import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RsvpButton from "@/components/events/RsvpButton";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, description, image_url")
    .eq("id", params.id)
    .single();

  if (!event) {
    return { title: "Event Not Found | Goats Heritage" };
  }

  return {
    title: `${event.title} | Goats Heritage`,
    description: event.description || `Join us for ${event.title} at Goats Heritage.`,
    openGraph: {
      title: event.title,
      description: event.description || `Join us for ${event.title} at Goats Heritage.`,
      ...(event.image_url ? { images: [{ url: event.image_url }] } : {}),
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  // RSVP count
  const { count: rsvpCount } = await supabase
    .from("event_rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("status", "confirmed");

  const confirmedCount = rsvpCount || 0;
  const spotsRemaining =
    event.capacity !== null ? event.capacity - confirmedCount : null;

  // Confirmed attendees with profiles
  const { data: attendees } = await supabase
    .from("event_rsvps")
    .select("user_id, profiles(full_name, avatar_url)")
    .eq("event_id", event.id)
    .eq("status", "confirmed")
    .limit(8);

  const dateObj = new Date(event.event_date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      {/* Banner */}
      <div className="relative h-64 overflow-hidden bg-[#1A1A1A] sm:h-80 md:h-96">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#262626]">
            <span className="text-8xl">&#9672;</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />

        {event.is_members_only && (
          <span className="absolute left-6 top-6 rounded-md bg-[#C8A84E] px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
            Members Only
          </span>
        )}
      </div>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Left — details */}
            <div>
              <h1 className="text-3xl font-bold text-[#F5F5F5] md:text-4xl">
                {event.title}
              </h1>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-[#A3A3A3]">
                  <Calendar className="h-5 w-5 text-[#C8A84E]" />
                  <span>
                    {formattedDate} at {formattedTime}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3 text-[#A3A3A3]">
                    <MapPin className="h-5 w-5 text-[#C8A84E]" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.event_link && (
                  <a
                    href={event.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#C8A84E] transition-colors hover:text-[#E8D48B]"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>View Event Details</span>
                  </a>
                )}

                <div className="flex items-center gap-3 text-[#A3A3A3]">
                  <Users className="h-5 w-5 text-[#C8A84E]" />
                  <span>
                    {confirmedCount} attending
                    {event.capacity && ` · ${event.capacity} capacity`}
                  </span>
                </div>
              </div>

              {/* Location placeholder */}
              {event.location && (
                <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-[#262626] bg-[#1A1A1A]">
                  <div className="text-center text-sm text-[#A3A3A3]">
                    <MapPin className="mx-auto h-6 w-6 text-[#262626]" />
                    <p className="mt-2">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-[#F5F5F5]">
                    About This Event
                  </h2>
                  <p className="mt-3 leading-relaxed text-[#A3A3A3]">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Attendees */}
              {attendees && attendees.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-[#F5F5F5]">
                    Attending
                  </h2>
                  <div className="mt-3 flex -space-x-2">
                    {attendees.map((a: any, i: number) => (
                      <div
                        key={i}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-[#262626] text-xs font-medium text-[#A3A3A3]"
                        title={a.profiles?.full_name || "Member"}
                      >
                        {a.profiles?.avatar_url ? (
                          <Image
                            src={a.profiles.avatar_url}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          (a.profiles?.full_name?.[0] || "?").toUpperCase()
                        )}
                      </div>
                    ))}
                    {confirmedCount > 8 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-[#C8A84E]/10 text-xs font-medium text-[#C8A84E]">
                        +{confirmedCount - 8}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right — RSVP card */}
            <div>
              <div className="sticky top-24 rounded-xl border border-[#262626] bg-[#141414] p-6">
                <h3 className="text-lg font-semibold text-[#F5F5F5]">
                  Reserve Your Spot
                </h3>

                {event.capacity && (
                  <div className="mt-3 text-sm">
                    {spotsRemaining !== null && spotsRemaining > 0 ? (
                      <span className="text-[#A3A3A3]">
                        {spotsRemaining} of {event.capacity} spots remaining
                      </span>
                    ) : spotsRemaining !== null ? (
                      <span className="text-[#EF4444]">Event is full</span>
                    ) : null}
                  </div>
                )}

                <div className="mt-4">
                  <RsvpButton
                    eventId={event.id}
                    isMembersOnly={event.is_members_only}
                    spotsRemaining={spotsRemaining}
                    initialRsvpStatus={null}
                  />
                </div>

                <p className="mt-4 text-center text-xs text-[#A3A3A3]">
                  Free event · Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
