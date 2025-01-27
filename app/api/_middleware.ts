/** @format */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";

  // Add proper user agent verification
  if (
    !userAgent ||
    userAgent.toLowerCase().includes("bot") ||
    userAgent.toLowerCase().includes("crawler")
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}
