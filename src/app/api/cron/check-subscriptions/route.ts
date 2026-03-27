export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/authnet/helpers";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all active subscriptions with Authorize.Net IDs
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, authnet_subscription_id")
    .eq("status", "active")
    .not("authnet_subscription_id", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let checked = 0;
  let deactivated = 0;
  const errors: string[] = [];

  for (const sub of subscriptions || []) {
    checked++;
    try {
      const result = await getSubscriptionStatus(sub.authnet_subscription_id);

      if (result.error) {
        errors.push(`Sub ${sub.id}: ${result.error}`);
        continue;
      }

      // Authorize.Net subscription statuses: active, expired, suspended, canceled, terminated
      if (result.status !== "active") {
        // Deactivate subscription
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("id", sub.id);

        // Downgrade user role
        await supabase
          .from("profiles")
          .update({ role: "customer" })
          .eq("id", sub.user_id);

        deactivated++;
      }
    } catch (err: any) {
      errors.push(`Sub ${sub.id}: ${err.message}`);
    }
  }

  return NextResponse.json({
    checked,
    deactivated,
    errors: errors.length > 0 ? errors : undefined,
  });
}
