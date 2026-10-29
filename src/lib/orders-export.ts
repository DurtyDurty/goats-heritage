// Orders spreadsheet for the books (server only): one row per order with the subtotal,
// shipping, tax and total split out, plus a sales tax summary by state.
// Downloaded from the admin Orders tab via /api/admin/orders/export.

import ExcelJS from "exceljs";
import { calculateTotals, SALES_TAX_RATES } from "@/lib/pricing";
import { paymentMethodLabel } from "@/lib/payment-methods";

/** The columns the export reads from each order. */
export const ORDERS_EXPORT_SELECT =
  "*, profiles(full_name, email), order_items(quantity, unit_price_cents, products(name, category))";

const TIME_ZONE = "America/New_York";
/** Orders that were actually charged. Pending and cancelled orders are listed but never counted. */
const COLLECTED = ["paid", "shipped", "delivered"];
const MONEY = '"$"#,##0.00';

/** The order's date and time on the Eastern clock, as parts. */
function easternParts(iso: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value])
  );
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    // Excel has no time zones, so the cell holds the Eastern wall-clock time
    cell: new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute)),
  };
}

/**
 * @param orders rows selected with ORDERS_EXPORT_SELECT, oldest first
 * @param opts.from, opts.to inclusive YYYY-MM-DD dates on the Eastern clock ("" for no limit)
 */
export async function buildOrdersWorkbook(
  orders: any[],
  { status, from, to }: { status: string | null; from: string; to: string }
): Promise<{ buffer: ArrayBuffer; filename: string }> {
  const rows = orders
    .map((o: any) => {
      const when = easternParts(o.created_at);
      const ship = (o.shipping_address || {}) as Record<string, any>;
      const items = o.order_items || [];
      const subtotal = items.reduce((sum: number, i: any) => sum + i.unit_price_cents * i.quantity, 0);
      const state = String(ship.state || "").trim().toUpperCase();
      const storedShipping = typeof ship.shipping_cents === "number" ? ship.shipping_cents : null;

      // Rebuild the breakdown with the rules that priced the order. If it does not add up
      // to what was charged (older orders, changed rates), the difference is shown as tax
      // and the row is flagged so nobody trusts it blindly.
      const totals = calculateTotals(
        items.map((i: any) => ({ category: i.products?.category || "", unit_price_cents: i.unit_price_cents, quantity: i.quantity })),
        state,
        storedShipping ?? undefined
      );
      const matches = totals.totalCents === o.total_cents;
      const shipping = matches ? totals.shippingCents : storedShipping ?? 0;
      const tobaccoTax = matches ? totals.tobaccoTaxCents : 0;
      const salesTax = matches ? totals.salesTaxCents : o.total_cents - subtotal - shipping;

      const notes: string[] = [];
      if (!matches) notes.push("Breakdown does not match current tax rules; tax = total - subtotal - shipping");
      if (COLLECTED.includes(o.status) && !o.payment_provider) notes.push("No payment method recorded");

      return {
        day: when.day,
        date: when.cell,
        orderNumber: o.id.slice(0, 8),
        orderId: o.id,
        status: o.status,
        collected: COLLECTED.includes(o.status),
        customer: [ship.firstName, ship.lastName].filter(Boolean).join(" ") || o.profiles?.full_name || "",
        email: ship.email || o.profiles?.email || "",
        city: ship.city || "",
        state,
        zip: ship.zip || "",
        products: items.map((i: any) => `${i.quantity} x ${i.products?.name || "Removed product"}`).join("; "),
        units: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
        subtotal,
        shipping,
        tobaccoTax,
        salesTax,
        taxRate: SALES_TAX_RATES[state] || 0,
        total: o.total_cents,
        paymentMethod: paymentMethodLabel(o.payment_provider),
        paymentReference: o.payment_reference || "",
        tracking: o.tracking_number || "",
        notes: notes.join(". "),
      };
    })
    .filter((r) => (!from || r.day >= from) && (!to || r.day <= to));

  const wb = new ExcelJS.Workbook();
  wb.creator = "Goats Heritage";
  wb.created = new Date();
  // Totals are formulas; have Excel compute them when the file opens
  wb.calcProperties.fullCalcOnLoad = true;

  // ── Orders ──────────────────────────────────────────────────────────────────
  const sheet = wb.addWorksheet("Orders", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    { header: "Date (ET)", key: "date", width: 17, style: { numFmt: "yyyy-mm-dd hh:mm" } },
    { header: "Order #", key: "orderNumber", width: 11 },
    { header: "Status", key: "status", width: 11 },
    { header: "Customer", key: "customer", width: 22 },
    { header: "Email", key: "email", width: 28 },
    { header: "City", key: "city", width: 16 },
    { header: "State", key: "state", width: 7 },
    { header: "ZIP", key: "zip", width: 8 },
    { header: "Products", key: "products", width: 40 },
    { header: "Units", key: "units", width: 7 },
    { header: "Merchandise", key: "subtotal", width: 13, style: { numFmt: MONEY } },
    { header: "Shipping", key: "shipping", width: 11, style: { numFmt: MONEY } },
    { header: "Tobacco Tax", key: "tobaccoTax", width: 12, style: { numFmt: MONEY } },
    { header: "Sales Tax", key: "salesTax", width: 11, style: { numFmt: MONEY } },
    { header: "Tax Rate", key: "taxRate", width: 9, style: { numFmt: "0.00%" } },
    { header: "Total Charged", key: "total", width: 14, style: { numFmt: MONEY } },
    { header: "Payment Method", key: "paymentMethod", width: 16 },
    { header: "Payment Reference", key: "paymentReference", width: 19 },
    { header: "Tracking", key: "tracking", width: 22 },
    { header: "Order ID", key: "orderId", width: 38 },
    { header: "Notes", key: "notes", width: 50 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const r of rows) {
    const row = sheet.addRow({
      ...r,
      subtotal: r.subtotal / 100,
      shipping: r.shipping / 100,
      tobaccoTax: r.tobaccoTax / 100,
      salesTax: r.salesTax / 100,
      total: r.total / 100,
    });
    // Not charged: greyed out and left out of the totals below
    if (!r.collected) row.font = { color: { argb: "FF9CA3AF" }, italic: true };
  }

  // Totals count only charged orders (column C is Status)
  if (rows.length > 0) {
    const first = 2;
    const last = rows.length + 1;
    const charged = COLLECTED.map((s) => `"${s}"`).join(",");
    const collected = rows.filter((r) => r.collected);
    const sumCharged = (col: string, field: "units" | "subtotal" | "shipping" | "tobaccoTax" | "salesTax" | "total") => {
      const value = collected.reduce((sum, r) => sum + r[field], 0);
      return {
        formula: `SUMPRODUCT(SUMIF(C${first}:C${last},{${charged}},${col}${first}:${col}${last}))`,
        result: field === "units" ? value : value / 100,
      };
    };
    sheet.addRow([]);
    const totalRow = sheet.addRow({
      products: "Totals (paid, shipped, delivered)",
      units: sumCharged("J", "units"),
      subtotal: sumCharged("K", "subtotal"),
      shipping: sumCharged("L", "shipping"),
      tobaccoTax: sumCharged("M", "tobaccoTax"),
      salesTax: sumCharged("N", "salesTax"),
      total: sumCharged("P", "total"),
    });
    totalRow.font = { bold: true };
  }
  sheet.autoFilter = { from: "A1", to: "U1" };

  // ── Sales tax by state ──────────────────────────────────────────────────────
  const tax = wb.addWorksheet("Sales Tax");
  const period = from || to ? `${from || "start"} to ${to || "today"}` : "All dates";
  tax.addRow(["Sales tax summary"]).font = { bold: true, size: 14 };
  tax.addRow([`Period: ${period} (Eastern time). Paid, shipped and delivered orders only.`]);
  tax.addRow([]);

  const header = tax.addRow([
    "State",
    "Orders",
    "Merchandise",
    "Shipping",
    "Taxable Amount",
    "Tax Rate",
    "Tobacco Tax",
    "Sales Tax Collected",
    "Total Charged",
  ]);
  header.font = { bold: true };

  const byState = new Map<string, { orders: number; subtotal: number; shipping: number; tobaccoTax: number; salesTax: number; total: number }>();
  for (const r of rows.filter((r) => r.collected)) {
    const key = r.state || "Unknown";
    const s = byState.get(key) || { orders: 0, subtotal: 0, shipping: 0, tobaccoTax: 0, salesTax: 0, total: 0 };
    s.orders += 1;
    s.subtotal += r.subtotal;
    s.shipping += r.shipping;
    s.tobaccoTax += r.tobaccoTax;
    s.salesTax += r.salesTax;
    s.total += r.total;
    byState.set(key, s);
  }

  const firstStateRow = tax.rowCount + 1;
  const stateRows: number[][] = [];
  for (const [state, s] of Array.from(byState.entries()).sort((a, b) => b[1].salesTax - a[1].salesTax || a[0].localeCompare(b[0]))) {
    const rate = SALES_TAX_RATES[state] || 0;
    // Same base as pricing.ts: merchandise + tobacco tax + shipping, only where tax is charged
    const taxable = rate > 0 ? s.subtotal + s.tobaccoTax + s.shipping : 0;
    const values = [s.orders, s.subtotal / 100, s.shipping / 100, taxable / 100, rate, s.tobaccoTax / 100, s.salesTax / 100, s.total / 100];
    stateRows.push(values);
    tax.addRow([state, ...values]);
  }
  const lastStateRow = tax.rowCount;

  if (byState.size > 0) {
    // Columns B..I map to values[0..7]
    const sum = (col: string) => {
      const i = col.charCodeAt(0) - "B".charCodeAt(0);
      const result = Math.round(stateRows.reduce((acc, v) => acc + v[i], 0) * 100) / 100;
      return { formula: `SUM(${col}${firstStateRow}:${col}${lastStateRow})`, result };
    };
    tax.addRow(["Total", sum("B"), sum("C"), sum("D"), sum("E"), null, sum("G"), sum("H"), sum("I")]).font = { bold: true };
  } else {
    tax.addRow(["No charged orders in this period"]);
  }

  tax.addRow([]);
  tax.addRow([
    "Florida: the site charges the 6% state rate only. County discretionary surtax is not collected; check with your accountant.",
  ]).font = { italic: true };

  [16, 9, 14, 12, 16, 10, 13, 20, 15].forEach((width, i) => (tax.getColumn(i + 1).width = width));
  for (let r = firstStateRow; r <= tax.rowCount; r++) {
    const row = tax.getRow(r);
    [3, 4, 5, 7, 8, 9].forEach((c) => (row.getCell(c).numFmt = MONEY));
    row.getCell(6).numFmt = "0.00%";
  }

  const buffer = await wb.xlsx.writeBuffer();
  const label = [status && status !== "all" ? status : null, from || null, to || null].filter(Boolean).join("_");
  const filename = `goats-heritage-orders${label ? `_${label}` : ""}.xlsx`;

  return { buffer: buffer as ArrayBuffer, filename };
}
