import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encrypt } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth/signin") ||
    request.nextUrl.pathname.startsWith("/auth/signup");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/conversation") ||
    request.nextUrl.pathname.startsWith("/image") ||
    request.nextUrl.pathname.startsWith("/models") ||
    request.nextUrl.pathname.startsWith("/network");

  // If authenticated, set the session cookie for Edge API routes
  if (isAuth && token) {
    const session = await encrypt({
      id: token.sub,
      email: token.email,
      name: token.name,
      image: token.picture
    });

    // Create response
    const response = NextResponse.next();
    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  }

  // Redirect to dashboard if authenticated and trying to access auth page
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return null;
  }

  // Redirect to login if not authenticated and trying to access protected page
  if (isDashboardPage && !isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
