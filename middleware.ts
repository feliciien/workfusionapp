import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/webhook",
  "/api/subscription",
  "/settings",
  "/sign-in",
  "/sign-up",
  "/api/auth",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Handle public routes
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication
  const token = await getToken({ req });

  if (!token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|favicon.ico).*)",
    "/",
  ],
};
