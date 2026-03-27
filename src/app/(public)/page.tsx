import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/shop/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
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
            {((featuredProducts as Product[]) || []).map((product) => (
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

          {/* Right — lifestyle image */}
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
              Tune in on our social media for upcoming events.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              {/* Instagram */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#262626] text-[#A3A3A3] transition-all hover:border-[#C8A84E] hover:text-[#C8A84E] hover:shadow-[0_0_15px_rgba(200,168,78,0.15)]"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#262626] text-[#A3A3A3] transition-all hover:border-[#C8A84E] hover:text-[#C8A84E] hover:shadow-[0_0_15px_rgba(200,168,78,0.15)]"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>

              {/* TikTok */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#262626] text-[#A3A3A3] transition-all hover:border-[#C8A84E] hover:text-[#C8A84E] hover:shadow-[0_0_15px_rgba(200,168,78,0.15)]"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#262626] text-[#A3A3A3] transition-all hover:border-[#C8A84E] hover:text-[#C8A84E] hover:shadow-[0_0_15px_rgba(200,168,78,0.15)]"
                aria-label="X"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#262626] text-[#A3A3A3] transition-all hover:border-[#C8A84E] hover:text-[#C8A84E] hover:shadow-[0_0_15px_rgba(200,168,78,0.15)]"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
