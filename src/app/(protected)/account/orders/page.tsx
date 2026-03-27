import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/types";

interface Props {
  searchParams: { success?: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  paid: "bg-[#22C55E]/10 text-[#22C55E]",
  shipped: "bg-[#3B82F6]/10 text-[#3B82F6]",
  delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

export default async function OrdersPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(id, product_id, quantity, unit_price_cents, products(name, slug, category, images))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              My <span className="text-[#C8A84E]">Orders</span>
            </h1>
            <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>
          <Link
            href="/shop"
            className="rounded-lg border border-[#C8A84E] px-4 py-2 text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
          >
            Continue Shopping
          </Link>
        </div>

        {searchParams.success && (
          <div className="mt-6 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/5 px-4 py-3 text-center">
            <p className="font-semibold text-[#22C55E]">Order placed successfully!</p>
            <p className="mt-1 text-sm text-[#A3A3A3]">Thank you for your purchase.</p>
          </div>
        )}

        {!orders || orders.length === 0 ? (
          <div className="mt-12 rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
            <p className="text-lg text-[#A3A3A3]">No orders yet</p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-lg bg-[#C8A84E] px-8 py-3 font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {(orders as any[]).map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] px-6 py-4">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div>
                      <p className="text-[#A3A3A3]">Order</p>
                      <p className="font-mono text-xs text-[#F5F5F5]">{order.id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-[#A3A3A3]">Date</p>
                      <p className="text-[#F5F5F5]">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#A3A3A3]">Total</p>
                      <p className="font-semibold text-[#F5F5F5]">{formatPrice(order.total_cents)}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.status] || ""}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Tracking */}
                {order.tracking_number && (
                  <div className="border-b border-[#262626] px-6 py-3 text-sm">
                    <span className="text-[#A3A3A3]">Tracking: </span>
                    <span className="font-mono text-[#C8A84E]">{order.tracking_number}</span>
                  </div>
                )}

                {/* Order items */}
                <div className="divide-y divide-[#262626]">
                  {(order.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#1A1A1A]">
                        {item.products?.images?.[0] ? (
                          <img
                            src={item.products.images[0]}
                            alt={item.products?.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[#262626]">&#9672;</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/shop/${item.products?.category}/${item.products?.slug}`}
                          className="text-sm font-medium text-[#F5F5F5] transition-colors hover:text-[#C8A84E]"
                        >
                          {item.products?.name || "Product"}
                        </Link>
                        <p className="mt-0.5 text-xs text-[#A3A3A3]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[#F5F5F5]">
                        {formatPrice(item.unit_price_cents * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
