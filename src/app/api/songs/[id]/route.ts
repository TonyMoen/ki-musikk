/**
 * Song Status API Route
 *
 * Provides polling endpoint for checking song generation status.
 * Supports polling fallback pattern (check every 5 seconds).
 *
 * @route GET /api/songs/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logError, logInfo } from '@/lib/utils/logger'

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
 * GET /api/songs/[id]
 *
 * Get song status and details for polling
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing song ID
 * @returns JSON response with song data or error
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

    logInfo('Song status requested', {
      userId: user.id,
      songId
    })

    // Step 3: Fetch song from database
    // RLS policy ensures users can only access their own songs
    const { data: song, error: songError } = await supabase
      .from('song')
      .select(`
        id,
        title,
        genre,
        concept,
        original_lyrics,
        optimized_lyrics,
        phonetic_enabled,
        suno_song_id,
        audio_url,
        duration_seconds,
        status,
        error_message,
        canvas_url,
        shared_count,
        created_at,
        updated_at
      `)
      .eq('id', songId)
      .single()

    // Step 4: Handle errors
    if (songError) {
      // Check if song doesn't exist or user doesn't have access (RLS)
      if (songError.code === 'PGRST116') {
        return errorResponse(
          'NOT_FOUND',
          'Sangen ble ikke funnet.',
          404
        )
      }

      logError('Database error fetching song', songError as Error, {
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

    // Step 5: Return song data based on status
    const response: any = {
      id: song.id,
      title: song.title,
      genre: song.genre,
      concept: song.concept,
      phoneticEnabled: song.phonetic_enabled,
      status: song.status,
      createdAt: song.created_at,
      updatedAt: song.updated_at
    }

    // Include status-specific data
    switch (song.status) {
      case 'generating':
        // Estimate progress based on creation time
        const createdAt = new Date(song.created_at)
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
        const estimatedTotal = 120 // 2 minutes typical
        const progressPercent = Math.min(Math.floor((elapsedSeconds / estimatedTotal) * 100), 95)

        response.progress = progressPercent
        response.estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsedSeconds)

        // Check Suno API for real status if song has been generating for a while
        // Poll every 30 seconds after the first minute
        if (song.suno_song_id && elapsedSeconds > 60) {
          try {
            const { getSongStatus } = await import('@/lib/api/suno')
            const sunoStatus = await getSongStatus(song.suno_song_id)

            logInfo('Suno API status check', {
              userId: user.id,
              songId,
              taskId: song.suno_song_id,
              sunoStatus: sunoStatus.data.status
            })

            // Handle completed generation
            const firstSong = sunoStatus.data.response?.sunoData?.[0]
            if (sunoStatus.data.status === 'SUCCESS' && firstSong?.audioUrl) {
              // Update database with completed status
              await supabase
                .from('song')
                .update({
                  status: 'completed',
                  audio_url: firstSong.audioUrl,
                  duration_seconds: firstSong.duration || null,
                  canvas_url: firstSong.imageUrl || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', songId)

              // Return completed status immediately
              response.status = 'completed'
              response.progress = 100
              response.audioUrl = firstSong.audioUrl
              response.duration = firstSong.duration

              logInfo('Song generation completed (via Suno API check)', {
                userId: user.id,
                songId,
                audioUrl: firstSong.audioUrl
              })
              break
            }

            // Handle failed generation
            if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(sunoStatus.data.status)) {
              const errorMessage = `Generering feilet: ${sunoStatus.data.status}`

              await supabase
                .from('song')
                .update({
                  status: 'failed',
                  error_message: errorMessage,
                  updated_at: new Date().toISOString()
                })
                .eq('id', songId)

              response.status = 'failed'
              response.errorMessage = errorMessage

              logError('Song generation failed (via Suno API check)', new Error(errorMessage), {
                userId: user.id,
                songId,
                sunoStatus: sunoStatus.data.status
              })
              break
            }

            // Still generating - continue showing progress
          } catch (sunoError) {
            // Suno API check failed - just log and continue showing estimated progress
            logError('Failed to check Suno API status', sunoError as Error, {
              userId: user.id,
              songId,
              taskId: song.suno_song_id
            })
          }
        }

        logInfo('Song status: generating', {
          userId: user.id,
          songId,
          progress: progressPercent,
          elapsedSeconds
        })
        break

      case 'completed':
        // Generate signed URL for audio file (24-hour expiration)
        let signedUrl = song.audio_url

        if (song.audio_url && song.audio_url.startsWith('songs/')) {
          // Audio is in Supabase Storage - generate signed URL
          const { data: urlData } = await supabase.storage
            .from('songs')
            .createSignedUrl(song.audio_url.replace('songs/', ''), 86400) // 24 hours

          if (urlData?.signedUrl) {
            signedUrl = urlData.signedUrl
          }
        }

        response.audioUrl = signedUrl
        response.duration = song.duration_seconds
        response.originalLyrics = song.original_lyrics
        response.optimizedLyrics = song.optimized_lyrics
        response.canvasUrl = song.canvas_url
        response.sharedCount = song.shared_count

        logInfo('Song status: completed', {
          userId: user.id,
          songId,
          hasAudioUrl: !!signedUrl,
          duration: song.duration_seconds
        })
        break

      case 'failed':
        response.errorMessage = song.error_message || 'Generering feilet. Prøv igjen.'

        logInfo('Song status: failed', {
          userId: user.id,
          songId,
          errorMessage: song.error_message
        })
        break

      default:
        response.status = 'unknown'
    }

    // Return 200 OK with song data
    return NextResponse.json(
      {
        data: response
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    // Unexpected server error
    logError('Unexpected error in song status API', error as Error)

    return errorResponse(
      'INTERNAL_ERROR',
      'En uventet feil oppstod. Prøv igjen senere.',
      500
    )
  }
}

/**
 * OPTIONS /api/songs/[id]
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
