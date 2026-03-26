"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/types";
import { redirectToCheckout } from "@/lib/checkout";

export default function CartPage() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const {
    items,
    isLoaded,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();

  if (!isLoaded) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-xl bg-[#141414]" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">
          Your <span className="text-[#C8A84E]">Cart</span>
        </h1>
        <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg text-[#A3A3A3]">Your cart is empty</p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-lg border border-[#C8A84E] px-8 py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            {/* Header row — desktop */}
            <div className="mt-8 hidden grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-[#262626] pb-4 text-sm text-[#A3A3A3] md:grid">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span className="w-8" />
            </div>

            {/* Items */}
            <div className="divide-y divide-[#262626]">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                >
                  {/* Product */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#1A1A1A]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#262626]">
                          <span className="text-2xl">&#9672;</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/shop/${item.category}/${item.slug}`}
                        className="font-medium text-[#F5F5F5] transition-colors hover:text-[#C8A84E]"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-[#A3A3A3]">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="text-sm text-[#A3A3A3]">
                    {formatPrice(item.price_cents)}
                  </span>

                  {/* Quantity */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm text-[#F5F5F5]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Total */}
                  <span className="font-medium text-[#F5F5F5]">
                    {formatPrice(item.price_cents * item.quantity)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="flex h-8 w-8 items-center justify-center text-[#A3A3A3] transition-colors hover:text-[#EF4444]"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 flex flex-col items-end border-t border-[#262626] pt-8">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#A3A3A3]">
                    Subtotal ({getCartCount()} items)
                  </span>
                  <span className="text-2xl font-bold text-[#F5F5F5]">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>

                <p className="text-xs text-[#A3A3A3]">
                  Shipping and taxes calculated at checkout.
                </p>

                {checkoutError && (
                  <p className="text-sm text-[#EF4444]">{checkoutError}</p>
                )}

                <button
                  onClick={async () => {
                    setCheckoutError("");
                    setCheckoutLoading(true);
                    try {
                      await redirectToCheckout(items);
                    } catch (err: any) {
                      setCheckoutError(err.message);
                      setCheckoutLoading(false);
                    }
                  }}
                  disabled={checkoutLoading}
                  className="mt-4 block w-full rounded-lg bg-[#C8A84E] py-4 text-center font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
                >
                  {checkoutLoading ? "Redirecting..." : "Proceed to Checkout"}
                </button>

                <Link
                  href="/shop"
                  className="block text-center text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
