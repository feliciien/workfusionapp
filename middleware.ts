import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isPublicPath = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname.startsWith('/public') ||
                      request.nextUrl.pathname.startsWith('/_next') ||
                      request.nextUrl.pathname.includes('.') || // Allow all files with extensions
                      request.nextUrl.pathname.startsWith('/api/auth');

  // Allow all API auth routes to pass through
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to signin page
  if (!isAuth && !isAuthPage && !isPublicPath) {
    const from = request.nextUrl.pathname;
    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions (.css, .js, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|.*\\..*|api/webhooks).*)',
  ],
}
