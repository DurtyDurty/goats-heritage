"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  full_name: string | null;
  source: string;
  subscribed: boolean;
  created_at: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
      setActive(data.active || 0);
      setLoading(false);
    }
    load();
  }, []);

  function exportCSV() {
    const csv = [
      "Email,Name,Source,Subscribed,Date",
      ...subscribers.map(
        (s) =>
          `${s.email},${s.full_name || ""},${s.source},${s.subscribed},${new Date(s.created_at).toLocaleDateString()}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goats-heritage-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Newsletter</h1>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 rounded-lg bg-[#C8A84E] px-4 py-2 text-sm font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 flex gap-4">
        <div className="rounded-lg bg-[#C8A84E]/10 px-4 py-2 text-sm font-medium text-[#C8A84E]">
          {total} Total
        </div>
        <div className="rounded-lg bg-[#22C55E]/10 px-4 py-2 text-sm font-medium text-[#22C55E]">
          {active} Active
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#A3A3A3]">
                  Loading...
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#A3A3A3]">
                  No subscribers yet
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-[#F5F5F5]">{s.email}</td>
                  <td className="px-4 py-3 text-[#A3A3A3]">{s.full_name || "—"}</td>
                  <td className="px-4 py-3 text-[#A3A3A3]">{s.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.subscribed
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#EF4444]/10 text-[#EF4444]"
                      }`}
                    >
                      {s.subscribed ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {new Date(s.created_at).toLocaleDateString()}
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