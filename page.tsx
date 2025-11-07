"use client";
import { useState } from "react";
import AdSlot from "@/components/AdSlot";
import Button from "@/components/Button";
import Image from "next/image";
import Progress from "@/components/Progress";

type ExtractResult = {
  title?: string;
  cover?: string;
  variants: {
    url: string;
    width?: number;
    height?: number;
    bitrate?: number;
    mime?: string;
  }[];
};

import { AFFILIATES } from "@/config/affiliates";

export default function Home() {
  const [pinUrl, setPinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractResult | null>(null);
  const [eta, setEta] = useState(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);
    const url = pinUrl.trim();
    if (!url) return;
    setLoading(true);
    setEta(10);
    let timer: any = null;
    timer = setInterval(() => {
      setEta((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as ExtractResult;
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to extract video");
    } finally {
      if (timer) clearInterval(timer);
      setLoading(false);
      setEta(0);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[blueviolet]">
Pinterest Video Downloader - {process.env.NEXT_PUBLIC_BRAND_NICK || "Website"}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Paste a Pinterest Pin URL to get direct MP4 download links.
        </p>
      </header>

      <section className="mt-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            placeholder="https://www.pinterest.com/pin/..."
            value={pinUrl}
            onChange={(e) => setPinUrl(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-900 dark:border-zinc-800"
          />
          <Button disabled={loading} />
        </form>
        {loading ? (
          <div className="mt-3 space-y-1">
            <Progress active inline label="Generating video links" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Preparing links… {eta > 0 ? `~${eta}s` : ""}</p>
          </div>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      {/* Monetization: top ad slot */}
      <div className="mt-8">
        {process.env.NEXT_PUBLIC_ADSENSE_SLOT ? (
          // Replace this with your real slot ID at build time via env
          // eslint-disable-next-line @next/next/no-sync-scripts
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT as string} />
        ) : (
          <div className="w-full rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
            Ad Slot (set NEXT_PUBLIC_ADSENSE_SLOT to enable)
          </div>
        )}
      </div>

      {data ? (
        <section className="mt-8 space-y-4">
          {data.cover ? (
            <div className="relative h-72 w-full overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
              <Image
                src={data.cover}
                alt={data.title || "Pin cover"}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
          <h2 className="text-xl font-semibold">Available Downloads</h2>
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {data.variants.map((v, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="text-sm">
                  <p className="font-medium">{v.mime || "video/mp4"}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {v.width && v.height ? `${v.width}x${v.height}` : "Unknown"}
                    {v.bitrate ? ` • ${Math.round(v.bitrate / 1000)} kbps` : ""}
                  </p>
                </div>
                <a
                  href={`/api/download?src=${encodeURIComponent(v.url)}`}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Monetization: affiliate links section */}
      <section className="mt-12 space-y-3">
        <h3 className="text-lg font-semibold">You may also like</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AFFILIATES.map((item) => (
            <a
              key={item.title}
              className="rounded-md border border-zinc-200 p-4 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              href={item.href}
              rel="sponsored noopener"
              target="_blank"
            >
              {item.title}
            </a>
          ))}
        </div>
      </section>
      <footer className="mt-12 text-center text-xs text-zinc-500">
        This tool is for personal use only. Respect creators’ rights and Pinterest’s Terms of Service.
        <br />
        Contact: <a className="underline" href="mailto:vk409633@gmail.com">vk409633@gmail.com</a>
      </footer>
    </main>
  );
}
