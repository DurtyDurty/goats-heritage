"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  event_link: string | null;
  is_members_only: boolean;
}

export default function ExperienceSlideshow({ events }: { events: Event[] }) {
  const totalSlides = 1 + events.length;
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      if (!paused.current) {
        setActive((prev) => (prev + 1) % totalSlides);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  function next() {
    setActive((prev) => (prev + 1) % totalSlides);
  }

  function prev() {
    setActive((prev) => (prev - 1 + totalSlides) % totalSlides);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* Slide 0: Experience / Social */}
      <div className={`transition-opacity duration-700 ${active === 0 ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            The <span className="text-[#C8A84E]">Experience</span>
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-[#C8A84E]/40" />
          <p className="mt-4 text-[#A3A3A3]">
            Tune in on our social media for upcoming events.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/goatsheritage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#262626] text-[#A3A3A3] transition-all hover:border-[#C8A84E] hover:text-[#C8A84E] hover:shadow-[0_0_15px_rgba(200,168,78,0.15)]"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Event slides */}
      {events.map((event, i) => {
        const slideIndex = i + 1;
        const dateObj = new Date(event.event_date);
        const formattedDate = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

        return (
          <div
            key={event.id}
            className={`transition-opacity duration-700 ${active === slideIndex ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
          >
            <div className="mx-auto max-w-2xl">
              <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]">
                {event.image_url && (
                  <div className="relative">
                    <img src={event.image_url} alt={event.title} className="w-full" />
                    {event.is_members_only && (
                      <span className="absolute left-3 top-3 rounded-md bg-[#C8A84E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">Members Only</span>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <p className="text-sm uppercase tracking-wider text-[#C8A84E]">{formattedDate} · {formattedTime}</p>
                  <h3 className="mt-2 text-xl font-bold text-[#F5F5F5]">{event.title}</h3>
                  {event.location && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-[#A3A3A3]">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </div>
                  )}
                  {event.description && (
                    <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3] line-clamp-3">{event.description}</p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <Link href={`/events/${event.id}`} className="rounded-lg bg-[#C8A84E] px-6 py-2 text-sm font-bold text-black transition-colors hover:bg-[#E8D48B]">
                      View Event
                    </Link>
                    {event.event_link && (
                      <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-[#262626] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:border-[#C8A84E] hover:text-[#C8A84E]">
                        <ExternalLink className="h-3.5 w-3.5" /> Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      {totalSlides > 1 && (
        <>
          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-[#141414] p-2 text-[#A3A3A3] shadow-lg transition-colors hover:text-[#C8A84E]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-[#141414] p-2 text-[#A3A3A3] shadow-lg transition-colors hover:text-[#C8A84E]">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${i === active ? "h-2.5 w-2.5 bg-[#C8A84E]" : "h-2 w-2 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
