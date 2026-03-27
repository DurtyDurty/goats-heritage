import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Goats Heritage\u2122",
  description: "Get in touch with Goats Heritage. We'd love to hear from you.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
