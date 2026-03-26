"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Update profile full_name
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
    }

    router.push("/auth/verify-age");
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-8">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-wider text-[#C8A84E]">
            GOATS HERITAGE
          </h2>
          <h1 className="mt-4 text-2xl font-bold text-[#F5F5F5]">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Join the heritage
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">
              Password
            </label>
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
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[#EF4444]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A3A3A3]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#C8A84E] transition-colors hover:text-[#E8D48B]"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
