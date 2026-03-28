export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();

  // Get newsletter subscribers
  const { data: newsletters } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  // Get registered customers with emails
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .order("created_at", { ascending: false });

  // Build newsletter list with source labels
  const newsletterEmails = new Set((newsletters || []).map((n: any) => n.email?.toLowerCase()));

  // Add registered customers who aren't already newsletter subscribers
  const customerEntries = (profiles || [])
    .filter((p: any) => p.email && !newsletterEmails.has(p.email.toLowerCase()))
    .map((p: any) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      source: "account",
      subscribed: true,
      created_at: p.created_at,
    }));

  const combined = [
    ...(newsletters || []),
    ...customerEntries,
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = combined.length;
  const active = combined.filter((s: any) => s.subscribed).length;
  const fromNewsletter = (newsletters || []).length;
  const fromAccounts = customerEntries.length;

  return NextResponse.json({ subscribers: combined, total, active, fromNewsletter, fromAccounts });
}
