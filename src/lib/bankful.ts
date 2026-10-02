// Bankful Hosted Payment Page (server only).
//
// Flow: we create a pending order, ask Bankful for a hosted page URL, and send the
// customer there to enter their card. Bankful then reports the outcome twice: as
// query params on the customer's return URL and as a server-to-server POST to
// url_callback. Both are signed, and both go through parseBankfulResult().
//
// Signing: HMAC-SHA256 keyed with the gateway password over every non-empty field,
// sorted by name and written as name+value with no separators. Hex encoded.
import { createHmac, timingSafeEqual } from "node:crypto";

const HOSTED_PAGE_URLS = {
  sandbox: "https://api-dev1.bankfulportal.com/front-calls/go-in/hosted-page-pay",
  production: "https://api.paybybankful.com/front-calls/go-in/hosted-page-pay",
} as const;

export type BankfulEnvironment = keyof typeof HOSTED_PAGE_URLS;

function config() {
  return {
    // Trimmed: a stray newline from a copy-paste would silently break every signature
    username: (process.env.BANKFUL_USERNAME || "").trim(),
    password: (process.env.BANKFUL_PASSWORD || "").trim(),
    // Anything other than an explicit "production" stays on the sandbox
    environment: (process.env.BANKFUL_ENV === "production" ? "production" : "sandbox") as BankfulEnvironment,
  };
}

export function bankfulConfigured(): boolean {
  const { username, password } = config();
  return Boolean(username && password);
}

export function bankfulEnvironment(): BankfulEnvironment {
  return config().environment;
}

function signatureMessage(fields: Record<string, string>): string {
  return Object.keys(fields)
    .filter((key) => key.toLowerCase() !== "signature" && fields[key] !== "" && fields[key] != null)
    .sort()
    .map((key) => key + fields[key])
    .join("");
}

export function signFields(fields: Record<string, string>, password = config().password): string {
  return createHmac("sha256", password).update(signatureMessage(fields)).digest("hex");
}

export interface HostedPaymentInput {
  orderId: string;
  amountCents: number;
  siteUrl: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  billing: { address: string; city: string; state: string; zip: string };
}

export type HostedPaymentResult = { ok: true; redirectUrl: string } | { ok: false; error: string };

/** Asks Bankful for a hosted payment page for this order and returns the URL to send the customer to. */
export async function createHostedPayment(input: HostedPaymentInput): Promise<HostedPaymentResult> {
  const { username, password, environment } = config();
  if (!username || !password) return { ok: false, error: "Payment gateway is not configured." };

  const site = input.siteUrl.replace(/\/$/, "");
  const fields: Record<string, string> = {
    req_username: username,
    transaction_type: "CAPTURE",
    amount: (input.amountCents / 100).toFixed(2),
    request_currency: "USD",
    cart_name: "Hosted-Page",
    return_redirect_url: "Y",
    xtl_order_id: input.orderId,
    cust_fname: input.customer.firstName,
    cust_lname: input.customer.lastName,
    cust_email: input.customer.email,
    cust_phone: input.customer.phone.replace(/\D/g, ""),
    bill_addr: input.billing.address,
    bill_addr_city: input.billing.city,
    bill_addr_state: input.billing.state,
    bill_addr_zip: input.billing.zip,
    bill_addr_country: "US",
    // Return pages live outside /checkout so they work even if the session has expired
    url_complete: `${site}/order/complete`,
    url_cancel: `${site}/order/cancelled`,
    url_failed: `${site}/order/complete`,
    url_pending: `${site}/order/complete`,
    url_callback: `${site}/api/bankful/callback`,
  };

  const body = new URLSearchParams({ ...fields, signature: signFields(fields, password) });

  try {
    const res = await fetch(HOSTED_PAGE_URLS[environment], {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "manual",
      cache: "no-store",
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}

    const redirectUrl = json?.redirect_url || res.headers.get("location");
    if (redirectUrl) return { ok: true, redirectUrl };

    console.error("Bankful hosted page request failed:", res.status, text.slice(0, 500));
    return { ok: false, error: json?.errorMessage || "The payment gateway could not start this payment." };
  } catch (err) {
    console.error("Bankful hosted page request error:", err);
    return { ok: false, error: "The payment gateway could not be reached. Please try again." };
  }
}

export type BankfulStatus = "approved" | "declined" | "pending" | "unknown";

export interface BankfulResult {
  /** True only when the signature matches our gateway password. Never act on an unverified result. */
  verified: boolean;
  status: BankfulStatus;
  orderId: string;
  amountCents: number | null;
  /** Bankful's order id. Needed for refunds. */
  reference: string;
  message: string;
}

function verifySignature(params: Record<string, string>): boolean {
  const { password } = config();
  const signatureKey = Object.keys(params).find((k) => k.toLowerCase() === "signature");
  if (!password || !signatureKey) return false;

  const expected = Buffer.from(signFields(params, password), "utf8");
  const received = Buffer.from(String(params[signatureKey]).toLowerCase(), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Reads a Bankful return or callback payload (field names arrive in upper case). */
export function parseBankfulResult(params: Record<string, string>): BankfulResult {
  const get = (name: string) => {
    const key = Object.keys(params).find((k) => k.toLowerCase() === name.toLowerCase());
    return key ? String(params[key]) : "";
  };

  const rawStatus = get("TRANS_STATUS_NAME").toUpperCase();
  const status: BankfulStatus =
    rawStatus === "APPROVED" ? "approved" : rawStatus === "DECLINED" ? "declined" : rawStatus === "PENDING" ? "pending" : "unknown";

  const value = parseFloat(get("TRANS_VALUE"));

  return {
    verified: verifySignature(params),
    status,
    orderId: get("XTL_ORDER_ID"),
    amountCents: Number.isFinite(value) ? Math.round(value * 100) : null,
    reference: get("TRANS_ORDER_ID"),
    message: get("ERROR_MESSAGE") || get("PROCESSOR_ADVICE") || get("API_ADVICE"),
  };
}
