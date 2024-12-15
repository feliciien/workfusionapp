import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
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
  ]
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
