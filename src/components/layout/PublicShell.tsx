"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import AgeGateModal from "./AgeGateModal";
import ProfileCompletionModal from "./ProfileCompletionModal";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AgeGateModal />
      <ProfileCompletionModal />
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
