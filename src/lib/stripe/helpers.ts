import { stripe } from "./client";
import type Stripe from "stripe";

interface CheckoutLineItem {
  name: string;
  price_cents: number;
  quantity: number;
}

export async function createCheckoutSession({
  lineItems,
  userId,
  customerEmail,
  customerId,
  mode,
  metadata,
}: {
  lineItems: CheckoutLineItem[];
  userId: string;
  customerEmail: string;
  customerId: string;
  mode: "payment" | "subscription";
  metadata?: Record<string, string>;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    customer_update: { address: "auto" },
    mode,
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.price_cents,
      },
      quantity: item.quantity,
    })),
    success_url: `${siteUrl}/account/orders?success=true`,
    cancel_url: `${siteUrl}/cart`,
    metadata: {
      user_id: userId,
      ...metadata,
    },
  };

  if (mode === "payment") {
    sessionParams.shipping_address_collection = {
      allowed_countries: ["US"],
    };
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}
