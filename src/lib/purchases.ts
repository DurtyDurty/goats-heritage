// Master switch for taking money. Purchases stay paused unless
// NEXT_PUBLIC_PURCHASES_ENABLED is exactly "true" in the environment, so a missing
// or mistyped variable fails safe. Enforced in the checkout and membership API
// routes; the pages read it only to explain the pause to the customer.
export const PURCHASES_ENABLED = process.env.NEXT_PUBLIC_PURCHASES_ENABLED === "true";

export const PURCHASES_PAUSED_MESSAGE =
  "Online ordering is not open yet. No payment was taken and your card was not charged.";
