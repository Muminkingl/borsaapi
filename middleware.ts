import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple check for any auth cookie (e.g., Supabase's sb-xxx-auth-token)
  // We'll update this once Supabase SSR is fully integrated
  const hasAuthCookie = request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'));

  // If the user is authenticated and tries to access /login, redirect to /dashboard
  if (hasAuthCookie && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Placeholder logic for protecting /dashboard
  // if (!hasAuthCookie && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
