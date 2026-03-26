import Link from "next/link";
import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import RsvpButton from "./RsvpButton";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    location: string | null;
    capacity: number | null;
    is_members_only: boolean;
    image_url: string | null;
    rsvp_count: number;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const spotsRemaining =
    event.capacity !== null ? event.capacity - event.rsvp_count : null;
  const soldOut = spotsRemaining !== null && spotsRemaining <= 0;

  const dateObj = new Date(event.event_date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#262626] bg-[#141414] transition-all duration-300 hover:border-[#C8A84E]">
      {/* Image */}
      <Link
        href={`/events/${event.id}`}
        className="relative aspect-video overflow-hidden bg-[#1A1A1A]"
      >
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#262626]">
            <span className="text-4xl">&#9672;</span>
          </div>
        )}

        {event.is_members_only && (
          <span className="absolute left-3 top-3 rounded-md bg-[#C8A84E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            Members Only
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm uppercase tracking-wider text-[#C8A84E]">
          {formattedDate} &middot; {formattedTime}
        </p>

        <Link href={`/events/${event.id}`}>
          <h3 className="mt-2 text-xl font-bold text-[#F5F5F5] transition-colors hover:text-[#C8A84E]">
            {event.title}
          </h3>
        </Link>

        {event.location && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-[#A3A3A3]">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </div>
        )}

        {event.capacity !== null && (
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-[#A3A3A3]" />
            {soldOut ? (
              <span className="text-[#EF4444]">Sold Out</span>
            ) : (
              <span className="text-[#A3A3A3]">
                {spotsRemaining} spots remaining
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="mt-4">
          <RsvpButton
            eventId={event.id}
            isMembersOnly={event.is_members_only}
            spotsRemaining={spotsRemaining}
            initialRsvpStatus={null}
          />
        </div>
      </div>
    </div>
  );
}
