export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { createCheckoutSession } from "@/lib/stripe/helpers";

interface CartItem {
  product_id: string;
  name: string;
  price_cents: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = (await request.json()) as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate products exist and are in stock
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price_cents, inventory_count, category, is_active")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Failed to validate products" },
        { status: 500 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available` },
          { status: 400 }
        );
      }
      if (product.inventory_count < item.quantity) {
        return NextResponse.json(
          { error: `"${product.name}" has insufficient stock` },
          { status: 400 }
        );
      }
    }

    // Check age verification for cigar products
    const hasCigars = products.some((p) => p.category === "cigar");
    if (hasCigars) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("age_verified")
        .eq("id", user.id)
        .single();

      if (!profile?.age_verified) {
        return NextResponse.json(
          {
            error:
              "Age verification required to purchase tobacco products. Please verify your age in your account settings.",
          },
          { status: 403 }
        );
      }
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await createCheckoutSession({
      lineItems: items.map((item) => ({
        name: item.name,
        price_cents: item.price_cents,
        quantity: item.quantity,
      })),
      userId: user.id,
      customerEmail: user.email!,
      customerId: stripeCustomerId,
      mode: "payment",
      metadata: {
        order_items: JSON.stringify(
          items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price_cents: i.price_cents,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
