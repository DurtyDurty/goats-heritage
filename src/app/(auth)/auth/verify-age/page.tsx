"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function VerifyAgePage() {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [underAge, setUnderAge] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnderAge(false);

    if (!month || !day || !year) {
      setError("Please select your full date of birth.");
      return;
    }

    setLoading(true);

    const dob = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    const dobStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const isVerified = age >= 21;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        date_of_birth: dobStr,
        age_verified: isVerified,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    if (!isVerified) {
      setUnderAge(true);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  const selectClasses =
    "flex-1 rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C8A84E]";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-8">
        <div className="text-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="mx-auto h-20 w-auto" />
          <h1 className="mt-4 text-2xl font-bold text-[#F5F5F5]">
            Verify Your Age
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#A3A3A3]">
            We need your date of birth to comply with tobacco regulations.
          </p>
        </div>

        {underAge ? (
          <div className="mt-8 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-4 text-center">
            <p className="font-medium text-[#F59E0B]">
              You must be 21 or older to purchase tobacco products.
            </p>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              You can still browse our merchandise and lifestyle products.
            </p>
            <button
              onClick={() => {
                router.push("/account");
                router.refresh();
              }}
              className="mt-4 rounded-lg border border-[#C8A84E] px-6 py-2 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Continue to Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#A3A3A3]">
                Date of Birth
              </label>
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={String(i + 1)}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={String(d)}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#EF4444]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Age"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
