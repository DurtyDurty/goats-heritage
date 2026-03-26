"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/types";
import { redirectToCheckout } from "@/lib/checkout";

export default function CartDrawer() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const {
    items,
    isLoaded,
    drawerOpen,
    setDrawerOpen,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();

  if (!isLoaded) return null;

  return (
    <>
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black/60"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[90] flex w-full flex-col border-l border-[#262626] bg-[#141414] shadow-2xl transition-transform duration-300 sm:max-w-md ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] px-6 py-4">
          <h2 className="text-lg font-bold text-[#F5F5F5]">
            Your Cart{" "}
            <span className="text-sm font-normal text-[#A3A3A3]">
              ({getCartCount()})
            </span>
          </h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-[#A3A3A3] transition-colors hover:text-[#F5F5F5]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <p className="text-[#A3A3A3]">Your cart is empty</p>
            <Link
              href="/shop"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border border-[#C8A84E] px-6 py-2 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-4 rounded-lg border border-[#262626] bg-[#1A1A1A] p-3"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[#262626]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#262626]">
                          <span className="text-xl">&#9672;</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/shop/${item.category}/${item.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="text-sm font-medium text-[#F5F5F5] transition-colors hover:text-[#C8A84E]"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-2 text-[#A3A3A3] transition-colors hover:text-[#EF4444]"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="mt-0.5 text-xs text-[#A3A3A3]">
                        {formatPrice(item.price_cents)}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.quantity - 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm text-[#F5F5F5]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="text-sm font-medium text-[#F5F5F5]">
                          {formatPrice(item.price_cents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#262626] px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[#A3A3A3]">Subtotal</span>
                <span className="text-xl font-bold text-[#F5F5F5]">
                  {formatPrice(getCartTotal())}
                </span>
              </div>

              <label className="mt-4 flex items-start gap-2 text-xs text-[#A3A3A3]">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 accent-[#C8A84E]"
                />
                I confirm that I am 21 years of age or older and legally permitted to purchase tobacco products.
              </label>

              {checkoutError && (
                <p className="mt-2 text-sm text-[#EF4444]">{checkoutError}</p>
              )}

              <button
                onClick={async () => {
                  if (!ageConfirmed) {
                    setCheckoutError("You must confirm you are 21 or older.");
                    return;
                  }
                  setCheckoutError("");
                  setCheckoutLoading(true);
                  try {
                    await redirectToCheckout(items);
                  } catch (err: any) {
                    setCheckoutError(err.message);
                    setCheckoutLoading(false);
                  }
                }}
                disabled={checkoutLoading || !ageConfirmed}
                className="mt-4 block w-full rounded-lg bg-[#C8A84E] py-4 text-center font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
              >
                {checkoutLoading ? "Redirecting..." : "Proceed to Checkout"}
              </button>

              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-3 w-full text-center text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
