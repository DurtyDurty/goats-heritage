import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Goats Heritage",
  description: "The story behind Goats Heritage — premium cigars and lifestyle.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-[#141414] to-[#0A0A0A] py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.06)_0%,_transparent_70%)]" />
        <div className="relative z-10 px-4 text-center">
          <Image src="/images/logo.png" alt="Goats Heritage" width={200} height={100} className="mx-auto h-32 w-auto" />
          <h1 className="mt-8 text-5xl font-bold leading-tight md:text-7xl">
            Our <span className="text-[#C8A84E]">Story</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#A3A3A3]">
            More than cigars. A heritage built on craft, culture, and community.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
              Our Mission
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Elevating <span className="text-[#C8A84E]">Tradition</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>
          <p className="mt-8 text-center leading-relaxed text-[#A3A3A3]">
            {/* TODO: Add mission statement */}
            Coming soon.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-[#141414] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="flex items-center justify-center">
            <div className="aspect-[3/4] w-full max-w-sm rounded-xl border border-[#C8A84E]/20 bg-[#1A1A1A]" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
              The Founder
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              {/* TODO: Add founder name */}
              <span className="text-[#C8A84E]">Coming Soon</span>
            </h2>
            <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
            <p className="mt-6 leading-relaxed text-[#A3A3A3]">
              {/* TODO: Add founder bio */}
              Founder bio coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              What We <span className="text-[#C8A84E]">Stand For</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Craft", description: "TODO: Add description" },
              { title: "Culture", description: "TODO: Add description" },
              { title: "Community", description: "TODO: Add description" },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-[#262626] bg-[#141414] p-6 text-center"
              >
                <h3 className="text-lg font-semibold text-[#C8A84E]">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#141414] py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            Join the <span className="text-[#C8A84E]">Heritage</span>
          </h2>
          <p className="mt-4 text-[#A3A3A3]">
            Be part of a community that celebrates the craft.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/shop"
              className="rounded-lg bg-[#C8A84E] px-8 py-4 font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              Shop Collection
            </a>
            <a
              href="/membership"
              className="rounded-lg border border-[#C8A84E] px-8 py-4 text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Join the Club
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
