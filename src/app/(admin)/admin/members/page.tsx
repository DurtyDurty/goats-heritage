"use client";

import { useState, useEffect } from "react";

const statusColors: Record<string, string> = {
  active: "bg-[#22C55E]/10 text-[#22C55E]",
  paused: "bg-[#F59E0B]/10 text-[#F59E0B]",
  cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
  past_due: "bg-[#EF4444]/10 text-[#EF4444]",
};

interface Sub {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null };
}

export default function AdminMembersPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      setSubs(data.subscriptions || []);
      setLoading(false);
    }
    load();
  }, []);

  const active = subs.filter((s) => s.status === "active").length;
  const paused = subs.filter((s) => s.status === "paused").length;
  const cancelled = subs.filter((s) => s.status === "cancelled").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F5F5F5]">Members</h1>

      {/* Summary stats */}
      <div className="mt-4 flex gap-4">
        <div className="rounded-lg bg-[#22C55E]/10 px-4 py-2 text-sm font-medium text-[#22C55E]">
          {active} Active
        </div>
        <div className="rounded-lg bg-[#F59E0B]/10 px-4 py-2 text-sm font-medium text-[#F59E0B]">
          {paused} Paused
        </div>
        <div className="rounded-lg bg-[#EF4444]/10 px-4 py-2 text-sm font-medium text-[#EF4444]">
          {cancelled} Cancelled
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Member Since</th>
              <th className="px-4 py-3 font-medium">Period End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#A3A3A3]">
                  Loading...
                </td>
              </tr>
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#A3A3A3]">
                  No members yet
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-[#F5F5F5]">
                    {s.profiles?.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {s.profiles?.email || "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-[#A3A3A3]">
                    {s.tier?.replace("_", " ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[s.status] || ""}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
