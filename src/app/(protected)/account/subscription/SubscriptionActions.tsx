"use client";

import { useState } from "react";

export default function SubscriptionActions() {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="mt-6 w-full rounded-lg border border-[#C8A84E] py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10 disabled:opacity-50"
    >
      {loading ? "Redirecting..." : "Manage Subscription"}
    </button>
  );
}
