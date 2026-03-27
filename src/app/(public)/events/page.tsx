import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/events/EventCard";

export default async function EventsPage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  // Get RSVP counts for each event
  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event) => {
      const { count } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "confirmed");

      return { ...event, rsvp_count: count || 0 };
    })
  );

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden py-32">
        <img
          src="https://images.unsplash.com/photo-1574027057912-3e09a36dee58?w=1920&q=80"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover brightness-[0.15]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.06)_0%,_transparent_70%)]" />
        <div className="relative z-10 px-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#C8A84E]">
            The Experience
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight md:text-7xl">
            Lounge &amp; <span className="text-[#C8A84E]">Events</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#A3A3A3]">
            Exclusive cigar lounge experiences, tastings, and social events.
            Connect with the community and elevate your lifestyle.
          </p>
        </div>
      </section>

      {/* Events grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold md:text-4xl">
              Upcoming <span className="text-[#C8A84E]">Events</span>
            </h2>
            <div className="mt-3 h-px w-16 bg-[#C8A84E]/40" />
          </div>

          {eventsWithCounts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-[#A3A3A3]">
                No upcoming events at the moment. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventsWithCounts.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
