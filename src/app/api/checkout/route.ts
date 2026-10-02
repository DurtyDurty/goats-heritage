export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PURCHASES_ENABLED, PURCHASES_PAUSED_MESSAGE } from "@/lib/purchases";
import { ageFromDob, MINIMUM_AGE } from "@/lib/age";
import { bankfulConfigured, bankfulEnvironment, createHostedPayment } from "@/lib/bankful";
import { calculateTotals, type PricedLine } from "@/lib/pricing";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CartItem {
  product_id: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

// Creates a pending order and returns the Bankful hosted payment page URL.
// The order becomes paid only when Bankful reports an approved, signed result
// (see src/lib/order-payments.ts).
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return PURCHASES_ENABLED
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.json({ error: PURCHASES_PAUSED_MESSAGE }, { status: 503 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("email, role, date_of_birth, age_verified")
      .eq("id", user.id)
      .single();

    // Purchases are paused for customers. Admins can still place test orders,
    // and only while the gateway is on the sandbox, so no real card is charged.
    if (!PURCHASES_ENABLED) {
      const adminSandboxTest = profile?.role === "admin" && bankfulEnvironment() === "sandbox";
      if (!adminSandboxTest) {
        return NextResponse.json({ error: PURCHASES_PAUSED_MESSAGE }, { status: 503 });
      }
    }

    if (!bankfulConfigured()) {
      return NextResponse.json({ error: "Payments are not set up yet. Please try again later." }, { status: 503 });
    }

    const { items, shippingAddress, email, dateOfBirth } = (await request.json()) as {
      items: CartItem[];
      shippingAddress: ShippingAddress;
      email?: string;
      dateOfBirth?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (items.some((i) => !i.product_id || !Number.isInteger(i.quantity) || i.quantity < 1)) {
      return NextResponse.json({ error: "Your cart has an invalid item. Please refresh and try again." }, { status: 400 });
    }

    const required: (keyof ShippingAddress)[] = ["firstName", "lastName", "address", "city", "state", "zip", "phone"];
    if (!shippingAddress || required.some((k) => !String(shippingAddress[k] || "").trim())) {
      return NextResponse.json({ error: "Enter your full shipping address." }, { status: 400 });
    }

    const contactEmail = (email || "").trim();
    if (contactEmail && !EMAIL_REGEX.test(contactEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address for your order confirmation." },
        { status: 400 }
      );
    }
    // The email typed at checkout wins; fall back to the account email
    const custEmail = contactEmail || profile?.email || user.email || "";

    // Validate products and take prices from the database, never from the browser
    const { data: products, error: productsError } = await adminSupabase
      .from("products")
      .select("id, name, category, price_cents, inventory_count, is_active")
      .in("id", items.map((i) => i.product_id));

    if (productsError || !products) {
      return NextResponse.json({ error: "Failed to validate products" }, { status: 500 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const lines: { product_id: string; quantity: number; unit_price_cents: number }[] = [];
    const pricedLines: PricedLine[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product || !product.is_active) {
        return NextResponse.json({ error: "An item in your cart is no longer available." }, { status: 400 });
      }
      if (product.inventory_count < item.quantity) {
        return NextResponse.json({ error: `"${product.name}" has insufficient stock` }, { status: 400 });
      }
      lines.push({ product_id: product.id, quantity: item.quantity, unit_price_cents: product.price_cents });
      pricedLines.push({ category: product.category, unit_price_cents: product.price_cents, quantity: item.quantity });
    }

    // Items + shipping + tax for the destination state. This is the amount charged.
    const totalCents = calculateTotals(pricedLines, shippingAddress.state).totalCents;

    // Age verification: the date of birth entered at checkout must be valid,
    // 21 or older, and consistent with the one already on the account.
    const age = ageFromDob(dateOfBirth || "");
    if (age === null) {
      return NextResponse.json({ error: "Enter your full date of birth to verify your age." }, { status: 400 });
    }
    if (age < MINIMUM_AGE) {
      return NextResponse.json({ error: `You must be ${MINIMUM_AGE} or older to place an order.` }, { status: 403 });
    }
    if (profile?.date_of_birth && profile.date_of_birth !== dateOfBirth) {
      return NextResponse.json(
        {
          error:
            "The date of birth entered does not match the one on your account. Contact us at contact@goatsheritage.com if it needs correcting.",
        },
        { status: 403 }
      );
    }
    if (!profile?.date_of_birth || !profile.age_verified) {
      await adminSupabase
        .from("profiles")
        .update({ date_of_birth: dateOfBirth, age_verified: true })
        .eq("id", user.id);
    }

    // Pending order: stock is checked now and deducted when the payment is approved
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total_cents: totalCents,
        shipping_address: { ...shippingAddress, email: custEmail, date_of_birth: dateOfBirth },
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json({ error: "We could not start your order. Please try again." }, { status: 500 });
    }

    const { error: itemsError } = await adminSupabase
      .from("order_items")
      .insert(lines.map((l) => ({ order_id: order.id, ...l })));

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      await adminSupabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      return NextResponse.json({ error: "We could not start your order. Please try again." }, { status: 500 });
    }

    const payment = await createHostedPayment({
      orderId: order.id,
      amountCents: totalCents,
      siteUrl: new URL(request.url).origin,
      customer: {
        firstName: shippingAddress.firstName.trim(),
        lastName: shippingAddress.lastName.trim(),
        email: custEmail,
        phone: shippingAddress.phone,
      },
      billing: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state,
        zip: shippingAddress.zip.trim(),
      },
    });

    if (!payment.ok) {
      await adminSupabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      return NextResponse.json({ error: payment.error }, { status: 502 });
    }

    return NextResponse.json({ redirectUrl: payment.redirectUrl, orderId: order.id });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Something went wrong starting your order." }, { status: 500 });
  }
}
