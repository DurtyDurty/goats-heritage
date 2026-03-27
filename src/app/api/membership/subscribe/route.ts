export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscription } from "@/lib/authnet/helpers";
import { sendSubscriptionWelcome } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Verify age
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("full_name, email, age_verified")
      .eq("id", user.id)
      .single();

    if (!profile?.age_verified) {
      return NextResponse.json(
        { error: "Age verification required for tobacco subscriptions." },
        { status: 403 }
      );
    }

    // Check existing active subscription
    const { data: existingSub } = await adminSupabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSub) {
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 400 }
      );
    }

    const { opaqueData, shippingAddress } = await request.json();

    if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
      return NextResponse.json(
        { error: "Payment information is missing" },
        { status: 400 }
      );
    }

    const nameParts = (profile.full_name || "").split(" ");
    const custFirstName = nameParts[0] || shippingAddress?.firstName || "";
    const custLastName =
      nameParts.slice(1).join(" ") || shippingAddress?.lastName || "";
    const custEmail = profile.email || user.email || "";

    // Start date: tomorrow (YYYY-MM-DD format)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split("T")[0];

    const result = await createSubscription({
      name: "Heritage Box Monthly",
      intervalLength: 1,
      intervalUnit: "months",
      startDate,
      totalOccurrences: 9999,
      amount: 49.99,
      opaqueData,
      customerInfo: {
        firstName: custFirstName,
        lastName: custLastName,
        email: custEmail,
      },
      shippingAddress: shippingAddress || {
        firstName: custFirstName,
        lastName: custLastName,
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Subscription creation failed" },
        { status: 400 }
      );
    }

    // Upsert subscription in database
    const now = new Date().toISOString();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await adminSupabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        authnet_subscription_id: result.subscriptionId,
        status: "active",
        tier: "monthly_box",
        current_period_start: now,
        current_period_end: periodEnd.toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Update profile role to member
    await adminSupabase
      .from("profiles")
      .update({ role: "member" })
      .eq("id", user.id);

    // Send welcome email
    if (custEmail) {
      await sendSubscriptionWelcome(custEmail, {
        customerName: profile.full_name || "Valued Customer",
        tier: "monthly_box",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
