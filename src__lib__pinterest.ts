import * as cheerio from "cheerio";

export type VideoVariant = {
  url: string;
  width?: number;
  height?: number;
  bitrate?: number;
  mime?: string;
};

export async function extractFromPinterest(pinUrl: string) {
  const headers = {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  } as const;

  const res = await fetch(pinUrl, { headers, redirect: "follow" });
  if (!res.ok) throw new Error(`Failed to fetch Pin (${res.status})`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('meta[property="og:title"]').attr("content") || $("title").text() || undefined;
  const cover = $('meta[property="og:image"]').attr("content") || undefined;

  // 1) Try OpenGraph video tags
  const ogVideo = $('meta[property="og:video"], meta[property="og:video:secure_url"]').attr("content");
  const ogType = $('meta[property="og:video:type"]').attr("content");
  const ogWidth = Number($('meta[property="og:video:width"]').attr("content") || "0");
  const ogHeight = Number($('meta[property="og:video:height"]').attr("content") || "0");

  const variants: VideoVariant[] = [];
  if (ogVideo) {
    variants.push({ url: ogVideo, width: ogWidth || undefined, height: ogHeight || undefined, mime: ogType });
  }

  // 2) Try JSON-LD
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      const asArray = Array.isArray(json) ? json : [json];
      for (const item of asArray) {
        if (item && typeof item === "object") {
          const contentUrl = item.contentUrl || item?.video?.contentUrl;
          if (contentUrl && typeof contentUrl === "string") {
            variants.push({ url: contentUrl, mime: item.encodingFormat });
          }
        }
      }
    } catch {}
  });

  // 3) Try Pinterest app state (__PWS_DATA__)
  const rawState = $("script#__PWS_DATA__").contents().text();
  if (rawState) {
    try {
      const state = JSON.parse(rawState);
      const tree = JSON.stringify(state);
      // Heuristic: look for video_list objects with url
      const urls = new Set<string>();
      const videoListRegex = /\"url\"\s*:\s*\"(https:[^\"]+\.mp4[^\"]*)\"/g;
      let match: RegExpExecArray | null;
      while ((match = videoListRegex.exec(tree))) {
        try {
          const u = JSON.parse(`"${match[1]}"`); // unescape
          urls.add(u);
        } catch {
          urls.add(match[1]);
        }
      }
      for (const u of urls) variants.push({ url: u });
    } catch {}
  }

  // Deduplicate and filter
  const uniq = new Map<string, VideoVariant>();
  for (const v of variants) {
    if (!v.url) continue;
    try {
      const u = new URL(v.url);
      if (!/^https?:$/.test(u.protocol)) continue;
      uniq.set(v.url, v);
    } catch {}
  }

  if (uniq.size === 0) {
    throw new Error("No downloadable video found for this Pin.");
  }

  return {
    title,
    cover,
    variants: Array.from(uniq.values()),
  };
}
