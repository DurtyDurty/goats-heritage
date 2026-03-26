"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ max }: { max: number }) {
  const [qty, setQty] = useState(1);

  return (
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
        max={max}
        value={qty}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 1 && val <= max) setQty(val);
        }}
        className="h-10 w-14 rounded-lg border border-[#262626] bg-transparent text-center text-sm text-[#F5F5F5] outline-none focus:border-[#C8A84E] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        onClick={() => setQty((q) => Math.min(max, q + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#262626] text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#F5F5F5]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
