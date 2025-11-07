"use client";
import { useEffect, useState } from "react";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export default function ContactPage() {
  const [ts, setTs] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" }); // website = honeypot
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setTs(Date.now()), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      setStatus({ ok: false, message: "Please complete all fields correctly." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, ts }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus({ ok: true, message: "Thanks! Your message has been sent." });
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message || "Failed to send message." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold">Contact</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Fill out the form below and we’ll get back to you. You can also email directly at
        {" "}
        <a className="underline" href="mailto:vk409633@gmail.com">vk409633@gmail.com</a>.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="hidden"
        />

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-900 dark:border-zinc-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-900 dark:border-zinc-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-900 dark:border-zinc-800"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center rounded-md bg-[blueviolet] px-6 text-base font-medium text-white shadow-sm hover:bg-[#2563eb] disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>

        {status ? (
          <p className={`text-sm ${status.ok ? "text-emerald-600" : "text-red-600"}`}>
            {status.message}
          </p>
        ) : null}
      </form>
    </main>
  );
}
