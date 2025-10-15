import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/barista",
    "/barista/:path*"
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log("🔒 Middleware triggered for:", pathname);
  
  // Skip login page to avoid infinite redirect
  if (pathname === "/barista/login") {
    console.log("✅ Skipping login page");
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = req.cookies.get("barista_auth");
  console.log("🍪 Auth cookie:", authCookie?.value);
  
  if (authCookie?.value === "1") {
    console.log("✅ User authenticated, allowing access");
    return NextResponse.next();
  }
  
  console.log("❌ User not authenticated, redirecting to login");
  const loginUrl = new URL("/barista/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

