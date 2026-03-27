"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Step = "age" | "email" | "done";

export default function AgeGateModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("age");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("goats_age_gate");
    if (!verified) setVisible(true);
  }, []);

  function handleAgeConfirm() {
    setStep("email");
  }

  function handleDeny() {
    window.location.href = "https://www.google.com";
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "age_gate" }),
      });
    } catch {}

    sessionStorage.setItem("goats_age_gate", "verified");
    setVisible(false);
  }

  function handleSkip() {
    sessionStorage.setItem("goats_age_gate", "verified");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-8 text-center">
        <Image src="/images/logo.png" alt="Goats Heritage™" width={200} height={100} className="mx-auto h-24 w-auto" />

        <div className="mx-auto my-5 h-px w-16 bg-[#C8A84E]/40" />

        {step === "age" && (
          <>
            <p className="text-xl text-white">
              Are you 21 years of age or older?
            </p>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              You must be of legal smoking age to enter this site.
            </p>
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleAgeConfirm}
                className="flex-1 rounded-lg bg-[#C8A84E] px-8 py-3 font-bold text-black transition-colors hover:bg-[#E8D48B]"
              >
                Yes, Enter
              </button>
              <button
                onClick={handleDeny}
                className="flex-1 rounded-lg bg-[#262626] px-8 py-3 text-[#A3A3A3] transition-colors hover:bg-[#333333]"
              >
                No, Exit
              </button>
            </div>
          </>
        )}

        {step === "email" && (
          <>
            <p className="text-xl text-white">
              Join the Heritage
            </p>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              Be the first to know about new releases, exclusive drops, and events.
            </p>

            <form onSubmit={handleEmailSubmit} className="mt-6">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-[#A3A3A3] outline-none transition-colors focus:border-[#C8A84E]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
              >
                {submitting ? "Joining..." : "Sign Me Up"}
              </button>
            </form>

            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-[#A3A3A3] transition-colors hover:text-[#F5F5F5]"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}