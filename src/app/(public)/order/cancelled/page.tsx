import Link from "next/link";
import type { Metadata } from "next";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled | Goats Heritage™",
  robots: { index: false },
};

export default function OrderCancelledPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-xl border border-[#262626] bg-[#141414] p-8 text-center">
        <XCircle className="mx-auto h-14 w-14 text-[#A3A3A3]" />
        <h1 className="mt-5 text-2xl font-bold text-[#F5F5F5]">Payment cancelled</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
          You left the payment page before finishing, so nothing was charged. Your cart is still saved.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/checkout" className="flex-1 rounded-lg bg-[#C8A84E] py-3 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]">
            Return to Checkout
          </Link>
          <Link href="/shop" className="flex-1 rounded-lg border border-[#C8A84E] py-3 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
