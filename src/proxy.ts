import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('glam_lounge_session')?.value;
    const payload = token ? await verifyJWT(token) : null;

    if (!payload) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API routes (except auth/login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth/login') {
    const token = request.cookies.get('glam_lounge_session')?.value;
    const payload = token ? await verifyJWT(token) : null;

    if (!payload) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
