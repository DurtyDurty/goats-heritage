export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Resend webhook wraps the email in a "data" object
    const emailData = body.data || body;

    const from = emailData.from || "unknown@email.com";
    const fromName = from.split("@")[0];
    const subject = emailData.subject || "No Subject";
    const text = emailData.text || emailData.html || "";
    const to = emailData.to || [];

    const supabase = createAdminClient();

    // Save to contact_messages table
    await supabase.from("contact_messages").insert({
      name: fromName,
      email: typeof from === "string" ? from : String(from),
      subject,
      message: typeof text === "string" ? text.substring(0, 10000) : "No content",
      status: "unread",
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Inbound email webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
