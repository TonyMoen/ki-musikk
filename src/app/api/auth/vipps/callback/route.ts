/**
 * Vipps Login Callback Route
 * Handles OAuth callback, exchanges code for tokens, and creates/authenticates user
 *
 * Flow:
 * 1. Vipps redirects here with authorization code
 * 2. Exchange code for access token
 * 3. Fetch user info from Vipps
 * 4. Create or link user in Supabase
 * 5. Create session and redirect to home
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface VippsTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
  id_token: string
}

interface VippsUserInfo {
  sub: string // Vipps user ID
  email?: string
  email_verified?: boolean
  name?: string
  given_name?: string
  family_name?: string
  phone_number?: string
}

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle error from Vipps
    if (error) {
      console.error('Vipps OAuth error:', error, errorDescription)
      return NextResponse.redirect(new URL(`/auth/login?error=vipps_denied`, appUrl))
    }

    if (!code || !state) {
      console.error('Missing code or state in callback')
      return NextResponse.redirect(new URL('/auth/login?error=invalid_callback', appUrl))
    }

    // Verify state to prevent CSRF
    const cookieStore = await cookies()
    const storedState = cookieStore.get('vipps_oauth_state')?.value

    if (!storedState || storedState !== state) {
      console.error('State mismatch - possible CSRF attack')
      return NextResponse.redirect(new URL('/auth/login?error=invalid_state', appUrl))
    }

    // Clear state cookie
    cookieStore.delete('vipps_oauth_state')

    // Get config
    const clientId = process.env.VIPPS_LOGIN_CLIENT_ID
    const clientSecret = process.env.VIPPS_LOGIN_CLIENT_SECRET
    const apiUrl = process.env.VIPPS_API_URL || 'https://api.vipps.no'

    if (!clientId || !clientSecret) {
      console.error('Missing Vipps Login credentials')
      return NextResponse.redirect(new URL('/auth/login?error=config', appUrl))
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(
      `${apiUrl}/access-management-1.0/access/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${appUrl}/api/auth/vipps/callback`,
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(new URL('/auth/login?error=token_exchange', appUrl))
    }

    const tokens: VippsTokenResponse = await tokenResponse.json()

    // Fetch user info
    const userInfoResponse = await fetch(
      `${apiUrl}/vipps-userinfo-api/userinfo`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('User info fetch failed:', errorText)
      return NextResponse.redirect(new URL('/auth/login?error=userinfo', appUrl))
    }

    const userInfo: VippsUserInfo = await userInfoResponse.json()

    console.log('Vipps user info:', {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    })

    // Create or link user in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.redirect(new URL('/auth/login?error=config', appUrl))
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if user exists with this email
    const email = userInfo.email
    if (!email) {
      console.error('No email provided by Vipps')
      return NextResponse.redirect(new URL('/auth/login?error=no_email', appUrl))
    }

    // Try to find existing user by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    let userId: string

    if (existingUser) {
      // User exists - use their ID
      userId = existingUser.id
      console.log('Existing user found:', userId)
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: userInfo.name || userInfo.given_name,
          vipps_sub: userInfo.sub,
          phone_number: userInfo.phone_number,
        },
      })

      if (createError || !newUser.user) {
        console.error('Failed to create user:', createError)
        return NextResponse.redirect(new URL('/auth/login?error=create_user', appUrl))
      }

      userId = newUser.user.id
      console.log('New user created:', userId)
    }

    // Generate magic link for session
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: appUrl,
      },
    })

    if (linkError || !linkData.properties?.hashed_token) {
      console.error('Failed to generate magic link:', linkError)
      return NextResponse.redirect(new URL('/auth/login?error=session', appUrl))
    }

    // Verify the OTP to create session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    })

    if (sessionError || !sessionData.session) {
      console.error('Failed to create session:', sessionError)
      return NextResponse.redirect(new URL('/auth/login?error=session', appUrl))
    }

    // Set session cookies
    const response = NextResponse.redirect(new URL('/', appUrl))

    // Set auth cookies for Supabase
    response.cookies.set('sb-access-token', sessionData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    console.log('Vipps login successful:', { userId, email })

    return response
  } catch (error) {
    console.error('Vipps callback error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=callback', appUrl))
  }
}
