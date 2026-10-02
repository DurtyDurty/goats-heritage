"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, ShieldCheck, ChevronLeft, CreditCard, Mail, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import CardLogos from "@/components/checkout/CardLogos";
import { PURCHASES_ENABLED, PURCHASES_PAUSED_MESSAGE } from "@/lib/purchases";
import { ageFromDob, daysInMonth, MINIMUM_AGE } from "@/lib/age";
import { calculateTotals, cigarsNeeded, FREE_SHIPPING_THRESHOLD_CENTS, MIN_CIGARS_PER_ORDER } from "@/lib/pricing";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC",
  "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const { items, isLoaded, getCartCount } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // Customers can order only when purchases are switched on; admins can always run sandbox tests
  const canPurchase = PURCHASES_ENABLED || isAdmin;

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

  // Date of birth
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");

  const dobComplete = Boolean(dobMonth && dobDay && dobYear);
  const dateOfBirth = dobComplete ? `${dobYear}-${dobMonth.padStart(2, "0")}-${dobDay.padStart(2, "0")}` : "";
  const dobAge = dobComplete ? ageFromDob(dateOfBirth) : null;
  const dobDays = Array.from({ length: daysInMonth(parseInt(dobMonth, 10) || 1, parseInt(dobYear, 10) || 0) }, (_, i) => i + 1);

  // Auth check, prefill the confirmation email, and find out whether this is an admin
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login?redirect=/checkout");
        return;
      }
      setEmail((current) => current || user.email || "");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setIsAdmin(profile?.role === "admin");
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

  const hasCigars = items.some((item) => item.category === "cigar");
  // Shipping estimate for the destination ZIP, refreshed when the ZIP or the cart changes
  const [shippingQuote, setShippingQuote] = useState<{ cents: number; source: string } | null>(null);
  const [quoting, setQuoting] = useState(false);
  const zip5 = /^\d{5}/.test(zip.trim()) ? zip.trim().slice(0, 5) : "";
  const cartKey = items.map((i) => `${i.product_id}:${i.quantity}`).join(",");

  useEffect(() => {
    if (!authenticated || !zip5 || !cartKey) {
      setShippingQuote(null);
      setQuoting(false);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zip: zip5,
            items: cartKey.split(",").map((pair) => {
              const [product_id, quantity] = pair.split(":");
              return { product_id, quantity: Number(quantity) };
            }),
          }),
        });
        const data = await res.json();
        if (!cancelled) {
          setShippingQuote(res.ok && typeof data.shippingCents === "number" ? { cents: data.shippingCents, source: data.source } : null);
        }
      } catch {
        if (!cancelled) setShippingQuote(null);
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authenticated, zip5, cartKey]);

  // Estimate for display. The server recalculates from its own prices before charging.
  const totals = calculateTotals(
    items.map((i) => ({ category: i.category, unit_price_cents: i.price_cents, quantity: i.quantity })),
    state,
    shippingQuote?.cents
  );

  const needed = cigarsNeeded(items);

  function validate(): string | null {
    if (needed > 0) return `The minimum order is ${MIN_CIGARS_PER_ORDER} cigars. Add ${needed} more to continue.`;
    if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address for your order confirmation.";
    if (!state) return "Select your state.";
    if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) return "Enter a valid ZIP code.";
    if (phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
    if (!dobComplete) return "Select your full date of birth to verify your age.";
    if (dobAge === null) return "That date of birth is not a valid date.";
    if (dobAge < MINIMUM_AGE) return `You must be ${MINIMUM_AGE} or older to place an order.`;
    if (hasCigars && !ageConfirmed) return "You must confirm you are 21 or older to purchase tobacco products.";
    if (quoting) return "Shipping is still being calculated. Please try again in a moment.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!canPurchase) {
      setError(PURCHASES_PAUSED_MESSAGE);
      return;
    }

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setLoading(true);

    try {
      // The server creates the order and returns the secure payment page for it.
      // Prices are looked up on the server, so only ids and quantities are sent.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          dateOfBirth,
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          shippingAddress: { firstName, lastName, address, city, state, zip, phone },
          // What the summary is showing, so the server can refuse to charge a different amount
          shippingCents: totals.shippingCents,
        }),
      });

      const data = await res.json();

      // The server's shipping estimate differs from the one shown: update the summary and let them confirm
      if (res.status === 409 && typeof data.shippingCents === "number") {
        setShippingQuote({ cents: data.shippingCents, source: data.source });
        setError(data.error);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.redirectUrl) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      // The cart is kept until the payment is confirmed, in case the customer comes back
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
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

        {!PURCHASES_ENABLED && !isAdmin && (
          <div role="status" className="mt-6 rounded-xl border border-[#C8A84E]/40 bg-[#C8A84E]/5 px-5 py-4">
            <p className="font-semibold text-[#E8D48B]">Online ordering opens soon</p>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              We are not taking payments yet, so orders cannot be placed and your card will not be charged.
            </p>
          </div>
        )}

        {!PURCHASES_ENABLED && isAdmin && (
          <div role="status" className="mt-6 rounded-xl border border-[#3B82F6]/40 bg-[#3B82F6]/5 px-5 py-4">
            <p className="font-semibold text-[#F5F5F5]">Admin test mode</p>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Ordering is paused for customers. As an admin you can place test orders through the payment sandbox. Use a test card. No real card is charged.
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

            {/* Age verification */}
            <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
              <SectionHeading step={3} icon={<ShieldCheck className="h-4 w-4 text-[#C8A84E]" />} title="Age verification" />
              <fieldset className="mt-5">
                <legend className={labelClass}>Date of birth</legend>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    aria-label="Birth month"
                    required
                    autoComplete="bday-month"
                    value={dobMonth}
                    onChange={(e) => {
                      setDobMonth(e.target.value);
                      // Drop a day that the new month does not have (e.g. the 31st)
                      const max = daysInMonth(parseInt(e.target.value, 10) || 1, parseInt(dobYear, 10) || 0);
                      if (parseInt(dobDay, 10) > max) setDobDay("");
                    }}
                    className={inputClass}
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={String(i + 1)}>{m}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Birth day"
                    required
                    autoComplete="bday-day"
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Day</option>
                    {dobDays.map((d) => (
                      <option key={d} value={String(d)}>{d}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Birth year"
                    required
                    autoComplete="bday-year"
                    value={dobYear}
                    onChange={(e) => {
                      setDobYear(e.target.value);
                      const max = daysInMonth(parseInt(dobMonth, 10) || 1, parseInt(e.target.value, 10) || 0);
                      if (parseInt(dobDay, 10) > max) setDobDay("");
                    }}
                    className={inputClass}
                  >
                    <option value="">Year</option>
                    {BIRTH_YEARS.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
                {dobComplete && dobAge !== null && dobAge < MINIMUM_AGE ? (
                  <p role="alert" className="mt-3 text-xs text-[#EF4444]">
                    You must be {MINIMUM_AGE} or older to place an order.
                  </p>
                ) : dobComplete && dobAge !== null ? (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[#22C55E]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Age confirmed, {MINIMUM_AGE} or older.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-[#A3A3A3]">
                    You must be {MINIMUM_AGE} or older to order. An adult signature and photo ID are required on delivery.
                  </p>
                )}
              </fieldset>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
              <SectionHeading
                step={4}
                icon={<CreditCard className="h-4 w-4 text-[#C8A84E]" />}
                title="Payment"
                aside={<CardLogos />}
              />
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-[#262626] bg-[#0A0A0A] p-4">
                  <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C8A84E]" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F5]">Pay by card on our secure payment page</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#A3A3A3]">
                      When you continue, you will be taken to a secure page hosted by our payment processor, Bankful, to enter your card. You return here as soon as the payment is complete.
                    </p>
                  </div>
                </div>
                <p className="flex items-start gap-2 text-xs leading-relaxed text-[#A3A3A3]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]" />
                  Your card details are entered only on the processor&apos;s encrypted page. They never pass through or get stored on our servers.
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
                  <span>{formatPrice(totals.subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>
                    Shipping
                    {shippingQuote?.source === "usps" && totals.shippingCents > 0 && (
                      <span className="ml-1 text-xs">(USPS estimate to {zip5})</span>
                    )}
                  </span>
                  <span className={!quoting && totals.shippingCents === 0 ? "text-[#22C55E]" : ""}>
                    {quoting ? "Calculating..." : totals.shippingCents === 0 ? "Free" : formatPrice(totals.shippingCents)}
                  </span>
                </div>
                {totals.tobaccoTaxCents > 0 && (
                  <div className="flex justify-between text-[#A3A3A3]">
                    <span>Tobacco tax</span>
                    <span>{formatPrice(totals.tobaccoTaxCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>
                    Sales tax{totals.salesTaxRate > 0 && ` (${state} ${(totals.salesTaxRate * 100).toFixed(totals.salesTaxRate * 100 % 1 === 0 ? 0 : 2)}%)`}
                  </span>
                  <span>{state ? formatPrice(totals.salesTaxCents) : "Select state"}</span>
                </div>
                {totals.shippingCents > 0 && (
                  <p className="text-xs text-[#A3A3A3]">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS - totals.subtotalCents)} more for free shipping.
                  </p>
                )}
                <div className="flex items-baseline justify-between border-t border-[#262626] pt-3">
                  <span className="font-semibold text-[#F5F5F5]">Total</span>
                  <span className="text-2xl font-bold text-[#C8A84E]">{formatPrice(totals.totalCents)}</span>
                </div>
              </div>

              {needed > 0 && (
                <p role="status" className="rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-4 py-3 text-sm text-[#F59E0B]">
                  The minimum order is {MIN_CIGARS_PER_ORDER} cigars. Add {needed} more to continue.{" "}
                  <Link href="/shop/cigar" className="underline hover:text-[#E8D48B]">Browse cigars</Link>
                </p>
              )}

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
                disabled={loading || !canPurchase || needed > 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8A84E] py-4 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {!canPurchase ? "Ordering Opens Soon" : loading ? "Opening secure payment..." : "Continue to Secure Payment"}
              </button>

              <div className="flex flex-col items-center gap-3">
                <CardLogos />
                <p className="text-center text-[11px] leading-relaxed text-[#A3A3A3]">
                  Payments are processed securely by Bankful. You must be 21 or older to purchase tobacco products.
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
