import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
const publicRoutes = [
  "/",
  "/api/webhook",
  "/paypal-success",
  "/updates",
  "/analytics",
  "/presentation",
  "/api/presentation",
  "/code-analysis",
  "/api/code-analysis",
  "/data-insights",
  "/api/data-insights",
  "/api/chat",
  "/api/content",
  "/api/translate",
  "/api/image",
  "/api/music",
  "/api/video",
  "/api/code",
  "/api/ideas",
  "/api/study"
];

export default authMiddleware({
  publicRoutes,
  afterAuth(auth, req) {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }
  }
});

// Stop Middleware running on static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
