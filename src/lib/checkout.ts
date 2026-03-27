"use client";

import { type CartItem } from "./cart-context";

export async function redirectToCheckout(items: CartItem[]) {
  // All orders now go through our custom checkout page
  window.location.href = "/checkout";
}
