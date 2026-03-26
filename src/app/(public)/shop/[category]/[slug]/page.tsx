import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { type Product, formatPrice, CATEGORY_LABELS } from "@/lib/types";
import ImageGallery from "@/components/shop/ImageGallery";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductCard from "@/components/shop/ProductCard";

interface Props {
  params: { category: string; slug: string };
}

const CIGAR_SPEC_LABELS: Record<string, string> = {
  origin: "Origin",
  strength: "Strength",
  ring_gauge: "Ring Gauge",
  wrapper: "Wrapper",
  length: "Length",
  filler: "Filler",
  binder: "Binder",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, images")
    .eq("slug", params.slug)
    .eq("category", params.category)
    .eq("is_active", true)
    .single();

  if (!product) {
    return { title: "Product Not Found | Goats Heritage" };
  }

  return {
    title: `${product.name} | Goats Heritage`,
    description: product.description || `Shop ${product.name} at Goats Heritage.`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at Goats Heritage.`,
      images: (product.images || []).map((url: string) => ({ url })),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .eq("category", params.category)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;
  const label = CATEGORY_LABELS[p.category] || p.category;
  const soldOut = p.inventory_count === 0;

  // Related products
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", p.category)
    .neq("id", p.id)
    .limit(4);

  // Cigar specs from metadata
  const specs =
    p.category === "cigar" && p.metadata
      ? Object.entries(p.metadata).filter(([key]) => key in CIGAR_SPEC_LABELS)
      : [];

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#A3A3A3]">
          <Link href="/shop" className="transition-colors hover:text-[#C8A84E]">
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/shop/${p.category}`}
            className="transition-colors hover:text-[#C8A84E]"
          >
            {label}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#F5F5F5]">{p.name}</span>
        </nav>

        {/* Product detail */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — Gallery */}
          <ImageGallery images={p.images} />

          {/* Right — Info */}
          <div>
            <span className="text-xs uppercase tracking-wider text-[#A3A3A3]">
              {p.category}
            </span>

            <h1 className="mt-2 text-3xl font-bold text-[#F5F5F5]">{p.name}</h1>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-[#F5F5F5]">
                {formatPrice(p.price_cents)}
              </span>
              {p.compare_at_price_cents && (
                <span className="text-lg text-[#A3A3A3] line-through">
                  {formatPrice(p.compare_at_price_cents)}
                </span>
              )}
            </div>

            {/* Members badge */}
            {p.is_member_exclusive && (
              <span className="mt-3 inline-block rounded-md bg-[#C8A84E]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C8A84E]">
                Members Only
              </span>
            )}

            {/* Description */}
            {p.description && (
              <p className="mt-6 leading-relaxed text-[#A3A3A3]">
                {p.description}
              </p>
            )}

            {/* Cigar specs */}
            {specs.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {specs.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-[#262626] bg-[#1A1A1A] px-4 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">
                      {CIGAR_SPEC_LABELS[key] || key}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#F5F5F5]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-8">
              <AddToCartButton
                item={{
                  product_id: p.id,
                  name: p.name,
                  slug: p.slug,
                  category: p.category,
                  price_cents: p.price_cents,
                  image: p.images.length > 0 ? p.images[0] : null,
                  is_member_exclusive: p.is_member_exclusive,
                }}
                maxQty={p.inventory_count}
                soldOut={soldOut}
              />
            </div>
          </div>
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold">
              You May Also <span className="text-[#C8A84E]">Like</span>
            </h2>
            <div className="mt-2 h-px w-16 bg-[#C8A84E]/40" />

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(related as Product[]).map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
