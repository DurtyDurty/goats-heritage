"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-[#F5F5F5]">
        Something went wrong
      </h2>
      <p className="mt-3 max-w-md text-[#A3A3A3]">{error.message}</p>
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-[#C8A84E] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#B8983E]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[#262626] px-6 py-3 text-sm font-semibold text-[#A3A3A3] transition-colors hover:text-[#F5F5F5]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
