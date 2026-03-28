import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Shipping Policy | Goats Heritage™",
  description: "Shipping Policy for Goats Heritage™ — shipping methods, delivery times, and tobacco delivery requirements.",
};

export default function ShippingPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="h-20 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-white">Shipping Policy</h1>
        <div className="mt-2 h-1 w-16 bg-[#C8A84E]" />
        <p className="mt-4 text-sm text-neutral-500">Last updated: March 2026</p>

        <div className="mt-8 space-y-10 text-neutral-300 leading-relaxed">
          {/* 1. Shipping Overview */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">1. Shipping Overview</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Goats Heritage™ currently ships to addresses within the United States only. We do not ship internationally at this time. Orders are shipped from our fulfillment center and delivered through major carriers including USPS, UPS, and FedEx.
            </p>
          </div>

          {/* 2. Processing Times */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">2. Processing Times</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Orders are processed within 1-3 business days after payment is confirmed and age verification (for tobacco products) is completed. Business days are Monday through Friday, excluding federal holidays.
            </p>
            <p className="mt-4 text-neutral-400">
              During peak seasons, product launches, or promotional events, processing times may be slightly longer. You will receive an email notification with tracking information once your order has shipped.
            </p>
          </div>

          {/* 3. Shipping Rates */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">3. Shipping Rates</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <div className="mt-4 overflow-hidden rounded-lg border border-neutral-800">
              <table className="w-full text-left text-neutral-400">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/80">
                    <th className="px-4 py-3 text-sm font-medium text-neutral-300">Order Total</th>
                    <th className="px-4 py-3 text-sm font-medium text-neutral-300">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-800/50">
                    <td className="px-4 py-3">Under $75.00</td>
                    <td className="px-4 py-3">$7.95 flat rate</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">$75.00 and above</td>
                    <td className="px-4 py-3 font-medium text-[#C8A84E]">Free shipping</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-neutral-400">
              Expedited shipping options may be available at checkout for an additional cost. Shipping rates are calculated before applicable taxes.
            </p>
          </div>

          {/* 4. Delivery Times */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">4. Estimated Delivery Times</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <div className="mt-4 overflow-hidden rounded-lg border border-neutral-800">
              <table className="w-full text-left text-neutral-400">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/80">
                    <th className="px-4 py-3 text-sm font-medium text-neutral-300">Shipping Method</th>
                    <th className="px-4 py-3 text-sm font-medium text-neutral-300">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-800/50">
                    <td className="px-4 py-3">Standard Shipping</td>
                    <td className="px-4 py-3">3-7 business days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Expedited Shipping</td>
                    <td className="px-4 py-3">2-3 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-neutral-400">
              Delivery times are estimates calculated from the ship date, not the order date. Actual delivery times may vary depending on the carrier, destination, weather conditions, and other factors beyond our control.
            </p>
          </div>

          {/* 5. Age Verification on Delivery */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">5. Age Verification on Delivery (Tobacco Products)</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              In compliance with federal and state tobacco regulations, all shipments containing tobacco products (including cigars) require the following upon delivery:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>An adult signature from a person 21 years of age or older</li>
              <li>Presentation of a valid government-issued photo ID to verify age</li>
              <li>The person receiving the package must be the named recipient or another adult over 21 at the delivery address</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              Packages cannot be left at the door without a signature for tobacco orders. If no eligible adult is available to sign, the carrier will attempt redelivery or hold the package at a local facility for pickup. After multiple failed delivery attempts, the package will be returned to us.
            </p>
            <p className="mt-4 text-neutral-400">
              Orders returned due to failed age verification at delivery may be refunded less the original shipping cost.
            </p>
          </div>

          {/* 6. Order Tracking */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">6. Order Tracking</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Once your order has shipped, you will receive an email with a tracking number and a link to track your package. You can also check your order status by logging into your account on the Site.
            </p>
            <p className="mt-4 text-neutral-400">
              Please allow up to 24 hours after receiving your shipping confirmation email for tracking information to become active in the carrier&apos;s system.
            </p>
          </div>

          {/* 7. Lost or Damaged Packages */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">7. Lost or Damaged Packages</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />

            <h3 className="mt-4 font-medium text-white">Damaged Packages</h3>
            <p className="mt-2 text-neutral-400">
              If your order arrives damaged, please contact us within 48 hours of delivery at contact@goatsheritage.com. Include your order number and photographs of the damaged packaging and products. We will work with you to arrange a replacement or refund.
            </p>

            <h3 className="mt-4 font-medium text-white">Lost Packages</h3>
            <p className="mt-2 text-neutral-400">
              If your tracking information shows your package as delivered but you have not received it, please first check with neighbors and your local post office or carrier facility. If the package cannot be located, contact us within 7 days of the delivery date.
            </p>
            <p className="mt-4 text-neutral-400">
              We will investigate lost package claims with the carrier. Resolution may include reshipping the order or issuing a refund at our discretion. We are not responsible for packages stolen after confirmed delivery.
            </p>

            <h3 className="mt-4 font-medium text-white">Incorrect Address</h3>
            <p className="mt-2 text-neutral-400">
              Please double-check your shipping address before placing your order. We are not responsible for orders shipped to an incorrect address provided by the customer. If a package is returned to us due to an incorrect address, we will contact you to arrange reshipment at your expense.
            </p>
          </div>

          {/* 8. Shipping Restrictions */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">8. Shipping Restrictions</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We do not ship to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>International addresses</li>
              <li>P.O. Boxes (for tobacco products requiring adult signature)</li>
              <li>APO/FPO/DPO addresses (for tobacco products)</li>
              <li>States or jurisdictions where the shipment of tobacco products is prohibited by law</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              Non-tobacco products (coffee, apparel, accessories) may be shipped to P.O. Boxes and APO/FPO/DPO addresses within the United States.
            </p>
          </div>

          {/* 9. Contact Us */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">9. Contact Us</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              For questions about shipping, order status, or delivery issues, please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
              <p className="font-medium text-white">Goats Heritage™</p>
              <p className="mt-1 text-neutral-400">Email: contact@goatsheritage.com</p>
              <p className="mt-1 text-neutral-400">Website: goatsheritage.com</p>
            </div>
            <p className="mt-4 text-neutral-400">
              We aim to respond to all shipping inquiries within 1-2 business days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
