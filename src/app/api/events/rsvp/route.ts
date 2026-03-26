export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event_id, action } = await request.json();

    if (!event_id || !["confirm", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get event
    const { data: event } = await supabase
      .from("events")
      .select("id, capacity, is_members_only")
      .eq("id", event_id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (action === "cancel") {
      // Check for existing rsvp
      const { data: existing } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", event_id)
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .single();

      if (existing) {
        const { data: rsvp } = await supabase
          .from("event_rsvps")
          .update({ status: "cancelled" })
          .eq("id", existing.id)
          .select()
          .single();

        return NextResponse.json({ rsvp });
      }

      return NextResponse.json({ rsvp: null });
    }

    // Confirming RSVP
    // Check members only
    if (event.is_members_only) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "member" && profile?.role !== "admin") {
        return NextResponse.json(
          { error: "This event is for members only" },
          { status: 403 }
        );
      }
    }

    // Check capacity
    let status = "confirmed";
    if (event.capacity !== null) {
      const { count } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event_id)
        .eq("status", "confirmed");

      if ((count || 0) >= event.capacity) {
        status = "waitlisted";
      }
    }

    // Check for existing cancelled rsvp to reuse
    const { data: existing } = await supabase
      .from("event_rsvps")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single();

    let rsvp;
    if (existing) {
      const { data } = await supabase
        .from("event_rsvps")
        .update({ status })
        .eq("id", existing.id)
        .select()
        .single();
      rsvp = data;
    } else {
      const { data } = await supabase
        .from("event_rsvps")
        .insert({
          event_id,
          user_id: user.id,
          status,
        })
        .select()
        .single();
      rsvp = data;
    }

    return NextResponse.json({ rsvp });
  } catch (err: any) {
    console.error("RSVP error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
