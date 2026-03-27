export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTransaction } from "@/lib/authnet/helpers";
import { sendOrderConfirmation } from "@/lib/email/send";

interface CartItem {
  product_id: string;
  name: string;
  price_cents: number;
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

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opaqueData, items, shippingAddress } = (await request.json()) as {
      opaqueData: { dataDescriptor: string; dataValue: string };
      items: CartItem[];
      shippingAddress: ShippingAddress;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
      return NextResponse.json(
        { error: "Payment information is missing" },
        { status: 400 }
      );
    }

    // Validate products exist, are active, and in stock
    const adminSupabase = createAdminClient();
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await adminSupabase
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
      const { data: ageProfile } = await adminSupabase
        .from("profiles")
        .select("age_verified")
        .eq("id", user.id)
        .single();

      if (!ageProfile?.age_verified) {
        return NextResponse.json(
          {
            error:
              "Age verification required to purchase tobacco products. Please verify your age in your account settings.",
          },
          { status: 403 }
        );
      }
    }

    // Get customer info from profile
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const nameParts = (profile?.full_name || "").split(" ");
    const custFirstName = nameParts[0] || shippingAddress.firstName;
    const custLastName = nameParts.slice(1).join(" ") || shippingAddress.lastName;
    const custEmail = profile?.email || user.email || "";

    // Calculate total in dollars
    const totalCents = items.reduce(
      (sum, i) => sum + i.price_cents * i.quantity,
      0
    );
    const totalDollars = totalCents / 100;

    // Generate invoice number
    const invoiceNumber = "GH-" + Date.now();

    // Create transaction via Authorize.Net
    const result = await createTransaction({
      amountInDollars: totalDollars,
      opaqueData,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price_cents / 100,
      })),
      customerInfo: {
        firstName: custFirstName,
        lastName: custLastName,
        email: custEmail,
      },
      shippingAddress,
      invoiceNumber,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payment failed" },
        { status: 400 }
      );
    }

    // Create order in database
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "paid",
        total_cents: totalCents,
        authnet_transaction_id: result.transactionId,
        shipping_address: shippingAddress,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json(
        { error: "Payment succeeded but order creation failed. Contact support." },
        { status: 500 }
      );
    }

    // Create order items
    const itemsToInsert = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.price_cents,
    }));

    await adminSupabase.from("order_items").insert(itemsToInsert);

    // Decrement inventory
    for (const item of items) {
      await adminSupabase.rpc("decrement_inventory", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }

    // Send order confirmation email
    if (custEmail) {
      const productIdsForEmail = items.map((i) => i.product_id);
      const { data: emailProducts } = await adminSupabase
        .from("products")
        .select("id, name")
        .in("id", productIdsForEmail);

      const productNameMap = new Map(
        (emailProducts || []).map((p) => [p.id, p.name])
      );

      const emailItems = items.map((item) => ({
        name: productNameMap.get(item.product_id) || item.name,
        qty: item.quantity,
        price: item.price_cents,
      }));

      const addressStr = [
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.zip,
      ]
        .filter(Boolean)
        .join(", ");

      await sendOrderConfirmation(custEmail, {
        orderNumber: order.id,
        items: emailItems,
        total: totalCents,
        shippingAddress: addressStr,
        customerName: profile?.full_name || "Valued Customer",
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
