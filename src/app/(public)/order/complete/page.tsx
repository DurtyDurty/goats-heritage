import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { parseBankfulResult } from "@/lib/bankful";
import { applyBankfulResult, type PaymentOutcome } from "@/lib/order-payments";
import ClearCart from "@/components/checkout/ClearCart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Status | Goats Heritage™",
  robots: { index: false },
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

// Bankful sends the customer back here with the signed result in the query string.
export default async function OrderCompletePage({ searchParams }: Props) {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params[key] = value;
  }

  const result = parseBankfulResult(params);
  let outcome: PaymentOutcome = "invalid";
  let orderId: string | undefined;
  try {
    ({ outcome, orderId } = await applyBankfulResult(result));
  } catch (err) {
    console.error("Order completion error:", err);
  }

  const paid = outcome === "paid" || outcome === "already_paid";

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-xl border border-[#262626] bg-[#141414] p-8 text-center">
        {paid && (
          <>
            <ClearCart />
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#22C55E]" />
            <h1 className="mt-5 text-2xl font-bold text-[#F5F5F5]">Order confirmed</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
              Thank you for your order. A confirmation email is on its way, and we will send tracking details when it ships.
            </p>
            {orderId && (
              <p className="mt-4 rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-xs text-[#A3A3A3]">
                Order number
                <span className="mt-1 block break-all font-mono text-sm text-[#F5F5F5]">{orderId}</span>
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/account/orders" className="flex-1 rounded-lg bg-[#C8A84E] py-3 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]">
                View My Orders
              </Link>
              <Link href="/shop" className="flex-1 rounded-lg border border-[#C8A84E] py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {outcome === "declined" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-[#EF4444]" />
            <h1 className="mt-5 text-2xl font-bold text-[#F5F5F5]">Payment not completed</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
              Your card was not charged. Your cart is saved, so you can try again or use a different card.
            </p>
            {result.message && (
              <p className="mt-4 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/5 px-4 py-3 text-xs text-[#EF4444]">
                {result.message}
              </p>
            )}
            <Link href="/checkout" className="mt-6 block rounded-lg bg-[#C8A84E] py-3 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]">
              Return to Checkout
            </Link>
          </>
        )}

        {outcome === "pending" && (
          <>
            <Clock className="mx-auto h-14 w-14 text-[#F59E0B]" />
            <h1 className="mt-5 text-2xl font-bold text-[#F5F5F5]">Payment pending</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
              Your payment is still being processed. We will email you as soon as it is confirmed. Please do not pay again.
            </p>
            <Link href="/account/orders" className="mt-6 block rounded-lg border border-[#C8A84E] py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
              View My Orders
            </Link>
          </>
        )}

        {outcome === "invalid" && (
          <>
            <AlertTriangle className="mx-auto h-14 w-14 text-[#F59E0B]" />
            <h1 className="mt-5 text-2xl font-bold text-[#F5F5F5]">We could not confirm this payment</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
              If you completed a payment, your order will still appear under My Orders once it is confirmed. Otherwise, please contact us at contact@goatsheritage.com.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/account/orders" className="flex-1 rounded-lg bg-[#C8A84E] py-3 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]">
                View My Orders
              </Link>
              <Link href="/contact" className="flex-1 rounded-lg border border-[#C8A84E] py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Contact Us
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
