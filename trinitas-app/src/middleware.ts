import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/barista", "/barista/:path*"],
};

export const runtime = "edge";

export function middleware(req: NextRequest) {
  console.log("Middleware triggered for:", req.nextUrl.pathname);
  
  // Skip login page to avoid infinite redirect
  if (req.nextUrl.pathname.startsWith("/barista/login")) {
    console.log("Skipping login page");
    return NextResponse.next();
  }

  // Check for authentication cookie
  const cookie = req.cookies.get("barista_auth")?.value;
  console.log("Auth cookie value:", cookie);
  
  if (cookie === "1") {
    console.log("User authenticated, allowing access");
    return NextResponse.next();
  }
  
  console.log("User not authenticated, redirecting to login");
  const url = new URL("/barista/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

