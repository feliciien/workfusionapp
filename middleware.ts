import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

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
  async afterAuth(auth, req) {
    const path = req.nextUrl.pathname;

    // Handle public routes
    if (publicRoutes.some(route => path.startsWith(route))) {
      return NextResponse.next();
    }

    // Handle auth
    if (!auth.userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", path);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
