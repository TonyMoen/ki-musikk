/**
 * Audio Proxy API Route
 *
 * Proxies audio from external URLs (like Suno) to bypass CORS restrictions.
 * Streams audio directly without storing, for fast preview playback.
 *
 * @route GET /api/audio-proxy?url=<encoded-url>
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Allowed domain patterns for security (prevent open proxy abuse)
// Suno uses various subdomains and CDNs
const ALLOWED_DOMAIN_PATTERNS = [
  /suno/i,              // Any domain containing "suno" (case insensitive)
  /\.amazonaws\.com$/,  // AWS S3
  /\.cloudfront\.net$/, // CloudFront CDN
  /^musicfile\./,       // musicfile.* domains (Suno's file hosting)
]

/**
 * Check if URL is from an allowed domain
 */
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname
    const isAllowed = ALLOWED_DOMAIN_PATTERNS.some(pattern => pattern.test(hostname))

    // Log for debugging
    console.log('[AudioProxy] Domain check:', { hostname, isAllowed })

    return isAllowed
  } catch (e) {
    console.log('[AudioProxy] URL parse error:', e)
    return false
  }
}

/**
 * GET /api/audio-proxy
 *
 * Proxy audio from external URL to bypass CORS
 */
export async function GET(request: NextRequest) {
  console.log('[AudioProxy] Request received')

  try {
    // Validate authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[AudioProxy] Unauthorized - no user')
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Get URL parameter
    const { searchParams } = new URL(request.url)
    const audioUrl = searchParams.get('url')

    console.log('[AudioProxy] URL param:', audioUrl?.substring(0, 100))

    if (!audioUrl) {
      console.log('[AudioProxy] Missing URL parameter')
      return NextResponse.json(
        { error: { code: 'MISSING_URL', message: 'URL parameter required' } },
        { status: 400 }
      )
    }

    // Decode and validate URL
    const decodedUrl = decodeURIComponent(audioUrl)
    console.log('[AudioProxy] Decoded URL:', decodedUrl.substring(0, 100))

    // Extract hostname for logging
    try {
      const parsedUrl = new URL(decodedUrl)
      console.log('[AudioProxy] Hostname:', parsedUrl.hostname)
    } catch (e) {
      console.log('[AudioProxy] Failed to parse URL')
    }

    if (!isAllowedUrl(decodedUrl)) {
      console.log('[AudioProxy] URL domain not allowed')
      return NextResponse.json(
        { error: { code: 'INVALID_URL', message: 'URL domain not allowed' } },
        { status: 403 }
      )
    }

    console.log('[AudioProxy] Fetching audio from Suno...')

    // Fetch audio from external URL
    const audioResponse = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIMusikk/1.0)',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log('[AudioProxy] Suno response status:', audioResponse.status)

    if (!audioResponse.ok) {
      console.log('[AudioProxy] Fetch failed:', audioResponse.status, audioResponse.statusText)
      return NextResponse.json(
        { error: { code: 'FETCH_FAILED', message: 'Failed to fetch audio' } },
        { status: 502 }
      )
    }

    // Get content type and length
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg'
    const contentLength = audioResponse.headers.get('content-length')

    // Stream the response
    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
    }

    if (contentLength) {
      headers['Content-Length'] = contentLength
    }

    // Return streamed response
    return new NextResponse(audioResponse.body, {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error('Audio proxy error:', error)

    return NextResponse.json(
      { error: { code: 'PROXY_ERROR', message: 'Failed to proxy audio' } },
      { status: 500 }
    )
  }
}
