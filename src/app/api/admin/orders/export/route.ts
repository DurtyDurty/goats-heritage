export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildOrdersWorkbook, ORDERS_EXPORT_SELECT } from "@/lib/orders-export";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Excel download of orders for accounting and sales tax.
// ?status=all|pending|paid|shipped|delivered  (matches the Orders tab filter)
// ?from=YYYY-MM-DD&to=YYYY-MM-DD              (inclusive, Eastern time)
export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) {
    return new Response("Dates must be YYYY-MM-DD", { status: 400 });
  }

  const supabase = createAdminClient();
  let query = supabase.from("orders").select(ORDERS_EXPORT_SELECT).order("created_at", { ascending: true });
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const { buffer, filename } = await buildOrdersWorkbook(data || [], { status, from, to });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
