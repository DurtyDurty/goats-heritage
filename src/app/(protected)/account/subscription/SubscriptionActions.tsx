"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/membership/cancel", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      }
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="mt-6 w-full rounded-lg border border-[#EF4444] py-3 text-sm font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/10 disabled:opacity-50"
    >
      {loading ? "Cancelling..." : "Cancel Subscription"}
    </button>
  );
}
