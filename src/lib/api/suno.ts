/**
 * Suno API Wrapper
 *
 * Provides TypeScript interfaces and functions for interacting with the Suno API
 * via sunoapi.org for AI-powered music generation.
 *
 * @module lib/api/suno
 */

import { logError, logInfo } from '@/lib/utils/logger'

/**
 * Suno API Configuration
 */
const SUNO_API_BASE_URL = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org'
const SUNO_API_KEY = process.env.SUNO_API_KEY
const SUNO_API_TIMEOUT = 30000 // 30 seconds

/**
 * Suno API Model Versions
 */
export type SunoModel = 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5'

/**
 * Suno API Request Parameters
 */
export interface SunoGenerateParams {
  title: string
  lyrics: string
  style: string
  model?: SunoModel
  callBackUrl?: string
  instrumental?: boolean
  duration?: number // Song duration in seconds (e.g., 30 for preview, undefined for full)
  personaId?: string
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
}

/**
 * Suno API Response
 */
export interface SunoGenerateResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

/**
 * Suno API Error Response
 */
export interface SunoErrorResponse {
  error: string
  code?: number
  message?: string
}

/**
 * Custom error class for Suno API errors
 */
export class SunoApiError extends Error {
  public readonly statusCode: number
  public readonly sunoMessage?: string

  constructor(message: string, statusCode: number, sunoMessage?: string) {
    super(message)
    this.name = 'SunoApiError'
    this.statusCode = statusCode
    this.sunoMessage = sunoMessage
  }
}

/**
 * Validate API key is configured
 */
function validateApiKey(): void {
  if (!SUNO_API_KEY) {
    throw new Error('SUNO_API_KEY environment variable is not configured')
  }
}

/**
 * Generate a song using the Suno API
 *
 * Calls Suno's /api/custom_generate endpoint with Norwegian lyrics and genre prompt.
 * The API returns a song_id for tracking the generation status.
 *
 * @param params - Song generation parameters
 * @returns Suno API response with song_id and status
 * @throws {SunoApiError} If API call fails
 *
 * @example
 * ```typescript
 * try {
 *   const result = await generateSong({
 *     lyrics: 'Norwegian lyrics here...',
 *     genrePrompt: 'Country, rock, anthem, twangy guitar',
 *     modelVersion: 'v2',
 *     webhookUrl: 'https://musikkfabrikken.no/api/webhooks/suno'
 *   })
 *   console.log(`Song generation started: ${result.song_id}`)
 * } catch (error) {
 *   if (error instanceof SunoApiError) {
 *     console.error(`Suno API error ${error.code}: ${error.message}`)
 *   }
 * }
 * ```
 */
export async function generateSong(
  params: SunoGenerateParams
): Promise<SunoGenerateResponse> {
  validateApiKey()

  const {
    title,
    lyrics,
    style,
    model = 'V5',
    callBackUrl,
    instrumental = false,
    duration,
    personaId,
    negativeTags,
    vocalGender,
    styleWeight,
    weirdnessConstraint,
    audioWeight
  } = params

  // Validate required parameters
  if (!title || title.trim().length === 0) {
    throw new SunoApiError('Title is required and cannot be empty', 400)
  }

  if (!lyrics || lyrics.trim().length === 0) {
    throw new SunoApiError('Lyrics are required and cannot be empty', 400)
  }

  if (!style || style.trim().length === 0) {
    throw new SunoApiError('Style is required and cannot be empty', 400)
  }

  // Validate lyrics length (Suno limits: 3000-5000 depending on model)
  if (lyrics.length < 10) {
    throw new SunoApiError('Lyrics must be at least 10 characters', 400)
  }

  if (lyrics.length > 5000) {
    throw new SunoApiError('Lyrics must not exceed 5000 characters', 400)
  }

  // Validate title length
  if (title.length > 80) {
    throw new SunoApiError('Title must not exceed 80 characters', 400)
  }

  const requestBody: Record<string, unknown> = {
    customMode: true,
    instrumental,
    model,
    title,
    prompt: lyrics, // Lyrics go in 'prompt' field when instrumental is false
    style,
    ...(callBackUrl && { callBackUrl }),
    ...(duration !== undefined && { duration }),
    ...(personaId && { personaId }),
    ...(negativeTags && { negativeTags }),
    ...(vocalGender && { vocalGender }),
    ...(styleWeight !== undefined && { styleWeight }),
    ...(weirdnessConstraint !== undefined && { weirdnessConstraint }),
    ...(audioWeight !== undefined && { audioWeight })
  }

  logInfo('Calling Suno API', {
    endpoint: '/api/v1/generate',
    lyricsLength: lyrics.length,
    style,
    model,
    instrumental,
    hasCallback: !!callBackUrl
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), SUNO_API_TIMEOUT)

    const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUNO_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // Parse response
    const data = (await response.json().catch(() => ({}))) as SunoGenerateResponse

    // Handle API errors (code !== 200)
    if (!response.ok || data.code !== 200) {
      // Map Suno error codes to user-friendly messages
      let errorMessage: string
      switch (response.status) {
        case 400:
          errorMessage = 'Ugyldig forespørsel. Sjekk sangtekst og stil.'
          break
        case 401:
          errorMessage = 'Autentisering feilet. Sjekk API-nøkkel.'
          break
        case 429:
          errorMessage = 'Ikke nok kreditter eller rate limit. Prøv igjen senere.'
          break
        case 500:
          errorMessage = 'Suno API-serverfeil. Prøv igjen senere.'
          break
        default:
          errorMessage = data.msg || 'Ukjent Suno API-feil'
      }

      logError(
        `Suno API error: ${response.status}`,
        new Error(errorMessage),
        {
          status: response.status,
          responseCode: data.code,
          responseMsg: data.msg,
          requestBody
        }
      )

      throw new SunoApiError(
        errorMessage,
        response.status,
        data.msg
      )
    }

    // Validate response structure
    if (!data.data?.taskId) {
      throw new SunoApiError(
        'Invalid Suno API response: missing taskId',
        500
      )
    }

    logInfo('Suno API call successful', {
      taskId: data.data.taskId,
      model,
      title
    })

    return data
  } catch (error) {
    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      logError('Suno API timeout', error, {
        timeout: SUNO_API_TIMEOUT,
        requestBody
      })
      throw new SunoApiError(
        'Suno API-forespørsel tok for lang tid. Prøv igjen.',
        504
      )
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logError('Suno API network error', error, { requestBody })
      throw new SunoApiError(
        'Nettverksfeil ved tilkobling til Suno API. Sjekk tilkoblingen.',
        503
      )
    }

    // Re-throw SunoApiError
    if (error instanceof SunoApiError) {
      throw error
    }

    // Unexpected error
    logError('Unexpected error calling Suno API', error as Error, {
      requestBody
    })
    throw new SunoApiError(
      'En uventet feil oppstod ved kall til Suno API',
      500,
      (error as Error).message
    )
  }
}

/**
 * Suno Task Status Response
 */
export interface SunoTaskStatusResponse {
  code: number
  msg: string
  data: {
    taskId: string
    status: 'PENDING' | 'TEXT_SUCCESS' | 'FIRST_SUCCESS' | 'SUCCESS' | 'CREATE_TASK_FAILED' | 'GENERATE_AUDIO_FAILED' | 'CALLBACK_EXCEPTION' | 'SENSITIVE_WORD_ERROR'
    response?: {
      sunoData?: Array<{
        id: string
        audioUrl: string
        sourceAudioUrl: string
        streamAudioUrl: string
        imageUrl: string
        sourceImageUrl: string
        prompt: string
        modelName: string
        title: string
        tags: string
        duration: number
        createTime: number
      }>
    }
    type?: string
    operationType?: string
  }
}

/**
 * Get song generation status from Suno API
 *
 * @param taskId - Suno task ID (returned from generate call)
 * @returns Task status information
 * @throws {SunoApiError} If API call fails
 */
export async function getSongStatus(
  taskId: string
): Promise<SunoTaskStatusResponse> {
  validateApiKey()

  if (!taskId || taskId.trim().length === 0) {
    throw new SunoApiError('Task ID is required', 400)
  }

  logInfo('Fetching Suno task status', { taskId })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), SUNO_API_TIMEOUT)

    const response = await fetch(
      `${SUNO_API_BASE_URL}/api/v1/generate/record-info?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUNO_API_KEY}`
        },
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    // Parse response
    const data = (await response.json().catch(() => ({}))) as SunoTaskStatusResponse

    // Handle API errors
    if (!response.ok || data.code !== 200) {
      let errorMessage: string
      switch (response.status) {
        case 404:
          errorMessage = 'Task ikke funnet. Sjekk task ID.'
          break
        case 401:
          errorMessage = 'Autentisering feilet. Sjekk API-nøkkel.'
          break
        case 500:
          errorMessage = 'Suno API-serverfeil. Prøv igjen senere.'
          break
        default:
          errorMessage = data.msg || 'Ukjent Suno API-feil'
      }

      logError(
        `Suno API status check error: ${response.status}`,
        new Error(errorMessage),
        { taskId, status: response.status, responseCode: data.code }
      )

      throw new SunoApiError(
        errorMessage,
        response.status,
        data.msg
      )
    }

    logInfo('Suno task status retrieved', {
      taskId,
      status: data.data.status,
      hasAudioUrl: !!data.data.response?.sunoData?.[0]?.audioUrl,
      songCount: data.data.response?.sunoData?.length || 0
    })

    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError('Suno status check timeout', error, { taskId })
      throw new SunoApiError('Suno API status check tok for lang tid', 504)
    }

    if (error instanceof SunoApiError) {
      throw error
    }

    logError('Unexpected error fetching Suno status', error as Error, {
      taskId
    })
    throw new SunoApiError(
      'En uventet feil oppstod ved sjekk av sangstatus',
      500
    )
  }
}
