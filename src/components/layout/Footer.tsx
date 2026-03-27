import Link from "next/link";
import Image from "next/image";
import NewsletterSignup from "./NewsletterSignup";

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/membership", label: "Membership" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/shipping", label: "Shipping Policy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#C8A84E] bg-[#141414]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex justify-center">
          <Image src="/images/logo.png" alt="Goats Heritage" width={100} height={100} className="h-20 w-auto opacity-90 transition-opacity hover:opacity-100" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold tracking-wider text-[#C8A84E]">
              GOATS HERITAGE™
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
              Premium cigars and lifestyle products curated for the modern
              connoisseur. Elevating tradition with sophistication.
            </p>
            <a
              href="mailto:contact@goatsheritage.com"
              className="mt-3 inline-block text-sm text-[#C8A84E] transition-colors hover:text-[#E8D48B]"
            >
              contact@goatsheritage.com
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
              Legal
            </h4>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A3A3A3] transition-colors hover:text-[#C8A84E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-[#262626] pt-6">
          <p className="text-center text-sm text-[#A3A3A3]">
            &copy; 2026 Goats Heritage™. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs text-[#A3A3A3]/60">
            You must be 21 years or older to purchase tobacco products.
          </p>
          <p className="mt-4 text-center text-xs tracking-wider text-[#A3A3A3]/80">
            🇺🇸 Proud Veteran-Owned Business
          </p>
        </div>
      </div>
    </footer>
  );
}
