"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  images: string[];
  inventory_count: number;
  is_active: boolean;
  is_member_exclusive: boolean;
  metadata: Record<string, string>;
}

const emptyProduct: Product = {
  name: "",
  slug: "",
  description: "",
  category: "cigar",
  price_cents: 0,
  compare_at_price_cents: null,
  images: [],
  inventory_count: 0,
  is_active: true,
  is_member_exclusive: false,
  metadata: {},
};

const cigarTemplate = { origin: "", strength: "", ring_gauge: "", wrapper: "" };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface Props {
  product?: Product | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({ product, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Product>(emptyProduct);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [compareDisplay, setCompareDisplay] = useState("");
  const [metadataText, setMetadataText] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const isEdit = !!product?.id;

  useEffect(() => {
    if (product) {
      setForm(product);
      setPriceDisplay((product.price_cents / 100).toFixed(2));
      setCompareDisplay(
        product.compare_at_price_cents
          ? (product.compare_at_price_cents / 100).toFixed(2)
          : ""
      );
      setMetadataText(JSON.stringify(product.metadata || {}, null, 2));
    } else {
      setForm(emptyProduct);
      setPriceDisplay("");
      setCompareDisplay("");
      setMetadataText("{}");
    }
    setError("");
  }, [product, open]);

  useEffect(() => {
    if (!isEdit && form.category === "cigar") {
      try {
        const current = JSON.parse(metadataText);
        if (Object.keys(current).length === 0) {
          setMetadataText(JSON.stringify(cigarTemplate, null, 2));
        }
      } catch {}
    }
  }, [form.category, isEdit, metadataText]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let metadata = {};
    try {
      metadata = JSON.parse(metadataText);
    } catch {
      setError("Invalid JSON in metadata");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      price_cents: Math.round(parseFloat(priceDisplay || "0") * 100),
      compare_at_price_cents: compareDisplay
        ? Math.round(parseFloat(compareDisplay) * 100)
        : null,
      metadata,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  function addImage() {
    if (imageUrl.trim()) {
      setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#262626] bg-[#141414] p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-[#F5F5F5]">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: isEdit ? f.slug : slugify(name),
                }));
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-[#A3A3A3]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={inputClass}
              >
                <option value="cigar">Cigar</option>
                <option value="apparel">Apparel</option>
                <option value="accessory">Accessory</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#A3A3A3]">Inventory</label>
              <input
                type="number"
                min={0}
                value={form.inventory_count}
                onChange={(e) =>
                  setForm((f) => ({ ...f, inventory_count: parseInt(e.target.value) || 0 }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-[#A3A3A3]">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#A3A3A3]">Compare at ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={compareDisplay}
                onChange={(e) => setCompareDisplay(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-[#A3A3A3]">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="accent-[#C8A84E]"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-[#A3A3A3]">
              <input
                type="checkbox"
                checked={form.is_member_exclusive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_member_exclusive: e.target.checked }))
                }
                className="accent-[#C8A84E]"
              />
              Members Only
            </label>
          </div>

          {/* Images */}
          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Images</label>
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-lg bg-[#262626] px-3 text-sm text-white hover:bg-[#333]"
              >
                Add
              </button>
            </div>
            {form.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="flex items-center gap-1 rounded bg-[#262626] px-2 py-1 text-xs text-[#A3A3A3]">
                    <span className="max-w-[150px] truncate">{url}</span>
                    <button type="button" onClick={() => removeImage(i)} className="text-[#EF4444]">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">
              Metadata (JSON)
            </label>
            <textarea
              rows={4}
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          {error && <p className="text-sm text-[#EF4444]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
