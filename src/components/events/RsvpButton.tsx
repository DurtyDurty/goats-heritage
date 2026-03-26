"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Props {
  eventId: string;
  isMembersOnly: boolean;
  spotsRemaining: number | null; // null = unlimited
  initialRsvpStatus: string | null;
}

export default function RsvpButton({
  eventId,
  isMembersOnly,
  spotsRemaining,
  initialRsvpStatus,
}: Props) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState(initialRsvpStatus);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || "customer");

        // Check user's rsvp
        const { data: rsvp } = await supabase
          .from("event_rsvps")
          .select("status")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .neq("status", "cancelled")
          .single();

        if (rsvp) setRsvpStatus(rsvp.status);
      }
      setAuthChecked(true);
    });
  }, [eventId]);

  async function handleRsvp(action: "confirm" | "cancel") {
    setLoading(true);
    try {
      const res = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setRsvpStatus(action === "cancel" ? null : data.rsvp?.status || "confirmed");
      }
    } catch {}
    setLoading(false);
  }

  if (!authChecked) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-[#262626]" />
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=/events/${eventId}`}
        className="block w-full rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
      >
        Sign In to RSVP
      </Link>
    );
  }

  if (isMembersOnly && role !== "member" && role !== "admin") {
    return (
      <button
        disabled
        className="w-full rounded-lg bg-[#262626] py-2.5 text-sm font-medium text-[#A3A3A3]"
      >
        Members Only
      </button>
    );
  }

  if (rsvpStatus === "confirmed") {
    return (
      <div className="space-y-2">
        <div className="w-full rounded-lg bg-[#22C55E]/10 py-2.5 text-center text-sm font-medium text-[#22C55E]">
          You&apos;re Going
        </div>
        <button
          onClick={() => handleRsvp("cancel")}
          disabled={loading}
          className="w-full text-center text-xs text-[#A3A3A3] transition-colors hover:text-[#EF4444]"
        >
          {loading ? "Cancelling..." : "Cancel RSVP"}
        </button>
      </div>
    );
  }

  if (rsvpStatus === "waitlisted") {
    return (
      <div className="space-y-2">
        <div className="w-full rounded-lg bg-[#F59E0B]/10 py-2.5 text-center text-sm font-medium text-[#F59E0B]">
          Waitlisted
        </div>
        <button
          onClick={() => handleRsvp("cancel")}
          disabled={loading}
          className="w-full text-center text-xs text-[#A3A3A3] transition-colors hover:text-[#EF4444]"
        >
          {loading ? "Cancelling..." : "Leave Waitlist"}
        </button>
      </div>
    );
  }

  if (spotsRemaining !== null && spotsRemaining <= 0) {
    return (
      <button
        onClick={() => handleRsvp("confirm")}
        disabled={loading}
        className="w-full rounded-lg border border-[#F59E0B] py-2.5 text-sm font-medium text-[#F59E0B] transition-colors hover:bg-[#F59E0B]/10 disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join Waitlist"}
      </button>
    );
  }

  return (
    <button
      onClick={() => handleRsvp("confirm")}
      disabled={loading}
      className="w-full rounded-lg bg-[#C8A84E] py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
    >
      {loading ? "Confirming..." : "RSVP Now"}
    </button>
  );
}
