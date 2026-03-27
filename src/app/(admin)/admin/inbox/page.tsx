"use client";

import { useState, useEffect } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "compose">("messages");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeSuccess, setComposeSuccess] = useState(false);

  const [error, setError] = useState("");

  async function fetchMessages() {
    try {
      const res = await fetch("/api/admin/inbox");
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
        setCounts({ total: data.total, unread: data.unread, replied: data.replied });
      }
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function markAsRead(msg: ContactMessage) {
    if (msg.status !== "unread") return;
    try {
      await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "read" }),
      });
      fetchMessages();
    } catch {
      console.error("Failed to mark as read");
    }
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    setError("");

    try {
      const res = await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          status: "replied",
          admin_reply: replyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reply.");
        return;
      }

      setReplyText("");
      setSelected(null);
      fetchMessages();
    } catch {
      setError("Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }

  async function handleComposeSend() {
    if (!composeTo || !composeSubject || !composeMessage) return;
    setComposeSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          message: composeMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send email.");
        return;
      }

      setComposeTo("");
      setComposeSubject("");
      setComposeMessage("");
      setComposeSuccess(true);
      setTimeout(() => setComposeSuccess(false), 3000);
    } catch {
      setError("Failed to send email.");
    } finally {
      setComposeSending(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusDot(status: string) {
    if (status === "unread")
      return <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#C8A84E]" title="Unread" />;
    if (status === "replied")
      return <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" title="Replied" />;
    return <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#666]" title="Read" />;
  }

  const inputClass =
    "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-[#666] outline-none transition-colors focus:border-[#C8A84E] focus:ring-1 focus:ring-[#C8A84E]/30";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          {counts.unread > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#C8A84E] px-2 text-xs font-bold text-[#0A0A0A]">
              {counts.unread}
            </span>
          )}
        </div>
        <div className="text-sm text-[#A3A3A3]">
          {counts.total} total &middot; {counts.unread} unread &middot;{" "}
          {counts.replied} replied
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[#262626] bg-[#0A0A0A] p-1">
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "messages"
              ? "bg-[#141414] text-[#C8A84E]"
              : "text-[#A3A3A3] hover:text-white"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab("compose")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "compose"
              ? "bg-[#141414] text-[#C8A84E]"
              : "text-[#A3A3A3] hover:text-white"
          }`}
        >
          Compose
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <>
          {loading ? (
            <div className="py-20 text-center text-[#A3A3A3]">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-[#262626] bg-[#141414] py-20 text-center text-[#A3A3A3]">
              No messages yet.
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelected(msg);
                    markAsRead(msg);
                  }}
                  className={`w-full rounded-xl border border-[#262626] bg-[#141414] p-4 text-left transition-colors hover:border-[#C8A84E]/30 ${
                    msg.status === "unread" ? "border-l-2 border-l-[#C8A84E]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {statusDot(msg.status)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className={`truncate text-sm font-medium ${
                            msg.status === "unread" ? "text-white" : "text-[#A3A3A3]"
                          }`}
                        >
                          {msg.name}
                        </span>
                        <span className="shrink-0 text-xs text-[#666]">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs text-[#A3A3A3]">
                          {msg.email}
                        </span>
                      </div>
                      <p
                        className={`mt-1 truncate text-sm ${
                          msg.status === "unread" ? "text-[#F5F5F5]" : "text-[#666]"
                        }`}
                      >
                        <span className="font-medium">{msg.subject}</span>
                        {" \u2014 "}
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message Detail Panel */}
          {selected && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
              <div className="flex h-full w-full max-w-xl flex-col border-l border-[#262626] bg-[#0A0A0A]">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-[#262626] px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    {selected.subject}
                  </h2>
                  <button
                    onClick={() => {
                      setSelected(null);
                      setReplyText("");
                    }}
                    className="text-[#A3A3A3] transition-colors hover:text-white"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Panel body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {selected.name}
                      </span>
                      {statusDot(selected.status)}
                    </div>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-[#C8A84E] transition-colors hover:text-[#E8D48B]"
                    >
                      {selected.email}
                    </a>
                    <p className="text-xs text-[#666]">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#262626] bg-[#141414] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F5]">
                      {selected.message}
                    </p>
                  </div>

                  {/* Existing reply */}
                  {selected.admin_reply && (
                    <div className="mt-6">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">
                        Your Reply
                      </p>
                      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F5]">
                          {selected.admin_reply}
                        </p>
                        {selected.replied_at && (
                          <p className="mt-3 text-xs text-[#666]">
                            Sent {formatDate(selected.replied_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mark as Read */}
                  {selected.status === "unread" && (
                    <button
                      onClick={() => {
                        markAsRead(selected);
                        setSelected({ ...selected, status: "read" });
                      }}
                      className="mt-4 rounded-lg border border-[#262626] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#C8A84E]"
                    >
                      Mark as Read
                    </button>
                  )}

                  {/* Reply form */}
                  {selected.status !== "replied" && (
                    <div className="mt-6">
                      <label className="mb-2 block text-sm font-medium text-[#A3A3A3]">
                        Reply
                      </label>
                      <textarea
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className={inputClass + " resize-none"}
                      />
                      <button
                        onClick={sendReply}
                        disabled={replying || !replyText.trim()}
                        className="mt-3 rounded-lg bg-[#C8A84E] px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8D48B] disabled:opacity-50"
                      >
                        {replying ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          {composeSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Email sent successfully!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#A3A3A3]">
                To
              </label>
              <input
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#A3A3A3]">
                Subject
              </label>
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#A3A3A3]">
                Message
              </label>
              <textarea
                rows={6}
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                placeholder="Write your message..."
                className={inputClass + " resize-none"}
              />
            </div>
            <button
              onClick={handleComposeSend}
              disabled={composeSending || !composeTo || !composeSubject || !composeMessage}
              className="rounded-lg bg-[#C8A84E] px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8D48B] disabled:opacity-50"
            >
              {composeSending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
