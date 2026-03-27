export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSubscription } from "@/lib/authnet/helpers";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Get active subscription
    const { data: subscription, error: subError } = await adminSupabase
      .from("subscriptions")
      .select("id, authnet_subscription_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (!subscription.authnet_subscription_id) {
      // Legacy Stripe subscription or missing ID — just mark as cancelled
      await adminSupabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscription.id);

      await adminSupabase
        .from("profiles")
        .update({ role: "customer" })
        .eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    // Cancel via Authorize.Net
    const result = await cancelSubscription(
      subscription.authnet_subscription_id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to cancel subscription" },
        { status: 400 }
      );
    }

    // Update database
    await adminSupabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscription.id);

    await adminSupabase
      .from("profiles")
      .update({ role: "customer" })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
