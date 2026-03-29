export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const emailData = body.data || body;

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
