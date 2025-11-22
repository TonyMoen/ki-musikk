/**
 * OAuth Callback Route Handler
 *
 * Handles the OAuth callback from Google after user grants permission.
 * Exchanges the authorization code for a JWT session token and creates
 * user profile on first login.
 *
 * Flow:
 * 1. Google redirects to /auth/callback?code=<oauth_code>
 * 2. Exchange code for session using Supabase Auth
 * 3. Check if user_profile exists for this user
 * 4. If not exists: Create user_profile with credit_balance=0
 * 5. Redirect to home page (/) or next parameter if provided
 *
 * Error Handling:
 * - Invalid code: Redirect to /auth/login?error=auth_failed
 * - Missing code: Redirect to /auth/login?error=no_code
 * - Profile creation failure: Log error, proceed with redirect (profile can be created later)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Check if we have a code parameter
  if (!code) {
    console.error('OAuth callback: No code parameter');
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  try {
    const supabase = await createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback: Failed to exchange code for session', error);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    const user = data.user;

    if (!user) {
      console.error('OAuth callback: No user returned after session exchange');
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    // Check if user profile exists, create if not
    const { data: profile, error: profileFetchError } = await supabase
      .from('user_profile')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileFetchError && profileFetchError.code !== 'PGRST116') {
      // PGRST116 = not found (expected for new users)
      console.error('OAuth callback: Error checking user profile', profileFetchError);
    }

    // Create profile if it doesn't exist
    if (!profile) {
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

      const { error: profileCreateError } = await supabase
        .from('user_profile')
        .insert({
          id: user.id,
          display_name: displayName,
          credit_balance: 0,
          preferences: {},
        })
        .select()
        .single();

      if (profileCreateError) {
        // Use ON CONFLICT DO NOTHING pattern - if insert fails due to race condition, that's okay
        if (profileCreateError.code !== '23505') {
          // 23505 = unique violation (race condition)
          console.error('OAuth callback: Failed to create user profile', profileCreateError);
        }
      } else {
        console.log(`OAuth callback: Created user profile for ${user.id} with 0 credits`);
      }
    }

    // Successful authentication and profile setup - redirect to home page or next parameter
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error('OAuth callback: Unexpected error', error);
    return NextResponse.redirect(`${origin}/auth/login?error=server_error`);
  }
}
