// Lyrics generation rate limit checking
// Anonymous users: 3 per 24 hours per IP
// Logged-in users: 30 per hour per user ID

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const ANON_MAX = 3
const ANON_WINDOW_HOURS = 24
const AUTH_MAX = 30
const AUTH_WINDOW_HOURS = 1

interface RateLimitResult {
  allowed: boolean
  remaining?: number
  requiresLogin?: boolean
  message?: string
}

/**
 * Extract client IP from request headers (Vercel sets x-forwarded-for)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return '0.0.0.0'
}

/**
 * Check if user/IP has exceeded lyrics generation rate limit
 */
export async function checkLyricsRateLimit(
  userId: string | null,
  ipAddress: string
): Promise<RateLimitResult> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (userId) {
      // Authenticated user: 30 per hour
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - AUTH_WINDOW_HOURS)

      const { count, error } = await supabase
        .from('lyrics_rate_limit')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo.toISOString())

      if (error) {
        console.error('[Lyrics Rate Limit] DB error (auth):', error)
        return { allowed: true }
      }

      const used = count || 0
      if (used >= AUTH_MAX) {
        return {
          allowed: false,
          remaining: 0,
          message: 'Du har nådd grensen på 30 tekstgenereringer per time. Prøv igjen senere.'
        }
      }

      return { allowed: true, remaining: AUTH_MAX - used }
    }

    // Anonymous user: 3 per 24 hours by IP
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - ANON_WINDOW_HOURS)

    const { count, error } = await supabase
      .from('lyrics_rate_limit')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .is('user_id', null)
      .gte('created_at', twentyFourHoursAgo.toISOString())

    if (error) {
      console.error('[Lyrics Rate Limit] DB error (anon):', error)
      return { allowed: true }
    }

    const used = count || 0
    if (used >= ANON_MAX) {
      return {
        allowed: false,
        remaining: 0,
        requiresLogin: true,
        message: 'Du har brukt opp dine 3 gratis tekstgenereringer. Logg inn for å fortsette.'
      }
    }

    return { allowed: true, remaining: ANON_MAX - used }
  } catch (error) {
    console.error('[Lyrics Rate Limit] Unexpected error:', error)
    return { allowed: true }
  }
}

/**
 * Record a lyrics generation/optimization request for rate limiting
 */
export async function recordLyricsUsage(
  userId: string | null,
  ipAddress: string,
  endpoint: 'generate' | 'optimize'
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('lyrics_rate_limit')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        endpoint,
      })

    if (error) {
      console.warn('[Lyrics Rate Limit] Failed to record usage:', error)
    }
  } catch (error) {
    console.warn('[Lyrics Rate Limit] Unexpected error recording usage:', error)
  }
}
