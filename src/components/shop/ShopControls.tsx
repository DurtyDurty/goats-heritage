"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

const categories = [
  { value: "", label: "All" },
  { value: "cigar", label: "Cigars" },
  { value: "apparel", label: "Apparel" },
  { value: "accessory", label: "Accessories" },
  { value: "lifestyle", label: "Lifestyle" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low–High" },
  { value: "price_desc", label: "Price: High–Low" },
];

export default function ShopControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeSearch = searchParams.get("q") || "";

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => updateParams({ category: cat.value })}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? "bg-[#C8A84E] text-black"
                : "bg-[#1A1A1A] text-[#A3A3A3] hover:bg-[#262626] hover:text-[#F5F5F5]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={activeSearch}
            onChange={(e) => updateParams({ q: e.target.value })}
            className="w-full rounded-lg border border-[#262626] bg-[#1A1A1A] py-2.5 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#A3A3A3] outline-none transition-colors focus:border-[#C8A84E]"
          />
        </div>

        <select
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-lg border border-[#262626] bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F5F5F5] outline-none transition-colors focus:border-[#C8A84E]"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
