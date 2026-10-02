export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultShippingCents } from "@/lib/pricing";
import { quoteShipping } from "@/lib/shipping";

// Shipping estimate for the checkout page. Signed-in customers only, so the
// carrier lookup cannot be hammered anonymously. Checkout re-quotes on the server
// before charging; this endpoint is for display.
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { zip, items } = (await request.json()) as {
      zip?: string;
      items?: { product_id: string; quantity: number }[];
    };

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (items.some((i) => !i.product_id || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 500)) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const { data: products } = await createAdminClient()
      .from("products")
      .select("id, price_cents, weight_oz, is_active")
      .in("id", items.map((i) => i.product_id));

    const byId = new Map((products || []).filter((p) => p.is_active).map((p) => [p.id, p]));
    const lines = items.filter((i) => byId.has(i.product_id)).map((i) => ({ product: byId.get(i.product_id)!, quantity: i.quantity }));
    if (lines.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const subtotalCents = lines.reduce((sum, l) => sum + l.product.price_cents * l.quantity, 0);
    const quote = await quoteShipping({
      destinationZip: zip || "",
      flatCents: defaultShippingCents(subtotalCents),
      lines: lines.map((l) => ({ weight_oz: l.product.weight_oz, quantity: l.quantity })),
    });

    return NextResponse.json({ shippingCents: quote.cents, source: quote.source });
  } catch (err) {
    console.error("Shipping quote error:", err);
    return NextResponse.json({ error: "Could not estimate shipping" }, { status: 500 });
  }
}
