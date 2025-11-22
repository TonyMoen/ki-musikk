/**
 * Logout API Route
 *
 * Handles user logout by invalidating the Supabase session.
 * Clears the session cookie and redirects to login page.
 *
 * Usage:
 * - From client component: POST /api/auth/logout
 * - Or redirect: GET /api/auth/logout (redirects to login)
 *
 * Response:
 * - Success: 200 OK with { success: true }
 * - Or redirects to /auth/login
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Sign out user and clear session
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  try {
    const supabase = await createClient();

    // Sign out user
    await supabase.auth.signOut();

    // Redirect to login page
    return NextResponse.redirect(`${origin}/auth/login`);
  } catch (error) {
    console.error('Logout redirect error:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=logout_failed`);
  }
}
