"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import EventForm from "@/components/admin/EventForm";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  capacity: number | null;
  is_members_only: boolean;
  image_url: string | null;
  rsvp_count: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);

  async function fetchEvents() {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchEvents();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Events</h1>
        <button
          onClick={() => {
            setEditEvent(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#C8A84E] px-4 py-2 text-sm font-bold text-black hover:bg-[#E8D48B]"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626] text-left text-[#A3A3A3]">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">RSVPs</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#A3A3A3]">
                  Loading...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#A3A3A3]">
                  No events yet
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-[#F5F5F5]">
                    {e.title}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {new Date(e.event_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {e.location || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A3]">
                    {e.capacity || "Unlimited"}
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5]">{e.rsvp_count}</td>
                  <td className="px-4 py-3">
                    {e.is_members_only && (
                      <span className="rounded-full bg-[#C8A84E]/10 px-2 py-0.5 text-xs font-medium text-[#C8A84E]">
                        Members
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditEvent(e);
                          setFormOpen(true);
                        }}
                        className="text-xs text-[#C8A84E] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-xs text-[#EF4444] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EventForm
        event={editEvent}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchEvents}
      />
    </div>
  );
}
