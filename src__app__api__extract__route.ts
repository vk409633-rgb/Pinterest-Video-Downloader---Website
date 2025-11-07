import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@/lib/rate-limit";
import { extractFromPinterest } from "@/lib/pinterest";

const limiter = createRateLimiter({ intervalMs: 60_000, uniqueTokenPerInterval: 20 }); // 20 req/min/IP

const Schema = z.object({ url: z.string().url() });

function isAllowedHost(u: URL) {
  const h = u.hostname.toLowerCase();
  return h.includes("pinterest.") || h === "www.pinterest.com" || h.endsWith("pinimg.com") || h === "pin.it";
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const token = limiter.take(`extract:${ip}`);
  if (!token.ok) {
    return new NextResponse("Rate limit exceeded. Try again later.", { status: 429, headers: { "Retry-After": Math.ceil((token.resetAt - Date.now()) / 1000).toString() } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new NextResponse("Invalid payload", { status: 400 });

  let target: URL;
  try {
    target = new URL(parsed.data.url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }
  if (!isAllowedHost(target)) {
    return new NextResponse("Only Pinterest URLs are supported.", { status: 400 });
  }

  try {
    const result = await extractFromPinterest(target.toString());
    return NextResponse.json(result, { status: 200, headers: { "Cache-Control": "public, max-age=60" } });
  } catch (err: any) {
    return new NextResponse(err?.message || "Failed to extract video", { status: 400 });
  }
}
