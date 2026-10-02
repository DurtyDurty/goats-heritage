"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Empties the cart once the order is confirmed paid. Renders nothing. */
export default function ClearCart() {
  const { isLoaded, items, clearCart } = useCart();

  useEffect(() => {
    if (isLoaded && items.length > 0) clearCart();
  }, [isLoaded, items.length, clearCart]);

  return null;
}
