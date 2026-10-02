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
 * Sales tax by destination state (2-letter code). States not listed are charged no tax.
 * FL: 6% is the state rate only. Counties add a 0.5%-1.5% surtax that is NOT included.
 */
export const SALES_TAX_RATES: Record<string, number> = {
  FL: 0.06,
};

/** Florida taxes delivery charges the customer cannot opt out of, so shipping is in the taxable amount. */
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

export function calculateTotals(lines: PricedLine[], state: string | null | undefined): OrderTotals {
  const code = (state || "").trim().toUpperCase();

  const subtotalCents = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const tobaccoSubtotalCents = lines
    .filter((l) => TOBACCO_CATEGORIES.includes(l.category))
    .reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);

  const shippingCents = subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
  const tobaccoTaxCents = Math.round(tobaccoSubtotalCents * (TOBACCO_TAX_RATES[code] || 0));

  const salesTaxRate = SALES_TAX_RATES[code] || 0;
  const taxableCents = subtotalCents + tobaccoTaxCents + (SALES_TAX_APPLIES_TO_SHIPPING ? shippingCents : 0);
  const salesTaxCents = Math.round(taxableCents * salesTaxRate);

  return {
    subtotalCents,
    shippingCents,
    tobaccoTaxCents,
    salesTaxCents,
    totalCents: subtotalCents + shippingCents + tobaccoTaxCents + salesTaxCents,
    salesTaxRate,
  };
}
