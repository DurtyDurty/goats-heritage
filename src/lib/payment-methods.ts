// How an order was paid (orders.payment_provider). "bankful" is set by the
// gateway when a hosted-page payment is approved; the rest are picked by an
// admin for orders paid outside the website (events, in person, apps).

export const GATEWAY_PROVIDER = "bankful";

export const MANUAL_PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "venmo", label: "Venmo" },
  { value: "cashapp", label: "Cash App" },
  { value: "zelle", label: "Zelle" },
  { value: "card_in_person", label: "Card (in person)" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
] as const;

export function isManualPaymentMethod(value: unknown): boolean {
  return MANUAL_PAYMENT_METHODS.some((m) => m.value === value);
}

export function paymentMethodLabel(provider: string | null | undefined): string {
  if (!provider) return "";
  if (provider === GATEWAY_PROVIDER) return "Card (Bankful)";
  return MANUAL_PAYMENT_METHODS.find((m) => m.value === provider)?.label || provider;
}
