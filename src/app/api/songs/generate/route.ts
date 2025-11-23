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
import {
  deductCredits,
  refundCredits,
  InsufficientCreditsError,
  CreditOperationError
} from '@/lib/credits/transaction'
import { CREDIT_COSTS } from '@/lib/constants'
import { creditLogger, logError, logInfo } from '@/lib/utils/logger'

/**
 * Request body schema
 */
interface SongGenerationRequest {
  genre: string
  concept: string
  phoneticEnabled?: boolean
  title?: string
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

    const { genre, concept, phoneticEnabled = true, title } = body

    if (!genre || !concept) {
      return errorResponse(
        'MISSING_FIELDS',
        'Mangler påkrevde felt: genre og konsept.',
        400
      )
    }

    logInfo('Song generation requested', {
      userId: user.id,
      genre,
      phoneticEnabled
    })

    // Step 3: Deduct credits atomically
    let deductionTxn
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

    // Step 4: Call Suno API (PLACEHOLDER - Epic 3 implementation)
    // For now, we simulate API behavior for testing rollback logic
    try {
      // TODO Epic 3: Implement actual Suno API integration
      // const sunoResult = await generateSongWithSuno({
      //   genre,
      //   concept,
      //   phoneticEnabled,
      //   title
      // })
      // const songId = sunoResult.id

      // PLACEHOLDER: Simulate successful API call
      const mockSongId = `mock-song-${Date.now()}`

      logInfo('Song generation initiated (mock)', {
        userId: user.id,
        songId: mockSongId,
        creditsDeducted: CREDIT_COSTS.SONG_GENERATION,
        balanceAfter: deductionTxn.balance_after
      })

      // Step 5: Success - Credits remain deducted
      return NextResponse.json(
        {
          data: {
            songId: mockSongId,
            status: 'generating',
            estimatedTime: 120, // seconds
            creditsDeducted: CREDIT_COSTS.SONG_GENERATION,
            balanceAfter: deductionTxn.balance_after
          }
        },
        { status: 202 } // 202 Accepted for async operation
      )
    } catch (sunoError) {
      // Step 6: Suno API failed - Refund credits automatically
      logError('Suno API call failed, refunding credits', sunoError as Error, {
        userId: user.id,
        amount: CREDIT_COSTS.SONG_GENERATION,
        originalTransactionId: deductionTxn.id
      })

      try {
        const refundTxn = await refundCredits(
          user.id,
          CREDIT_COSTS.SONG_GENERATION,
          `Generation failed - ${(sunoError as Error).message || 'API error'}`,
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

        return errorResponse(
          'GENERATION_FAILED',
          'Sanggenereringen feilet. Kredittene er tilbakebetalt.',
          500,
          true // refunded flag
        )
      } catch (refundError) {
        // CRITICAL: Refund failed - User was charged but didn't get service
        logError('CRITICAL: Credit refund failed after API failure', refundError as Error, {
          userId: user.id,
          amount: CREDIT_COSTS.SONG_GENERATION,
          originalTransactionId: deductionTxn.id
        })

        // Alert admin - manual intervention needed
        // TODO: Integrate with monitoring/alerting service

        return errorResponse(
          'REFUND_FAILED',
          'En kritisk feil oppstod. Kontakt support for tilbakebetaling.',
          500,
          false
        )
      }
    }
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
