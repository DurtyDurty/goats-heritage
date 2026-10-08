// Master switch for taking money. Purchases stay paused unless
// NEXT_PUBLIC_PURCHASES_ENABLED is exactly "true" in the environment, so a missing
// or mistyped variable fails safe. Enforced in the checkout and membership API
// routes; the pages read it only to explain the pause to the customer.
export const PURCHASES_ENABLED = process.env.NEXT_PUBLIC_PURCHASES_ENABLED === "true";

// Memberships are off until recurring billing is set up with the new processor.
// Kept separate so turning purchases on does not reopen the old subscription form.
export const MEMBERSHIPS_ENABLED = false;

export const PURCHASES_PAUSED_MESSAGE =
  "Orders are paused during maintenance. No payment was taken and your card was not charged.";
