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
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch all profile emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email");

    // Fetch all subscribed newsletter emails
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("subscribed", true);

    // Deduplicate emails
    const emailSet = new Set<string>();
    (profiles || []).forEach((p: any) => {
      if (p.email) emailSet.add(p.email.toLowerCase());
    });
    (subscribers || []).forEach((s: any) => {
      if (s.email) emailSet.add(s.email.toLowerCase());
    });

    const allEmails = Array.from(emailSet);
    if (allEmails.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    const email = adminCompose({ subject, message });

    // Send in batches of 50
    let sentCount = 0;
    for (let i = 0; i < allEmails.length; i += 50) {
      const batch = allEmails.slice(i, i + 50);
      const { error: sendError } = await resend.emails.send({
        from: "Goats Heritage <contact@goatsheritage.com>",
        to: batch,
        subject: email.subject,
        html: email.html,
      });

      if (sendError) {
        console.error("Broadcast batch error:", sendError);
      } else {
        sentCount += batch.length;
      }
    }

    // Save to sent_emails table for each recipient
    const sentRecords = allEmails.map((e) => ({
      to_email: e,
      subject,
      message,
      sent_by: admin.id,
    }));

    // Insert in chunks to avoid payload limits
    for (let i = 0; i < sentRecords.length; i += 100) {
      await supabase
        .from("sent_emails")
        .insert(sentRecords.slice(i, i + 100));
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send broadcast" },
      { status: 500 }
    );
  }
}
