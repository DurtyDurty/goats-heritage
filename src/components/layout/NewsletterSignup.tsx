"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You're in! Welcome to the heritage.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
        Stay Connected
      </h4>
      <p className="mt-2 text-sm text-[#A3A3A3]">
        Be the first to know about new releases, events, and exclusive drops.
      </p>

      {status === "success" ? (
        <p className="mt-3 text-sm text-[#C8A84E]">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder-[#A3A3A3] outline-none transition-colors focus:border-[#C8A84E]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-[#C8A84E] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Join"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-2 text-xs text-[#EF4444]">{message}</p>
      )}
    </div>
  );
}
