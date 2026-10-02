"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div>
      {/* Main image */}
      <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-xl bg-[#0A0A0A]">
        {hasImages ? (
          <Image
            src={images[activeIndex]}
            alt="Product image"
            fill
            sizes="(max-width: 1024px) 100vw, 448px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Goats Heritage"
              width={200}
              height={100}
              className="h-24 w-auto opacity-80"
            />
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
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
