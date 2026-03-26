"use client";

import Link from "next/link";
import Image from "next/image";
import { type Product, formatPrice } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const href = `/shop/${product.category}/${product.slug}`;
  const hasImage = product.images.length > 0;
  const soldOut = product.inventory_count === 0;

  function handleAdd() {
    addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price_cents: product.price_cents,
      image: hasImage ? product.images[0] : null,
      is_member_exclusive: product.is_member_exclusive,
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#262626] bg-[#141414] transition-all duration-300 hover:border-[#C8A84E]">
      {/* Image */}
      <Link href={href} className="relative aspect-square overflow-hidden bg-[#1A1A1A]">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#262626] transition-transform duration-300 group-hover:scale-105">
            <span className="text-4xl">&#9672;</span>
          </div>
        )}

        {product.is_member_exclusive && (
          <span className="absolute left-3 top-3 rounded-md bg-[#C8A84E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            Members Only
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs uppercase tracking-wider text-[#A3A3A3]">
          {product.category}
        </span>

        <Link href={href}>
          <h3 className="mt-1 font-medium text-[#F5F5F5] transition-colors group-hover:text-[#C8A84E]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-[#F5F5F5]">
            {formatPrice(product.price_cents)}
          </span>
          {product.compare_at_price_cents && (
            <span className="text-sm text-[#A3A3A3] line-through">
              {formatPrice(product.compare_at_price_cents)}
            </span>
          )}
        </div>

        <div className="flex-1" />
      </div>

      {/* Add to Cart / Sold Out */}
      {soldOut ? (
        <button
          disabled
          className="w-full bg-[#262626] py-2.5 text-sm font-semibold text-[#A3A3A3]"
        >
          Sold Out
        </button>
      ) : (
        <button
          onClick={handleAdd}
          className="w-full translate-y-2 bg-[#C8A84E] py-2.5 text-sm font-semibold text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
