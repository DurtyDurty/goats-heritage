export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, sku, mcu, category, price_cents, cost_cents, inventory_count, reorder_point, weight_oz, supplier, location, is_active, images")
    .order("name", { ascending: true });

  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  // Sold line items from completed orders (paid, shipped, delivered)
  const { data: soldItems } = await supabase
    .from("order_items")
    .select("product_id, quantity, unit_price_cents, orders!inner(status)")
    .in("orders.status", ["paid", "shipped", "delivered"]);

  const items = products || [];
  const totalItems = items.reduce((sum: number, p: any) => sum + (p.inventory_count || 0), 0);
  const totalValue = items.reduce((sum: number, p: any) => sum + (p.cost_cents || 0) * (p.inventory_count || 0), 0);
  const lowStock = items.filter((p: any) => p.inventory_count <= (p.reorder_point || 5) && p.is_active);
  const outOfStock = items.filter((p: any) => p.inventory_count === 0 && p.is_active);

  // Per-product sales rollup
  const sales = new Map<string, { units: number; revenue: number }>();
  for (const item of soldItems || []) {
    if (!item.product_id) continue;
    const s = sales.get(item.product_id) || { units: 0, revenue: 0 };
    s.units += item.quantity || 0;
    s.revenue += (item.unit_price_cents || 0) * (item.quantity || 0);
    sales.set(item.product_id, s);
  }

  const perProduct = items.map((p: any) => {
    const stock = p.inventory_count || 0;
    const cost = p.cost_cents || 0;
    const s = sales.get(p.id) || { units: 0, revenue: 0 };
    const cogs = cost * s.units;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      stock,
      stockCost: cost * stock,
      stockRetail: (p.price_cents || 0) * stock,
      unitsSold: s.units,
      revenue: s.revenue,
      cogs,
      profit: s.revenue - cogs,
    };
  });

  const sum = (key: keyof (typeof perProduct)[number]) =>
    perProduct.reduce((acc, p) => acc + (p[key] as number), 0);

  const financials = {
    shelf: {
      cost: totalValue,
      retail: sum("stockRetail"),
    },
    sold: {
      revenue: sum("revenue"),
      cogs: sum("cogs"),
      units: sum("unitsSold"),
    },
    products: perProduct
      .filter((p) => p.stock > 0 || p.unitsSold > 0)
      .sort((a, b) => b.revenue - a.revenue || b.stockRetail - a.stockRetail),
  };

  return NextResponse.json({
    products: items,
    movements: movements || [],
    stats: {
      totalProducts: items.length,
      totalItems,
      totalValue,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
    },
    financials,
  });
}

// Update product inventory fields
export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, sku, mcu, price_cents, cost_cents, weight_oz, reorder_point, supplier, location } = body;

  if (price_cents !== undefined && (!Number.isInteger(price_cents) || price_cents <= 0)) {
    return NextResponse.json({ error: "Price must be greater than $0.00" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      ...(sku !== undefined && { sku }),
      ...(mcu !== undefined && { mcu }),
      ...(price_cents !== undefined && { price_cents }),
      ...(cost_cents !== undefined && { cost_cents }),
      ...(weight_oz !== undefined && { weight_oz }),
      ...(reorder_point !== undefined && { reorder_point }),
      ...(supplier !== undefined && { supplier }),
      ...(location !== undefined && { location }),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Add inventory movement (restock, adjustment, etc.)
export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { product_id, type, quantity, notes } = body;

  const supabase = createAdminClient();

  // Get current count
  const { data: product } = await supabase
    .from("products")
    .select("inventory_count")
    .eq("id", product_id)
    .single();

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const previousCount = product.inventory_count || 0;
  const newCount = type === "sale" || type === "damaged"
    ? Math.max(0, previousCount - Math.abs(quantity))
    : previousCount + Math.abs(quantity);

  // Update product inventory
  await supabase
    .from("products")
    .update({ inventory_count: newCount })
    .eq("id", product_id);

  // Log the movement
  await supabase
    .from("inventory_movements")
    .insert({
      product_id,
      type,
      quantity: type === "sale" || type === "damaged" ? -Math.abs(quantity) : Math.abs(quantity),
      previous_count: previousCount,
      new_count: newCount,
      notes,
      created_by: admin.id,
    });

  return NextResponse.json({ success: true, newCount });
}
