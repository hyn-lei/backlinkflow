import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Clear the session cookie by setting it to empty with immediate expiration
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Also clear potential stale cookies from callback paths
  cookieStore.set('session', '', { maxAge: 0, path: '/api/auth/callback/google' });
  cookieStore.set('session', '', { maxAge: 0, path: '/api/auth/callback/github' });

  return NextResponse.json({ success: true });
}
