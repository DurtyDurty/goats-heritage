// First contact with the Bankful sandbox: asks for a hosted payment page for a $1.00 test order.
//
//   1. Put the sandbox credentials from Bankful's email into .env.local:
//        BANKFUL_USERNAME=...
//        BANKFUL_PASSWORD=...
//   2. Run:  node scripts/bankful-sandbox-test.mjs
//
// Sandbox only. No real card is charged and nothing in the site's database is touched.
import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";

const SANDBOX_URL = "https://api-dev1.bankfulportal.com/front-calls/go-in/hosted-page-pay";
const SITE = "https://www.goatsheritage.com";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const username = env.BANKFUL_USERNAME;
const password = env.BANKFUL_PASSWORD;
if (!username || !password) {
  console.error("Missing credentials. Add BANKFUL_USERNAME and BANKFUL_PASSWORD to .env.local first.");
  process.exit(1);
}

const fields = {
  req_username: username,
  transaction_type: "CAPTURE",
  amount: "1.00",
  request_currency: "USD",
  cart_name: "Hosted-Page",
  return_redirect_url: "Y",
  xtl_order_id: "GH-TEST-" + Date.now(),
  cust_fname: "Test",
  cust_lname: "Customer",
  cust_email: "test@goatsheritage.com",
  cust_phone: "9045550100",
  bill_addr: "100 Main St",
  bill_addr_city: "St. Johns",
  bill_addr_state: "FL",
  bill_addr_zip: "32259",
  bill_addr_country: "US",
  url_complete: `${SITE}/checkout/complete`,
  url_cancel: `${SITE}/cart`,
  url_failed: `${SITE}/checkout/failed`,
  url_pending: `${SITE}/checkout/pending`,
  url_callback: `${SITE}/api/bankful/callback`,
};

// Message: every non-empty field, sorted by name, written as name+value with no separators
const message = Object.keys(fields)
  .filter((k) => fields[k] !== "")
  .sort()
  .map((k) => k + fields[k])
  .join("");

// Bankful's docs describe the signature loosely, so try the documented method first
// and fall back to the other readings. The first one the sandbox accepts is the answer.
const methods = [
  ["HMAC-SHA256 keyed with the password (documented)", () => createHmac("sha256", password).update(message).digest("hex")],
  ["plain SHA256 of the message", () => createHash("sha256").update(message).digest("hex")],
  ["SHA256 of message + password", () => createHash("sha256").update(message + password).digest("hex")],
  ["SHA256 of password + message", () => createHash("sha256").update(password + message).digest("hex")],
];

async function attempt(signature) {
  const res = await fetch(SANDBOX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...fields, signature }).toString(),
    redirect: "manual",
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, location: res.headers.get("location"), text, json };
}

console.log(`Bankful sandbox test as ${username}, order ${fields.xtl_order_id}\n`);

for (const [name, sign] of methods) {
  const r = await attempt(sign());
  const url = r.json?.redirect_url || r.location;
  if (url) {
    console.log(`SUCCESS using: ${name}`);
    console.log(`\nOpen this link to see the hosted payment page:\n${url}\n`);
    console.log("Pay with test card 4111 1111 1111 1111, any future expiry, any CVV.");
    process.exit(0);
  }
  const reason = r.json?.errorMessage || r.text.slice(0, 200).replace(/\s+/g, " ");
  console.log(`- ${name}: HTTP ${r.status} ${reason}`);
  if (!/signature/i.test(reason)) {
    console.log("\nThe sandbox rejected the request for a reason other than the signature. Share the line above.");
    process.exit(1);
  }
}

console.log("\nEvery signature method was rejected. Send the sample code attached to Bankful's email so the exact method can be matched.");
process.exit(1);
