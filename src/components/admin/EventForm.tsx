"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EventData {
  id?: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  capacity: number | null;
  is_members_only: boolean;
  image_url: string;
}

const emptyEvent: EventData = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  capacity: null,
  is_members_only: false,
  image_url: "",
};

interface Props {
  event?: EventData | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventForm({ event, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState<EventData>(emptyEvent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!event?.id;

  useEffect(() => {
    if (event) {
      setForm({
        ...event,
        event_date: event.event_date
          ? new Date(event.event_date).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setForm(emptyEvent);
    }
    setError("");
  }, [event, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      event_date: new Date(form.event_date).toISOString(),
      capacity: form.capacity || null,
      image_url: form.image_url || null,
    };

    try {
      const res = await fetch("/api/admin/events", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#C8A84E]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#262626] bg-[#141414] p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-[#F5F5F5]">
          {isEdit ? "Edit Event" : "Create Event"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Description</label>
            <textarea spellCheck={true}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-[#A3A3A3]">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={form.event_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, event_date: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#A3A3A3]">
                Capacity
              </label>
              <input
                type="number"
                min={0}
                value={form.capacity ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capacity: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                placeholder="Unlimited"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Location</label>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#A3A3A3]">Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, image_url: e.target.value }))
              }
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#A3A3A3]">
            <input
              type="checkbox"
              checked={form.is_members_only}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_members_only: e.target.checked }))
              }
              className="accent-[#C8A84E]"
            />
            Members Only
          </label>

          {error && <p className="text-sm text-[#EF4444]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#C8A84E] py-3 font-bold text-black hover:bg-[#E8D48B] disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
