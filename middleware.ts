import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";

// List of routes that require pro subscription
const proRoutes = [
  "/video",
  "/music",
  "/custom",
  "/models",
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
    const url = req.nextUrl;
    const path = url.pathname;

    // Handle public routes
    if (publicRoutes.some(route => path.startsWith(route))) {
      console.log("[MIDDLEWARE] Public route access granted:", path);
      return NextResponse.next();
    }

    // Handle auth
    if (!auth.userId) {
      console.log("[MIDDLEWARE] No user ID, redirecting to sign-in");
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", path);
      return NextResponse.redirect(signInUrl);
    }

    // Check if accessing a pro route
    if (proRoutes.some(route => path.startsWith(route))) {
      const isPro = await checkSubscription();
      if (!isPro) {
        console.log("[MIDDLEWARE] No pro access, redirecting to settings");
        return NextResponse.redirect(new URL("/settings", req.url));
      }
    }

    // Feature usage checks are now handled in individual API routes
    console.log("[MIDDLEWARE_AFTER_AUTH] Request started:", {
      path,
      userId: auth.userId,
      timestamp: new Date().toISOString()
    });

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
