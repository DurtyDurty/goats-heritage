import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service | Goats Heritage™",
  description: "Terms of Service for Goats Heritage™ — the rules and conditions governing your use of our website and services.",
};

export default function TermsPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="h-20 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <div className="mt-2 h-1 w-16 bg-[#C8A84E]" />
        <p className="mt-4 text-sm text-neutral-500">Last updated: March 2026</p>

        <div className="mt-8 space-y-10 text-neutral-300 leading-relaxed">
          {/* 1. Acceptance of Terms */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">1. Acceptance of Terms</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Welcome to Goats Heritage™. By accessing or using our website at goatsheritage.com (the &quot;Site&quot;), creating an account, or making a purchase, you agree to be bound by these Terms of Service (&quot;Terms&quot;), our Privacy Policy, and our Shipping Policy. If you do not agree to these Terms, you must not use the Site.
            </p>
            <p className="mt-4 text-neutral-400">
              We reserve the right to update or modify these Terms at any time. Changes will be effective upon posting to the Site. Your continued use of the Site following any changes constitutes acceptance of the revised Terms.
            </p>
          </div>

          {/* 2. Age Requirement */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">2. Age Requirement</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              You must be at least 21 years of age to purchase tobacco products from the Site. By placing an order for any tobacco product, you confirm that you are 21 or older and that the tobacco products are intended for personal use and will not be provided to any person under 21.
            </p>
            <p className="mt-4 text-neutral-400">
              Age verification is required at the time of purchase and may be required again at the time of delivery. We reserve the right to refuse or cancel any order if age cannot be verified. Providing false age information is a violation of these Terms and may constitute a violation of law.
            </p>
            <p className="mt-4 text-neutral-400">
              For non-tobacco products such as coffee, apparel, and accessories, you must be at least 18 years of age to make a purchase.
            </p>
          </div>

          {/* 3. Account Registration */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">3. Account Registration</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              To make purchases or access certain features, you may be required to create an account. When creating an account, you agree to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your information to keep it accurate and current</li>
              <li>Keep your password secure and confidential</li>
              <li>Maintain only one account per person</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              We reserve the right to suspend or terminate your account at our discretion if we believe you have violated these Terms or if your account information is inaccurate.
            </p>
          </div>

          {/* 4. Products and Pricing */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">4. Products and Pricing</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              All prices displayed on the Site are in United States Dollars (USD) and are subject to change without notice. We make every effort to display accurate product descriptions and pricing, but errors may occur.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Product images are for illustration purposes and may differ slightly from the actual product</li>
              <li>We reserve the right to correct pricing errors and cancel orders placed at an incorrect price</li>
              <li>Products marked as &quot;Coming Soon&quot; are not yet available for purchase and their pricing and availability may change</li>
              <li>Availability of products is subject to change and we do not guarantee that any product will remain in stock</li>
              <li>Applicable taxes and shipping charges will be added at checkout</li>
            </ul>
          </div>

          {/* 5. Orders and Payment */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">5. Orders and Payment</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              All payments are processed securely through Authorize.Net. We accept major credit cards and other payment methods as displayed at checkout.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>By submitting an order, you authorize us to charge the total order amount to your selected payment method</li>
              <li>An order confirmation email does not constitute acceptance of your order — we reserve the right to accept or decline any order</li>
              <li>We may cancel or refuse orders for any reason, including suspected fraud, pricing errors, product unavailability, or failure to verify age</li>
              <li>If an order is cancelled after payment has been collected, a full refund will be issued to the original payment method</li>
              <li>You are responsible for all applicable taxes associated with your purchase</li>
            </ul>
          </div>

          {/* 6. Shipping and Delivery */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">6. Shipping and Delivery</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We currently ship within the United States only. For full details on shipping methods, delivery times, and policies, please refer to our Shipping Policy.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Delivery times are estimates and are not guaranteed</li>
              <li>Risk of loss and title for products pass to you upon delivery to the carrier</li>
              <li>Tobacco shipments require an adult signature (21+) and valid government-issued photo ID upon delivery</li>
              <li>Orders that cannot be delivered due to failed age verification will be returned to us and a refund may be issued less shipping costs</li>
            </ul>
          </div>

          {/* 7. Returns and Refunds */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">7. Returns and Refunds</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />

            <h3 className="mt-4 font-medium text-white">Tobacco Products</h3>
            <p className="mt-2 text-neutral-400">
              Due to health, safety, and regulatory requirements, all sales of tobacco products (including cigars) are final. Tobacco products cannot be returned or exchanged. If you receive a damaged or defective tobacco product, please contact us within 48 hours of delivery at contact@goatsheritage.com with photos of the damage, and we will work with you to resolve the issue.
            </p>

            <h3 className="mt-4 font-medium text-white">Coffee</h3>
            <p className="mt-2 text-neutral-400">
              Due to the perishable nature of coffee, opened bags cannot be returned. Unopened, sealed bags may be returned within 14 days of delivery. If you receive a damaged or incorrect coffee order, contact us within 48 hours.
            </p>

            <h3 className="mt-4 font-medium text-white">Apparel and Accessories</h3>
            <p className="mt-2 text-neutral-400">
              Apparel and accessories may be returned within 30 days of delivery, provided items are unused, unworn, and in their original packaging with all tags attached. Return shipping costs are the responsibility of the customer unless the return is due to our error.
            </p>

            <h3 className="mt-4 font-medium text-white">Refund Process</h3>
            <p className="mt-2 text-neutral-400">
              Approved refunds will be issued to the original payment method within 7-10 business days of receiving the returned item. Contact us at contact@goatsheritage.com to initiate a return.
            </p>
          </div>

          {/* 8. Tobacco Compliance */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">8. Tobacco Regulatory Compliance</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Goats Heritage™ complies with all applicable federal, state, and local laws regarding the sale and shipment of tobacco products, including but not limited to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>The Federal Food, Drug, and Cosmetic Act and FDA regulations governing tobacco products</li>
              <li>The PACT Act (Prevent All Cigarette Trafficking Act) requirements for shipping and reporting</li>
              <li>State-specific tobacco sales and shipping regulations</li>
              <li>Age verification requirements at the point of sale and delivery</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              We do not sell tobacco products to minors under any circumstances. All tobacco orders require age verification. Adult signature with valid government-issued ID showing the recipient is 21 or older is required at delivery. We do not ship tobacco products to states or jurisdictions where such shipments are prohibited by law.
            </p>
          </div>

          {/* 9. Subscription and Membership */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">9. Subscription and Membership Terms</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Goats Heritage™ may offer subscription boxes and membership programs. By enrolling in a subscription or membership, you agree to the following:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Subscriptions involve recurring charges billed automatically to your payment method at the frequency selected (monthly, quarterly, etc.)</li>
              <li>You authorize recurring charges until you cancel your subscription</li>
              <li>Membership benefits, pricing, and included products may change with reasonable notice</li>
              <li>You may cancel your subscription at any time through your account settings or by contacting us at contact@goatsheritage.com</li>
              <li>Cancellations take effect at the end of the current billing cycle — no partial refunds will be issued for the remaining period</li>
              <li>Membership perks and discounts apply only to the enrolled member and are non-transferable</li>
            </ul>
          </div>

          {/* 10. Intellectual Property */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">10. Intellectual Property</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              All content on the Site, including but not limited to the Goats Heritage™ name, logo, product names, text, graphics, images, page layout, and overall design, is the property of Goats Heritage™ or its licensors and is protected by United States and international trademark, copyright, and intellectual property laws.
            </p>
            <p className="mt-4 text-neutral-400">
              You may not reproduce, distribute, modify, create derivative works from, publicly display, or otherwise use any content from the Site without our prior written consent. Unauthorized use of our intellectual property may result in legal action.
            </p>
          </div>

          {/* 11. User Content */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">11. User Content</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              If you submit reviews, comments, or other content to the Site, you grant Goats Heritage™ a non-exclusive, royalty-free, perpetual, and worldwide license to use, display, reproduce, and distribute that content in connection with our business. You represent that any content you submit is accurate, does not violate any third-party rights, and complies with these Terms.
            </p>
            <p className="mt-4 text-neutral-400">
              We reserve the right to remove any user content at our sole discretion, including content that we determine to be offensive, misleading, or in violation of these Terms.
            </p>
          </div>

          {/* 12. Prohibited Conduct */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">12. Prohibited Conduct</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">When using the Site, you agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Misrepresent your age or provide false identity information</li>
              <li>Purchase tobacco products for or provide them to anyone under 21</li>
              <li>Resell products purchased from the Site without written authorization</li>
              <li>Engage in fraudulent activity, including using stolen payment information</li>
              <li>Attempt to gain unauthorized access to our systems, accounts, or databases</li>
              <li>Use automated tools, bots, or scrapers to access or collect data from the Site</li>
              <li>Interfere with the operation or security of the Site</li>
              <li>Violate any applicable federal, state, or local law or regulation</li>
              <li>Harass, abuse, or threaten other users or our staff</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              Violation of these prohibitions may result in account termination and, where applicable, referral to law enforcement.
            </p>
          </div>

          {/* 13. Limitation of Liability */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">13. Limitation of Liability</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              TO THE FULLEST EXTENT PERMITTED BY LAW, GOATS HERITAGE™, ITS OWNERS, OFFICERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE OR PURCHASE OF PRODUCTS, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.
            </p>
            <p className="mt-4 text-neutral-400">
              OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM OR RELATED TO THESE TERMS OR YOUR USE OF THE SITE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SPECIFIC PRODUCT OR SERVICE GIVING RISE TO THE CLAIM. THE SITE AND ALL PRODUCTS ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
          </div>

          {/* 14. Indemnification */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">14. Indemnification</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              You agree to indemnify, defend, and hold harmless Goats Heritage™, its owners, officers, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney&apos;s fees) arising from your use of the Site, violation of these Terms, infringement of any third-party rights, or any misrepresentation of your age or identity.
            </p>
          </div>

          {/* 15. Governing Law */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">15. Governing Law</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in the State of Texas, and you consent to the personal jurisdiction of such courts.
            </p>
          </div>

          {/* 16. Dispute Resolution */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">16. Dispute Resolution</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Before initiating any formal legal proceedings, you agree to first attempt to resolve any dispute with us informally by contacting us at contact@goatsheritage.com. We will make reasonable efforts to resolve the issue within 30 days.
            </p>
            <p className="mt-4 text-neutral-400">
              If informal resolution is unsuccessful, any dispute arising from these Terms or your use of the Site shall be resolved through binding arbitration administered in accordance with the rules of the American Arbitration Association. Arbitration shall take place in the State of Texas. You agree that any arbitration shall be conducted on an individual basis and not as a class action or collective proceeding.
            </p>
          </div>

          {/* 17. Severability */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">17. Severability</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent.
            </p>
          </div>

          {/* 18. Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">18. Contact Information</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
              <p className="font-medium text-white">Goats Heritage™</p>
              <p className="mt-1 text-neutral-400">Email: contact@goatsheritage.com</p>
              <p className="mt-1 text-neutral-400">Website: goatsheritage.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
