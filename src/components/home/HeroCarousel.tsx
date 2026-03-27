"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  "https://images.unsplash.com/photo-1478445214834-5e36de9923d7?w=1920&q=80",
  "https://images.unsplash.com/photo-1553433342-956cde1d7646?w=1920&q=80",
  "https://images.unsplash.com/photo-1709526494925-a2780a094838?w=1920&q=80",
  "https://images.unsplash.com/photo-1524335672824-627a98049dfa?w=1920&q=80",
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(advance, 6000);
    return () => clearInterval(timer);
  }, [paused, advance]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            className={`object-cover brightness-[0.15] ${
              i === active ? "animate-ken-burns" : ""
            }`}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Gold radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.08)_0%,_transparent_70%)]" />

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? "h-2.5 w-2.5 bg-[#C8A84E]"
                : "h-2 w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
