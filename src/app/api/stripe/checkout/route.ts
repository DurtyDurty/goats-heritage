// DEPRECATED: Stripe checkout has been replaced by Authorize.Net.
// See /api/checkout for the new checkout endpoint.
// Delete this file manually.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe checkout is no longer active. Use /api/checkout instead." },
    { status: 410 }
  );
}
