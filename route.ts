import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter({ intervalMs: 60_000, uniqueTokenPerInterval: 30 });

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const token = limiter.take(`download:${ip}`);
  if (!token.ok) {
    return new NextResponse("Rate limit exceeded. Try again later.", { status: 429, headers: { "Retry-After": Math.ceil((token.resetAt - Date.now()) / 1000).toString() } });
  }

  const src = req.nextUrl.searchParams.get("src");
  if (!src) return new NextResponse("Missing src", { status: 400 });

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return new NextResponse("Invalid src", { status: 400 });
  }
  if (!/^https?:$/.test(target.protocol)) {
    return new NextResponse("Unsupported protocol", { status: 400 });
  }

  // Stream the remote video to the client
  const upstream = await fetch(target.toString(), { headers: { "user-agent": "Mozilla/5.0" } });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Failed to download source", { status: 400 });
  }

  const headers = new Headers();
  const type = upstream.headers.get("content-type") || "video/mp4";
  const length = upstream.headers.get("content-length") || undefined;
  headers.set("Content-Type", type);
  if (length) headers.set("Content-Length", length);
  headers.set("Cache-Control", "private, max-age=0, no-store");
  headers.set("Content-Disposition", `attachment; filename=pin-${Date.now()}.mp4`);

  return new NextResponse(upstream.body, { status: 200, headers });
}
