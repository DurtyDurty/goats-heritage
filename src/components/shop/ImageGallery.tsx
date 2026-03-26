"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1A1A1A]">
        {hasImages ? (
          <Image
            src={images[activeIndex]}
            alt="Product image"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#262626]">
            <span className="text-6xl">&#9672;</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-colors ${
                i === activeIndex
                  ? "border-[#C8A84E]"
                  : "border-[#262626] hover:border-[#A3A3A3]"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
