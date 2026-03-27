"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";

interface Props {
  item: Omit<CartItem, "quantity">;
  maxQty: number;
  soldOut: boolean;
}

export default function AddToCartButton({ item, maxQty, soldOut }: Props) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);

  function handleAdd() {
    addToCart(item, qty);
    showToast(`${item.name} added to cart`);
    setQty(1);
  }

  if (soldOut) {
    return (
      <button
        disabled
        className="w-full rounded-lg bg-[#262626] py-3.5 text-sm font-bold text-[#A3A3A3]"
      >
        Sold Out
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-[#A3A3A3]">Quantity</label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1 && val <= maxQty) setQty(val);
            }}
            className="h-10 w-14 rounded-lg border border-[#262626] bg-transparent text-center text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="w-full rounded-lg bg-[#C8A84E] py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]"
      >
        Add to Cart
      </button>

      {maxQty <= 10 && (
        <p className="text-center text-xs text-[#F59E0B]">
          Only {maxQty} left in stock
        </p>
      )}
    </div>
  );
}
