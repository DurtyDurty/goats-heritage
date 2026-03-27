import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">
          My <span className="text-[#C8A84E]">Account</span>
        </h1>
        <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />

        <div className="mt-8 rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">Profile</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Email</span>
              <span className="text-[#F5F5F5]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Name</span>
              <span className="text-[#F5F5F5]">
                {profile?.full_name || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A3A3]">Age Verified</span>
              <span className={profile?.age_verified ? "text-[#22C55E]" : "text-[#F59E0B]"}>
                {profile?.age_verified ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="block w-full rounded-lg bg-[#C8A84E] py-3 text-center text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              My Orders
            </Link>
            <Link
              href="/account/subscription"
              className="block w-full rounded-lg border border-[#C8A84E] py-3 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10"
            >
              Membership
            </Link>
            <Link
              href="/account/edit"
              className="block w-full rounded-lg border border-[#262626] py-3 text-center text-sm font-medium text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A]"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
