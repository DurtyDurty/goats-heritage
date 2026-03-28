"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, XCircle, DollarSign, Search, Plus, Minus } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any>({});
  const [movementModal, setMovementModal] = useState<{ product: Product } | null>(null);
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

  async function saveEdit(id: string) {
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editFields }),
    });
    setEditingId(null);
    setEditFields({});
    fetchData();
  }

  async function submitMovement() {
    if (!movementModal || !moveQty) return;
    setMoveSaving(true);
    await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: movementModal.product.id,
        type: moveType,
        quantity: parseInt(moveQty),
        notes: moveNotes || null,
      }),
    });
    setMovementModal(null);
    setMoveType("restock");
    setMoveQty("");
    setMoveNotes("");
    setMoveSaving(false);
    fetchData();
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditFields({
      sku: p.sku || "",
      mcu: p.mcu || "",
      cost_cents: p.cost_cents || 0,
      weight_oz: p.weight_oz || "",
      reorder_point: p.reorder_point || 5,
      supplier: p.supplier || "",
      location: p.location || "",
    });
  }

  const inputClass = "rounded border border-[#262626] bg-[#0A0A0A] px-2 py-1 text-xs text-white outline-none focus:border-[#C8A84E]";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F5F5F5]">Inventory</h1>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <Package className="h-5 w-5 text-[#C8A84E]" />
          <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">{stats.totalItems}</p>
          <p className="text-xs text-[#A3A3A3]">Total Units</p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <DollarSign className="h-5 w-5 text-[#C8A84E]" />
          <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">${(stats.totalValue / 100).toFixed(2)}</p>
          <p className="text-xs text-[#A3A3A3]">Inventory Value (Cost)</p>
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
          {[
            { key: "all", label: "All" },
            { key: "low", label: "Low Stock" },
            { key: "out", label: "Out of Stock" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-[#C8A84E] text-black"
                  : "bg-[#1A1A1A] text-[#A3A3A3] hover:bg-[#262626]"
              }`}
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
              <th className="px-4 py-3 font-medium">Reorder At</th>
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
                const isEditing = editingId === p.id;
                const margin = p.cost_cents > 0 ? ((p.price_cents - p.cost_cents) / p.price_cents * 100).toFixed(0) : "—";
                const stockStatus = p.inventory_count === 0
                  ? "text-[#EF4444]"
                  : p.inventory_count <= (p.reorder_point || 5)
                  ? "text-[#F59E0B]"
                  : "text-[#22C55E]";

                return (
                  <tr key={p.id} className="hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#F5F5F5]">{p.name}</p>
                      <p className="text-xs capitalize text-[#A3A3A3]">{p.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input value={editFields.sku} onChange={(e) => setEditFields({ ...editFields, sku: e.target.value })} className={`${inputClass} w-24`} />
                      ) : (
                        <span className="font-mono text-xs text-[#A3A3A3]">{p.sku || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input value={editFields.mcu} onChange={(e) => setEditFields({ ...editFields, mcu: e.target.value })} className={`${inputClass} w-24`} />
                      ) : (
                        <span className="font-mono text-xs text-[#A3A3A3]">{p.mcu || "—"}</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 font-bold ${stockStatus}`}>{p.inventory_count}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" value={editFields.reorder_point} onChange={(e) => setEditFields({ ...editFields, reorder_point: parseInt(e.target.value) || 0 })} className={`${inputClass} w-16`} />
                      ) : (
                        <span className="text-[#A3A3A3]">{p.reorder_point}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" step="0.01" value={(editFields.cost_cents / 100).toFixed(2)} onChange={(e) => setEditFields({ ...editFields, cost_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} className={`${inputClass} w-20`} />
                      ) : (
                        <span className="text-[#A3A3A3]">${(p.cost_cents / 100).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#F5F5F5]">${(p.price_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`${margin !== "—" && parseInt(margin) > 50 ? "text-[#22C55E]" : margin !== "—" ? "text-[#F59E0B]" : "text-[#A3A3A3]"}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input value={editFields.supplier} onChange={(e) => setEditFields({ ...editFields, supplier: e.target.value })} className={`${inputClass} w-24`} />
                      ) : (
                        <span className="text-xs text-[#A3A3A3]">{p.supplier || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input value={editFields.location} onChange={(e) => setEditFields({ ...editFields, location: e.target.value })} className={`${inputClass} w-24`} />
                      ) : (
                        <span className="text-xs text-[#A3A3A3]">{p.location || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(p.id)} className="text-xs text-[#22C55E] hover:underline">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-[#A3A3A3] hover:underline">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)} className="text-xs text-[#C8A84E] hover:underline">Edit</button>
                            <button onClick={() => setMovementModal({ product: p })} className="flex items-center gap-1 rounded bg-[#22C55E]/10 px-2 py-1 text-xs text-[#22C55E] hover:bg-[#22C55E]/20">
                              <Plus className="h-3 w-3" /> Adjust
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[m.type] || ""}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono ${m.quantity > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="px-4 py-3 text-[#A3A3A3]">
                      {m.previous_count} → {m.new_count}
                    </td>
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

      {/* Movement Modal */}
      {movementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-6">
            <h2 className="text-lg font-bold text-[#F5F5F5]">
              Adjust Stock: {movementModal.product.name}
            </h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Current stock: <span className="font-bold text-[#F5F5F5]">{movementModal.product.inventory_count}</span>
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Movement Type</label>
                <select
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]"
                >
                  <option value="restock">Restock (+)</option>
                  <option value="return">Return (+)</option>
                  <option value="sale">Sale (−)</option>
                  <option value="damaged">Damaged (−)</option>
                  <option value="adjustment">Adjustment (+/−)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={moveQty}
                  onChange={(e) => setMoveQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A3A3A3]">Notes (optional)</label>
                <input
                  value={moveNotes}
                  onChange={(e) => setMoveNotes(e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMovementModal(null)}
                className="flex-1 rounded-lg border border-[#262626] py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                onClick={submitMovement}
                disabled={moveSaving || !moveQty}
                className="flex-1 rounded-lg bg-[#C8A84E] py-2.5 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
              >
                {moveSaving ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
