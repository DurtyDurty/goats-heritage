"use client";

import { useState, useEffect } from "react";
import { Mail, Send, X } from "lucide-react";

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

  // Broadcast modal state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastConfirm, setBroadcastConfirm] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ message: string; success: boolean } | null>(null);

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

  async function handleBroadcast() {
    if (!broadcastConfirm) {
      setBroadcastConfirm(true);
      return;
    }

    setBroadcastSending(true);
    setBroadcastResult(null);

    try {
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: broadcastSubject,
          message: broadcastMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBroadcastResult({ message: `Broadcast sent to ${data.sent} recipients`, success: true });
      setBroadcastSubject("");
      setBroadcastMessage("");
      setBroadcastConfirm(false);
    } catch (err: any) {
      setBroadcastResult({ message: err.message || "Failed to send", success: false });
      setBroadcastConfirm(false);
    }
    setBroadcastSending(false);
  }

  function closeBroadcast() {
    setBroadcastOpen(false);
    setBroadcastSubject("");
    setBroadcastMessage("");
    setBroadcastConfirm(false);
    setBroadcastResult(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Newsletter</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white hover:bg-[#60A5FA]"
          >
            <Send className="h-4 w-4" />
            Send Broadcast
          </button>
          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 rounded-lg bg-[#C8A84E] px-4 py-2 text-sm font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            Export CSV
          </button>
        </div>
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
                  <td className="px-4 py-3 text-[#A3A3A3]">{s.full_name || "\u2014"}</td>
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

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-lg rounded-xl border border-[#262626] bg-[#141414] p-6">
            <button
              onClick={closeBroadcast}
              className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-[#F5F5F5]">Send Broadcast</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Send an email to all subscribers and registered customers.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Subject</label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Message</label>
                <textarea
                  rows={6}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]"
                />
              </div>

              {broadcastResult && (
                <p
                  className={`text-sm ${
                    broadcastResult.success ? "text-[#22C55E]" : "text-[#EF4444]"
                  }`}
                >
                  {broadcastResult.message}
                </p>
              )}

              {broadcastConfirm && !broadcastResult?.success && (
                <p className="text-sm text-[#F59E0B]">
                  Are you sure? This will send to all subscribers and customers.
                </p>
              )}

              <button
                onClick={handleBroadcast}
                disabled={broadcastSending || !broadcastSubject || !broadcastMessage || broadcastResult?.success}
                className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
              >
                {broadcastSending
                  ? "Sending..."
                  : broadcastConfirm
                  ? "Confirm Send to All"
                  : "Send to All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
