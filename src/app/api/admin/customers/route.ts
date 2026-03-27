export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, date_of_birth, age_verified, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get order counts and totals per user
  const customersWithOrders = await Promise.all(
    (profiles || []).map(async (profile: any) => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_cents, status, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      const totalSpent = (orders || [])
        .filter((o: any) => o.status === "paid" || o.status === "shipped" || o.status === "delivered")
        .reduce((sum: number, o: any) => sum + o.total_cents, 0);

      return {
        ...profile,
        orders: orders || [],
        order_count: orders?.length || 0,
        total_spent: totalSpent,
      };
    })
  );

  return NextResponse.json({ customers: customersWithOrders });
}
