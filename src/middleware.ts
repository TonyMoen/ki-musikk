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

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Maintenance mode configuration
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const MAINTENANCE_BYPASS_SECRET = process.env.MAINTENANCE_BYPASS_SECRET || 'letmein123';

export async function middleware(request: NextRequest) {
  // Check maintenance mode
  if (MAINTENANCE_MODE) {
    const url = request.nextUrl;
    const bypassParam = url.searchParams.get('bypass');
    const bypassCookie = request.cookies.get('maintenance_bypass')?.value;

    // Allow bypass with secret param or cookie
    if (bypassParam === MAINTENANCE_BYPASS_SECRET) {
      // Set cookie for persistent bypass and redirect to remove param from URL
      const response = NextResponse.redirect(new URL(url.pathname, request.url));
      response.cookies.set('maintenance_bypass', MAINTENANCE_BYPASS_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    if (bypassCookie === MAINTENANCE_BYPASS_SECRET) {
      // User has bypass cookie, allow through
      return await updateSession(request);
    }

    // Show maintenance page to everyone else
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vedlikehold | SangTekster.no</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { color: #a0a0a0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>Vi er straks tilbake!</h1>
    <p>SangTekster.no er under vedlikehold for å gi deg en enda bedre opplevelse. Vi er snart tilbake!</p>
  </div>
</body>
</html>`,
      {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '3600',
        },
      }
    );
  }

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
