import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/shop/ProductGrid";
import { type Product, CATEGORY_LABELS } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface Props {
  params: { category: string };
  searchParams: { sort?: string; q?: string };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const supabase = createClient();
  const label = CATEGORY_LABELS[params.category] || params.category;

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", params.category);

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

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
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#A3A3A3]">
          <Link href="/shop" className="transition-colors hover:text-[#C8A84E]">
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#F5F5F5]">{label}</span>
        </nav>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold md:text-4xl">
            <span className="text-[#C8A84E]">{label}</span>
          </h1>
          <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
        </div>

        {/* Products */}
        <ProductGrid products={(products as Product[]) || []} />
      </div>
    </section>
  );
}
