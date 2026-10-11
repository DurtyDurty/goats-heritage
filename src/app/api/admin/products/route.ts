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
  return NextResponse.json({ products: data });
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
      // An upcoming product is never active, so the storefront cannot show it
      is_active: body.is_upcoming ? false : body.is_active ?? true,
      is_upcoming: body.is_upcoming ?? false,
      upcoming_note: (body.upcoming_note || "").trim() || null,
      is_member_exclusive: body.is_member_exclusive ?? false,
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
      // An upcoming product is never active, so the storefront cannot show it
      is_active: body.is_upcoming ? false : body.is_active ?? true,
      is_upcoming: body.is_upcoming ?? false,
      upcoming_note: (body.upcoming_note || "").trim() || null,
      is_member_exclusive: body.is_member_exclusive ?? false,
      metadata: body.metadata || {},
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// Upcoming switch from the products list. Turning it on hides the product from the
// store; turning it off puts the product live.
export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, is_upcoming } = await request.json();
  if (!id || typeof is_upcoming !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_upcoming, is_active: !is_upcoming })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: false, is_upcoming: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
