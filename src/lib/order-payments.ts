import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation } from "@/lib/email/send";
import type { BankfulResult } from "@/lib/bankful";

export type PaymentOutcome = "paid" | "already_paid" | "declined" | "pending" | "invalid";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Applies a signed Bankful result to its order. Called from both the customer's
 * return page and the server-to-server callback, which can arrive in either order
 * or at the same time, so the pending -> paid switch is a single conditional update
 * and everything after it (stock, email) runs only for whichever caller won it.
 */
export async function applyBankfulResult(
  result: BankfulResult
): Promise<{ outcome: PaymentOutcome; orderId?: string }> {
  if (!result.verified || !UUID_REGEX.test(result.orderId)) return { outcome: "invalid" };

  const db = createAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("id, status, total_cents, shipping_address")
    .eq("id", result.orderId)
    .maybeSingle();

  if (!order) return { outcome: "invalid" };
  if (["paid", "shipped", "delivered"].includes(order.status)) {
    return { outcome: "already_paid", orderId: order.id };
  }

  if (result.status === "declined") {
    await db.from("orders").update({ status: "cancelled" }).eq("id", order.id).eq("status", "pending");
    return { outcome: "declined", orderId: order.id };
  }

  if (result.status !== "approved") return { outcome: "pending", orderId: order.id };

  if (result.amountCents !== order.total_cents) {
    console.error(
      `Bankful amount mismatch on order ${order.id}: paid ${result.amountCents}, expected ${order.total_cents}`
    );
    return { outcome: "invalid", orderId: order.id };
  }

  // A declined first attempt leaves the order cancelled; an approval for it is still authoritative
  const { data: claimed } = await db
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id)
    .in("status", ["pending", "cancelled"])
    .select("id");

  if (!claimed || claimed.length === 0) return { outcome: "already_paid", orderId: order.id };

  const { error: referenceError } = await db
    .from("orders")
    .update({ payment_provider: "bankful", payment_reference: result.reference })
    .eq("id", order.id);
  if (referenceError) {
    console.error(`Order ${order.id} paid (Bankful ref ${result.reference}) but the reference was not saved:`, referenceError.message);
  }

  const { data: items } = await db
    .from("order_items")
    .select("product_id, quantity, unit_price_cents, products(name)")
    .eq("order_id", order.id);

  for (const item of items || []) {
    if (!item.product_id) continue;
    await db.rpc("decrement_inventory", { p_product_id: item.product_id, p_quantity: item.quantity });
  }

  const shipping = (order.shipping_address || {}) as Record<string, string>;
  if (shipping.email) {
    await sendOrderConfirmation(shipping.email, {
      orderNumber: order.id,
      items: (items || []).map((item: any) => ({
        name: item.products?.name || "Item",
        qty: item.quantity,
        price: item.unit_price_cents,
      })),
      total: order.total_cents,
      shippingAddress: [shipping.address, shipping.city, shipping.state, shipping.zip].filter(Boolean).join(", "),
      customerName: [shipping.firstName, shipping.lastName].filter(Boolean).join(" ") || "Valued Customer",
    });
  }

  return { outcome: "paid", orderId: order.id };
}
