import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/shop/ProductGrid";
import { type Product } from "@/lib/types";

export default async function MembershipPerksPage() {
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

  const isMember = profile?.role === "member" || profile?.role === "admin";

  if (!isMember) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Lock className="mx-auto h-16 w-16 text-[#262626]" />
          <h1 className="mt-6 text-3xl font-bold text-[#F5F5F5]">
            Members Only
          </h1>
          <p className="mt-3 text-[#A3A3A3]">
            This area is exclusive to Goats Heritage members. Join the club to
            unlock member-only products, events, and perks.
          </p>
          <Link
            href="/membership"
            className="mt-8 inline-block rounded-lg bg-[#C8A84E] px-8 py-3 font-bold text-black transition-colors hover:bg-[#E8D48B]"
          >
            Join the Club
          </Link>
        </div>
      </section>
    );
  }

  // Fetch member-only products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_member_exclusive", true)
    .order("created_at", { ascending: false });

  // Fetch members-only events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_members_only", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(3);

  // Subscription info
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, tier, current_period_end, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">
          Member <span className="text-[#C8A84E]">Perks</span>
        </h1>
        <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />

        {/* Membership status card */}
        {subscription && (
          <div className="mt-8 rounded-xl border border-[#C8A84E]/30 bg-[#C8A84E]/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#A3A3A3]">Your Membership</p>
                <p className="mt-1 font-semibold text-[#C8A84E]">
                  {subscription.tier?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Heritage Box"}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-[#22C55E]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                  Active
                </span>
                <p className="mt-1 text-xs text-[#A3A3A3]">
                  Member since{" "}
                  {new Date(subscription.created_at).toLocaleDateString(
                    "en-US",
                    { month: "short", year: "numeric" }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Member-only products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold">
            Exclusive <span className="text-[#C8A84E]">Products</span>
          </h2>
          <div className="mt-2 h-px w-16 bg-[#C8A84E]/40" />
          <div className="mt-6">
            <ProductGrid products={(products as Product[]) || []} />
          </div>
        </div>

        {/* Members-only events */}
        {events && events.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold">
              Upcoming <span className="text-[#C8A84E]">Events</span>
            </h2>
            <div className="mt-2 h-px w-16 bg-[#C8A84E]/40" />
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {events.map((event: any) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-[#262626] bg-[#141414] p-6"
                >
                  <span className="inline-block rounded-md bg-[#C8A84E]/10 px-3 py-1 text-xs font-bold tracking-wider text-[#C8A84E]">
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }).toUpperCase()}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-[#F5F5F5]">
                    {event.title}
                  </h3>
                  {event.location && (
                    <p className="mt-1 text-sm text-[#A3A3A3]">
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
