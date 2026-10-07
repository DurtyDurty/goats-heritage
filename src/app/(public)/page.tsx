import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/shop/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import ExperienceSlideshow from "@/components/home/ExperienceSlideshow";
import InstagramFeed from "@/components/home/InstagramFeed";
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
    .in("slug", ["jared", "florentino", "baby-goats", "baby-goats-honey-vanilla"])
    .order("created_at", { ascending: false })
    .limit(4);

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

          <h1 className="mt-8 text-5xl font-bold uppercase leading-tight tracking-wide md:text-7xl">
            Welcome to the <span className="text-[#C8A84E]">Herd</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#A3A3A3]">
            A community built on tradition, and the mindset to never quit
            climbing until you conquer your own mountain.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[#F5F5F5]">
            We offer premium cigars and exclusive merchandise.
          </p>

          <p className="mt-4 text-sm font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
            Built with purpose.
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

      {/* ── Experience & Events Slideshow ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <ExperienceSlideshow events={(upcomingEvents as any[]) || []} />
          </FadeIn>
        </div>
      </section>

      {/* ── Instagram (renders only once a token is configured) ── */}
      <InstagramFeed />
    </>
  );
}
