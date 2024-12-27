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
  "/settings",
  "/sign-in",
  "/sign-up"
];

export default authMiddleware({
  publicRoutes: [
    ...publicRoutes,
    "/sign-in/[[...sign-in]]",
    "/sign-up/[[...sign-up]]",
    "/sso-callback",
    "/api/subscription/verify"
  ],
  ignoredRoutes: [
    "/api/webhook",
    "/_next",
    "/favicon.ico",
    "/public",
    "/api/subscription/verify"
  ],
  beforeAuth: (req) => {
    const url = req.nextUrl;
    console.log("[MIDDLEWARE_BEFORE_AUTH]", {
      path: url.pathname,
      timestamp: new Date().toISOString()
    });
    return NextResponse.next();
  },
  async afterAuth(auth, req) {
    const start = Date.now();
    const path = req.nextUrl.pathname;
    
    // Check if path matches any public route pattern
    const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
    
    console.log("[MIDDLEWARE_AFTER_AUTH] Request started:", {
      path,
      userId: auth.userId,
      isPublicRoute,
      timestamp: new Date().toISOString()
    });

    // Allow public routes
    if (isPublicRoute) {
      console.log("[MIDDLEWARE] Public route access granted:", path);
      return NextResponse.next();
    }

    // If not public route and user is not authenticated, redirect to sign-in
    if (!auth.userId) {
      console.log("[MIDDLEWARE] No user ID, redirecting to sign-in");
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", path);
      return NextResponse.redirect(signInUrl);
    }

    // Check if the requested path requires pro subscription
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

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
