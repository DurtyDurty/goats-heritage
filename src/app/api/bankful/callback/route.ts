export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { parseBankfulResult } from "@/lib/bankful";
import { applyBankfulResult } from "@/lib/order-payments";

// Server-to-server notification from Bankful after a hosted-page payment.
// There is no session here: the HMAC signature is the only thing trusted.
async function readParams(request: Request): Promise<Record<string, string>> {
  const params: Record<string, string> = {};
  new URL(request.url).searchParams.forEach((value, key) => (params[key] = value));

  if (request.method === "POST") {
    const raw = await request.text();
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        for (const [key, value] of Object.entries(JSON.parse(raw) as Record<string, unknown>)) {
          params[key] = String(value);
        }
      } catch {}
    } else {
      new URLSearchParams(raw).forEach((value, key) => (params[key] = value));
    }
  }
  return params;
}

async function handle(request: Request) {
  try {
    const result = parseBankfulResult(await readParams(request));
    if (!result.verified) {
      console.error("Bankful callback rejected: bad or missing signature");
      return NextResponse.json({ received: false }, { status: 400 });
    }

    const { outcome, orderId } = await applyBankfulResult(result);
    console.log(`Bankful callback: order ${orderId || result.orderId} -> ${outcome}`);
    return NextResponse.json({ received: true, outcome });
  } catch (err) {
    console.error("Bankful callback error:", err);
    // A 500 lets Bankful retry
    return NextResponse.json({ received: false }, { status: 500 });
  }
}

export const POST = handle;
export const GET = handle;
