import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/shop/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import ExperienceSlideshow from "@/components/home/ExperienceSlideshow";
import FadeIn from "@/components/ui/FadeIn";
import { type Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";


export default async function HomePage() {
  const supabase = createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", "cigar")
    .in("slug", ["baby-goats", "florentino"])
    .order("created_at", { ascending: false })
    .limit(2);

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, description, event_date, location, image_url, event_link, is_members_only")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(5);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background carousel */}
        <HeroCarousel />

        <div className="relative z-10 px-4 text-center">
          <div className="animate-fade-in">
            <Image src="/images/logo.png" alt="Goats Heritage" width={500} height={500} className="mx-auto h-56 w-auto sm:h-64 md:h-72 lg:h-80" />
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
          <FadeIn>
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                The <span className="text-[#C8A84E]">Collection</span>
              </h2>
              <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
              <p className="mt-4 text-[#A3A3A3]">
                Hand-selected premium cigars for every occasion.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {((featuredProducts as Product[]) || []).map((product, i) => (
              <FadeIn key={product.id} delay={i * 100}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="inline-block rounded-lg border border-[#C8A84E] px-8 py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
              >
                View All Products
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Membership Teaser ── */}
      <section className="bg-[#141414] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          {/* Left — text */}
          <FadeIn>
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
          </FadeIn>

          {/* Right — lifestyle image */}
          <FadeIn delay={200}>
          <div className="flex items-center justify-center">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-[#C8A84E]/20">
              <Image
                src="https://images.unsplash.com/photo-1592862080230-fe0a3b380f21?w=800&q=80"
                alt="Premium cigar and whiskey"
                fill
                className="object-cover"
              />
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Experience & Events Slideshow ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <ExperienceSlideshow events={(upcomingEvents as any[]) || []} />
          </FadeIn>
        </div>
      </section>
    </>
  );
}
