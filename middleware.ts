import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";

// List of routes that require pro subscription
const proRoutes = [
  "/video",
  "/music",
  "/custom",
  "/voice",
  "/art",
  "/network",
  "/code",
  "/image",
  "/code-analysis",
  "/data-insights",
  "/study",
  "/translate",
  "/content",
  "/models",
  "/ideas",
  "/presentation"
];

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/webhook",
  "/api/subscription",
  "/settings"
];

export default authMiddleware({
  publicRoutes: publicRoutes,
  async afterAuth(auth, req) {
    const start = Date.now();
    console.log("[MIDDLEWARE] Request started:", {
      path: req.nextUrl.pathname,
      userId: auth.userId,
      timestamp: new Date().toISOString()
    });

    // If the user is not authenticated, redirect to sign-in
    if (!auth.userId) {
      console.log("[MIDDLEWARE] No user ID, redirecting to sign-in");
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Check if the requested path requires pro subscription
    const path = req.nextUrl.pathname;
    const isProRoute = proRoutes.some(route => path.startsWith(route));
    
    console.log("[MIDDLEWARE] Route check:", {
      path,
      isProRoute,
      userId: auth.userId,
      timestamp: new Date().toISOString()
    });

    if (isProRoute) {
      try {
        const hasProAccess = await checkSubscription();
        
        console.log("[MIDDLEWARE] Pro access check:", {
          path,
          hasProAccess,
          userId: auth.userId,
          timeElapsed: Date.now() - start,
          timestamp: new Date().toISOString()
        });

        if (!hasProAccess) {
          console.log("[MIDDLEWARE] No pro access, redirecting to settings");
          return NextResponse.redirect(new URL("/settings", req.url));
        }
      } catch (error) {
        console.error("[MIDDLEWARE_ERROR] Subscription check failed:", error);
        // On error, allow access as a fallback
        console.log("[MIDDLEWARE] Error in subscription check, allowing access");
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    '/',
  ],
};
