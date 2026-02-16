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
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { logError, logInfo } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

// Admin client for server-side operations that bypass RLS
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
        stream_audio_url,
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

        // Check Suno API for real status after 10 seconds (webhook fallback)
        // Suno typically has FIRST_SUCCESS ready after 15-20 seconds
        if (song.suno_song_id && elapsedSeconds > 10) {
          try {
            const { getSongStatus } = await import('@/lib/api/suno')
            const sunoStatus = await getSongStatus(song.suno_song_id)

            logInfo('Suno API status check (polling fallback)', {
              userId: user.id,
              songId,
              taskId: song.suno_song_id,
              sunoStatus: sunoStatus.data.status,
              elapsedSeconds
            })

            // Handle FIRST_SUCCESS - early playback available
            // Use proxy URL to bypass CORS (fast, no storage upload needed)
            const firstSong = sunoStatus.data.response?.sunoData?.[0]
            if (sunoStatus.data.status === 'FIRST_SUCCESS' && firstSong?.streamAudioUrl) {
              const adminClient = getAdminClient()

              // Log the original Suno URL for debugging
              console.log('[FIRST_SUCCESS] Original Suno stream URL:', firstSong.streamAudioUrl)

              // Create proxy URL for the stream audio
              const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(firstSong.streamAudioUrl)}`
              console.log('[FIRST_SUCCESS] Proxy URL:', proxyUrl)

              // Update database with partial status (store original Suno URL for reference)
              await adminClient
                .from('song')
                .update({
                  status: 'partial',
                  stream_audio_url: firstSong.streamAudioUrl,
                  duration_seconds: firstSong.duration ? Math.round(firstSong.duration) : null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', songId)

              // Return partial status with proxy URL for browser playback
              response.status = 'partial'
              response.progress = 75
              response.streamAudioUrl = proxyUrl
              response.duration = firstSong.duration

              logInfo('Song partially ready (FIRST_SUCCESS via polling, using proxy URL)', {
                userId: user.id,
                songId,
                originalUrl: firstSong.streamAudioUrl
              })
              break
            }

            // Handle completed generation (SUCCESS)
            if (sunoStatus.data.status === 'SUCCESS' && firstSong?.audioUrl) {
              // Use admin client to bypass RLS for update
              const adminClient = getAdminClient()

              // Download audio from Suno and upload to Supabase Storage
              const filePath = `${user.id}/${songId}.mp3`
              const storagePath = `songs/${filePath}`
              let audioStored = false
              try {
                const audioResponse = await fetch(firstSong.audioUrl, {
                  signal: AbortSignal.timeout(30000)
                })
                if (audioResponse.ok) {
                  const audioBuffer = await audioResponse.arrayBuffer()

                  const { error: uploadError } = await adminClient.storage
                    .from('songs')
                    .upload(filePath, audioBuffer, {
                      contentType: 'audio/mpeg',
                      upsert: true
                    })

                  if (!uploadError) {
                    audioStored = true
                    logInfo('Audio uploaded to Supabase Storage (polling fallback)', {
                      songId,
                      filePath
                    })
                  } else {
                    logError('Storage upload failed (polling fallback)', uploadError as unknown as Error, { songId })
                  }
                }
              } catch (downloadError) {
                logError('Audio download failed (polling fallback)', downloadError as Error, { songId })
              }

              // Update database with completed status using admin client
              // Store the permanent storage path, not a signed URL
              await adminClient
                .from('song')
                .update({
                  status: 'completed',
                  audio_url: audioStored ? storagePath : firstSong.audioUrl,
                  duration_seconds: firstSong.duration ? Math.round(firstSong.duration) : null,
                  canvas_url: firstSong.imageUrl || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', songId)

              // Return completed status immediately
              response.status = 'completed'
              response.progress = 100
              response.audioUrl = storagePath
              response.duration = firstSong.duration

              logInfo('Song generation completed (via polling fallback)', {
                userId: user.id,
                songId,
                storagePath
              })
              break
            }

            // Handle failed generation
            if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(sunoStatus.data.status)) {
              const errorMessage = `Generering feilet: ${sunoStatus.data.status}`
              const adminClient = getAdminClient()

              await adminClient
                .from('song')
                .update({
                  status: 'failed',
                  error_message: errorMessage,
                  updated_at: new Date().toISOString()
                })
                .eq('id', songId)

              response.status = 'failed'
              response.errorMessage = errorMessage

              logError('Song generation failed (via polling fallback)', new Error(errorMessage), {
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

      case 'partial':
        // Song has early playback available (FIRST_SUCCESS)
        // Use proxy URL for immediate playback while waiting for final audio
        console.log('[Partial] Song stream_audio_url from DB:', song.stream_audio_url)
        if (song.stream_audio_url) {
          const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(song.stream_audio_url)}`
          console.log('[Partial] Returning proxy URL:', proxyUrl)
          response.streamAudioUrl = proxyUrl
        } else {
          console.log('[Partial] No stream_audio_url in database!')
        }
        response.duration = song.duration_seconds
        response.progress = 85 // Show good progress but not complete
        response.originalLyrics = song.original_lyrics
        response.optimizedLyrics = song.optimized_lyrics

        // Continue polling Suno API to check for SUCCESS (final audio)
        if (song.suno_song_id) {
          try {
            const { getSongStatus } = await import('@/lib/api/suno')
            const sunoStatus = await getSongStatus(song.suno_song_id)

            logInfo('Checking for SUCCESS while partial', {
              userId: user.id,
              songId,
              sunoStatus: sunoStatus.data.status
            })

            const firstSong = sunoStatus.data.response?.sunoData?.[0]
            if (sunoStatus.data.status === 'SUCCESS' && firstSong?.audioUrl) {
              // SUCCESS! Download final audio to storage
              const adminClient = getAdminClient()

              const filePath = `${user.id}/${songId}.mp3`
              const storagePath = `songs/${filePath}`
              let audioStored = false
              try {
                const audioResponse = await fetch(firstSong.audioUrl, {
                  signal: AbortSignal.timeout(30000)
                })
                if (audioResponse.ok) {
                  const audioBuffer = await audioResponse.arrayBuffer()

                  const { error: uploadError } = await adminClient.storage
                    .from('songs')
                    .upload(filePath, audioBuffer, {
                      contentType: 'audio/mpeg',
                      upsert: true
                    })

                  if (!uploadError) {
                    audioStored = true
                    logInfo('Audio uploaded to storage (partial→completed)', {
                      songId,
                      filePath
                    })
                  }
                }
              } catch (downloadError) {
                logError('Audio download failed, using Suno URL', downloadError as Error, { songId })
              }

              // Update database to completed - store permanent path
              await adminClient
                .from('song')
                .update({
                  status: 'completed',
                  audio_url: audioStored ? storagePath : firstSong.audioUrl,
                  duration_seconds: firstSong.duration ? Math.round(firstSong.duration) : song.duration_seconds,
                  canvas_url: firstSong.imageUrl || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', songId)

              // Return completed status
              response.status = 'completed'
              response.progress = 100
              response.audioUrl = storagePath
              response.duration = firstSong.duration || song.duration_seconds

              logInfo('Song completed (partial→completed via polling)', {
                userId: user.id,
                songId
              })
              break
            }
          } catch (sunoError) {
            // Suno check failed - just continue with partial status
            logError('Failed to check for SUCCESS while partial', sunoError as Error, {
              songId
            })
          }
        }

        logInfo('Song status: partial (early playback available)', {
          userId: user.id,
          songId,
          hasStreamUrl: !!song.stream_audio_url,
          duration: song.duration_seconds
        })
        break

      case 'completed':
        // Generate signed URL for audio file (24-hour expiration)
        let signedUrl = song.audio_url

        if (song.audio_url && song.audio_url.startsWith('songs/')) {
          // Audio is in Supabase Storage - generate signed URL
          const { data: urlData } = await supabase.storage
            .from('songs')
            .createSignedUrl(song.audio_url.replace('songs/', ''), 86400)

          if (urlData?.signedUrl) {
            signedUrl = urlData.signedUrl
          }
        } else if (song.audio_url && song.audio_url.includes('.supabase.co/storage/')) {
          // Legacy: expired signed URL — try to derive the storage path
          const pathMatch = song.audio_url.match(/\/songs\/([^?]+)/)
          if (pathMatch) {
            const { data: urlData } = await supabase.storage
              .from('songs')
              .createSignedUrl(pathMatch[1], 86400)

            if (urlData?.signedUrl) {
              signedUrl = urlData.signedUrl
            }
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

    // Log the response being sent
    console.log('[SongStatus] Returning response:', {
      status: response.status,
      hasStreamAudioUrl: !!response.streamAudioUrl,
      streamAudioUrl: response.streamAudioUrl?.substring(0, 80)
    })

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
 * DELETE /api/songs/[id]
 *
 * Permanently delete a song and its audio file from storage.
 * Uses RLS + explicit ownership check for security.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing song ID
 * @returns JSON response with success or error
 */
export async function DELETE(
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

    logInfo('Song deletion requested', {
      userId: user.id,
      songId
    })

    // Step 3: Fetch song to get audio_url for storage deletion
    // RLS policy ensures users can only access their own songs
    const { data: song, error: fetchError } = await supabase
      .from('song')
      .select('id, title, audio_url, user_id')
      .eq('id', songId)
      .single()

    // Step 4: Handle fetch errors
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse(
          'NOT_FOUND',
          'Sangen ble ikke funnet.',
          404
        )
      }

      logError('Database error fetching song for deletion', fetchError as Error, {
        userId: user.id,
        songId
      })

      return errorResponse(
        'DATABASE_ERROR',
        'Kunne ikke slette sangen. Prøv igjen.',
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

    // Step 5: Double-check ownership (RLS should handle this, but extra safety)
    if (song.user_id !== user.id) {
      logError('Unauthorized deletion attempt', new Error('User does not own song'), {
        userId: user.id,
        songId,
        songOwnerId: song.user_id
      })

      return errorResponse(
        'UNAUTHORIZED',
        'Du har ikke tilgang til å slette denne sangen.',
        401
      )
    }

    // Step 6: Delete audio file from Supabase Storage
    if (song.audio_url) {
      const storagePath = extractStoragePath(song.audio_url)

      if (storagePath) {
        const { error: storageError } = await supabase
          .storage
          .from('songs')
          .remove([storagePath])

        if (storageError) {
          // Log but continue - database deletion should still proceed
          logError('Storage deletion error', storageError as Error, {
            userId: user.id,
            songId,
            storagePath
          })
        } else {
          logInfo('Audio file deleted from storage', {
            userId: user.id,
            songId,
            storagePath
          })
        }
      }
    }

    // Step 7: Delete song record from database (permanent hard delete)
    const { error: deleteError } = await supabase
      .from('song')
      .delete()
      .eq('id', songId)

    if (deleteError) {
      logError('Database deletion error', deleteError as Error, {
        userId: user.id,
        songId
      })

      return errorResponse(
        'DATABASE_ERROR',
        'Kunne ikke slette sangen. Prøv igjen.',
        500
      )
    }

    logInfo('Song deleted successfully', {
      userId: user.id,
      songId,
      songTitle: song.title
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        deletedId: songId,
        message: 'Sangen ble slettet.'
      },
      { status: 200 }
    )
  } catch (error) {
    // Unexpected server error
    logError('Unexpected error in song deletion API', error as Error)

    return errorResponse(
      'INTERNAL_ERROR',
      'En uventet feil oppstod. Prøv igjen senere.',
      500
    )
  }
}

/**
 * Extract storage path from audio URL
 *
 * Handles both Supabase Storage URLs and direct paths
 * Format: https://{project}.supabase.co/storage/v1/object/public/songs/{path}
 * Or: songs/{path}
 */
function extractStoragePath(audioUrl: string): string | null {
  if (!audioUrl) return null

  // If it's already a storage path (starts with songs/)
  if (audioUrl.startsWith('songs/')) {
    return audioUrl.replace('songs/', '')
  }

  // Extract path from full Supabase Storage URL
  const match = audioUrl.match(/\/songs\/(.+)$/)
  return match ? match[1] : null
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
        'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  )
}
