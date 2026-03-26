export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (!userId) break;

        if (session.mode === "payment") {
          const orderItemsRaw = session.metadata?.order_items;
          if (!orderItemsRaw) break;

          const orderItems: {
            product_id: string;
            quantity: number;
            price_cents: number;
          }[] = JSON.parse(orderItemsRaw);

          const totalCents = orderItems.reduce(
            (sum, i) => sum + i.price_cents * i.quantity,
            0
          );

          // Create order
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              user_id: userId,
              status: "paid",
              total_cents: totalCents,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              stripe_checkout_session_id: session.id,
              shipping_address: session.shipping_details?.address || null,
            })
            .select("id")
            .single();

          if (orderError || !order) {
            console.error("Failed to create order:", orderError);
            break;
          }

          // Create order items
          const itemsToInsert = orderItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price_cents: item.price_cents,
          }));

          await supabase.from("order_items").insert(itemsToInsert);

          // Decrement inventory
          for (const item of orderItems) {
            await supabase.rpc("decrement_inventory", {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          }
        }

        if (session.mode === "subscription") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : null;

          if (!subscriptionId) break;

          const sub = await stripe.subscriptions.retrieve(subscriptionId);

          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_subscription_id: subscriptionId,
              status: "active",
              tier: session.metadata?.tier || "monthly_box",
              current_period_start: new Date(
                sub.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                sub.current_period_end * 1000
              ).toISOString(),
            },
            { onConflict: "stripe_subscription_id" }
          );

          await supabase
            .from("profiles")
            .update({ role: "member" })
            .eq("id", userId);
        }

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (!existing) break;

        const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : sub.status === "canceled" ? "cancelled" : sub.status;

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: new Date(
              sub.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              sub.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        if (sub.status !== "active") {
          await supabase
            .from("profiles")
            .update({ role: "customer" })
            .eq("id", existing.user_id);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (!existing) break;

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id);

        await supabase
          .from("profiles")
          .update({ role: "customer" })
          .eq("id", existing.user_id);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : null;

        if (!subscriptionId) break;

        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
