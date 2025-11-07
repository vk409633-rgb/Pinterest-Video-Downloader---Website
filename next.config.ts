import type { NextConfig } from "next";

function buildCSP() {
  const d: Record<string, string[]> = {
    "default-src": ["'self'"],
    "img-src": ["'self'", "data:", "https:"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "connect-src": ["'self'", "https://*.pinterest.com", "https://*.pinimg.com"],
    "media-src": ["'self'", "https:", "data:"],
    "frame-src": [],
  };

  // Google Analytics
  if (process.env.NEXT_PUBLIC_GA_ID) {
    d["script-src"].push("https://www.googletagmanager.com");
    d["connect-src"].push("https://www.google-analytics.com");
  }

  // Plausible
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
    d["script-src"].push("https://plausible.io");
    d["connect-src"].push("https://plausible.io");
  }

  // AdSense / Google Ads
  if (process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
    d["script-src"].push(
      "https://pagead2.googlesyndication.com",
      "https://www.googletagservices.com"
    );
    d["connect-src"].push(
      "https://pagead2.googlesyndication.com",
      "https://googleads.g.doubleclick.net"
    );
    d["frame-src"].push(
      "https://*.googlesyndication.com",
      "https://*.doubleclick.net",
      "https://googleads.g.doubleclick.net"
    );
    // d["img-src"].push("https://*.googlesyndication.com", "https://*.doubleclick.net");
  }

  // Microsoft Clarity
  if (process.env.NEXT_PUBLIC_CLARITY_ID) {
    d["script-src"].push("https://www.clarity.ms");
    d["connect-src"].push("https://www.clarity.ms");
    d["img-src"].push("https://*.clarity.ms");
  }

  // Meta Pixel
  if (process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
    d["script-src"].push("https://connect.facebook.net");
    d["connect-src"].push("https://graph.facebook.com", "https://connect.facebook.net");
    d["img-src"].push("https://www.facebook.com");
  }

  // Hotjar
  if (process.env.NEXT_PUBLIC_HOTJAR_ID) {
    d["script-src"].push("https://static.hotjar.com", "https://script.hotjar.com");
    d["connect-src"].push("https://*.hotjar.com", "wss://*.hotjar.com");
    d["img-src"].push("https://*.hotjar.com");
  }

  const toString = (obj: Record<string, string[]>) =>
    Object.entries(obj)
      .filter(([, arr]) => arr.length > 0)
      .map(([k, arr]) => `${k} ${arr.join(" ")}`)
      .join("; ");

  // In production, upgrade any http:// subrequests to https:// as a safety net
  const csp = toString(d);
  return process.env.NODE_ENV === "production" ? `${csp}; upgrade-insecure-requests` : csp;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.pinimg.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "s.pinimg.com" },
    ],
  },
  async headers() {
    const csp = buildCSP();
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
