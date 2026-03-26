"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

interface Product {
  id: string;
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this product?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Products</h1>
        <button
          onClick={() => {
            setEditProduct(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#C8A84E] px-4 py-2 text-sm font-bold text-black hover:bg-[#E8D48B]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Exclusive</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#A3A3A3]">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#A3A3A3]">
                  No products yet
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-[#1A1A1A]">
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt="" fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#262626]">
                          &#9672;
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#F5F5F5]">
                    {p.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-[#262626] px-2 py-0.5 text-xs capitalize text-[#A3A3A3]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5]">
                    ${(p.price_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.inventory_count < 5
                          ? "font-medium text-[#F59E0B]"
                          : "text-[#A3A3A3]"
                      }
                    >
                      {p.inventory_count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_active
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-[#EF4444]/10 text-[#EF4444]"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_member_exclusive && (
                      <span className="rounded-full bg-[#C8A84E]/10 px-2 py-0.5 text-xs font-medium text-[#C8A84E]">
                        Members
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditProduct(p);
                          setFormOpen(true);
                        }}
                        className="text-xs text-[#C8A84E] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-[#EF4444] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductForm
        product={editProduct}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProducts}
      />
    </div>
  );
}
