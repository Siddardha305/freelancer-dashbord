import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge-level route protection middleware.
 * Runs on every request to /dashboard/* and /admin/* routes.
 * Redirects unauthenticated users to /login before any page code runs.
 *
 * NOTE: This is a lightweight check (cookie presence only).
 * Full session decryption & DB user verification still happens inside Server Actions.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('session');

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session?.value) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname); // Preserve intended destination
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session?.value) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on dashboard and admin routes — skip static assets and API routes
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
