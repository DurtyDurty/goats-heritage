"use client";

import { useState } from "react";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Contact | Goats Heritage\u2122",
//   description: "Get in touch with Goats Heritage. We'd love to hear from you.",
// };

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-[#666] outline-none transition-colors focus:border-[#C8A84E] focus:ring-1 focus:ring-[#C8A84E]/30";

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Get in <span className="text-[#C8A84E]">Touch</span>
          </h1>
          <p className="mt-4 text-lg text-[#A3A3A3]">
            Have a question? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Side info */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
                  Email Us
                </h3>
                <a
                  href="mailto:contact@goatsheritage.com"
                  className="mt-2 block text-[#C8A84E] transition-colors hover:text-[#E8D48B]"
                >
                  contact@goatsheritage.com
                </a>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
                  Response Time
                </h3>
                <p className="mt-2 text-sm text-[#A3A3A3]">
                  We typically respond within 24 hours.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#262626] bg-[#141414] p-8">
                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C8A84E]/10">
                      <svg
                        className="h-8 w-8 text-[#C8A84E]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Message sent!
                    </h3>
                    <p className="mt-2 text-[#A3A3A3]">
                      We&apos;ll get back to you soon.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-6 text-sm text-[#C8A84E] transition-colors hover:text-[#E8D48B]"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium text-[#A3A3A3]"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-[#A3A3A3]"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-1.5 block text-sm font-medium text-[#A3A3A3]"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        placeholder="What's this about?"
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-1.5 block text-sm font-medium text-[#A3A3A3]"
                      >
                        Message
                      </label>
                      <textarea spellCheck={true}
                        id="message"
                        rows={4}
                        required
                        placeholder="Your message..."
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        className={inputClass + " resize-none"}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-[#C8A84E] px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition-all hover:bg-[#E8D48B] disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
