export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/email/client";
import { eventAnnouncement } from "@/lib/email/templates/eventAnnouncement";

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch all profile emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email");

    // Fetch all newsletter subscriber emails
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

    const { subject, html } = eventAnnouncement({
      title: event.title,
      eventDate: event.event_date,
      location: event.location,
      description: event.description,
    });

    // Send in batches of 50
    let sentCount = 0;
    for (let i = 0; i < allEmails.length; i += 50) {
      const batch = allEmails.slice(i, i + 50);
      const { error: sendError } = await resend.emails.send({
        from: "Goats Heritage <contact@goatsheritage.com>",
        to: batch,
        subject,
        html,
      });

      if (sendError) {
        console.error("Event notify batch error:", sendError);
      } else {
        sentCount += batch.length;
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error: any) {
    console.error("Event notify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notifications" },
      { status: 500 }
    );
  }
}
