export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function getLast30Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();
  const days = getLast30Days();

  try {
    // Fetch all data in parallel
    const [
      ordersRes,
      allOrdersRes,
      profilesRes,
      newsletterRes,
      orderItemsRes,
      productsRes,
      sentEmailsRes,
      contactMessagesRes,
      recentProfilesRes,
      recentOrdersRes,
      recentContactRes,
      recentNewsletterRes,
      activeProductsRes,
    ] = await Promise.all([
      // Orders last 30 days (paid/shipped/delivered)
      supabase
        .from("orders")
        .select("id, total_cents, status, created_at, user_id")
        .in("status", ["paid", "shipped", "delivered"])
        .gte("created_at", since),
      // All orders (for summary)
      supabase
        .from("orders")
        .select("id, total_cents, status, user_id")
        .in("status", ["paid", "shipped", "delivered"]),
      // Profiles last 30 days
      supabase
        .from("profiles")
        .select("id, created_at, age_verified")
        .order("created_at", { ascending: true }),
      // Newsletter subscribers
      supabase
        .from("newsletter_subscribers")
        .select("id, created_at")
        .order("created_at", { ascending: true }),
      // Order items with products
      supabase
        .from("order_items")
        .select("id, product_id, quantity, unit_price_cents"),
      // Products
      supabase.from("products").select("id, name"),
      // Sent emails count
      supabase
        .from("sent_emails")
        .select("id", { count: "exact", head: true }),
      // Contact messages count
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true }),
      // Recent signups (last 10)
      supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      // Recent orders (last 10)
      supabase
        .from("orders")
        .select("id, total_cents, status, created_at, user_id, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(10),
      // Recent contact messages (last 10)
      supabase
        .from("contact_messages")
        .select("id, name, email, subject, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      // Recent newsletter subs (last 10)
      supabase
        .from("newsletter_subscribers")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      // Active products
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]);

    const orders = ordersRes.data || [];
    const allOrders = allOrdersRes.data || [];
    const profiles = profilesRes.data || [];
    const newsletter = newsletterRes.data || [];
    const orderItems = orderItemsRes.data || [];
    const products = productsRes.data || [];

    // --- a) Revenue over time ---
    const revenueByDate: Record<string, number> = {};
    for (const day of days) revenueByDate[day] = 0;
    for (const order of orders) {
      const date = order.created_at.split("T")[0];
      if (revenueByDate[date] !== undefined) {
        revenueByDate[date] += order.total_cents || 0;
      }
    }
    const revenue = days.map((date) => ({
      date,
      revenue: Math.round((revenueByDate[date] || 0) / 100 * 100) / 100,
    }));

    // --- b) Customer growth (cumulative) ---
    const profilesByDate: Record<string, number> = {};
    for (const p of profiles) {
      const date = p.created_at.split("T")[0];
      profilesByDate[date] = (profilesByDate[date] || 0) + 1;
    }
    let cumProfiles = profiles.filter(
      (p: any) => p.created_at.split("T")[0] < days[0]
    ).length;
    const customerGrowth = days.map((date) => {
      cumProfiles += profilesByDate[date] || 0;
      return { date, count: cumProfiles };
    });

    // --- c) Newsletter growth (cumulative) ---
    const nlByDate: Record<string, number> = {};
    for (const n of newsletter) {
      const date = n.created_at.split("T")[0];
      nlByDate[date] = (nlByDate[date] || 0) + 1;
    }
    let cumNl = newsletter.filter(
      (n: any) => n.created_at.split("T")[0] < days[0]
    ).length;
    const newsletterGrowth = days.map((date) => {
      cumNl += nlByDate[date] || 0;
      return { date, count: cumNl };
    });

    // --- d) Top products ---
    const productMap = new Map<string, { name: string }>();
    for (const p of products) {
      productMap.set(p.id, { name: p.name });
    }
    const productStats: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};
    for (const item of orderItems) {
      const product = productMap.get(item.product_id);
      const name = product?.name || "Unknown";
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = { name, quantity: 0, revenue: 0 };
      }
      productStats[item.product_id].quantity += item.quantity || 0;
      productStats[item.product_id].revenue +=
        ((item.unit_price_cents || 0) * (item.quantity || 0)) / 100;
    }
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // --- e) Conversion funnel ---
    const signups = profiles.length;
    const verified = profiles.filter((p: any) => p.age_verified).length;
    const customerIds = new Set(allOrders.map((o: any) => o.user_id));
    const customers = customerIds.size;
    const funnel = { signups, verified, customers };

    // --- f) Email stats ---
    const emailStats = {
      sent: sentEmailsRes.count || 0,
      received: contactMessagesRes.count || 0,
    };

    // --- g) Recent activity ---
    const activity: { type: string; description: string; timestamp: string }[] =
      [];
    for (const p of recentProfilesRes.data || []) {
      activity.push({
        type: "signup",
        description: `${p.full_name || p.email || "Someone"} signed up`,
        timestamp: p.created_at,
      });
    }
    for (const o of recentOrdersRes.data || []) {
      const name = (o as any).profiles?.full_name || "A customer";
      activity.push({
        type: "order",
        description: `${name} placed a $${((o.total_cents || 0) / 100).toFixed(2)} order`,
        timestamp: o.created_at,
      });
    }
    for (const m of recentContactRes.data || []) {
      activity.push({
        type: "message",
        description: `${m.name || m.email} sent a message: "${m.subject || "No subject"}"`,
        timestamp: m.created_at,
      });
    }
    for (const n of recentNewsletterRes.data || []) {
      activity.push({
        type: "newsletter",
        description: `${n.email} subscribed to newsletter`,
        timestamp: n.created_at,
      });
    }
    activity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const recentActivity = activity.slice(0, 10);

    // --- h) Summary stats ---
    const totalRevenue = allOrders.reduce(
      (sum: number, o: any) => sum + (o.total_cents || 0),
      0
    );
    const totalOrders = allOrders.length;
    const totalCustomers = profiles.length;
    const totalSubscribers = newsletter.length;
    const activeProducts = activeProductsRes.count || 0;
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const summary = {
      totalRevenue: totalRevenue / 100,
      totalOrders,
      totalCustomers,
      totalSubscribers,
      activeProducts,
      avgOrderValue: avgOrderValue / 100,
    };

    return NextResponse.json({
      revenue,
      customerGrowth,
      newsletterGrowth,
      topProducts,
      funnel,
      emailStats,
      recentActivity,
      summary,
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
