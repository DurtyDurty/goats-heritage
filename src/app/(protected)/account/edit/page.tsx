"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to update profile.");
    } else {
      setMessage("Profile updated!");
      setTimeout(() => router.push("/account"), 1000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-md px-4">
          <div className="h-64 animate-pulse rounded-xl bg-[#141414]" />
        </div>
      </section>
    );
  }

  const inputClass = "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]";

  return (
    <section className="py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-2xl font-bold">
          Edit <span className="text-[#C8A84E]">Profile</span>
        </h1>
        <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />

        <form onSubmit={handleSave} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className={`${inputClass} opacity-50`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#A3A3A3]">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className={inputClass}
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes("Failed") ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/account")}
            className="w-full text-center text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
          >
            Cancel
          </button>
        </form>
      </div>
    </section>
  );
}
