"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/membership", label: "Membership" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { getCartCount, setDrawerOpen, isLoaded } = useCart();
  const cartItemCount = isLoaded ? getCartCount() : 0;
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/">
            <Image src="/images/logo.webp" width={120} height={48} alt="Goats Heritage" className="h-10 w-auto sm:h-12" />
          </Link>

          {/* Center nav links - desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative py-1 text-sm font-medium text-[#A3A3A3] transition-colors hover:text-[#F5F5F5] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#C8A84E] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative text-[#A3A3A3] transition-colors hover:text-[#F5F5F5]"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C8A84E] text-[10px] font-bold text-[#0A0A0A]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth - desktop */}
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C8A84E] text-[#C8A84E] transition-colors hover:bg-[#C8A84E] hover:text-[#0A0A0A]"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-[#262626] bg-[#141414] shadow-xl">
                    <div className="border-b border-[#262626] px-4 py-3">
                      <p className="truncate text-sm text-[#F5F5F5]">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#F5F5F5]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#EF4444]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-md border border-[#C8A84E] px-4 py-1.5 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E] hover:text-[#0A0A0A] md:flex"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="text-[#A3A3A3] transition-colors hover:text-[#F5F5F5] md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0A]">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/logo.webp" width={100} height={40} alt="Goats Heritage" className="h-9 w-auto" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-[#A3A3A3] transition-colors hover:text-[#F5F5F5]"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-medium text-[#F5F5F5] transition-colors hover:text-[#C8A84E]"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-medium text-[#F5F5F5] transition-colors hover:text-[#C8A84E]"
                >
                  Account
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-md border border-[#EF4444] px-6 py-2 text-lg font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/10"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-4 flex items-center gap-2 rounded-md border border-[#C8A84E] px-6 py-2 text-lg font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E] hover:text-[#0A0A0A]"
              >
                <User className="h-5 w-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
