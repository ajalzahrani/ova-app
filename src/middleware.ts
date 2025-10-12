// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // If no token, let NextAuth handle the redirect to login
    if (!token) {
      return;
    }

    // Check if user is on first login
    if (token.isFirstLogin) {
      // Allow access to first-login page and logout
      if (
        req.nextUrl.pathname === "/first-login" ||
        req.nextUrl.pathname === "/api/auth/signout"
      ) {
        return;
      }

      // Redirect all other pages to first-login
      return NextResponse.redirect(new URL("/first-login", req.url));
    }

    // If user is not on first login but trying to access first-login page, redirect to dashboard
    if (!token.isFirstLogin && req.nextUrl.pathname === "/first-login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow if the token (session) exists
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - anonymous-report (anonymous report page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|anonymous-report).*)",
  ],
};
