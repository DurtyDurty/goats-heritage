"use client";

import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";

interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  age_verified: boolean;
  role: string;
  created_at: string;
  order_count: number;
  total_spent: number;
  type: "customer" | "lead";
  source?: string;
  subscribed?: boolean;
  orders: {
    id: string;
    total_cents: number;
    status: string;
    created_at: string;
  }[];
}

type FilterTab = "all" | "customers" | "leads";

const statusColors: Record<string, string> = {
  pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  paid: "bg-[#22C55E]/10 text-[#22C55E]",
  shipped: "bg-[#3B82F6]/10 text-[#3B82F6]",
  delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      filterTab === "all" ||
      (filterTab === "customers" && c.type === "customer") ||
      (filterTab === "leads" && c.type === "lead");
    return matchesSearch && matchesTab;
  });

  const customerCount = customers.filter((c) => c.type === "customer").length;
  const leadCount = customers.filter((c) => c.type === "lead").length;

  function formatDob(dob: string | null) {
    if (!dob) return "\u2014";
    return new Date(dob + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function calculateAge(dob: string | null) {
    if (!dob) return "\u2014";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function exportCSV() {
    const csv = [
      "Type,Name,Email,Phone,DOB,Age,Age Verified,Role,Orders,Total Spent,Source,Joined",
      ...customers.map(
        (c) =>
          `${c.type},"${c.full_name || ""}",${c.email},${c.phone || ""},${c.date_of_birth || ""},${calculateAge(c.date_of_birth)},${c.age_verified},${c.role},${c.order_count},$${(c.total_spent / 100).toFixed(2)},${c.source || ""},${new Date(c.created_at).toLocaleDateString()}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goats-heritage-customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "customers", label: "Customers" },
    { key: "leads", label: "Leads" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Customers</h1>
        <button
          onClick={exportCSV}
          disabled={customers.length === 0}
          className="flex items-center gap-2 rounded-lg bg-[#C8A84E] px-4 py-2 text-sm font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 flex gap-4">
        <div className="rounded-lg bg-[#C8A84E]/10 px-4 py-2 text-sm font-medium text-[#C8A84E]">
          {customers.length} Total
        </div>
        <div className="rounded-lg bg-[#22C55E]/10 px-4 py-2 text-sm font-medium text-[#22C55E]">
          {customerCount} Customers
        </div>
        <div className="rounded-lg bg-[#3B82F6]/10 px-4 py-2 text-sm font-medium text-[#3B82F6]">
          {leadCount} Leads
        </div>
        <div className="rounded-lg bg-[#F59E0B]/10 px-4 py-2 text-sm font-medium text-[#F59E0B]">
          {customers.filter((c) => c.order_count > 0).length} With Orders
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-4 flex gap-1 rounded-lg bg-[#1A1A1A] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              filterTab === tab.key
                ? "bg-[#262626] text-[#F5F5F5]"
                : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#262626] bg-[#1A1A1A] py-2.5 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#A3A3A3] outline-none focus:border-[#C8A84E]"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">DOB</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#A3A3A3]">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#A3A3A3]">No customers found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors hover:bg-[#1A1A1A]"
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.type === "customer"
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#3B82F6]/10 text-[#3B82F6]"
                      }`}
                    >
                      {c.type === "customer" ? "Customer" : "Lead"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#F5F5F5]">{c.full_name || "\u2014"}</td>
                  <td className="px-4 py-3 text-[#A3A3A3]">{c.email}</td>
                  <td className="px-4 py-3 text-[#A3A3A3]">{formatDob(c.date_of_birth)}</td>
                  <td className="px-4 py-3 text-[#A3A3A3]">{calculateAge(c.date_of_birth)}</td>
                  <td className="px-4 py-3">
                    {c.type === "customer" ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.age_verified ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                        {c.age_verified ? "Yes" : "No"}
                      </span>
                    ) : (
                      <span className="text-[#A3A3A3]">{"\u2014"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5]">{c.order_count}</td>
                  <td className="px-4 py-3 text-[#F5F5F5]">${(c.total_spent / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#A3A3A3]">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order detail panel */}
      {selected && selected.orders.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">
            Orders for {selected.full_name || selected.email}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {selected.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-mono text-xs text-[#A3A3A3]">{o.id.slice(0, 8)}...</td>
                    <td className="py-3 text-[#F5F5F5]">${(o.total_cents / 100).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] || ""}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#A3A3A3]">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
