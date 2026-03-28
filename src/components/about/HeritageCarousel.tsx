"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const slides = [
  "https://images.unsplash.com/photo-1765468290589-17d332ddbd4b?w=1920&q=80",
  "/images/ddg.jpeg",
  "https://images.unsplash.com/photo-1556337074-c1a5a6559f12?w=1920&q=80",
  "https://images.unsplash.com/photo-1682623764612-4e942b7c8119?w=1920&q=80",
];

const captions = [
  "Honor and Service",
  "Strength at Sea",
  "Roots in the Mountains",
  "Forged in Service",
];

export default function HeritageCarousel() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) {
        setActive((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative aspect-[3/4] w-full max-w-lg overflow-hidden rounded-xl border border-[#C8A84E]/20 sm:aspect-square"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {slides.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={captions[i]}
            fill
            className={`object-cover ${i === active ? "animate-ken-burns" : ""}`}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C8A84E]">
          {captions[active]}
        </p>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 right-6 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active ? "h-2 w-2 bg-[#C8A84E]" : "h-1.5 w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}