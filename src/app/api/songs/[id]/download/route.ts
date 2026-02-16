/**
 * Song Download API Route
 *
 * Generates a signed URL for downloading a song from Supabase Storage.
 * Verifies user ownership through RLS before providing download access.
 *
 * @route GET /api/songs/[id]/download
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { logError, logInfo } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

/**
 * Sanitize song title for use as filename
 * Handles Norwegian characters and special characters
 */
function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'sang'
}

/**
 * Error response helper with Norwegian messages
 */
function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message
      }
    },
    { status }
  )
}

/**
 * GET /api/songs/[id]/download
 *
 * Generate signed download URL for a song
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing song ID
 * @returns JSON response with download URL and filename, or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params object
    const { id: songId } = await params

    // Step 1: Validate authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse(
        'UNAUTHORIZED',
        'Ikke autentisert. Vennligst logg inn.',
        401
      )
    }

    // Step 2: Validate song ID
    if (!songId || songId.trim().length === 0) {
      return errorResponse(
        'INVALID_ID',
        'Ugyldig sang-ID.',
        400
      )
    }

    logInfo('Download requested', {
      userId: user.id,
      songId
    })

    // Step 3: Check if user has made at least one purchase (required for downloads)
    const { data: hasPurchase, error: purchaseCheckError } = await supabase
      .from('credit_transaction')
      .select('id')
      .eq('user_id', user.id)
      .eq('transaction_type', 'purchase')
      .limit(1)
      .maybeSingle()

    if (purchaseCheckError) {
      logError('Error checking purchase status', purchaseCheckError as Error, {
        userId: user.id
      })
    }

    if (!hasPurchase) {
      return errorResponse(
        'PURCHASE_REQUIRED',
        'Du må kjøpe kreditt for å laste ned sanger. Gratis kreditt gir kun tilgang til å lage og lytte.',
        403
      )
    }

    // Step 5: Fetch song from database
    // RLS policy ensures users can only access their own songs
    const { data: song, error: songError } = await supabase
      .from('song')
      .select('id, title, audio_url, user_id, status')
      .eq('id', songId)
      .single()

    // Step 6: Handle errors
    if (songError) {
      // Check if song doesn't exist or user doesn't have access (RLS)
      if (songError.code === 'PGRST116') {
        return errorResponse(
          'NOT_FOUND',
          'Sangen ble ikke funnet.',
          404
        )
      }

      logError('Database error fetching song for download', songError as Error, {
        userId: user.id,
        songId
      })

      return errorResponse(
        'DATABASE_ERROR',
        'Kunne ikke hente sangdata. Prøv igjen senere.',
        500
      )
    }

    if (!song) {
      return errorResponse(
        'NOT_FOUND',
        'Sangen ble ikke funnet.',
        404
      )
    }

    // Step 7: Verify song is completed and has audio
    if (song.status !== 'completed') {
      return errorResponse(
        'NOT_READY',
        'Sangen er ikke klar for nedlasting ennå.',
        400
      )
    }

    if (!song.audio_url) {
      return errorResponse(
        'NO_AUDIO',
        'Sangen har ingen lydfil tilgjengelig.',
        404
      )
    }

    // Step 8: Generate signed URL for download
    // Audio URL could be a storage path or a legacy signed URL
    let downloadUrl = song.audio_url
    let storagePath: string | null = null

    if (song.audio_url.startsWith('songs/')) {
      storagePath = song.audio_url.replace('songs/', '')
    } else if (song.audio_url.includes('.supabase.co/storage/')) {
      // Legacy: expired signed URL — derive the storage path
      const pathMatch = song.audio_url.match(/\/songs\/([^?]+)/)
      if (pathMatch) storagePath = pathMatch[1]
    }

    if (storagePath) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
        .from('songs')
        .createSignedUrl(storagePath, 300, {
          download: `${sanitizeFilename(song.title)}-kimusikk.mp3`
        })

      if (signedUrlError || !signedUrlData?.signedUrl) {
        logError('Failed to generate signed URL', signedUrlError as Error, {
          userId: user.id,
          songId,
          storagePath
        })

        return errorResponse(
          'STORAGE_ERROR',
          'Kunne ikke generere nedlastingslenke. Prøv igjen.',
          500
        )
      }

      downloadUrl = signedUrlData.signedUrl
    }

    // Step 9: Return download URL and filename
    const filename = `${sanitizeFilename(song.title)}-kimusikk.mp3`

    logInfo('Download URL generated', {
      userId: user.id,
      songId,
      filename
    })

    return NextResponse.json(
      {
        data: {
          downloadUrl,
          filename
        }
      },
      { status: 200 }
    )
  } catch (error) {
    // Unexpected server error
    logError('Unexpected error in download API', error as Error)

    return errorResponse(
      'INTERNAL_ERROR',
      'En uventet feil oppstod. Prøv igjen senere.',
      500
    )
  }
}

/**
 * OPTIONS /api/songs/[id]/download
 *
 * CORS preflight handler
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  )
}
