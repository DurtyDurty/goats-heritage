export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/email/client";
import { adminCompose } from "@/lib/email/templates/adminCompose";

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "To, subject, and message are required." },
        { status: 400 }
      );
    }

    const email = adminCompose({ subject, message });
    const { data, error } = await resend.emails.send({
      from: "Goats Heritage <contact@goatsheritage.com>",
      to,
      subject: email.subject,
      html: email.html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save to sent_emails table
    const supabase = createAdminClient();
    await supabase.from("sent_emails").insert({
      to_email: to,
      subject,
      message,
      sent_by: admin.id,
    });

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email." },
      { status: 500 }
    );
  }
}
