"use client";

import { useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";

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
  is_preorder?: boolean;
  preorder_note?: string | null;
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
  is_preorder: false,
  preorder_note: "",
  metadata: {},
};

const cigarTemplate = { origin: "", strength: "", ring_gauge: "", wrapper: "" };

/** Longest side of an uploaded photo, in pixels. Big enough for zoom, small enough to load fast. */
const MAX_IMAGE_EDGE = 2000;

/**
 * Resizes a photo in the browser and re-encodes it (WebP, or JPEG where the browser
 * can't make WebP) so phone photos fit under the server's upload limit.
 * GIFs are sent as they are to keep any animation.
 */
async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`"${file.name}" could not be read. Use a JPG, PNG or WebP image.`);
  }
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (!jpeg) throw new Error(`"${file.name}" could not be processed.`);
  return jpeg;
}

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
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");

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
    setImageError("");
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

  // The first image is the one shown in the shop grid
  function makeMain(index: number) {
    setForm((f) => ({ ...f, images: [f.images[index], ...f.images.filter((_, i) => i !== index)] }));
  }

  // Dropped or browsed files: shrink, upload to storage, then add to the product
  async function uploadFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImageError(images.length === 0 && files.length > 0 ? "Only image files can be added." : "");

    for (const file of images) {
      setUploading((n) => n + 1);
      try {
        const blob = await shrinkImage(file);
        const body = new FormData();
        body.append("file", new File([blob], file.name, { type: blob.type }));
        body.append("folder", "products");
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error || `"${file.name}" failed to upload.`);
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      } catch (err: any) {
        setImageError(err.message || `"${file.name}" failed to upload.`);
      }
      setUploading((n) => n - 1);
    }
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
            <textarea spellCheck={true}
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
                <option value="coffee">Coffee</option>
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

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Status</label>
            <select
              value={!form.is_active ? "hidden" : form.is_preorder ? "presale" : "live"}
              onChange={(e) => {
                const status = e.target.value;
                setForm((f) => ({ ...f, is_active: status !== "hidden", is_preorder: status === "presale" }));
              }}
              className={inputClass}
            >
              <option value="live">Live: on the store, sold from stock</option>
              <option value="presale">Pre-sale: on the store, customers can buy before stock arrives</option>
              <option value="hidden">Hidden: not on the store</option>
            </select>
            {form.is_active && form.is_preorder && (
              <div className="mt-3">
                <label className="mb-1 block text-xs text-[#A3A3A3]">Pre-sale message to customers (optional)</label>
                <input
                  value={form.preorder_note || ""}
                  onChange={(e) => setForm((f) => ({ ...f, preorder_note: e.target.value }))}
                  placeholder="Ships the week of November 16."
                  maxLength={160}
                  className={inputClass}
                />
              </div>
            )}
          </div>

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

          {/* Images */}
          <div>
            <span className="mb-1 block text-xs text-[#A3A3A3]">Images</span>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                // Ignore leaving into the zone's own icon and text
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                uploadFiles(e.dataTransfer.files);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors focus-within:border-[#C8A84E] ${
                dragging ? "border-[#C8A84E] bg-[#C8A84E]/5" : "border-[#262626] hover:border-[#C8A84E]/60"
              }`}
            >
              <ImagePlus className="h-6 w-6 text-[#C8A84E]" />
              <span className="text-[#F5F5F5]">
                {uploading > 0 ? `Uploading ${uploading} image${uploading > 1 ? "s" : ""}...` : "Drag photos here or click to browse"}
              </span>
              <span className="text-xs text-[#A3A3A3]">JPG, PNG, WebP or GIF. Large photos are resized automatically.</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files) uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {imageError && <p className="mt-2 text-xs text-[#EF4444]">{imageError}</p>}

            {form.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.images.map((url, i) => (
                  <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-[#262626] bg-[#0A0A0A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute left-1 top-1 rounded bg-[#C8A84E] px-1.5 py-0.5 text-[10px] font-bold text-black">Main</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeMain(i)}
                        className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100 focus:opacity-100"
                      >
                        Make main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-[#EF4444]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste an image URL"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addImage}
                disabled={!imageUrl.trim()}
                className="whitespace-nowrap rounded-lg bg-[#262626] px-3 text-sm text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#262626]"
              >
                Add URL
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">
              Metadata (JSON)
            </label>
            <textarea spellCheck={true}
              rows={4}
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          {error && <p className="text-sm text-[#EF4444]">{error}</p>}

          <button
            type="submit"
            disabled={loading || uploading > 0}
            className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {loading ? "Saving..." : uploading > 0 ? "Uploading images..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
