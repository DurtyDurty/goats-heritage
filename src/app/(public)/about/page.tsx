import Image from "next/image";
import type { Metadata } from "next";
import HeritageCarousel from "@/components/about/HeritageCarousel";

export const metadata: Metadata = {
  title: "About | Goats Heritage\u2122",
  description: "The story behind Goats Heritage \u2014 premium cigars and lifestyle. Built with purpose, driven by legacy.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden py-32">
        <Image
          src="https://images.unsplash.com/photo-1633526544668-c4f2e3c8d999?w=1920&q=80"
          alt=""
          fill
          className="object-cover brightness-[0.15]"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
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
              Built with <span className="text-[#C8A84E]">Purpose</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>
          <div className="mt-10 space-y-6 text-center text-lg leading-relaxed text-[#A3A3A3]">
            <p>
              Goats Heritage exists to build something greater than a brand — a culture rooted in purpose.
            </p>
            <p>
              It is for those committed to becoming the best version of themselves, for those who were guided and now lead others forward.
            </p>
            <p className="font-medium text-[#F5F5F5]">
              Built with purpose, driven by legacy — to honor, to build, and to lead.
            </p>
          </div>
        </div>
      </section>

      {/* Heritage / Patriotic Carousel */}
      <section className="bg-[#141414] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="flex items-center justify-center">
            <HeritageCarousel />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
              The Founder
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Nestor <span className="text-[#C8A84E]">Cuevas Soto</span>
            </h2>
            <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
            <div className="mt-6 space-y-4 leading-relaxed text-[#A3A3A3]">
              <p>Every journey has a beginning.</p>
              <p>
                A kid from Lares, Puerto Rico took a leap of faith and joined the world's strongest Navy, stepping into the unknown and leaving everything familiar behind.
              </p>
              <p>
                Through the years, one thing remained constant: mentorship, leadership, and guidance. The kind that shapes you, molds you, and pushes you to become better than you ever thought possible.
              </p>
              <p>
                In what felt like the blink of an eye, 20 years passed. A career built on discipline, sacrifice, and growth came full circle, and a new chapter began.
              </p>
              <p className="font-medium text-[#F5F5F5]">
                My name is Nestor Cuevas Soto. I am the product of a life shaped by great people, mentors who believed in me before I believed in myself.
              </p>
              <p>
                Goats Heritage is my way of paying that forward.
              </p>
              <p>
                Transitioning from the military comes with a cost, identity, purpose, direction. But those things are not lost, they are rebuilt from within.
              </p>
              <p>
                Goats Heritage is more than a brand. It is a reflection of that journey. A culture built for those striving to become their best. For those who were guided, and now lead.
              </p>
              <p className="mt-2 text-lg font-semibold text-[#C8A84E]">
                I am Goats Heritage.
              </p>
            </div>
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
              { title: "Honor", description: "We honor those who served, those who sacrificed, and those who built the foundation we stand on today." },
              { title: "Legacy", description: "Every product we create is a tribute to the traditions passed down through generations — from the tobacco fields to your hands." },
              { title: "Community", description: "We believe in building a brotherhood of like-minded individuals who elevate each other and celebrate the culture together." },
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
