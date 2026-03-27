export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/email/client";
import { contactReply } from "@/lib/email/templates/contactReply";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = data || [];
  const total = messages.length;
  const unread = messages.filter((m: any) => m.status === "unread").length;
  const replied = messages.filter((m: any) => m.status === "replied").length;

  // Fetch sent emails
  const { data: sentData } = await supabase
    .from("sent_emails")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ messages, total, unread, replied, sent: sentData || [] });
}

export async function PATCH(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, status, admin_reply } = body;

    if (!id) {
      return NextResponse.json({ error: "Message ID required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // If replying, send the email first
    if (status === "replied" && admin_reply) {
      // Get the original message
      const { data: msg, error: fetchError } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !msg) {
        return NextResponse.json({ error: "Message not found." }, { status: 404 });
      }

      // Send reply email
      try {
        const reply = contactReply({
          customerName: msg.name,
          originalSubject: msg.subject,
          originalMessage: msg.message,
          replyMessage: admin_reply,
        });
        await resend.emails.send({
          from: "Goats Heritage <contact@goatsheritage.com>",
          to: msg.email,
          subject: reply.subject,
          html: reply.html,
        });
      } catch (emailError) {
        console.error("Failed to send reply email:", emailError);
        return NextResponse.json(
          { error: "Failed to send reply email." },
          { status: 500 }
        );
      }

      // Update the message
      const { error: updateError } = await supabase
        .from("contact_messages")
        .update({
          status: "replied",
          admin_reply,
          replied_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else if (status) {
      // Just update status (e.g., mark as read)
      const { error: updateError } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inbox PATCH error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
