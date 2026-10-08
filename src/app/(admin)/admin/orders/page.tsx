"use client";

import { Fragment, useState, useEffect } from "react";

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
  payment_reference?: string | null;
  shipping_address: Record<string, any> | null;
  profiles: { full_name: string | null; email: string | null };
  order_items: { id: string; quantity: number; unit_price_cents: number; products: { name: string } | null }[];
}

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

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
              orders.map((o) => {
                const ship = o.shipping_address || {};
                const subtotal = (o.order_items || []).reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0);
                return (
                <Fragment key={o.id}>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setOpenId(openId === o.id ? null : o.id)}
                      aria-expanded={openId === o.id}
                      className="text-[#C8A84E] hover:text-[#E8D48B]"
                    >
                      {openId === o.id ? "▾" : "▸"} {o.id.slice(0, 8)}...
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5]">
                    {o.profiles?.full_name || o.profiles?.email || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {(o.order_items || []).reduce((sum, i) => sum + i.quantity, 0)}
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
                {openId === o.id && (
                  <tr className="bg-[#0A0A0A]">
                    <td colSpan={7} className="px-6 py-5">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">Items</p>
                          <ul className="mt-2 space-y-1 text-[#F5F5F5]">
                            {(o.order_items || []).map((i) => (
                              <li key={i.id} className="flex justify-between gap-4">
                                <span>{i.quantity} × {i.products?.name || "Removed product"}</span>
                                <span className="text-[#A3A3A3]">{dollars(i.unit_price_cents * i.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 space-y-1 border-t border-[#262626] pt-3 text-[#A3A3A3]">
                            <div className="flex justify-between"><span>Subtotal</span><span>{dollars(subtotal)}</span></div>
                            {typeof ship.shipping_cents === "number" ? (
                              <>
                                <div className="flex justify-between"><span>Shipping &amp; handling</span><span>{dollars(ship.shipping_cents)}</span></div>
                                <div className="flex justify-between"><span>Sales tax</span><span>{dollars(o.total_cents - subtotal - ship.shipping_cents)}</span></div>
                              </>
                            ) : (
                              <div className="flex justify-between"><span>Shipping, handling and tax</span><span>{dollars(o.total_cents - subtotal)}</span></div>
                            )}
                            <div className="flex justify-between font-semibold text-[#F5F5F5]"><span>Total charged</span><span>{dollars(o.total_cents)}</span></div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">Ship to</p>
                            <p className="mt-2 text-[#F5F5F5]">
                              {[ship.firstName, ship.lastName].filter(Boolean).join(" ") || o.profiles?.full_name || "No name"}
                            </p>
                            <p className="text-[#A3A3A3]">{[ship.address, ship.address2].filter(Boolean).join(", ") || "No address on this order"}</p>
                            <p className="text-[#A3A3A3]">{[ship.city, ship.state, ship.zip].filter(Boolean).join(", ")}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">Contact</p>
                            <p className="mt-2 text-[#A3A3A3]">{ship.email || o.profiles?.email || "No email"}</p>
                            {ship.phone && <p className="text-[#A3A3A3]">{ship.phone}</p>}
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">Reference</p>
                            <p className="mt-2 break-all font-mono text-xs text-[#A3A3A3]">Order {o.id}</p>
                            {o.payment_reference && (
                              <p className="font-mono text-xs text-[#A3A3A3]">Bankful {o.payment_reference}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
