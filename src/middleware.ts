/**
 * Next.js Middleware
 *
 * Runs on every request before reaching route handlers.
 * Handles authentication state validation and route protection.
 *
 * Protected routes:
 * - /songs/* - User's song library
 * - /settings/* - User account settings
 *
 * Public routes (not protected):
 * - / - Home page
 * - /auth/* - Authentication pages (login, callback)
 * - /_next/* - Next.js internal routes
 * - /api/* - API routes (handle their own auth)
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
