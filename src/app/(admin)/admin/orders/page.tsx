"use client";

import { useState, useEffect } from "react";

const statusFilters = ["all", "pending", "paid", "shipped", "delivered"];
const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  paid: "bg-[#22C55E]/10 text-[#22C55E]",
  shipped: "bg-[#3B82F6]/10 text-[#3B82F6]",
  delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_cents: number;
  tracking_number: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null };
  order_items: { id: string }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function fetchOrders() {
    const res = await fetch(`/api/admin/orders?status=${filter}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [filter]);

  async function updateOrder(id: string, updates: Record<string, any>) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    fetchOrders();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F5F5F5]">Orders</h1>

      {/* Filter tabs */}
      <div className="mt-4 flex gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "bg-[#C8A84E] text-black"
                : "bg-[#1A1A1A] text-[#A3A3A3] hover:bg-[#262626]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tracking</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#A3A3A3]">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#A3A3A3]">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs text-[#A3A3A3]">
                    {o.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5]">
                    {o.profiles?.full_name || o.profiles?.email || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {o.order_items?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5]">
                    ${(o.total_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateOrder(o.id, { status: e.target.value })
                      }
                      className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || ""} bg-transparent outline-none`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-[#141414] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={o.tracking_number || ""}
                      placeholder="Add tracking"
                      onBlur={(e) => {
                        if (e.target.value !== (o.tracking_number || "")) {
                          updateOrder(o.id, {
                            tracking_number: e.target.value || null,
                          });
                        }
                      }}
                      className="w-28 rounded border border-[#262626] bg-transparent px-2 py-1 text-xs text-[#A3A3A3] outline-none focus:border-[#C8A84E]"
                    />
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
