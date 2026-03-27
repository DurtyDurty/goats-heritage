// DEPRECATED: Stripe webhooks are no longer active.
// Authorize.Net subscription status is checked via /api/cron/check-subscriptions.
// Delete this file manually.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe webhooks are no longer active." },
    { status: 410 }
  );
}
