import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Goats Heritage\u2122",
};

export default function PrivacyPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <div className="mt-2 h-1 w-16 bg-[#C8A84E]" />
        <p className="mt-8 text-neutral-400">
          Our privacy policy is being updated. Please check back soon.
        </p>
      </div>
    </section>
  );
}