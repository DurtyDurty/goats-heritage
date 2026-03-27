"use client";

declare global {
  interface Window {
    Accept: any;
  }
}

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isLoaded, clearCart, getCartTotal } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // Shipping fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login?redirect=/checkout");
        return;
      }
      setAuthenticated(true);
    });
  }, [router]);

  // Redirect if cart empty
  useEffect(() => {
    if (isLoaded && items.length === 0 && authenticated) {
      router.push("/cart");
    }
    if (isLoaded && authenticated && items.length > 0) {
      setPageReady(true);
    }
  }, [isLoaded, items, authenticated, router]);

  // Load Accept.js
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("accept-js-script")) return;
    const script = document.createElement("script");
    script.id = "accept-js-script";
    script.src = "https://jstest.authorize.net/v1/Accept.js";
    script.charset = "utf-8";
    document.head.appendChild(script);
  }, []);

  const hasCigars = items.some((item) => item.category === "cigar");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (hasCigars && !ageConfirmed) {
      setError("You must confirm you are 21 or older to purchase tobacco products.");
      return;
    }

    setLoading(true);

    // Tokenize card via Accept.js
    const authData = {
      clientKey: process.env.NEXT_PUBLIC_AUTHNET_CLIENT_KEY!,
      apiLoginID: process.env.NEXT_PUBLIC_AUTHNET_API_LOGIN_ID!,
    };

    const cardData = {
      cardNumber,
      month: expMonth,
      year: expYear,
      cardCode: cvv,
    };

    window.Accept.dispatchData(
      { authData, cardData },
      async (response: any) => {
        if (response.messages.resultCode === "Error") {
          setError(
            response.messages.message
              .map((m: any) => m.text)
              .join(". ")
          );
          setLoading(false);
          return;
        }

        const opaqueData = response.opaqueData;

        try {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              opaqueData,
              items: items.map((i) => ({
                product_id: i.product_id,
                name: i.name,
                price_cents: i.price_cents,
                quantity: i.quantity,
              })),
              shippingAddress: {
                firstName,
                lastName,
                address,
                city,
                state,
                zip,
                phone,
              },
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Checkout failed");
            setLoading(false);
            return;
          }

          clearCart();
          router.push("/account/orders?success=true");
        } catch (err: any) {
          setError(err.message || "Something went wrong");
          setLoading(false);
        }
      }
    );
  }

  if (!pageReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#262626] border-t-[#C8A84E]" />
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">
          <span className="text-[#C8A84E]">Checkout</span>
        </h1>
        <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Order Summary */}
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Order Summary
            </h2>
            <div className="mt-4 divide-y divide-[#262626]">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <span className="text-sm text-[#F5F5F5]">{item.name}</span>
                    <span className="ml-2 text-xs text-[#A3A3A3]">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="text-sm text-[#F5F5F5]">
                    {formatPrice(item.price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#262626] pt-4">
              <span className="font-semibold text-[#F5F5F5]">Total</span>
              <span className="text-xl font-bold text-[#C8A84E]">
                {formatPrice(getCartTotal())}
              </span>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Shipping Address
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <input
                type="text"
                placeholder="Address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E] sm:col-span-2"
              />
              <input
                type="text"
                placeholder="City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E] sm:col-span-2"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Payment Details
            </h2>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={16}
                className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="MM"
                  required
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  maxLength={2}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
                <input
                  type="text"
                  placeholder="YYYY"
                  required
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  maxLength={4}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
              </div>
            </div>
          </div>

          {/* Age Confirmation (cigars) */}
          {hasCigars && (
            <label className="flex items-start gap-3 rounded-xl border border-[#262626] bg-[#141414] p-6 text-sm text-[#A3A3A3]">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-[#C8A84E]"
              />
              I confirm that I am 21 years of age or older and legally permitted
              to purchase tobacco products. I understand that tobacco products
              will require an adult signature upon delivery.
            </label>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/5 px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#C8A84E] py-4 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

          {/* Compliance */}
          <p className="text-center text-xs text-[#A3A3A3]">
            Your payment is processed securely through Authorize.Net. Tobacco
            products are sold in compliance with all applicable federal, state,
            and local laws. You must be 21 years or older to purchase tobacco
            products.
          </p>
        </form>
      </div>
    </section>
  );
}
