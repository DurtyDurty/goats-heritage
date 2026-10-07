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
              <span className="text-[#A3A3A3]">Date of Birth</span>
              <span className="text-[#F5F5F5]">
                {profile?.date_of_birth
                  ? new Date(`${profile.date_of_birth}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A3A3A3]">Age Verified</span>
              <span className={profile?.age_verified ? "text-[#22C55E]" : "text-[#F59E0B]"}>
                {profile?.age_verified ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {!profile?.age_verified && (
            <div className="mt-5 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-4">
              <p className="text-sm text-[#F5F5F5]">Your age is not verified yet.</p>
              <p className="mt-1 text-xs text-[#A3A3A3]">
                Add your date of birth to order tobacco products. You must be 21 or older.
              </p>
              <Link
                href="/auth/verify-age"
                className="mt-3 inline-block rounded-lg bg-[#C8A84E] px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]"
              >
                Verify Age
              </Link>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="block w-full rounded-lg bg-[#C8A84E] py-3 text-center text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]"
            >
              My Orders
            </Link>
            <Link
              href="/account/edit"
              className="block w-full rounded-lg border border-[#262626] py-3 text-center text-sm font-medium text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A]"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {profile?.role === "admin" && (
          <div className="mt-6 rounded-xl border-2 border-[#C8A84E] bg-[#C8A84E]/5 p-6">
            <h2 className="text-lg font-bold text-[#C8A84E]">Admin Panel</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">Manage your store, orders, and customers.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/admin" className="rounded-lg bg-[#C8A84E] py-2.5 text-center text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]">
                Dashboard
              </Link>
              <Link href="/admin/inbox" className="rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Inbox
              </Link>
              <Link href="/admin/customers" className="rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Customers
              </Link>
              <Link href="/admin/products" className="rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Products
              </Link>
              <Link href="/admin/inventory" className="rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Inventory
              </Link>
              <Link href="/admin/orders" className="rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Orders
              </Link>
              <Link href="/admin/newsletter" className="rounded-lg border border-[#C8A84E] py-2.5 text-center text-sm font-medium text-[#C8A84E] transition-colors hover:bg-[#C8A84E]/10">
                Newsletter
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
