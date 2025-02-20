import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getCookieName } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect /admin and /playground routes
  if (!path.startsWith("/admin") && !path.startsWith("/playground")) {
    return NextResponse.next();
  }

  // Skip auth check for login pages
  if (path.endsWith("-login")) {
    return NextResponse.next();
  }

  const area = path.startsWith("/admin") ? "admin" : "playground";
  const token = request.cookies.get(getCookieName(area))?.value;

  if (!token) {
    const loginUrl = new URL(`/${area}-login`, request.url);
    // Add the attempted URL as a query parameter
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);

  if (!payload || payload.area !== area) {
    const loginUrl = new URL(`/${area}-login`, request.url);
    // Add the attempted URL as a query parameter
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/playground/:path*"],
};
