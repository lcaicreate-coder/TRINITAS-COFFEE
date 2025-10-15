import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/barista",
    "/barista/((?!login).)*"
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip login page to avoid infinite redirect
  if (pathname === "/barista/login") {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get("barista_auth");
  
  if (authCookie?.value === "1") {
    return NextResponse.next();
  }
  
  // Redirect to login page
  const loginUrl = new URL("/barista/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}