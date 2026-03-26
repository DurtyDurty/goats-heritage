import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/shop/ProductGrid";
import ShopControls from "@/components/shop/ShopControls";
import { type Product } from "@/lib/types";

interface Props {
  searchParams: { category?: string; sort?: string; q?: string };
}

export default async function ShopPage({ searchParams }: Props) {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  // Category filter
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }

  // Search
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  // Sort
  switch (searchParams.sort) {
    case "price_asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_cents", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold md:text-4xl">
            The <span className="text-[#C8A84E]">Collection</span>
          </h1>
          <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
        </div>

        {/* Controls */}
        <ShopControls />

        {/* Products */}
        <div className="mt-10">
          <ProductGrid products={(products as Product[]) || []} />
        </div>
      </div>
    </section>
  );
}
