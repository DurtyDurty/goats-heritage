export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendShippingUpdate } from "@/lib/email/send";

export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*, profiles(full_name, email), order_items(id)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, tracking_number } = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, any> = {};
  if (status) updates.status = status;
  if (tracking_number !== undefined) updates.tracking_number = tracking_number;

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send shipping update email when order is marked as shipped with tracking
  if (status === "shipped" && tracking_number && data?.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", data.user_id)
      .single();

    if (profile?.email) {
      await sendShippingUpdate(profile.email, {
        orderNumber: data.id,
        trackingNumber: tracking_number,
        customerName: profile.full_name || "Valued Customer",
      });
    }
  }

  return NextResponse.json({ order: data });
}
