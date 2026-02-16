import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/songs
 *
 * Fetch user's songs with pagination
 *
 * Query params:
 * - offset: number (default: 0)
 * - limit: number (default: 20, max: 50)
 */
export async function GET(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Du må være logget inn for å se sanger'
        }
      },
      { status: 401 }
    )
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 songs per request

  // Validate pagination parameters
  if (offset < 0 || limit < 1) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_PAGINATION',
          message: 'Ugyldig paginering parametere'
        }
      },
      { status: 400 }
    )
  }

  try {
    // Query songs with pagination - only completed songs with audio
    const { data: songs, error: queryError } = await supabase
      .from('song')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .not('audio_url', 'is', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (queryError) {
      throw queryError
    }

    // Use admin client for storage operations (anon key can't sign private bucket URLs)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate signed URLs and map canvas_url → image_url for frontend
    const songsWithSignedUrls = await Promise.all(
      (songs || []).map(async (song) => {
        // Map DB canvas_url to frontend image_url
        const mapped = { ...song, image_url: song.canvas_url }

        if (!song.audio_url) return mapped

        // Storage path format: songs/{userId}/{songId}.mp3
        if (song.audio_url.startsWith('songs/')) {
          const { data: urlData } = await adminClient.storage
            .from('songs')
            .createSignedUrl(song.audio_url.replace('songs/', ''), 86400)

          if (urlData?.signedUrl) {
            return { ...mapped, audio_url: urlData.signedUrl }
          }
        }

        // Legacy: expired signed URL — try to derive the storage path
        if (song.audio_url.includes('.supabase.co/storage/')) {
          const pathMatch = song.audio_url.match(/\/songs\/([^?]+)/)
          if (pathMatch) {
            const { data: urlData } = await adminClient.storage
              .from('songs')
              .createSignedUrl(pathMatch[1], 86400)

            if (urlData?.signedUrl) {
              return { ...mapped, audio_url: urlData.signedUrl }
            }
          }
        }

        return mapped
      })
    )

    return NextResponse.json({
      data: songsWithSignedUrls,
      meta: {
        offset,
        limit,
        count: songsWithSignedUrls.length
      }
    })
  } catch (error) {
    console.error('Error fetching songs:', error)

    return NextResponse.json(
      {
        error: {
          code: 'FETCH_FAILED',
          message: 'Kunne ikke hente sanger. Prøv igjen senere.'
        }
      },
      { status: 500 }
    )
  }
}
