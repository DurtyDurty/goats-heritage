"use client";

import { type CartItem } from "./cart-context";

export async function redirectToCheckout(items: CartItem[]) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price_cents: i.price_cents,
        quantity: i.quantity,
      })),
    }),
  });

  const data = await res.json();

  if (res.status === 401) {
    window.location.href = "/login?redirect=/cart";
    return;
  }

  if (!res.ok) {
    throw new Error(data.error || "Checkout failed");
  }

  window.location.href = data.url;
}
