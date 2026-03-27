import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/shop/ProductCard";
import { MapPin } from "lucide-react";
import { type Product } from "@/lib/types";

const featuredProducts: Product[] = [
  { id: "1", name: "Heritage Robusto", slug: "heritage-robusto", description: null, category: "cigar", price_cents: 1800, compare_at_price_cents: null, images: [], inventory_count: 20, is_active: true, is_member_exclusive: false, metadata: {}, stripe_price_id: null, created_at: "", updated_at: "" },
  { id: "2", name: "Legacy Toro", slug: "legacy-toro", description: null, category: "cigar", price_cents: 2200, compare_at_price_cents: null, images: [], inventory_count: 15, is_active: true, is_member_exclusive: false, metadata: {}, stripe_price_id: null, created_at: "", updated_at: "" },
  { id: "3", name: "Crown Churchill", slug: "crown-churchill", description: null, category: "cigar", price_cents: 2800, compare_at_price_cents: null, images: [], inventory_count: 10, is_active: true, is_member_exclusive: false, metadata: {}, stripe_price_id: null, created_at: "", updated_at: "" },
  { id: "4", name: "Gold Label Sampler", slug: "gold-label-sampler", description: null, category: "cigar", price_cents: 6500, compare_at_price_cents: null, images: [], inventory_count: 8, is_active: true, is_member_exclusive: true, metadata: {}, stripe_price_id: null, created_at: "", updated_at: "" },
];

const upcomingEvents = [
  {
    date: "APR 12",
    title: "Spring Smoke & Social",
    location: "Houston, TX",
    description: "An evening of premium cigars, craft cocktails, and good company.",
  },
  {
    date: "APR 26",
    title: "Members-Only Tasting",
    location: "Dallas, TX",
    description: "Exclusive tasting of our newest limited-edition blends.",
  },
  {
    date: "MAY 10",
    title: "Heritage Gala Night",
    location: "Miami, FL",
    description: "Our annual celebration of culture, craft, and community.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-[#141414] to-[#0A0A0A]">
        {/* Radial gold overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.08)_0%,_transparent_70%)]" />

        <div className="relative z-10 px-4 text-center">
          <div className="animate-fade-in">
            <Image src="/images/logo.png" alt="Goats Heritage" width={400} height={200} className="mx-auto h-48 w-auto md:h-56" />
          </div>

          <h1 className="mt-8 text-5xl font-bold leading-tight md:text-7xl">
            <span className="text-[#C8A84E]">Heritage</span> in Every Draw
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#A3A3A3]">
            Curated premium cigars, exclusive merch, and a community built on
            tradition. Welcome to the culture.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-lg bg-[#C8A84E] px-8 py-4 font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              Shop Collection
            </Link>
            <Link
              href="/membership"
              className="rounded-lg border border-[#C8A84E] px-8 py-4 text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Join the Club
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Collection ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              The <span className="text-[#C8A84E]">Collection</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
            <p className="mt-4 text-[#A3A3A3]">
              Hand-selected premium cigars for every occasion.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-block rounded-lg border border-[#C8A84E] px-8 py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── Membership Teaser ── */}
      <section className="bg-[#141414] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          {/* Left — text */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
              The Inner Circle
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Join the <span className="text-[#C8A84E]">Club</span>
            </h2>
            <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
            <p className="mt-6 leading-relaxed text-[#A3A3A3]">
              Monthly curated cigar boxes delivered to your door. Members get
              early access to limited releases, exclusive merch drops, VIP event
              invites, and a community of like-minded aficionados.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#A3A3A3]">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8A84E]" />
                Monthly premium cigar selection
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8A84E]" />
                Exclusive member-only merchandise
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8A84E]" />
                VIP access to private events
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8A84E]" />
                10% off all shop purchases
              </li>
            </ul>
            <Link
              href="/membership"
              className="mt-8 inline-block rounded-lg bg-[#C8A84E] px-8 py-3 font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              Learn More
            </Link>
          </div>

          {/* Right — placeholder image */}
          <div className="flex items-center justify-center">
            <div className="aspect-[4/5] w-full max-w-sm rounded-xl border border-[#C8A84E]/20 bg-[#1A1A1A]" />
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              The <span className="text-[#C8A84E]">Experience</span>
            </h2>
            <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
            <p className="mt-4 text-[#A3A3A3]">
              Connect, celebrate, and enjoy the culture in person.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="rounded-xl border border-[#262626] bg-[#141414] p-6 transition-colors hover:border-[#C8A84E]/30"
              >
                <span className="inline-block rounded-md bg-[#C8A84E]/10 px-3 py-1 text-xs font-bold tracking-wider text-[#C8A84E]">
                  {event.date}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#F5F5F5]">
                  {event.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-[#A3A3A3]">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
                  {event.description}
                </p>
                <button className="mt-5 w-full rounded-lg border border-[#C8A84E] py-2 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                  RSVP
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
