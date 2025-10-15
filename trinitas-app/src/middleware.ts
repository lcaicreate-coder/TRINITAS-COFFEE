import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/barista", "/barista/:path*"],
};

export function middleware(req: NextRequest) {
  // Skip login page to avoid infinite redirect
  if (req.nextUrl.pathname.startsWith("/barista/login")) {
    return NextResponse.next();
  }

  // Use default passcode if not configured
  const passcode = process.env.BARISTA_PASSCODE || "4778337";

  const cookie = req.cookies.get("barista_auth")?.value;
  if (cookie === "1") {
    return NextResponse.next();
  }
  const url = new URL("/barista/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

