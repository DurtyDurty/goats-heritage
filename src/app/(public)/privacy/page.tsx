import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy | Goats Heritage™",
  description: "Privacy Policy for Goats Heritage™ — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/images/logo.png" alt="Goats Heritage™" width={160} height={80} className="h-20 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <div className="mt-2 h-1 w-16 bg-[#C8A84E]" />
        <p className="mt-4 text-sm text-neutral-500">Last updated: March 2026</p>

        <div className="mt-8 space-y-10 text-neutral-300 leading-relaxed">
          {/* Introduction */}
          <div>
            <p>
              Goats Heritage™ (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website goatsheritage.com (the &quot;Site&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Site or make a purchase. By using the Site, you consent to the practices described in this policy.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">1. Information We Collect</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />

            <h3 className="mt-4 font-medium text-white">Personal Information</h3>
            <p className="mt-2 text-neutral-400">
              When you create an account, place an order, or contact us, we may collect the following:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Date of birth (required for age verification on tobacco products)</li>
              <li>Account login credentials</li>
            </ul>

            <h3 className="mt-4 font-medium text-white">Payment Information</h3>
            <p className="mt-2 text-neutral-400">
              Payment transactions are processed through Authorize.Net. We do not store your full credit card number, CVV, or other sensitive payment data on our servers. Authorize.Net handles and encrypts all payment information in accordance with PCI-DSS standards.
            </p>

            <h3 className="mt-4 font-medium text-white">Usage Data</h3>
            <p className="mt-2 text-neutral-400">
              We automatically collect certain information when you access the Site, including:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited, time spent on pages, and navigation paths</li>
              <li>Referring website or source</li>
              <li>Date and time of each visit</li>
            </ul>

            <h3 className="mt-4 font-medium text-white">Cookies and Local Storage</h3>
            <p className="mt-2 text-neutral-400">
              We use cookies and browser storage technologies to enhance your experience. See Section 5 for full details on our cookie practices.
            </p>
          </div>

          {/* 2. How We Use Your Information */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">2. How We Use Your Information</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">We use the information we collect for the following purposes:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Process and fulfill your orders, including payment processing, shipping, and delivery confirmation</li>
              <li>Verify your age for the purchase of tobacco products in compliance with federal and state law</li>
              <li>Create and manage your account</li>
              <li>Communicate with you about orders, account updates, and customer service inquiries</li>
              <li>Send promotional emails, newsletters, and marketing materials (with your consent)</li>
              <li>Manage membership and subscription services, including recurring billing</li>
              <li>Improve our Site, products, and services through analytics and user feedback</li>
              <li>Detect and prevent fraud, unauthorized access, and other illegal activities</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </div>

          {/* 3. Information Sharing */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">3. Information Sharing and Disclosure</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We do not sell your personal information. We may share your information with the following third parties solely to operate our business and provide our services:
            </p>

            <h3 className="mt-4 font-medium text-white">Service Providers</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li><span className="text-neutral-300">Authorize.Net</span> — Payment processing and transaction management</li>
              <li><span className="text-neutral-300">Resend</span> — Transactional and marketing email delivery</li>
              <li><span className="text-neutral-300">Google Analytics</span> — Website usage analytics and traffic reporting</li>
              <li><span className="text-neutral-300">Vercel</span> — Website hosting and content delivery</li>
              <li><span className="text-neutral-300">Supabase</span> — Database and authentication services</li>
              <li><span className="text-neutral-300">Shipping carriers</span> — Order fulfillment and delivery</li>
            </ul>

            <h3 className="mt-4 font-medium text-white">Legal Requirements</h3>
            <p className="mt-2 text-neutral-400">
              We may disclose your information if required to do so by law, in response to a subpoena, court order, or other governmental request, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>

            <h3 className="mt-4 font-medium text-white">Business Transfers</h3>
            <p className="mt-2 text-neutral-400">
              In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
            </p>
          </div>

          {/* 4. Age Verification */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">4. Age Verification</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Federal and state laws prohibit the sale of tobacco products to individuals under the age of 21. To comply with these regulations:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>All visitors must confirm they are 21 years of age or older before accessing the Site through our age verification gate</li>
              <li>We collect date of birth information during account registration to verify eligibility for tobacco purchases</li>
              <li>Age verification is performed at the time of purchase and may be required again upon delivery</li>
              <li>We reserve the right to cancel any order if age verification cannot be completed</li>
              <li>Age gate confirmation is stored in your browser&apos;s sessionStorage and resets when you close your browser</li>
            </ul>
          </div>

          {/* 5. Cookies and Tracking */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">5. Cookies and Tracking Technologies</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We use the following cookies and tracking technologies:
            </p>

            <h3 className="mt-4 font-medium text-white">Essential Cookies</h3>
            <p className="mt-2 text-neutral-400">
              Required for the Site to function properly. These include authentication cookies that keep you logged in and session cookies that maintain your shopping cart.
            </p>

            <h3 className="mt-4 font-medium text-white">Age Gate (sessionStorage)</h3>
            <p className="mt-2 text-neutral-400">
              When you confirm your age upon entering the Site, this confirmation is stored in your browser&apos;s sessionStorage. This data is automatically cleared when you close your browser tab or window.
            </p>

            <h3 className="mt-4 font-medium text-white">Google Analytics</h3>
            <p className="mt-2 text-neutral-400">
              We use Google Analytics to understand how visitors interact with the Site. Google Analytics collects information such as pages visited, time on site, and traffic sources. This data is aggregated and does not personally identify you. You may opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.
            </p>

            <h3 className="mt-4 font-medium text-white">Managing Cookies</h3>
            <p className="mt-2 text-neutral-400">
              Most web browsers allow you to manage cookie preferences through their settings. Disabling certain cookies may limit your ability to use some features of the Site.
            </p>
          </div>

          {/* 6. Data Security */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">6. Data Security</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We take reasonable administrative, technical, and physical measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>SSL/TLS encryption for all data transmitted between your browser and our servers</li>
              <li>PCI-DSS compliant payment processing through Authorize.Net</li>
              <li>Secure password hashing and authentication through Supabase</li>
              <li>Regular security reviews and access controls for administrative systems</li>
              <li>Limited employee access to personal information on a need-to-know basis</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              While we strive to protect your personal information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </div>

          {/* 7. Your Rights */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">7. Your Rights and Choices</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">You have the following rights regarding your personal information:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li><span className="text-neutral-300">Access:</span> You may request a copy of the personal information we hold about you</li>
              <li><span className="text-neutral-300">Update:</span> You may update your account information at any time by logging into your account settings</li>
              <li><span className="text-neutral-300">Delete:</span> You may request deletion of your account and associated personal data by contacting us at contact@goatsheritage.com</li>
              <li><span className="text-neutral-300">Opt-Out of Marketing:</span> You may unsubscribe from marketing emails at any time by clicking the &quot;unsubscribe&quot; link in any promotional email or by contacting us directly</li>
              <li><span className="text-neutral-300">Cookies:</span> You may manage or disable cookies through your browser settings</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              To exercise any of these rights, please contact us at contact@goatsheritage.com. We will respond to your request within 30 days.
            </p>
          </div>

          {/* 8. California / State Privacy Rights */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">8. California and State Privacy Rights</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />

            <h3 className="mt-4 font-medium text-white">California Residents (CCPA/CPRA)</h3>
            <p className="mt-2 text-neutral-400">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), including:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>The right to know what personal information we collect, use, and disclose</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to opt out of the sale or sharing of your personal information (we do not sell personal information)</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
              <li>The right to correct inaccurate personal information</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              To submit a request under the CCPA/CPRA, please email us at contact@goatsheritage.com with the subject line &quot;California Privacy Request.&quot;
            </p>

            <h3 className="mt-4 font-medium text-white">Other State Privacy Laws</h3>
            <p className="mt-2 text-neutral-400">
              Residents of Virginia, Colorado, Connecticut, Utah, and other states with consumer privacy legislation may have similar rights. Please contact us to exercise your rights under applicable state law.
            </p>
          </div>

          {/* 9. Data Retention */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">9. Data Retention</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-neutral-400">
              <li>Account information is retained for the duration of your active account</li>
              <li>Order and transaction records are retained for a minimum of seven (7) years for tax and legal compliance</li>
              <li>Age verification records are retained as required by tobacco regulatory compliance</li>
              <li>Marketing preferences are retained until you opt out or request deletion</li>
              <li>Usage and analytics data is retained in aggregated, anonymized form</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              Upon account deletion, we will remove your personal information within 30 days, except where retention is required by law.
            </p>
          </div>

          {/* 10. Children's Privacy */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">10. Children&apos;s Privacy</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              Our Site is not intended for individuals under 21 years of age. We do not knowingly collect personal information from anyone under 21. If we become aware that we have collected personal information from a person under 21, we will take steps to delete that information promptly.
            </p>
          </div>

          {/* 11. Changes to This Policy */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">11. Changes to This Privacy Policy</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make material changes, we will update the &quot;Last updated&quot; date at the top of this page and, where appropriate, notify you via email or a prominent notice on the Site. Your continued use of the Site after any changes constitutes your acceptance of the revised policy.
            </p>
          </div>

          {/* 12. Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-[#C8A84E]">12. Contact Information</h2>
            <div className="mt-1 h-0.5 w-10 bg-[#C8A84E]/30" />
            <p className="mt-4 text-neutral-400">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
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
