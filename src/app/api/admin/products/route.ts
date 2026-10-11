export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pre-saleed units that are paid for but not shipped yet, per product
  const { data: owedItems } = await supabase
    .from("order_items")
    .select("product_id, quantity, orders!inner(status)")
    .eq("is_preorder", true)
    .eq("orders.status", "paid");

  const owed = new Map<string, number>();
  for (const item of owedItems || []) {
    if (!item.product_id) continue;
    owed.set(item.product_id, (owed.get(item.product_id) || 0) + (item.quantity || 0));
  }

  return NextResponse.json({
    products: (data || []).map((p: any) => ({ ...p, preorder_owed: owed.get(p.id) || 0 })),
  });
}

// What each choice in the Status dropdown on the products list means
const STATUS_FIELDS: Record<string, { is_active: boolean; is_preorder: boolean }> = {
  live: { is_active: true, is_preorder: false },
  presale: { is_active: true, is_preorder: true },
  hidden: { is_active: false, is_preorder: false },
};

// Status dropdown on the products list
export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await request.json();
  if (!id || !STATUS_FIELDS[status]) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update(STATUS_FIELDS[status]).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      category: body.category,
      price_cents: body.price_cents,
      compare_at_price_cents: body.compare_at_price_cents || null,
      images: body.images || [],
      inventory_count: body.inventory_count || 0,
      is_active: body.is_active ?? true,
      is_member_exclusive: body.is_member_exclusive ?? false,
      is_preorder: body.is_preorder ?? false,
      preorder_note: (body.preorder_note || "").trim() || null,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function PUT(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .update({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      category: body.category,
      price_cents: body.price_cents,
      compare_at_price_cents: body.compare_at_price_cents || null,
      images: body.images || [],
      inventory_count: body.inventory_count || 0,
      is_active: body.is_active ?? true,
      is_member_exclusive: body.is_member_exclusive ?? false,
      metadata: body.metadata || {},
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
