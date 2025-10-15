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
  
  // Add debug headers
  const response = NextResponse.next();
  response.headers.set("x-middleware-path", pathname);
  
  // Skip login page to avoid infinite redirect
  if (pathname === "/barista/login") {
    response.headers.set("x-middleware-action", "skip-login");
    return response;
  }

  // Check for authentication cookie
  const authCookie = req.cookies.get("barista_auth");
  
  if (authCookie?.value === "1") {
    response.headers.set("x-middleware-action", "authenticated");
    return response;
  }
  
  // Redirect to login page
  response.headers.set("x-middleware-action", "redirect-to-login");
  const loginUrl = new URL("/barista/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

