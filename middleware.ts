import { withAuth } from "next-auth/middleware";

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/webhook",
  "/api/subscription",
  "/settings",
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/api/analytics", // Added this line
];

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Always allow access to public routes
      if (publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
        return true;
      }
      // Require authentication for other routes
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|favicon\\.ico).*)",
    "/",
  ],
};
