import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return [
    { url: base, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/faq`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/sponsored`, changeFrequency: "weekly", priority: 0.4 },
  ];
}
