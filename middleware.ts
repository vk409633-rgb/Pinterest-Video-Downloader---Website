import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto && proto !== "https") {
    const url = new URL(req.url);
    url.protocol = "https:";
    return NextResponse.redirect(url.toString(), 308);
  }
  return NextResponse.next();
}

export const config = { matcher: "/:path*" };
