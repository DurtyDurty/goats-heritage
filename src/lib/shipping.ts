// Shipping estimates by destination (server only).
//
// Asks USPS for the Ground Advantage price from our ZIP to the customer's ZIP for a
// package of this order's weight. If USPS is not configured, slow, or returns an
// error, the flat fee from pricing.ts is used instead, so checkout never breaks.
// ── Packaging assumptions. Replace with measured values. ──────────────────────
/** ZIP the packages are mailed from. */
const ORIGIN_ZIP = (process.env.SHIP_FROM_ZIP || "32259").trim();
/** Used for any product with no weight entered in the admin Inventory tab. */
const DEFAULT_ITEM_OZ = 0.7;
/** Humidor bag plus padded mailer. */
const BAG = { tareOz: 2, length: 9, width: 6, height: 1 };
/** Orders of this many items or more ship in a box. */
const BOX_MIN_ITEMS = 25;
const BOX = { tareOz: 8, length: 10, width: 8, height: 4 };
// ──────────────────────────────────────────────────────────────────────────────

const USPS_BASE = process.env.USPS_API_BASE || "https://apis.usps.com";
const USPS_TIMEOUT_MS = 4000;

export interface ShippingLine {
  weight_oz: number | null;
  quantity: number;
}

export interface ShippingQuote {
  cents: number;
  /** "usps" = live estimate, "flat" = fallback fee, "free" = over the free-shipping threshold. */
  source: "usps" | "flat" | "free";
}

export function buildPackage(lines: ShippingLine[]) {
  const items = lines.reduce((sum, l) => sum + l.quantity, 0);
  const itemsOz = lines.reduce((sum, l) => sum + (Number(l.weight_oz) > 0 ? Number(l.weight_oz) : DEFAULT_ITEM_OZ) * l.quantity, 0);
  const pack = items >= BOX_MIN_ITEMS ? BOX : BAG;
  const pounds = Math.max(0.01, Math.round(((itemsOz + pack.tareOz) / 16) * 100) / 100);
  return { pounds, length: pack.length, width: pack.width, height: pack.height, packaging: pack === BOX ? "box" : "bag" };
}

export function uspsConfigured(): boolean {
  return Boolean(process.env.USPS_CLIENT_ID?.trim() && process.env.USPS_CLIENT_SECRET?.trim());
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function uspsToken(signal: AbortSignal): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch(`${USPS_BASE}/oauth2/v3/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.USPS_CLIENT_ID!.trim(),
      client_secret: process.env.USPS_CLIENT_SECRET!.trim(),
      grant_type: "client_credentials",
    }),
    cache: "no-store",
    signal,
  });
  const json: any = await res.json().catch(() => null);
  if (!res.ok || !json?.access_token) {
    console.error("USPS token request failed:", res.status, JSON.stringify(json)?.slice(0, 300));
    return null;
  }
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000 };
  return cachedToken.value;
}

/** USPS Ground Advantage retail price in cents, or null if it could not be fetched. */
async function uspsGroundAdvantageCents(destinationZip: string, lines: ShippingLine[]): Promise<number | null> {
  const pkg = buildPackage(lines);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), USPS_TIMEOUT_MS);

  try {
    const token = await uspsToken(controller.signal);
    if (!token) return null;

    const res = await fetch(`${USPS_BASE}/prices/v3/base-rates/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        originZIPCode: ORIGIN_ZIP,
        destinationZIPCode: destinationZip,
        weight: pkg.pounds,
        length: pkg.length,
        width: pkg.width,
        height: pkg.height,
        mailClass: "USPS_GROUND_ADVANTAGE",
        processingCategory: "MACHINABLE",
        destinationEntryFacilityType: "NONE",
        rateIndicator: "SP",
        priceType: "RETAIL",
        mailingDate: new Date().toISOString().slice(0, 10),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    const json: any = await res.json().catch(() => null);
    const price = Number(json?.totalBasePrice);
    if (!res.ok || !Number.isFinite(price) || price <= 0) {
      console.error("USPS price request failed:", res.status, JSON.stringify(json)?.slice(0, 300));
      return null;
    }
    return Math.round(price * 100);
  } catch (err: any) {
    console.error("USPS price request error:", err?.name === "AbortError" ? "timed out" : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The shipping charge for an order: free at the threshold, else a USPS estimate, else the flat fee. */
export async function quoteShipping(input: {
  destinationZip: string;
  /** The flat-fee result for this order from pricing.ts defaultShippingCents(); 0 means free shipping. */
  flatCents: number;
  lines: ShippingLine[];
}): Promise<ShippingQuote> {
  const flat = input.flatCents;
  if (flat === 0) return { cents: 0, source: "free" };

  const zip = (input.destinationZip || "").trim().slice(0, 5);
  if (uspsConfigured() && /^\d{5}$/.test(zip)) {
    const cents = await uspsGroundAdvantageCents(zip, input.lines);
    if (cents !== null) return { cents, source: "usps" };
  }
  return { cents: flat, source: "flat" };
}
