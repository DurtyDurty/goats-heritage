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

  const items = products || [];
  const totalItems = items.reduce((sum: number, p: any) => sum + (p.inventory_count || 0), 0);
  const totalValue = items.reduce((sum: number, p: any) => sum + (p.cost_cents || 0) * (p.inventory_count || 0), 0);
  const lowStock = items.filter((p: any) => p.inventory_count <= (p.reorder_point || 5) && p.is_active);
  const outOfStock = items.filter((p: any) => p.inventory_count === 0 && p.is_active);

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
  });
}

// Update product inventory fields
export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, sku, mcu, cost_cents, weight_oz, reorder_point, supplier, location } = body;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      ...(sku !== undefined && { sku }),
      ...(mcu !== undefined && { mcu }),
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
