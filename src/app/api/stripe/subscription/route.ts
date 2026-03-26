export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check age verification
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, age_verified")
      .eq("id", user.id)
      .single();

    if (!profile?.age_verified) {
      return NextResponse.json(
        { error: "Age verification required for tobacco subscriptions." },
        { status: 403 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = profile.stripe_customer_id;

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Subscription price not configured" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/account/subscription?success=true`,
      cancel_url: `${siteUrl}/membership`,
      metadata: {
        user_id: user.id,
        tier: "monthly_box",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
