"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const slides = [
  "https://images.unsplash.com/photo-1592862080230-fe0a3b380f21?w=1920&q=80",
  "https://images.unsplash.com/photo-1634922951968-11ca107aa6e3?w=1920&q=80",
  "https://images.unsplash.com/photo-1553433342-956cde1d7646?w=1920&q=80",
  "https://images.unsplash.com/photo-1524335672824-627a98049dfa?w=1920&q=80",
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) {
        setActive((prev) => (prev + 1) % slides.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
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
            sizes="100vw"
            className={`object-cover brightness-[0.3] ${
              i === active ? "animate-ken-burns" : ""
            }`}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Gold radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.06)_0%,_transparent_70%)]" />

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
