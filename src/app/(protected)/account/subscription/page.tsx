import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubscriptionActions from "./SubscriptionActions";

interface Props {
  searchParams: { success?: string; already_member?: string };
}

export default async function SubscriptionPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isActive = subscription?.status === "active";

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">
          My <span className="text-[#C8A84E]">Subscription</span>
        </h1>
        <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />

        {/* Success banner */}
        {searchParams.success && (
          <div className="mt-6 rounded-lg border border-[#C8A84E]/30 bg-[#C8A84E]/5 px-4 py-3 text-center">
            <p className="font-semibold text-[#C8A84E]">
              Welcome to the club!
            </p>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Your Heritage Box subscription is now active.
            </p>
          </div>
        )}

        {searchParams.already_member && (
          <div className="mt-6 rounded-lg border border-[#C8A84E]/30 bg-[#C8A84E]/5 px-4 py-3 text-center">
            <p className="text-sm text-[#C8A84E]">
              You already have an active subscription.
            </p>
          </div>
        )}

        {isActive ? (
          <div className="mt-8 rounded-xl border border-[#262626] bg-[#141414] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">
                The Heritage Box
              </h2>
              <span className="rounded-full bg-[#22C55E]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                Active
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A3A3A3]">Tier</span>
                <span className="capitalize text-[#F5F5F5]">
                  {subscription.tier?.replace("_", " ") || "Monthly Box"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A3A3A3]">Status</span>
                <span className="capitalize text-[#22C55E]">
                  {subscription.status}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-[#A3A3A3]">Next billing date</span>
                  <span className="text-[#F5F5F5]">
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#A3A3A3]">Member since</span>
                <span className="text-[#F5F5F5]">
                  {new Date(subscription.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>

            {isActive && <SubscriptionActions />}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-[#262626] bg-[#141414] p-8 text-center">
            <p className="text-lg text-[#A3A3A3]">
              You don&apos;t have an active subscription.
            </p>
            <Link
              href="/membership"
              className="mt-6 inline-block rounded-lg bg-[#C8A84E] px-8 py-3 font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              Join the Club
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
