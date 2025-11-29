import { NextRequest, NextResponse } from 'next/server'
import { optimizeLyrics, validateOptimization } from '@/lib/phonetic/optimizer'
import type { OptimizationResult } from '@/lib/phonetic/optimizer'

export interface OptimizationRequest {
  lyrics: string
}

export interface OptimizationResponse {
  data?: OptimizationResult
  error?: {
    code: string
    message: string
    details?: string[]
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<OptimizationResponse>> {
  try {
    const { lyrics }: OptimizationRequest = await request.json()

    // Validate input
    if (!lyrics || typeof lyrics !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_LYRICS',
            message: 'Sangtekst er påkrevd'
          }
        },
        { status: 400 }
      )
    }

    if (lyrics.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'EMPTY_LYRICS',
            message: 'Sangtekst kan ikke være tom'
          }
        },
        { status: 400 }
      )
    }

    if (lyrics.length > 2000) {
      return NextResponse.json(
        {
          error: {
            code: 'LYRICS_TOO_LONG',
            message: 'Sangtekst kan ikke være mer enn 2000 tegn'
          }
        },
        { status: 400 }
      )
    }

    // Set timeout for optimization (100ms requirement for rule engine)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('OPTIMIZATION_TIMEOUT'))
      }, 500) // 500ms timeout (rule engine should complete in <100ms)
    })

    // Perform optimization with timeout
    const optimizationPromise = optimizeLyrics(lyrics)

    const result = await Promise.race([optimizationPromise, timeoutPromise])

    // Validate optimization quality
    const validation = validateOptimization(
      result.originalLyrics,
      result.optimizedLyrics
    )

    if (!validation.isValid) {
      console.warn('Optimization validation failed:', validation.issues)
      // Return original lyrics if validation fails (graceful degradation)
      return NextResponse.json({
        data: {
          originalLyrics: lyrics,
          optimizedLyrics: lyrics,
          changes: [],
          cacheHitRate: 0
        }
      })
    }

    // Success - return optimized lyrics
    return NextResponse.json({
      data: result
    })
  } catch (error) {
    console.error('Lyrics optimization failed:', error)

    // Check for timeout
    if (error instanceof Error && error.message === 'OPTIMIZATION_TIMEOUT') {
      return NextResponse.json(
        {
          error: {
            code: 'OPTIMIZATION_TIMEOUT',
            message:
              'Optimalisering tok for lang tid. Prøv med kortere tekst eller prøv igjen.'
          }
        },
        { status: 504 } // Gateway Timeout
      )
    }


    // Generic error
    return NextResponse.json(
      {
        error: {
          code: 'OPTIMIZATION_FAILED',
          message:
            'Kunne ikke optimalisere uttale. Prøv igjen eller bruk original tekst.'
        }
      },
      { status: 500 }
    )
  }
}
