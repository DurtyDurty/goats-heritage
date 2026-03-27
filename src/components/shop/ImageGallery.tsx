"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#0A0A0A]">
        {hasImages ? (
          <>
            <Image
              src={images[activeIndex]}
              alt="Product image"
              fill
              className="object-cover blur-sm brightness-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="Goats Heritage"
                width={200}
                height={100}
                className="h-24 w-auto opacity-90"
              />
              <span className="mt-4 rounded-full bg-[#C8A84E]/10 px-5 py-1.5 text-sm font-bold uppercase tracking-widest text-[#C8A84E]">
                Coming Soon
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Goats Heritage"
              width={200}
              height={100}
              className="h-24 w-auto opacity-60"
            />
            <span className="mt-4 rounded-full bg-[#C8A84E]/10 px-5 py-1.5 text-sm font-bold uppercase tracking-widest text-[#C8A84E]">
              Coming Soon
            </span>
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
              <Image src={src} alt="" fill className="object-cover blur-sm brightness-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
