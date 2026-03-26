import { DollarSign, Users, ShoppingBag, Calendar } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Fetch stats in parallel
  const [revenueRes, subscribersRes, pendingRes, eventsRes, recentOrdersRes, recentSubsRes] =
    await Promise.all([
      supabase.from("orders").select("total_cents").eq("status", "paid"),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("events").select("id", { count: "exact", head: true }).gte("event_date", new Date().toISOString()),
      supabase.from("orders").select("id, total_cents, status, created_at, user_id, profiles(full_name)").order("created_at", { ascending: false }).limit(10),
      supabase.from("subscriptions").select("id, tier, status, created_at, user_id, profiles(full_name, email)").order("created_at", { ascending: false }).limit(5),
    ]);

  const totalRevenue = (revenueRes.data as any[] || []).reduce((sum: number, o: any) => sum + o.total_cents, 0);
  const activeSubscribers = subscribersRes.count || 0;
  const pendingOrders = pendingRes.count || 0;
  const upcomingEvents = eventsRes.count || 0;
  const recentOrders = (recentOrdersRes.data || []) as any[];
  const recentSubs = (recentSubsRes.data || []) as any[];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const stats = [
    { label: "Total Revenue", value: `$${(totalRevenue / 100).toFixed(2)}`, icon: DollarSign },
    { label: "Active Subscribers", value: String(activeSubscribers), icon: Users },
    { label: "Pending Orders", value: String(pendingOrders), icon: ShoppingBag },
    { label: "Upcoming Events", value: String(upcomingEvents), icon: Calendar },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
    paid: "bg-[#22C55E]/10 text-[#22C55E]",
    shipped: "bg-[#3B82F6]/10 text-[#3B82F6]",
    delivered: "bg-[#22C55E]/10 text-[#22C55E]",
    cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
    active: "bg-[#22C55E]/10 text-[#22C55E]",
    paused: "bg-[#F59E0B]/10 text-[#F59E0B]",
    past_due: "bg-[#EF4444]/10 text-[#EF4444]",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Dashboard</h1>
        <p className="text-sm text-[#A3A3A3]">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#262626] bg-[#141414] p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A3A3A3]">{stat.label}</p>
              <stat.icon className="h-5 w-5 text-[#C8A84E]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">
            Recent Orders
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="py-3 font-mono text-xs text-[#A3A3A3]">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 text-[#F5F5F5]">
                      {order.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="py-3 text-[#F5F5F5]">
                      ${(order.total_cents / 100).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || ""}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#A3A3A3]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#A3A3A3]">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Members */}
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">
            Recent Members
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Tier</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {recentSubs.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="py-3 text-[#F5F5F5]">
                      {sub.profiles?.full_name || sub.profiles?.email || "Unknown"}
                    </td>
                    <td className="py-3 capitalize text-[#A3A3A3]">
                      {sub.tier?.replace("_", " ") || "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[sub.status] || ""}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#A3A3A3]">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentSubs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#A3A3A3]">
                      No members yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
