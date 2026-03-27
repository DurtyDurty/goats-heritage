"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  UserCircle,
  Calendar,
  ExternalLink,
  Mail,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/admin/customers", label: "Customers", icon: UserCircle },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#262626] bg-[#141414]">
      {/* Logo */}
      <div className="border-b border-[#262626] px-6 py-5">
        <Image src="/images/logo.png" alt="Goats Heritage™" width={140} height={56} className="h-12 w-auto" />
        <span className="mt-1 inline-block rounded bg-[#C8A84E]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C8A84E]">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-l-2 border-[#C8A84E] bg-[#C8A84E]/10 text-[#C8A84E]"
                  : "text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#262626] px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
