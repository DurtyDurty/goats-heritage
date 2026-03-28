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
        type: "customer" as const,
        orders: orders || [],
        order_count: orders?.length || 0,
        total_spent: totalSpent,
      };
    })
  );

  // Fetch newsletter subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, full_name, source, subscribed, created_at")
    .order("created_at", { ascending: false });

  // Build set of existing customer emails for dedup
  const customerEmails = new Set(
    (profiles || []).map((p: any) => p.email?.toLowerCase())
  );

  // Create lead entries for newsletter-only subscribers
  const leads = (subscribers || [])
    .filter((s: any) => !customerEmails.has(s.email?.toLowerCase()))
    .map((s: any) => ({
      id: s.id,
      full_name: s.full_name || null,
      email: s.email,
      phone: null,
      date_of_birth: null,
      age_verified: false,
      role: "lead",
      created_at: s.created_at,
      type: "lead" as const,
      source: s.source,
      subscribed: s.subscribed,
      orders: [],
      order_count: 0,
      total_spent: 0,
    }));

  const combined = [...customersWithOrders, ...leads];

  return NextResponse.json({ customers: combined });
}
