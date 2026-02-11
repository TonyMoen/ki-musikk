/**
 * Vipps Login Initiation Route
 * Redirects user to Vipps OAuth consent screen
 *
 * Vipps Login uses OpenID Connect (OIDC) with these scopes:
 * - openid: Required for OIDC
 * - email: Get user's email
 * - name: Get user's name
 */

import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clientId = process.env.VIPPS_LOGIN_CLIENT_ID
    const apiUrl = process.env.VIPPS_API_URL || 'https://api.vipps.no'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!clientId) {
      console.error('VIPPS_LOGIN_CLIENT_ID not configured')
      return NextResponse.redirect(new URL('/auth/logg-inn?error=config', appUrl))
    }

    // Generate CSRF state token
    const state = randomBytes(32).toString('hex')

    // Store state in cookie for verification
    const cookieStore = await cookies()
    cookieStore.set('vipps_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    // Build authorization URL
    const authUrl = new URL(`${apiUrl}/access-management-1.0/access/oauth2/auth`)

    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid email name')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('redirect_uri', `${appUrl}/api/auth/vipps/callback`)

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Vipps login initiation error:', error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/auth/logg-inn?error=vipps_init', appUrl))
  }
}
