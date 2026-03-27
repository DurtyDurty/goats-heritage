"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-8">
        <div className="text-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="mx-auto h-20 w-auto" />
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Check Your Email</h1>
            <p className="mt-3 leading-relaxed text-[#A3A3A3]">
              We sent a password reset link to{" "}
              <span className="font-medium text-[#C8A84E]">{email}</span>.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg border border-[#C8A84E] px-6 py-2 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-center text-2xl font-bold text-[#F5F5F5]">
              Reset Password
            </h1>
            <p className="mt-1 text-center text-sm text-[#A3A3A3]">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-[#A3A3A3]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-sm text-[#EF4444]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#A3A3A3]">
              Remember your password?{" "}
              <Link href="/login" className="text-[#C8A84E] transition-colors hover:text-[#E8D48B]">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
