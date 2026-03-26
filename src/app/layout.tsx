import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import PublicShell from "@/components/layout/PublicShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goats Heritage | Premium Cigars & Lifestyle",
  description:
    "Premium cigars, curated memberships, and exclusive lifestyle products. Elevating tradition with sophistication for the modern connoisseur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-[#F5F5F5]`}>
        <CartProvider>
          <PublicShell>{children}</PublicShell>
        </CartProvider>
      </body>
    </html>
  );
}
