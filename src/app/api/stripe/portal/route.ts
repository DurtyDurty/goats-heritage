// DEPRECATED: Stripe customer portal has been replaced.
// Subscription management is now handled via /api/membership/cancel.
// Delete this file manually.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe portal is no longer active. Manage subscriptions from your account page." },
    { status: 410 }
  );
}
