"use client";

declare global {
  interface Window {
    Accept: any;
  }
}

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, ShieldCheck, ChevronLeft, CreditCard, Mail, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import CardLogos, { CardLogo, detectCardBrand } from "@/components/checkout/CardLogos";
import { PURCHASES_ENABLED, PURCHASES_PAUSED_MESSAGE } from "@/lib/purchases";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC",
  "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function formatCardNumber(digits: string, isAmex: boolean): string {
  if (isAmex) {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

const inputClass =
  "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#555] outline-none transition-colors focus:border-[#C8A84E] focus:ring-1 focus:ring-[#C8A84E]/30";
const labelClass = "mb-1.5 block text-xs font-medium text-[#A3A3A3]";

function SectionHeading({ step, icon, title, aside }: { step: number; icon: React.ReactNode; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C8A84E] text-xs font-bold text-black">{step}</span>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#F5F5F5]">
        {icon}
        {title}
      </h2>
      {aside && <div className="ml-auto">{aside}</div>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isLoaded, clearCart, getCartTotal, getCartCount } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // Contact
  const [email, setEmail] = useState("");

  // Shipping fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  // Card fields (digits only; formatted for display)
  const [cardDigits, setCardDigits] = useState("");
  const [expDigits, setExpDigits] = useState("");
  const [cvv, setCvv] = useState("");

  const brand = detectCardBrand(cardDigits);
  const isAmex = brand === "amex";
  const cardMaxLength = isAmex ? 15 : 16;
  const cvvLength = isAmex ? 4 : 3;

  // Auth check, and prefill the confirmation email from the account
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login?redirect=/checkout");
        return;
      }
      setEmail((current) => current || user.email || "");
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
  const total = getCartTotal();

  function validate(): string | null {
    if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address for your order confirmation.";
    if (!state) return "Select your state.";
    if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) return "Enter a valid ZIP code.";
    if (phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
    if (cardDigits.length !== cardMaxLength || !luhnValid(cardDigits)) return "Check your card number.";
    if (expDigits.length !== 4) return "Enter your card's expiration date as MM / YY.";
    const month = parseInt(expDigits.slice(0, 2), 10);
    const year = 2000 + parseInt(expDigits.slice(2), 10);
    if (month < 1 || month > 12) return "Check your card's expiration month.";
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      return "This card has expired.";
    }
    if (cvv.length !== cvvLength) return `Enter the ${cvvLength}-digit security code.`;
    if (hasCigars && !ageConfirmed) return "You must confirm you are 21 or older to purchase tobacco products.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Paused: stop before the card is sent anywhere
    if (!PURCHASES_ENABLED) {
      setError(PURCHASES_PAUSED_MESSAGE);
      return;
    }

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    if (!window.Accept) {
      setError("The secure payment form is still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    // Card details go straight from the browser to Authorize.Net and come back as a one-time token
    const authData = {
      clientKey: process.env.NEXT_PUBLIC_AUTHNET_CLIENT_KEY!,
      apiLoginID: process.env.NEXT_PUBLIC_AUTHNET_API_LOGIN_ID!,
    };

    const cardData = {
      cardNumber: cardDigits,
      month: expDigits.slice(0, 2),
      year: "20" + expDigits.slice(2),
      cardCode: cvv,
    };

    window.Accept.dispatchData({ authData, cardData }, async (response: any) => {
      if (response.messages.resultCode === "Error") {
        setError(response.messages.message.map((m: any) => m.text).join(". "));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opaqueData: response.opaqueData,
            email: email.trim(),
            items: items.map((i) => ({
              product_id: i.product_id,
              name: i.name,
              price_cents: i.price_cents,
              quantity: i.quantity,
            })),
            shippingAddress: { firstName, lastName, address, city, state, zip, phone },
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
    });
  }

  if (!pageReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#262626] border-t-[#C8A84E]" />
      </div>
    );
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]">
              <ChevronLeft className="h-4 w-4" /> Back to cart
            </Link>
            <h1 className="mt-2 text-3xl font-bold">
              Secure <span className="text-[#C8A84E]">Checkout</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/5 px-4 py-2 text-xs font-medium text-[#22C55E]">
            <Lock className="h-3.5 w-3.5" /> SSL encrypted connection
          </div>
        </div>

        {!PURCHASES_ENABLED && (
          <div role="status" className="mt-6 rounded-xl border border-[#C8A84E]/40 bg-[#C8A84E]/5 px-5 py-4">
            <p className="font-semibold text-[#E8D48B]">Online ordering opens soon</p>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              We are not taking payments yet, so orders cannot be placed and your card will not be charged.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* ── Left: details ── */}
          <div className="space-y-6 lg:col-span-3">
            {/* Contact */}
            <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
              <SectionHeading step={1} icon={<Mail className="h-4 w-4 text-[#C8A84E]" />} title="Contact" />
              <div className="mt-5">
                <label htmlFor="email" className={labelClass}>Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-[#A3A3A3]">
                  Your order confirmation and shipping updates are sent here.
                </p>
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
              <SectionHeading step={2} icon={<Truck className="h-4 w-4 text-[#C8A84E]" />} title="Shipping address" />
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>First name</label>
                  <input id="firstName" type="text" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>Last name</label>
                  <input id="lastName" type="text" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className={labelClass}>Street address</label>
                  <input id="address" type="text" required autoComplete="street-address" placeholder="Street, apartment, suite" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="city" className={labelClass}>City</label>
                  <input id="city" type="text" required autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className={labelClass}>State</label>
                    <select id="state" required autoComplete="address-level1" value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="zip" className={labelClass}>ZIP code</label>
                    <input id="zip" type="text" required inputMode="numeric" autoComplete="postal-code" maxLength={10} value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={labelClass}>Phone</label>
                  <input id="phone" type="tel" required autoComplete="tel" placeholder="For delivery questions only" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
              <SectionHeading
                step={3}
                icon={<CreditCard className="h-4 w-4 text-[#C8A84E]" />}
                title="Payment"
                aside={<CardLogos active={brand} />}
              />
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="cardNumber" className={labelClass}>Card number</label>
                  <div className="relative">
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardDigits, isAmex)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        const max = detectCardBrand(digits) === "amex" ? 15 : 16;
                        setCardDigits(digits.slice(0, max));
                      }}
                      className={inputClass + " pr-16 tracking-wider"}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      {brand ? <CardLogo brand={brand} /> : <Lock className="h-4 w-4 text-[#555]" />}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExp" className={labelClass}>Expiration date</label>
                    <input
                      id="cardExp"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      value={expDigits.length > 2 ? `${expDigits.slice(0, 2)} / ${expDigits.slice(2)}` : expDigits}
                      onChange={(e) => {
                        let digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                        // "5" → "05" so a single-digit month does not need a leading zero
                        if (digits.length === 1 && parseInt(digits, 10) > 1) digits = "0" + digits;
                        setExpDigits(digits);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="cardCvv" className={labelClass}>Security code</label>
                    <input
                      id="cardCvv"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder={isAmex ? "4 digits" : "CVV"}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, cvvLength))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <p className="flex items-start gap-2 text-xs leading-relaxed text-[#A3A3A3]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]" />
                  Your card details are encrypted and sent directly to Authorize.Net. They are never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: order summary ── */}
          <div className="lg:col-span-2">
            <div className="space-y-5 rounded-xl border border-[#262626] bg-[#141414] p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">
                Order summary <span className="text-sm font-normal text-[#A3A3A3]">({getCartCount()} {getCartCount() === 1 ? "item" : "items"})</span>
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <div className="relative h-16 w-12 flex-shrink-0 rounded-md border border-[#262626] bg-[#0A0A0A]">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="48px" className="rounded-md object-cover" />
                      ) : (
                        <Image src="/images/logo.png" alt="" fill sizes="48px" className="object-contain p-1.5 opacity-70" />
                      )}
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C8A84E] px-1 text-[10px] font-bold text-black">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#F5F5F5]">{item.name}</p>
                      <p className="text-xs capitalize text-[#A3A3A3]">{item.category} · {formatPrice(item.price_cents)} each</p>
                    </div>
                    <span className="text-sm font-medium text-[#F5F5F5]">{formatPrice(item.price_cents * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[#262626] pt-4 text-sm">
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-[#262626] pt-3">
                  <span className="font-semibold text-[#F5F5F5]">Total</span>
                  <span className="text-2xl font-bold text-[#C8A84E]">{formatPrice(total)}</span>
                </div>
              </div>

              {hasCigars && (
                <label className="flex items-start gap-3 rounded-lg border border-[#262626] bg-[#0A0A0A] p-4 text-xs leading-relaxed text-[#A3A3A3]">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#C8A84E]"
                  />
                  I confirm that I am 21 years of age or older and legally permitted to purchase tobacco products. I understand an adult signature is required on delivery.
                </label>
              )}

              {error && (
                <p role="alert" className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/5 px-4 py-3 text-sm text-[#EF4444]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !PURCHASES_ENABLED}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8A84E] py-4 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {!PURCHASES_ENABLED ? "Ordering Opens Soon" : loading ? "Processing..." : `Pay ${formatPrice(total)}`}
              </button>

              <div className="flex flex-col items-center gap-3">
                <CardLogos />
                <p className="text-center text-[11px] leading-relaxed text-[#A3A3A3]">
                  Payments are processed securely by Authorize.Net. You must be 21 or older to purchase tobacco products.
                </p>
                <p className="text-center text-[11px] leading-relaxed text-[#A3A3A3]">
                  By placing your order you agree to our{" "}
                  <Link href="/terms" className="text-[#C8A84E] hover:text-[#E8D48B]">Terms of Service</Link>,{" "}
                  <Link href="/shipping" className="text-[#C8A84E] hover:text-[#E8D48B]">Shipping Policy</Link>, and{" "}
                  <Link href="/refund-policy" className="text-[#C8A84E] hover:text-[#E8D48B]">Refund Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
