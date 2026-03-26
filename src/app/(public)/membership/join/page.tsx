"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login?redirect=/membership/join");
        return;
      }
      setAuthenticated(true);

      // Check existing subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (sub) {
        router.push("/account/subscription?already_member=true");
        return;
      }

      setLoading(false);
    });
  }, [router]);

  async function handleSubscribe() {
    setError("");
    setSubscribing(true);

    try {
      const res = await fetch("/api/stripe/subscription", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setSubscribing(false);
    }
  }

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#262626] border-t-[#C8A84E]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border-2 border-[#C8A84E] bg-[#141414] p-8">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-wider text-[#C8A84E]">
            GOATS HERITAGE
          </h2>
          <h1 className="mt-4 text-2xl font-bold text-[#F5F5F5]">
            Confirm Your Membership
          </h1>
        </div>

        <div className="mt-6 rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F5F5F5]">
              The Heritage Box
            </span>
            <span className="text-[#C8A84E]">$49.99/mo</span>
          </div>
          <ul className="mt-4 space-y-2">
            {[
              "5–7 premium cigars monthly",
              "Members-only merch access",
              "10% off all purchases",
              "VIP event invites",
              "Free shipping",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-[#A3A3A3]"
              >
                <Check className="h-3.5 w-3.5 text-[#C8A84E]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="mt-4 text-sm text-[#EF4444]">{error}</p>
        )}

        <button
          onClick={handleSubscribe}
          disabled={subscribing}
          className="mt-6 w-full rounded-lg bg-[#C8A84E] py-4 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
        >
          {subscribing ? "Redirecting to Stripe..." : "Subscribe Now"}
        </button>

        <p className="mt-4 text-center text-xs text-[#A3A3A3]">
          Cancel anytime. You&apos;ll be redirected to Stripe for secure payment.
        </p>
      </div>
    </div>
  );
}
