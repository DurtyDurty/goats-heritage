export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Resend signs each webhook (Svix format) with the webhook's whsec_ signing secret.
// Requests older or newer than this are refused, so a captured request can't be replayed later.
const TOLERANCE_SECONDS = 5 * 60;

function verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isInteger(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  // A truncated or mistyped secret must not turn into a guessable key
  if (key.length < 16) return false;

  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();
  // The header can carry several space-separated signatures ("v1,<base64>") during key rotation
  return signature.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Resend sends every email received on the account to this webhook, including mail
// for other businesses' domains on the same Resend account (e.g. Corsa Auto Detailing).
// Only mail addressed to goatsheritage.com (or a subdomain of it) belongs in this inbox.
const OWN_DOMAIN = "goatsheritage.com";

function recipientDomains(to: unknown): string[] {
  const list = Array.isArray(to) ? to : to ? [to] : [];
  return list
    .map((r) => /@([^\s>]+)/.exec(String(r))?.[1]?.toLowerCase() || "")
    .filter(Boolean);
}

function isForGoatsHeritage(to: unknown): boolean {
  const domains = recipientDomains(to);
  // No recipient information: keep the old behaviour rather than drop real mail
  if (domains.length === 0) return true;
  return domains.some((d) => d === OWN_DOMAIN || d.endsWith(`.${OWN_DOMAIN}`));
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Only Resend may post here. Without the secret configured nothing could be verified,
    // so the endpoint refuses everything rather than accept forged messages.
    const secret = (process.env.RESEND_WEBHOOK_SECRET || "").trim();
    if (!secret) {
      console.error("Inbound email rejected: RESEND_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }
    if (!verifySignature(rawBody, request.headers, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const emailData = body.data || body;

    if (!isForGoatsHeritage(emailData.to)) {
      return NextResponse.json({ received: true, filtered: true });
    }

    const from = emailData.from || "unknown@email.com";
    const fromName = from.split("@")[0];
    const subject = emailData.subject || "No Subject";
    const html = emailData.html || "";
    const text = emailData.text || "";

    // Use plain text if available, otherwise strip HTML
    let message = text || stripHtml(html) || "No content";
    message = message.substring(0, 10000);

    // Filter out automated system emails
    const spamDomains = ["dmarc", "dmarcreport", "verification@mail.conversations.godaddy.com"];
    const isSystemEmail = spamDomains.some(d => from.toLowerCase().includes(d));
    if (isSystemEmail) {
      return NextResponse.json({ received: true, filtered: true });
    }

    const supabase = createAdminClient();

    await supabase.from("contact_messages").insert({
      name: fromName,
      email: typeof from === "string" ? from : String(from),
      subject,
      message,
      status: "unread",
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Inbound email webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
