import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

// Routes that require authentication
const protectedRoutes = ['/board', '/submit'];

// Routes that should redirect to /board if already authenticated
const authRoutes = ['/sign-in', '/sign-up'];

async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; email: string };
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('session')?.value;

    // Check if user is authenticated
    const session = sessionToken ? await verifyToken(sessionToken) : null;
    const isAuthenticated = !!session;

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Check if current route is an auth route (sign-in, sign-up)
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Redirect unauthenticated users from protected routes to sign-in
    if (isProtectedRoute && !isAuthenticated) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Redirect authenticated users from auth routes to board
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/board', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/board/:path*',
        '/submit/:path*',
        '/sign-in',
        '/sign-up',
    ],
};
