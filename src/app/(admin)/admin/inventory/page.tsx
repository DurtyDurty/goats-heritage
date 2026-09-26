"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, XCircle, DollarSign, TrendingUp, Search, Plus, X, Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  mcu: string | null;
  category: string;
  price_cents: number;
  cost_cents: number;
  inventory_count: number;
  reorder_point: number;
  weight_oz: number | null;
  supplier: string | null;
  location: string | null;
  is_active: boolean;
  images: string[];
}

interface Movement {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  previous_count: number;
  new_count: number;
  notes: string | null;
  created_at: string;
  products: { name: string };
}

interface ProductFinancials {
  id: string;
  name: string;
  category: string;
  stock: number;
  stockCost: number;
  stockRetail: number;
  unitsSold: number;
  revenue: number;
  cogs: number;
  profit: number;
}

interface Financials {
  shelf: { cost: number; retail: number };
  sold: { revenue: number; cogs: number; units: number };
  products: ProductFinancials[];
}

const emptyFinancials: Financials = {
  shelf: { cost: 0, retail: 0 },
  sold: { revenue: 0, cogs: 0, units: 0 },
  products: [],
};

// Validated against the #141414 surface for contrast and color-vision separation
const SOLD_COLOR = "#B08A32";
const SHELF_COLOR = "#3B82F6";

function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

const typeColors: Record<string, string> = {
  restock: "bg-[#22C55E]/10 text-[#22C55E]",
  sale: "bg-[#C8A84E]/10 text-[#C8A84E]",
  adjustment: "bg-[#3B82F6]/10 text-[#3B82F6]",
  return: "bg-[#F59E0B]/10 text-[#F59E0B]",
  damaged: "bg-[#EF4444]/10 text-[#EF4444]",
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalItems: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [financials, setFinancials] = useState<Financials>(emptyFinancials);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Edit modal
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editFields, setEditFields] = useState({
    sku: "", mcu: "", price: "", cost: "", weight_oz: "", reorder_point: "5", supplier: "", location: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Movement modal
  const [moveProduct, setMoveProduct] = useState<Product | null>(null);
  const [moveType, setMoveType] = useState("restock");
  const [moveQty, setMoveQty] = useState("");
  const [moveNotes, setMoveNotes] = useState("");
  const [moveSaving, setMoveSaving] = useState(false);

  async function fetchData() {
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    setProducts(data.products || []);
    setMovements(data.movements || []);
    setStats(data.stats || {});
    setFinancials(data.financials || emptyFinancials);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.mcu || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchesSearch && p.inventory_count <= (p.reorder_point || 5) && p.inventory_count > 0 && p.is_active;
    if (filter === "out") return matchesSearch && p.inventory_count === 0 && p.is_active;
    return matchesSearch;
  });

  function openEdit(p: Product) {
    setEditProduct(p);
    setEditError("");
    setEditFields({
      sku: p.sku || "",
      mcu: p.mcu || "",
      price: (p.price_cents / 100).toFixed(2),
      cost: p.cost_cents ? (p.cost_cents / 100).toFixed(2) : "",
      weight_oz: p.weight_oz ? String(p.weight_oz) : "",
      reorder_point: String(p.reorder_point || 5),
      supplier: p.supplier || "",
      location: p.location || "",
    });
  }

  async function saveEdit() {
    if (!editProduct) return;
    const priceCents = Math.round(parseFloat(editFields.price) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setEditError("Price must be greater than $0.00");
      return;
    }
    setEditError("");
    setEditSaving(true);
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editProduct.id,
        sku: editFields.sku || null,
        mcu: editFields.mcu || null,
        price_cents: priceCents,
        cost_cents: editFields.cost ? Math.round(parseFloat(editFields.cost) * 100) : 0,
        weight_oz: editFields.weight_oz ? parseFloat(editFields.weight_oz) : null,
        reorder_point: parseInt(editFields.reorder_point) || 5,
        supplier: editFields.supplier || null,
        location: editFields.location || null,
      }),
    });
    setEditSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error || "Failed to save changes");
      return;
    }
    setEditProduct(null);
    fetchData();
  }

  async function clearField(productId: string, field: string) {
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, [field]: null }),
    });
    fetchData();
  }

  async function submitMovement() {
    if (!moveProduct || !moveQty) return;
    setMoveSaving(true);
    await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: moveProduct.id,
        type: moveType,
        quantity: parseInt(moveQty),
        notes: moveNotes || null,
      }),
    });
    setMoveProduct(null);
    setMoveType("restock");
    setMoveQty("");
    setMoveNotes("");
    setMoveSaving(false);
    fetchData();
  }

  const inputClass = "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#C8A84E]";

  const shelfProfit = financials.shelf.retail - financials.shelf.cost;
  const soldProfit = financials.sold.revenue - financials.sold.cogs;
  const pipelineTotal = financials.sold.revenue + financials.shelf.retail;
  const soldShare = pipelineTotal > 0 ? (financials.sold.revenue / pipelineTotal) * 100 : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F5F5F5]">Inventory</h1>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <Package className="h-5 w-5 text-[#C8A84E]" />
          <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">{stats.totalItems}</p>
          <p className="text-xs text-[#A3A3A3]">Total Units</p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <DollarSign className="h-5 w-5 text-[#C8A84E]" />
          <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">${(stats.totalValue / 100).toFixed(2)}</p>
          <p className="text-xs text-[#A3A3A3]">Inventory Value</p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <TrendingUp className="h-5 w-5 text-[#22C55E]" />
          <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">${(financials.shelf.retail / 100).toFixed(2)}</p>
          <p className="text-xs text-[#A3A3A3]">Expected Value</p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <Package className="h-5 w-5 text-[#3B82F6]" />
          <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">{stats.totalProducts}</p>
          <p className="text-xs text-[#A3A3A3]">Total SKUs</p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          <p className="mt-2 text-2xl font-bold text-[#F59E0B]">{stats.lowStockCount}</p>
          <p className="text-xs text-[#A3A3A3]">Low Stock</p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <XCircle className="h-5 w-5 text-[#EF4444]" />
          <p className="mt-2 text-2xl font-bold text-[#EF4444]">{stats.outOfStockCount}</p>
          <p className="text-xs text-[#A3A3A3]">Out of Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search by name, SKU, or MCU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#262626] bg-[#1A1A1A] py-2.5 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#A3A3A3] outline-none focus:border-[#C8A84E]"
          />
        </div>
        <div className="flex gap-2">
          {[{ key: "all", label: "All" }, { key: "low", label: "Low Stock" }, { key: "out", label: "Out of Stock" }].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-[#C8A84E] text-black" : "bg-[#1A1A1A] text-[#A3A3A3] hover:bg-[#262626]"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">MCU</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Reorder</th>
              <th className="px-4 py-3 font-medium">Cost</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Margin</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr><td colSpan={11} className="py-12 text-center text-[#A3A3A3]">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="py-12 text-center text-[#A3A3A3]">No products found</td></tr>
            ) : (
              filtered.map((p) => {
                const margin = p.cost_cents > 0 ? ((p.price_cents - p.cost_cents) / p.price_cents * 100).toFixed(0) : "—";
                const stockColor = p.inventory_count === 0 ? "text-[#EF4444]" : p.inventory_count <= (p.reorder_point || 5) ? "text-[#F59E0B]" : "text-[#22C55E]";

                return (
                  <tr key={p.id} className="hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#F5F5F5]">{p.name}</p>
                      <p className="text-xs capitalize text-[#A3A3A3]">{p.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-[#A3A3A3]">{p.sku || "—"}</span>
                        {p.sku && (
                          <button onClick={() => clearField(p.id, "sku")} className="text-[#EF4444]/50 hover:text-[#EF4444]">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-[#A3A3A3]">{p.mcu || "—"}</span>
                        {p.mcu && (
                          <button onClick={() => clearField(p.id, "mcu")} className="text-[#EF4444]/50 hover:text-[#EF4444]">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-bold ${stockColor}`}>{p.inventory_count}</td>
                    <td className="px-4 py-3 text-[#A3A3A3]">{p.reorder_point}</td>
                    <td className="px-4 py-3 text-[#A3A3A3]">{p.cost_cents > 0 ? `$${(p.cost_cents / 100).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3 text-[#F5F5F5]">${(p.price_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={margin !== "—" && parseInt(margin) > 50 ? "text-[#22C55E]" : margin !== "—" ? "text-[#F59E0B]" : "text-[#A3A3A3]"}>
                        {margin === "—" ? "—" : `${margin}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#A3A3A3]">{p.supplier || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#A3A3A3]">{p.location || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex items-center gap-1 rounded bg-[#C8A84E]/10 px-2 py-1 text-xs text-[#C8A84E] hover:bg-[#C8A84E]/20"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => setMoveProduct(p)}
                          className="flex items-center gap-1 rounded bg-[#22C55E]/10 px-2 py-1 text-xs text-[#22C55E] hover:bg-[#22C55E]/20"
                        >
                          <Plus className="h-3 w-3" /> Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Margins & Value */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F5F5F5]">Margins &amp; Value</h2>
        <p className="mt-1 text-xs text-[#A3A3A3]">What is on the shelf today versus what has sold in paid orders, all time. Sold cost uses each product&apos;s current cost.</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* On the shelf */}
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SHELF_COLOR }} />
              <h3 className="text-sm font-semibold text-[#F5F5F5]">On the shelf</h3>
              <span className="ml-auto text-xs text-[#A3A3A3]">{stats.totalItems.toLocaleString()} units</span>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-[#A3A3A3]">Value at cost</dt><dd className="font-medium text-[#F5F5F5]">{money(financials.shelf.cost)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#A3A3A3]">Value at retail</dt><dd className="font-medium text-[#F5F5F5]">{money(financials.shelf.retail)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#A3A3A3]">Profit if it all sells</dt><dd className="font-medium text-[#F5F5F5]">{money(shelfProfit)}</dd></div>
              <div className="flex justify-between border-t border-[#262626] pt-2.5"><dt className="text-[#A3A3A3]">Blended margin</dt><dd className="text-lg font-bold text-[#F5F5F5]">{pct(shelfProfit, financials.shelf.retail)}</dd></div>
            </dl>
          </div>

          {/* Sold to date */}
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SOLD_COLOR }} />
              <h3 className="text-sm font-semibold text-[#F5F5F5]">Sold to date</h3>
              <span className="ml-auto text-xs text-[#A3A3A3]">{financials.sold.units.toLocaleString()} units</span>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-[#A3A3A3]">Revenue</dt><dd className="font-medium text-[#F5F5F5]">{money(financials.sold.revenue)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#A3A3A3]">Cost of goods sold</dt><dd className="font-medium text-[#F5F5F5]">{money(financials.sold.cogs)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#A3A3A3]">Gross profit</dt><dd className="font-medium text-[#F5F5F5]">{money(soldProfit)}</dd></div>
              <div className="flex justify-between border-t border-[#262626] pt-2.5"><dt className="text-[#A3A3A3]">Realized margin</dt><dd className="text-lg font-bold text-[#F5F5F5]">{pct(soldProfit, financials.sold.revenue)}</dd></div>
            </dl>
          </div>
        </div>

        {/* Sold vs still on shelf */}
        <div className="mt-4 rounded-xl border border-[#262626] bg-[#141414] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#F5F5F5]">Sell-through</h3>
            <p className="text-xs text-[#A3A3A3]">Revenue earned vs. retail value still in stock</p>
          </div>
          {pipelineTotal === 0 ? (
            <p className="mt-4 text-sm text-[#A3A3A3]">No stock or sales yet</p>
          ) : (
            <>
              <div className="mt-4 flex h-6 w-full gap-[2px] overflow-hidden rounded">
                {financials.sold.revenue > 0 && (
                  <div
                    className="h-full rounded-l"
                    style={{ width: `${soldShare}%`, backgroundColor: SOLD_COLOR }}
                    title={`Sold: ${money(financials.sold.revenue)} (${Math.round(soldShare)}%)`}
                  />
                )}
                {financials.shelf.retail > 0 && (
                  <div
                    className="h-full rounded-r"
                    style={{ width: `${100 - soldShare}%`, backgroundColor: SHELF_COLOR }}
                    title={`On shelf at retail: ${money(financials.shelf.retail)} (${Math.round(100 - soldShare)}%)`}
                  />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#A3A3A3]">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SOLD_COLOR }} />Sold {money(financials.sold.revenue)} · {Math.round(soldShare)}%</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SHELF_COLOR }} />On shelf {money(financials.shelf.retail)} · {Math.round(100 - soldShare)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Per-product breakdown */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Stock @ Cost</th>
                <th className="px-4 py-3 text-right font-medium">Stock @ Retail</th>
                <th className="px-4 py-3 text-right font-medium">Sold</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Profit</th>
                <th className="px-4 py-3 text-right font-medium">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-[#A3A3A3]">Loading...</td></tr>
              ) : financials.products.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-[#A3A3A3]">No stock or sales yet</td></tr>
              ) : (
                financials.products.map((p) => {
                  const marginPct = p.revenue > 0 ? Math.round((p.profit / p.revenue) * 100) : null;
                  return (
                    <tr key={p.id} className="hover:bg-[#1A1A1A]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#F5F5F5]">{p.name}</p>
                        <p className="text-xs capitalize text-[#A3A3A3]">{p.category}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-[#A3A3A3]">{p.stock}</td>
                      <td className="px-4 py-3 text-right text-[#A3A3A3]">{p.stockCost > 0 ? money(p.stockCost) : "—"}</td>
                      <td className="px-4 py-3 text-right text-[#F5F5F5]">{money(p.stockRetail)}</td>
                      <td className="px-4 py-3 text-right text-[#A3A3A3]">{p.unitsSold}</td>
                      <td className="px-4 py-3 text-right text-[#F5F5F5]">{p.revenue > 0 ? money(p.revenue) : "—"}</td>
                      <td className={`px-4 py-3 text-right ${p.revenue > 0 ? (p.profit >= 0 ? "text-[#22C55E]" : "text-[#EF4444]") : "text-[#A3A3A3]"}`}>
                        {p.revenue > 0 ? money(p.profit) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-[#A3A3A3]">{marginPct === null ? "—" : `${marginPct}%`}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F5F5F5]">Movement History</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Before → After</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {movements.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[#A3A3A3]">No movements yet</td></tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-[#F5F5F5]">{m.products?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[m.type] || ""}`}>{m.type}</span>
                    </td>
                    <td className={`px-4 py-3 font-mono ${m.quantity > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="px-4 py-3 text-[#A3A3A3]">{m.previous_count} → {m.new_count}</td>
                    <td className="px-4 py-3 text-xs text-[#A3A3A3]">{m.notes || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#A3A3A3]">
                      {new Date(m.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#262626] bg-[#141414] p-6">
            <button onClick={() => setEditProduct(null)} className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-[#F5F5F5]">Edit: {editProduct.name}</h2>
            <p className="mt-1 text-xs capitalize text-[#A3A3A3]">{editProduct.category} · Stock: {editProduct.inventory_count}</p>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[#A3A3A3]">SKU</label>
                  <input value={editFields.sku} onChange={(e) => setEditFields({ ...editFields, sku: e.target.value })} placeholder="e.g. GH-CIG-001" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#A3A3A3]">MCU</label>
                  <input value={editFields.mcu} onChange={(e) => setEditFields({ ...editFields, mcu: e.target.value })} placeholder="e.g. MCU-BG-50" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[#A3A3A3]">Price ($)</label>
                  <input type="number" step="0.01" min="0.01" value={editFields.price} onChange={(e) => setEditFields({ ...editFields, price: e.target.value })} placeholder="0.00" className={inputClass} />
                  <p className="mt-1 text-[10px] text-[#A3A3A3]">Shown to customers in the shop</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#A3A3A3]">Cost ($)</label>
                  <input type="number" step="0.01" value={editFields.cost} onChange={(e) => setEditFields({ ...editFields, cost: e.target.value })} placeholder="0.00" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[#A3A3A3]">Weight (oz)</label>
                  <input type="number" step="0.1" value={editFields.weight_oz} onChange={(e) => setEditFields({ ...editFields, weight_oz: e.target.value })} placeholder="0.0" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#A3A3A3]">Reorder Point</label>
                  <input type="number" value={editFields.reorder_point} onChange={(e) => setEditFields({ ...editFields, reorder_point: e.target.value })} className={inputClass} />
                  <p className="mt-1 text-[10px] text-[#A3A3A3]">Alert when stock falls below this</p>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Supplier</label>
                <input value={editFields.supplier} onChange={(e) => setEditFields({ ...editFields, supplier: e.target.value })} placeholder="Supplier name" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Warehouse Location</label>
                <input value={editFields.location} onChange={(e) => setEditFields({ ...editFields, location: e.target.value })} placeholder="e.g. Shelf A-3" className={inputClass} />
              </div>
            </div>

            {editError && <p className="mt-3 text-sm text-[#EF4444]">{editError}</p>}

            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditProduct(null)} className="flex-1 rounded-lg border border-[#262626] py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1A1A1A]">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={editSaving} className="flex-1 rounded-lg bg-[#C8A84E] py-2.5 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50">
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {moveProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-6">
            <h2 className="text-lg font-bold text-[#F5F5F5]">Adjust Stock: {moveProduct.name}</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">Current stock: <span className="font-bold text-[#F5F5F5]">{moveProduct.inventory_count}</span></p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Movement Type</label>
                <select value={moveType} onChange={(e) => setMoveType(e.target.value)} className={inputClass}>
                  <option value="restock">Restock (+)</option>
                  <option value="return">Return (+)</option>
                  <option value="sale">Sale (−)</option>
                  <option value="damaged">Damaged (−)</option>
                  <option value="adjustment">Adjustment (+/−)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Quantity</label>
                <input type="number" min="1" value={moveQty} onChange={(e) => setMoveQty(e.target.value)} placeholder="Enter quantity" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Notes (optional)</label>
                <input spellCheck={true} value={moveNotes} onChange={(e) => setMoveNotes(e.target.value)} placeholder="Reason for adjustment..." className={inputClass} />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setMoveProduct(null)} className="flex-1 rounded-lg border border-[#262626] py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1A1A1A]">Cancel</button>
              <button onClick={submitMovement} disabled={moveSaving || !moveQty} className="flex-1 rounded-lg bg-[#C8A84E] py-2.5 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50">
                {moveSaving ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
