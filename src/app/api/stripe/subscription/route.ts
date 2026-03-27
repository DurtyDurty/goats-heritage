// DEPRECATED: Stripe subscription has been replaced by Authorize.Net.
// See /api/membership/subscribe for the new subscription endpoint.
// Delete this file manually.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe subscriptions are no longer active. Use /api/membership/subscribe instead." },
    { status: 410 }
  );
}
