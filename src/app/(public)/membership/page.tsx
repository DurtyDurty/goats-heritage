import Link from "next/link";
import { Package, Lock, MapPin, Users, Check } from "lucide-react";

const benefits = [
  {
    icon: Package,
    title: "Monthly Curated Box",
    description:
      "Hand-selected premium cigars delivered to your door every month. Each box is a journey through the world's finest tobacco.",
  },
  {
    icon: Lock,
    title: "Members-Only Drops",
    description:
      "Early access to exclusive merch and limited-edition releases before they hit the public shop.",
  },
  {
    icon: MapPin,
    title: "Lounge Access",
    description:
      "Priority access to Goats Heritage events, tastings, and lounge experiences across the country.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join a network of cigar enthusiasts and collectors. Connect, share, and elevate the culture together.",
  },
];

const included = [
  "5–7 premium cigars monthly",
  "Exclusive member-only merchandise",
  "10% off all shop purchases",
  "VIP event invitations",
  "Early access to new releases",
  "Member community access",
  "Free shipping on all orders",
];

const faqs = [
  {
    question: "What's in the monthly box?",
    answer:
      "Each Heritage Box includes 5–7 hand-selected premium cigars from top manufacturers worldwide, along with tasting notes, pairing suggestions, and occasionally exclusive accessories or merch items.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel or pause your subscription at any time through your account dashboard or the Stripe Customer Portal. No contracts, no commitments.",
  },
  {
    question: "When does my box ship?",
    answer:
      "Boxes ship on the 1st of each month. Orders placed before the 25th will be included in the next month's shipment. Standard shipping is free for all members.",
  },
  {
    question: "Is there an age requirement?",
    answer:
      "Yes. You must be 21 years or older to subscribe. Age verification is required during signup and is checked again at checkout in compliance with tobacco regulations.",
  },
  {
    question: "Can I gift a membership?",
    answer:
      "Gift memberships are coming soon. In the meantime, reach out to us directly and we'll help you set up a gift subscription manually.",
  },
];

export default function MembershipPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden py-32">
        <img
          src="https://images.unsplash.com/photo-1669554017468-2399ffe08222?w=1920&q=80"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover brightness-[0.15]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.06)_0%,_transparent_70%)]" />
        <div className="relative z-10 px-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
            The Club
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight md:text-7xl">
            Join the <span className="text-[#C8A84E]">Heritage</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#A3A3A3]">
            A premium cigar subscription built for connoisseurs. Monthly curated
            boxes, exclusive access, and a community that celebrates the craft.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Member <span className="text-[#C8A84E]">Benefits</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-[#262626] bg-[#141414] p-6 transition-colors hover:border-[#C8A84E]/30"
              >
                <b.icon className="h-8 w-8 text-[#C8A84E]" />
                <h3 className="mt-4 text-lg font-semibold text-[#F5F5F5]">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A3A3A3]">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#141414] py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Simple <span className="text-[#C8A84E]">Pricing</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>

          <div className="mt-12 rounded-2xl border-2 border-[#C8A84E] bg-[#0A0A0A] p-8">
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#C8A84E]/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#C8A84E]">
                Most Popular
              </span>
              <h3 className="mt-4 text-2xl font-bold text-[#F5F5F5]">
                The Heritage Box
              </h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-[#F5F5F5]">
                  $49.99
                </span>
                <span className="text-[#A3A3A3]">/month</span>
              </div>
            </div>

            <ul className="mt-8 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#C8A84E]" />
                  <span className="text-[#A3A3A3]">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/membership/join"
              className="mt-8 block w-full rounded-lg bg-[#C8A84E] py-4 text-center font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              Join the Club
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Frequently <span className="text-[#C8A84E]">Asked</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-[#262626] bg-[#141414]"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[#F5F5F5] [&::-webkit-details-marker]:hidden">
                  <span className="font-medium">{faq.question}</span>
                  <span className="ml-4 text-[#C8A84E] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm leading-relaxed text-[#A3A3A3]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
