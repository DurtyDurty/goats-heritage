export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
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
    await resend.emails.send({
      from: "Goats Heritage <contact@goatsheritage.com>",
      to,
      subject: email.subject,
      html: email.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
