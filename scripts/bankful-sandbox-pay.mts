// End-to-end sandbox check of src/lib/bankful.ts:
//   1. asks Bankful for a hosted payment page
//   2. submits the hosted page's own form with a test card
//   3. follows the customer redirect and checks that our code verifies the signed result
//
//   node scripts/bankful-sandbox-pay.mts            (approved card)
//   node scripts/bankful-sandbox-pay.mts <cardNumber>
//
// Sandbox only: refuses to run when BANKFUL_ENV=production.
import { readFileSync } from "node:fs";
import { createHostedPayment, parseBankfulResult, bankfulEnvironment } from "../src/lib/bankful.ts";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const i = line.indexOf("=");
  const key = line.slice(0, i).trim();
  if (key.startsWith("BANKFUL_")) process.env[key] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

if (bankfulEnvironment() !== "sandbox") {
  console.error("Refusing to run: this script is for the sandbox only.");
  process.exitCode = 1;
} else {
  await main();
}

async function main() {
  const card = process.argv[2] || "4111111111111111";
  const orderId = "GH-TEST-" + Date.now();
  const siteUrl = process.env.BANKFUL_TEST_SITE_URL || "https://www.goatsheritage.com";

  const created = await createHostedPayment({
    orderId,
    amountCents: 1234,
    siteUrl,
    customer: { firstName: "Test", lastName: "Customer", email: "test@goatsheritage.com", phone: "(904) 555-0100" },
    billing: { address: "100 Main St", city: "St. Johns", state: "FL", zip: "32259" },
  });
  if (!created.ok) {
    console.log("FAILED to create hosted payment:", created.error);
    process.exitCode = 1;
    return;
  }
  console.log("1. hosted page created for", orderId);

  // Load the hosted page like a browser would, keeping its session cookies
  const pageRes = await fetch(created.redirectUrl);
  const html = await pageRes.text();
  const cookies = (pageRes.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  const formHtml = /<form id="credit-card-process-form"[\s\S]*?<\/form>/.exec(html)?.[0] || "";
  const action = /action="([^"]+)"/.exec(formHtml)?.[1];
  if (!action) {
    console.log("FAILED: hosted page form not found");
    process.exitCode = 1;
    return;
  }

  const form = new URLSearchParams();
  for (const tag of formHtml.match(/<input\b[^>]*>/g) || []) {
    const name = /\bname="([^"]*)"/.exec(tag)?.[1];
    if (!name) continue;
    form.set(name, /\bvalue="([^"]*)"/.exec(tag)?.[1] || "");
  }
  form.set("card_number", card);
  form.set("exp_mm", "12");
  form.set("exp_yy", String((new Date().getFullYear() + 2) % 100));
  form.set("cvv", "123");
  form.set("terms", "on");

  const payRes = await fetch(new URL(action, created.redirectUrl), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies, Referer: created.redirectUrl },
    body: form.toString(),
    redirect: "manual",
  });
  const location = payRes.headers.get("location");
  const payBody = await payRes.text();
  console.log("2. card submitted: HTTP", payRes.status, location ? "-> " + location.split("?")[0] : payBody.slice(0, 300).replace(/\s+/g, " "));

  const returnUrl = location || /https?:\/\/[^"'\s<]*TRANS_STATUS_NAME[^"'\s<]*/.exec(payBody)?.[0]?.replace(/&amp;/g, "&");
  if (!returnUrl) {
    console.log("FAILED: no return URL in the response");
    process.exitCode = 1;
    return;
  }

  const params = Object.fromEntries(new URL(returnUrl, siteUrl).searchParams.entries());
  console.log("3. returned fields:", params);

  const result = parseBankfulResult(params);
  console.log("4. parsed:", result);
  const ok = result.verified && result.orderId === orderId;
  console.log(ok ? `PASS: signature verified, status ${result.status}` : "FAIL: result did not verify");
  process.exitCode = ok ? 0 : 1;
}
