/**
 * Song Generation API Route
 *
 * Handles song generation requests with atomic credit deduction and automatic rollback.
 * This is a PLACEHOLDER implementation - actual Suno API integration will be in Epic 3.
 *
 * Flow:
 * 1. Validate authentication
 * 2. Validate sufficient credits (server-side)
 * 3. Atomically deduct credits using stored procedure
 * 4. Call Suno API to generate song
 * 5. If success: Return song ID, credits remain deducted
 * 6. If failure: Automatically refund credits via compensating transaction
 *
 * @route POST /api/songs/generate
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  deductCredits,
  refundCredits,
  InsufficientCreditsError,
  CreditOperationError
} from '@/lib/credits/transaction'
import { CREDIT_COSTS } from '@/lib/constants'
import { creditLogger, logError, logInfo } from '@/lib/utils/logger'
import { generateSong, SunoApiError } from '@/lib/api/suno'
import { optimizeLyrics } from '@/lib/phonetic/optimizer'
import { checkPreviewLimit } from '@/lib/preview-limits'

export const dynamic = 'force-dynamic'

// Admin client for server-side operations that bypass RLS
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Request body schema
 */
interface SongGenerationRequest {
  genre: string // genre name or ID
  concept: string // user's song concept description
  lyrics?: string // optional pre-written lyrics (otherwise generated from concept)
  optimizedLyrics?: string // optional pre-optimized lyrics from client
  phoneticEnabled?: boolean // apply pronunciation optimization (default: true)
  title?: string // optional custom title
  previewMode?: boolean // generate 30-second free preview (no credit cost)
  vocalGender?: 'm' | 'f' | null // voice gender selection ('m' = male, 'f' = female, null = let Suno decide)
  customGenrePrompt?: string // Suno prompt for custom genres (required if genre starts with "custom-")
}

/**
 * Error response helper with Norwegian messages
 */
function errorResponse(
  code: string,
  message: string,
  status: number,
  refunded = false
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        refunded
      }
    },
    { status }
  )
}

/**
 * POST /api/songs/generate
 *
 * Generate a new song with Norwegian pronunciation optimization
 *
 * @param request - Next.js request object
 * @returns JSON response with song ID or error
 */
export async function POST(request: NextRequest) {
  try {
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

    // Step 2: Parse and validate request body
    let body: SongGenerationRequest
    try {
      body = await request.json()
    } catch {
      return errorResponse(
        'INVALID_REQUEST',
        'Ugyldig forespørsel. Sjekk dataene og prøv igjen.',
        400
      )
    }

    const {
      genre,
      concept,
      lyrics,
      optimizedLyrics,
      phoneticEnabled = true,
      title,
      previewMode = false,
      vocalGender
    } = body

    if (!genre) {
      return errorResponse(
        'MISSING_FIELDS',
        'Mangler påkrevd felt: genre.',
        400
      )
    }

    if (!concept) {
      return errorResponse(
        'MISSING_FIELDS',
        'Mangler påkrevd felt: konsept.',
        400
      )
    }

    // Must have either lyrics or optimizedLyrics
    if (!lyrics && !optimizedLyrics) {
      return errorResponse(
        'MISSING_FIELDS',
        'Mangler påkrevd felt: lyrics eller optimizedLyrics.',
        400
      )
    }

    logInfo('Song generation requested', {
      userId: user.id,
      genre,
      phoneticEnabled,
      hasLyrics: !!lyrics,
      hasOptimizedLyrics: !!optimizedLyrics,
      previewMode
    })

    // Step 2.5: Check preview limit if in preview mode
    if (previewMode) {
      const previewCheck = await checkPreviewLimit(user.id)

      if (!previewCheck.allowed) {
        return errorResponse(
          'PREVIEW_LIMIT_EXCEEDED',
          previewCheck.message || 'Du har allerede opprettet en gratis forhåndsvisning i dag.',
          403
        )
      }

      logInfo('Preview limit check passed', {
        userId: user.id,
        message: previewCheck.message
      })
    }

    // Step 3: Deduct credits atomically (skip if preview mode)
    let deductionTxn
    if (!previewMode) {
      try {
        deductionTxn = await deductCredits(
          user.id,
          CREDIT_COSTS.SONG_GENERATION,
          'Song generation',
          undefined // songId will be assigned after Suno response
        )

        creditLogger.deductionSuccess(
          user.id,
          CREDIT_COSTS.SONG_GENERATION,
          deductionTxn.id,
          deductionTxn.balance_after
        )
      } catch (error) {
        if (error instanceof InsufficientCreditsError) {
          creditLogger.insufficientCredits(
            user.id,
            CREDIT_COSTS.SONG_GENERATION,
            0, // We don't have current balance here
            'song_generation'
          )

          return errorResponse(
            'INSUFFICIENT_CREDITS',
            'Ikke nok kreditter. Kjøp en pakke for å fortsette.',
            403
          )
        }

        // Database or RPC error
        logError('Credit deduction failed (system error)', error as Error, {
          userId: user.id,
          amount: CREDIT_COSTS.SONG_GENERATION
        })

        return errorResponse(
          'CREDIT_DEDUCTION_FAILED',
          'En feil oppstod under kreditttrekk. Prøv igjen senere.',
          500
        )
      }
    } else {
      logInfo('Preview mode - skipping credit deduction', { userId: user.id })
    }

    // Step 4: Load genre - check if custom genre first, then database
    let genreData: {
      id: string
      name: string
      display_name: string
      suno_prompt_template: string
    }

    // Check if this is a custom genre (ID starts with "custom-")
    const isCustomGenre = genre.startsWith('custom-')

    if (isCustomGenre) {
      // For custom genres, we need to get the prompt from the request
      // The frontend should pass this as part of the genre parameter or separately
      // For now, expect format: "custom-{id}|{prompt}" or pass as customGenrePrompt
      logInfo('Custom genre detected', { userId: user.id, genre })

      // Custom genres don't exist in database - create a synthetic genre data object
      // The prompt should be passed separately (we'll need to update the request interface)
      genreData = {
        id: genre,
        name: genre,
        display_name: genre,
        suno_prompt_template: body.customGenrePrompt || genre.split('|')[1] || 'pop'
      }
    } else {
      // Standard database genre
      const { data: dbGenre, error: genreError } = await supabase
        .from('genre')
        .select('id, name, display_name, suno_prompt_template')
        .eq('name', genre)
        .eq('is_active', true)
        .single()

      if (genreError || !dbGenre) {
        logError('Genre not found in database', genreError as Error, {
          userId: user.id,
          genre
        })
        return errorResponse(
          'GENRE_NOT_FOUND',
          `Genre "${genre}" ble ikke funnet.`,
          404
        )
      }

      genreData = dbGenre
    }

    // Step 5: Select lyrics to use (optimized if phoneticEnabled, else original)
    let finalLyrics: string
    let originalLyricsForDb: string
    let optimizedLyricsForDb: string | null = null

    if (phoneticEnabled) {
      // If client provided optimized lyrics, use those
      if (optimizedLyrics) {
        finalLyrics = optimizedLyrics
        originalLyricsForDb = lyrics || ''
        optimizedLyricsForDb = optimizedLyrics
      } else if (lyrics) {
        // Optimize lyrics server-side
        try {
          const optimization = await optimizeLyrics(lyrics)
          finalLyrics = optimization.optimizedLyrics
          originalLyricsForDb = optimization.originalLyrics
          optimizedLyricsForDb = optimization.optimizedLyrics

          logInfo('Lyrics optimized for pronunciation', {
            userId: user.id,
            changesCount: optimization.changes.length,
            cacheHitRate: optimization.cacheHitRate
          })
        } catch (optimizationError) {
          logError('Phonetic optimization failed, using original lyrics', optimizationError as Error, {
            userId: user.id
          })
          // Fallback to original lyrics if optimization fails
          finalLyrics = lyrics
          originalLyricsForDb = lyrics
        }
      } else {
        // Should never happen due to validation
        return errorResponse(
          'MISSING_FIELDS',
          'Mangler tekster for generering.',
          400
        )
      }
    } else {
      // Use original lyrics without optimization
      finalLyrics = lyrics || optimizedLyrics || ''
      originalLyricsForDb = lyrics || ''
    }

    // Step 6: Call Suno API to initiate song generation
    let sunoTaskId: string
    let estimatedTime: number = previewMode ? 60 : 120 // Preview: 60s, Full: 120s
    try {
      // Add watermark to preview lyrics
      const finalLyricsWithWatermark = previewMode
        ? `${finalLyrics}\n\nCreated with AIMusikk`
        : finalLyrics

      const sunoResult = await generateSong({
        title: title || 'Untitled Song',
        lyrics: finalLyricsWithWatermark,
        style: genreData.suno_prompt_template,
        model: 'V5',
        callBackUrl: `${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')}/api/webhooks/suno`,
        duration: previewMode ? 30 : undefined, // 30 seconds for preview, default for full song
        vocalGender: vocalGender || undefined // Only pass if user made a selection
      })

      // 🐛 DEBUG: Log the actual webhook URL being sent
console.log('🔔 Webhook URL sent to Suno:', `${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')}/api/webhooks/suno`)

      sunoTaskId = sunoResult.data.taskId

      logInfo('Suno API call successful', {
        userId: user.id,
        sunoTaskId,
        estimatedTime,
        genre: genreData.name,
        previewMode
      })
    } catch (sunoError) {
      // Suno API failed - refund credits (only if not preview) and return error
      logError('Suno API call failed', sunoError as Error, {
        userId: user.id,
        genre: genreData.name,
        previewMode
      })

      // Refund credits (only if not preview mode)
      if (!previewMode && deductionTxn) {
        try {
          const refundTxn = await refundCredits(
            user.id,
            CREDIT_COSTS.SONG_GENERATION,
            `Generering feilet - ${(sunoError as Error).message || 'Suno API-feil'}`,
            undefined
          )

          creditLogger.refundIssued(
            user.id,
            CREDIT_COSTS.SONG_GENERATION,
            'Suno API failure',
            refundTxn.id,
            refundTxn.balance_after,
            deductionTxn.id
          )

          // Return user-friendly error message
          const errorMessage = sunoError instanceof SunoApiError
            ? sunoError.message
            : 'Sanggenereringen feilet. Prøv igjen senere.'

          return errorResponse(
            'GENERATION_FAILED',
            `${errorMessage} Kredittene er tilbakebetalt.`,
            500,
            true
          )
        } catch (refundError) {
          // CRITICAL: Refund failed
          logError('CRITICAL: Credit refund failed after Suno API failure', refundError as Error, {
            userId: user.id,
            originalTransactionId: deductionTxn.id
          })

          return errorResponse(
            'REFUND_FAILED',
            'En kritisk feil oppstod. Kontakt support for tilbakebetaling.',
            500,
            false
          )
        }
      } else {
        // Preview mode - no refund needed, just return error
        const errorMessage = sunoError instanceof SunoApiError
          ? sunoError.message
          : 'Forhåndsvisningsgenerering feilet. Prøv igjen senere.'

        return errorResponse(
          'GENERATION_FAILED',
          errorMessage,
          500
        )
      }
    }

    // Step 7: Create song record in database with status='generating'
    // Use admin client to bypass RLS for server-side insert
    const adminClient = getAdminClient()
    const songTitle = title || `${concept.substring(0, 50)}`

    const { data: songData, error: songError } = await adminClient
      .from('song')
      .insert({
        user_id: user.id,
        title: songTitle,
        genre: genreData.name,
        concept,
        original_lyrics: originalLyricsForDb,
        optimized_lyrics: optimizedLyricsForDb,
        phonetic_enabled: phoneticEnabled,
        suno_song_id: sunoTaskId,
        status: 'generating',
        is_preview: previewMode
      })
      .select('id')
      .single()

    if (songError || !songData) {
      // Song record creation failed - refund credits (only if not preview)
      logError('Song record creation failed', songError as Error, {
        userId: user.id,
        sunoTaskId,
        previewMode
      })

      if (!previewMode && deductionTxn) {
        try {
          await refundCredits(
            user.id,
            CREDIT_COSTS.SONG_GENERATION,
            'Database error - song record creation failed',
            undefined
          )

          return errorResponse(
            'DATABASE_ERROR',
            'Kunne ikke opprette sangopptak. Kredittene er tilbakebetalt.',
            500,
            true
          )
        } catch (refundError) {
          logError('CRITICAL: Credit refund failed after database error', refundError as Error, {
            userId: user.id
          })

          return errorResponse(
            'REFUND_FAILED',
            'En kritisk feil oppstod. Kontakt support for tilbakebetaling.',
            500,
            false
          )
        }
      } else {
        return errorResponse(
          'DATABASE_ERROR',
          'Kunne ikke opprette forhåndsvisningsopptak. Prøv igjen senere.',
          500
        )
      }
    }

    // Step 8: Update credit transaction with song_id (only if not preview)
    if (!previewMode && deductionTxn) {
      await adminClient
        .from('credit_transaction')
        .update({ song_id: songData.id })
        .eq('id', deductionTxn.id)
    }

    logInfo('Song generation initiated successfully', {
      userId: user.id,
      songId: songData.id,
      sunoTaskId,
      creditsDeducted: previewMode ? 0 : CREDIT_COSTS.SONG_GENERATION,
      balanceAfter: deductionTxn?.balance_after,
      previewMode
    })

    // Step 9: Success - Return 202 Accepted with song ID
    return NextResponse.json(
      {
        data: {
          songId: songData.id,
          status: 'generating',
          estimatedTime,
          isPreview: previewMode,
          creditsDeducted: previewMode ? 0 : CREDIT_COSTS.SONG_GENERATION,
          balanceAfter: deductionTxn?.balance_after
        }
      },
      { status: 202 } // 202 Accepted for async operation
    )
  } catch (error) {
    // Unexpected server error
    logError('Unexpected error in song generation API', error as Error)

    return errorResponse(
      'INTERNAL_ERROR',
      'En uventet feil oppstod. Prøv igjen senere.',
      500
    )
  }
}

/**
 * OPTIONS /api/songs/generate
 *
 * CORS preflight handler
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  )
}
