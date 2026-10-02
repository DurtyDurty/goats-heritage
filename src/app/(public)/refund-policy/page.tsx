import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Refund Policy | Goats Heritage™",
  description: "Refund and return policy for Goats Heritage™ — tobacco products, apparel, accessories, cancellations, and how refunds are issued.",
};

export default function RefundPolicyPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 flex justify-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="h-20 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-white">Refund Policy</h1>
        <div className="mt-2 h-1 w-16 bg-[#C8A84E]" />
        <p className="mt-4 text-sm text-neutral-500">Last updated: October 2026</p>

        <div className="mt-8 space-y-10 leading-relaxed text-neutral-300">
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">1. Tobacco Products</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Due to health, safety, and regulatory requirements, all sales of tobacco products (including cigars) are final. Tobacco products cannot be returned or exchanged.
            </p>
            <p className="mt-4 text-neutral-400">
              If you receive a damaged or defective tobacco product, contact us within 48 hours of delivery at {BUSINESS.email} with your order number and photos of the damage. We will work with you to arrange a replacement or refund.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">2. Apparel and Accessories</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Apparel and accessories may be returned within 30 days of delivery, provided items are unused, unworn, and in their original packaging with all tags attached. Return shipping costs are the responsibility of the customer unless the return is due to our error.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">3. Coffee</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Due to the perishable nature of coffee, opened bags cannot be returned. Unopened, sealed bags may be returned within 14 days of delivery. If you receive a damaged or incorrect coffee order, contact us within 48 hours.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">4. Cancelled and Undeliverable Orders</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <ul className="mt-4 list-disc space-y-1 pl-6 text-neutral-400">
              <li>If an order is cancelled after payment has been collected, a full refund will be issued to the original payment method</li>
              <li>Orders returned to us because age verification failed at delivery may be refunded less the original shipping cost</li>
              <li>Lost package claims are investigated with the carrier and may be resolved by reshipping the order or issuing a refund</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              See our <Link href="/shipping" className="text-[#C8A84E] hover:text-[#E8D48B]">Shipping Policy</Link> for delivery requirements and lost or damaged package claims.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">5. Memberships</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Memberships can be cancelled at any time from your account. Cancellations take effect at the end of the current billing cycle, and no partial refunds are issued for the remaining period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">6. How Refunds Are Issued</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              To request a return or refund, email {BUSINESS.email} with your order number. Approved refunds are issued to the original payment method within 7-10 business days of our receiving the returned item, or of approval where no return is required.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">7. Contact Us</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
              <p className="font-medium text-white">{BUSINESS.name}</p>
              {BUSINESS.addressLines.map((line) => (
                <p key={line} className="mt-1 text-neutral-400">{line}</p>
              ))}
              <p className="mt-1 text-neutral-400">Email: {BUSINESS.email}</p>
              {BUSINESS.phone && <p className="mt-1 text-neutral-400">Phone: {BUSINESS.phone}</p>}
              <p className="mt-1 text-neutral-400">Website: goatsheritage.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
