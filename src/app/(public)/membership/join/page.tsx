"use client";

declare global {
  interface Window {
    Accept: any;
  }
}

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login?redirect=/membership/join");
        return;
      }
      setAuthenticated(true);

      // Check existing subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (sub) {
        router.push("/account/subscription?already_member=true");
        return;
      }

      setLoading(false);
    });
  }, [router]);

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

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!ageConfirmed) {
      setError(
        "You must confirm you are 21 or older to subscribe to tobacco products."
      );
      return;
    }

    setSubscribing(true);

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
            response.messages.message.map((m: any) => m.text).join(". ")
          );
          setSubscribing(false);
          return;
        }

        const opaqueData = response.opaqueData;

        try {
          const res = await fetch("/api/membership/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              opaqueData,
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
            throw new Error(data.error || "Failed to create subscription");
          }

          router.push("/account/subscription?success=true");
        } catch (err: any) {
          setError(err.message);
          setSubscribing(false);
        }
      }
    );
  }

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#262626] border-t-[#C8A84E]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border-2 border-[#C8A84E] bg-[#141414] p-8">
        <div className="text-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="mx-auto h-20 w-auto" />
          <h1 className="mt-4 text-2xl font-bold text-[#F5F5F5]">
            Confirm Your Membership
          </h1>
        </div>

        <div className="mt-6 rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F5F5F5]">
              The Heritage Box
            </span>
            <span className="text-[#C8A84E]">$49.99/mo</span>
          </div>
          <ul className="mt-4 space-y-2">
            {[
              "5-7 premium cigars monthly",
              "Members-only merch access",
              "10% off all purchases",
              "VIP event invites",
              "Free shipping",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-[#A3A3A3]"
              >
                <Check className="h-3.5 w-3.5 text-[#C8A84E]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubscribe} className="mt-6 space-y-6">
          {/* Shipping */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F5]">
              Shipping Address
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <input
                type="text"
                placeholder="Address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-2 rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <input
                type="text"
                placeholder="City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-2 rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F5]">
              Payment Details
            </h3>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                placeholder="Card Number"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={16}
                className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="MM"
                  required
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  maxLength={2}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
                <input
                  type="text"
                  placeholder="YYYY"
                  required
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  maxLength={4}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                  className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E]"
                />
              </div>
            </div>
          </div>

          {/* Age confirmation */}
          <label className="flex items-start gap-2 text-sm text-[#A3A3A3]">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 accent-[#C8A84E]"
            />
            I confirm that I am 21 years of age or older and legally permitted
            to purchase tobacco products.
          </label>

          {error && <p className="text-sm text-[#EF4444]">{error}</p>}

          <button
            type="submit"
            disabled={subscribing}
            className="w-full rounded-lg bg-[#C8A84E] py-4 font-bold text-black transition-colors hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {subscribing ? "Processing..." : "Subscribe Now"}
          </button>

          <p className="text-center text-xs text-[#A3A3A3]">
            Cancel anytime. Your payment is processed securely through
            Authorize.Net. You must be 21 or older to subscribe.
          </p>
        </form>
      </div>
    </div>
  );
}
