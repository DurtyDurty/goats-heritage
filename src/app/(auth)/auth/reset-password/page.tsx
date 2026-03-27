"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/account");
    }, 2000);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-8">
        <div className="text-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="mx-auto h-20 w-auto" />
        </div>

        {success ? (
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold text-[#22C55E]">Password Updated!</h1>
            <p className="mt-2 text-sm text-[#A3A3A3]">Redirecting to your account...</p>
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-center text-2xl font-bold text-[#F5F5F5]">
              New Password
            </h1>
            <p className="mt-1 text-center text-sm text-[#A3A3A3]">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-[#A3A3A3]">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-[#A3A3A3]">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-[#EF4444]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
