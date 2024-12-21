import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
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
  debug: process.env.NODE_ENV === 'development'
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
};
