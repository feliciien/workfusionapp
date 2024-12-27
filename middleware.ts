import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/subscription";
import { FREE_LIMITS, FEATURE_TYPES } from "@/constants";
import { prismaEdge } from "@/lib/prisma-edge";
import type { PrismaClient } from '@prisma/client/edge';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// List of routes that require pro subscription
const proRoutes = [
  "/video",
  "/music",
  "/custom",
  "/models",
];

// Routes with free tier limits
const limitedRoutes = {
  "/image": FEATURE_TYPES.IMAGE_GENERATION,
  "/code": FEATURE_TYPES.CODE_GENERATION,
  "/voice": FEATURE_TYPES.VOICE_SYNTHESIS,
  "/content": FEATURE_TYPES.CONTENT_WRITER,
  "/presentation": FEATURE_TYPES.PRESENTATION,
  "/ideas": FEATURE_TYPES.IDEA_GENERATOR,
};

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

    // Check feature limits for limited routes
    const limitedRoute = Object.entries(limitedRoutes).find(([route]) => path.startsWith(route));
    if (limitedRoute) {
      const [_, featureType] = limitedRoute;
      const isPro = await checkSubscription();
      
      if (!isPro) {
        // For API routes, we'll handle the limit check in the route handler
        if (path.startsWith('/api')) {
          return NextResponse.next();
        }
        
        try {
          // For page routes, redirect to upgrade if limit reached
          const usage = await prismaEdge.userFeatureUsage.findUnique({
            where: {
              userId_featureType: {
                userId: auth.userId,
                featureType
              }
            }
          });
          
          const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS];
          if (usage && usage.count >= limit) {
            console.log("[MIDDLEWARE] Free tier limit reached, redirecting to upgrade");
            return NextResponse.redirect(new URL("/", req.url));
          }
        } catch (error) {
          console.error("[MIDDLEWARE_ERROR] Failed to check feature usage:", error);
          // On error, allow access as a fallback
          return NextResponse.next();
        }
      }
    }

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
