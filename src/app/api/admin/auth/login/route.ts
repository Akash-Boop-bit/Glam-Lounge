import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth';
import { verifyPassword } from '@/lib/hash';
import { readContent } from '@/lib/content';

// Default fallback hash for "gularora2026"
const DEFAULT_HASH = '$2a$12$UuTDd3J0W0ablxbSz6g2HOpe3levS.D49HLEnMBrgGtHFTdAN9DQG';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    let hash = DEFAULT_HASH;
    try {
      const content = await readContent();
      hash = content.auth?.passwordHash || process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
    } catch (e) {
      console.warn('Failed to load password hash from content.json, falling back');
      hash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
    }

    const isValid = await verifyPassword(password, hash);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    // Sign JWT session token
    const token = await signJWT({ user: 'admin' });

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('glam_lounge_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
