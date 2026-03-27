"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AgeGateModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("goats_age_gate");
    if (!verified) setVisible(true);
  }, []);

  function handleConfirm() {
    sessionStorage.setItem("goats_age_gate", "verified");
    setVisible(false);
  }

  function handleDeny() {
    window.location.href = "https://www.google.com";
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-8 text-center">
        <Image src="/images/logo.png" alt="Goats Heritage" width={200} height={100} className="mx-auto h-24 w-auto" />

        <div className="mx-auto my-5 h-px w-16 bg-[#C8A84E]/40" />

        <p className="text-xl text-white">
          Are you 21 years of age or older?
        </p>

        <p className="mt-2 text-sm text-[#A3A3A3]">
          You must be of legal smoking age to enter this site.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleConfirm}
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
      </div>
    </div>
  );
}
