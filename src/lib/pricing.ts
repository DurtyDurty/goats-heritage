// Shipping and tax rules for checkout. One function, used by the checkout page (as
// an estimate), by the server when it creates the order (the amount actually
// charged), and by the confirmation email.
//
// These are BASELINE rates. Change the numbers here and every place stays in sync.

/** Flat shipping fee, waived at the free-shipping threshold (matches the Shipping Policy). */
export const SHIPPING_FLAT_CENTS = 799;
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

/**
 * Smallest number of cigars (any mix) an order may contain. A single cigar is not
 * worth a shipment once postage and adult signature are paid. Orders with no
 * cigars have no minimum.
 */
export const MIN_CIGARS_PER_ORDER = 3;

/**
 * Sales tax by destination state (2-letter code). States not listed are charged no tax
 * (AK, DE, MT, NH and OR have no state sales tax).
 * These are the STATE rates only. County and city taxes, which many states add on top
 * (FL counties add 0.5%-1.5%), are NOT included. UT and VA include their mandatory
 * statewide local portion. Confirm the rates with your accountant before relying on them.
 */
export const SALES_TAX_RATES: Record<string, number> = {
  AL: 0.04,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DC: 0.06,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.05,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.07,
  MO: 0.04225,
  NE: 0.055,
  NV: 0.0685,
  NJ: 0.06625,
  NM: 0.04875,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.042,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.061,
  VT: 0.06,
  VA: 0.053,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
};

/**
 * Florida taxes delivery charges the customer cannot opt out of, so shipping is in the
 * taxable amount. Applied to every state for simplicity; some states do not tax shipping.
 */
export const SALES_TAX_APPLIES_TO_SHIPPING = true;

/**
 * Tobacco (excise) tax by destination state, as a fraction of the cigar price,
 * shown as its own line when above zero.
 * FL: 0. Florida's tobacco products tax excludes cigars (s. 210.25, F.S.), so there
 * is no state cigar tax to collect. Set a rate here if your accountant says otherwise.
 */
export const TOBACCO_TAX_RATES: Record<string, number> = {
  FL: 0,
};

const TOBACCO_CATEGORIES = ["cigar"];

export interface PricedLine {
  category: string;
  unit_price_cents: number;
  quantity: number;
}

/** How many more cigars the cart needs to reach the minimum. 0 when it is met or there are no cigars. */
export function cigarsNeeded(lines: { category: string; quantity: number }[]): number {
  const cigars = lines
    .filter((l) => TOBACCO_CATEGORIES.includes(l.category))
    .reduce((sum, l) => sum + l.quantity, 0);
  return cigars === 0 ? 0 : Math.max(0, MIN_CIGARS_PER_ORDER - cigars);
}

export interface OrderTotals {
  subtotalCents: number;
  shippingCents: number;
  tobaccoTaxCents: number;
  salesTaxCents: number;
  totalCents: number;
  /** The sales tax rate applied, 0 when the destination is not taxed. */
  salesTaxRate: number;
}

/** Shipping when no carrier estimate is available: the flat fee, or free at the threshold. */
export function defaultShippingCents(subtotalCents: number): number {
  return subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

/**
 * @param shippingCents a carrier estimate for this order (see src/lib/shipping.ts).
 *   Leave undefined to use the flat fee. Free shipping at the threshold always wins.
 */
export function calculateTotals(
  lines: PricedLine[],
  state: string | null | undefined,
  shippingCents?: number | null
): OrderTotals {
  const code = (state || "").trim().toUpperCase();

  const subtotalCents = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const tobaccoSubtotalCents = lines
    .filter((l) => TOBACCO_CATEGORIES.includes(l.category))
    .reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);

  const flatCents = defaultShippingCents(subtotalCents);
  const shipping = flatCents === 0 || shippingCents == null ? flatCents : Math.max(0, Math.round(shippingCents));
  const tobaccoTaxCents = Math.round(tobaccoSubtotalCents * (TOBACCO_TAX_RATES[code] || 0));

  const salesTaxRate = SALES_TAX_RATES[code] || 0;
  const taxableCents = subtotalCents + tobaccoTaxCents + (SALES_TAX_APPLIES_TO_SHIPPING ? shipping : 0);
  const salesTaxCents = Math.round(taxableCents * salesTaxRate);

  return {
    subtotalCents,
    shippingCents: shipping,
    tobaccoTaxCents,
    salesTaxCents,
    totalCents: subtotalCents + shipping + tobaccoTaxCents + salesTaxCents,
    salesTaxRate,
  };
}
