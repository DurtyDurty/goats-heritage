"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ageFromDob, daysInMonth, MINIMUM_AGE } from "@/lib/age";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pages that already handle sign-in or their own profile step
const SKIP_PREFIXES = ["/login", "/signup", "/register", "/forgot-password", "/auth"];

interface Missing {
  name: boolean;
  email: boolean;
  dob: boolean;
}

/**
 * Shown to a signed-in customer whose account is missing a name, email, or date
 * of birth. It cannot be dismissed: the only ways out are to complete it or sign out.
 */
export default function ProfileCompletionModal() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [missing, setMissing] = useState<Missing | null>(null);
  const [underAgeNotice, setUnderAgeNotice] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const check = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserId(null);
      setMissing(null);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, date_of_birth")
      .eq("id", user.id)
      .single();
    if (!profile) return;

    const next: Missing = {
      name: !profile.full_name?.trim(),
      email: !profile.email?.trim(),
      dob: !profile.date_of_birth,
    };

    setUserId(user.id);
    setEmail((current) => current || user.email || "");
    setMissing(next.name || next.email || next.dob ? next : null);
  }, []);

  useEffect(() => {
    check();
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // Defer: Supabase calls must not run inside the auth callback itself
        setTimeout(check, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [check]);

  const skip = SKIP_PREFIXES.some((p) => pathname.startsWith(p));
  if (skip || !userId || (!missing && !underAgeNotice)) return null;

  const dobComplete = Boolean(dobMonth && dobDay && dobYear);
  const dateOfBirth = dobComplete ? `${dobYear}-${dobMonth.padStart(2, "0")}-${dobDay.padStart(2, "0")}` : "";
  const dobDays = Array.from({ length: daysInMonth(parseInt(dobMonth, 10) || 1, parseInt(dobYear, 10) || 0) }, (_, i) => i + 1);

  function clampDay(month: string, year: string) {
    const max = daysInMonth(parseInt(month, 10) || 1, parseInt(year, 10) || 0);
    if (parseInt(dobDay, 10) > max) setDobDay("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!missing || !userId) return;
    setError("");

    const update: Record<string, string | boolean> = {};
    let age: number | null = null;

    if (missing.name) {
      if (fullName.trim().length < 2) return setError("Enter your full name.");
      update.full_name = fullName.trim();
    }
    if (missing.email) {
      if (!EMAIL_REGEX.test(email.trim())) return setError("Enter a valid email address.");
      update.email = email.trim();
    }
    if (missing.dob) {
      if (!dobComplete) return setError("Select your full date of birth.");
      age = ageFromDob(dateOfBirth);
      if (age === null) return setError("That date of birth is not a valid date.");
      update.date_of_birth = dateOfBirth;
      update.age_verified = age >= MINIMUM_AGE;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").update(update).eq("id", userId);
    setSaving(false);

    if (updateError) {
      setError("We could not save your details. Please try again.");
      return;
    }

    setMissing(null);
    if (age !== null && age < MINIMUM_AGE) setUnderAgeNotice(true);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const inputClass =
    "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#C8A84E] focus:ring-1 focus:ring-[#C8A84E]/30";
  const labelClass = "mb-1.5 block text-xs font-medium text-[#A3A3A3]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-completion-title"
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-black/90 px-4 py-8 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-[#C8A84E]/40 bg-[#141414] p-8">
        <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="mx-auto h-16 w-auto" />

        {underAgeNotice ? (
          <div className="mt-6 text-center">
            <h2 id="profile-completion-title" className="text-xl font-bold text-[#F5F5F5]">Account updated</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#F59E0B]">
              You must be {MINIMUM_AGE} or older to purchase tobacco products.
            </p>
            <button
              onClick={() => setUnderAgeNotice(false)}
              className="mt-6 w-full rounded-lg border border-[#C8A84E] py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Continue
            </button>
          </div>
        ) : (
          missing && (
            <>
              <div className="mt-6 text-center">
                <h2 id="profile-completion-title" className="text-xl font-bold text-[#F5F5F5]">
                  Complete your account
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#A3A3A3]">
                  We are missing a few details. Please add them to continue.
                </p>
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-4">
                {missing.name && (
                  <div>
                    <label htmlFor="pc-name" className={labelClass}>Full name</label>
                    <input id="pc-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  </div>
                )}

                {missing.email && (
                  <div>
                    <label htmlFor="pc-email" className={labelClass}>Email address</label>
                    <input id="pc-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                )}

                {missing.dob && (
                  <fieldset>
                    <legend className={labelClass}>Date of birth</legend>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        aria-label="Birth month"
                        autoComplete="bday-month"
                        value={dobMonth}
                        onChange={(e) => { setDobMonth(e.target.value); clampDay(e.target.value, dobYear); }}
                        className={inputClass + " px-3"}
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={String(i + 1)}>{m}</option>
                        ))}
                      </select>
                      <select
                        aria-label="Birth day"
                        autoComplete="bday-day"
                        value={dobDay}
                        onChange={(e) => setDobDay(e.target.value)}
                        className={inputClass + " px-3"}
                      >
                        <option value="">Day</option>
                        {dobDays.map((d) => (
                          <option key={d} value={String(d)}>{d}</option>
                        ))}
                      </select>
                      <select
                        aria-label="Birth year"
                        autoComplete="bday-year"
                        value={dobYear}
                        onChange={(e) => { setDobYear(e.target.value); clampDay(dobMonth, e.target.value); }}
                        className={inputClass + " px-3"}
                      >
                        <option value="">Year</option>
                        {BIRTH_YEARS.map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-2 text-xs text-[#A3A3A3]">
                      Required to comply with tobacco regulations.
                    </p>
                  </fieldset>
                )}

                {error && <p role="alert" className="text-sm text-[#EF4444]">{error}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save and Continue"}
                </button>
              </form>

              <button
                onClick={handleSignOut}
                className="mt-4 w-full text-center text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
              >
                Sign out instead
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}
