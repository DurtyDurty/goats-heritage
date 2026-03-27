export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Resend inbound email webhook payload
    const from = body.from || body.envelope?.from || "unknown@email.com";
    const fromName = body.from_name || from.split("@")[0];
    const subject = body.subject || "No Subject";
    const text = body.text || body.html || "";
    const to = body.to || "";

    // Only process emails sent to contact@goatsheritage.com
    const isForContact = Array.isArray(to)
      ? to.some((t: string) => t.includes("contact@goatsheritage.com"))
      : String(to).includes("contact@goatsheritage.com");

    if (!isForContact) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const supabase = createAdminClient();

    // Save to contact_messages table
    await supabase.from("contact_messages").insert({
      name: fromName,
      email: typeof from === "string" ? from : from,
      subject,
      message: text.substring(0, 10000), // Limit message length
      status: "unread",
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Inbound email webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
