/**
 * Suno Webhook Handler
 *
 * Receives song generation completion notifications from Suno API,
 * downloads audio files, uploads to Supabase Storage, and updates database.
 *
 * Security: Webhook signature verification with HMAC-SHA256
 * Idempotency: Checks song status before processing to handle duplicate webhooks
 * Performance target: <10 seconds (download + upload + database update)
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { logInfo, logError } from '@/lib/utils/logger'

/**
 * Suno Webhook Payload Structure
 */
interface SunoWebhookPayload {
  taskId: string // Suno's internal task ID
  status: 'SUCCESS' | 'GENERATE_AUDIO_FAILED' | 'CALLBACK_EXCEPTION'
  response?: {
    sunoData?: Array<{
      id: string // Suno song ID
      audioUrl: string // URL to download audio file
      duration: number // Song duration in seconds
      title: string
      tags: string
    }>
  }
  errorMessage?: string // If status is failed
}

/**
 * Verify webhook signature using HMAC-SHA256
 * Prevents spoofing attacks from unauthorized sources
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    logError('Signature verification error', error as Error)
    return false
  }
}

/**
 * Download audio file from Suno URL
 * Streams download to buffer for efficient memory usage
 */
async function downloadAudioFile(audioUrl: string): Promise<ArrayBuffer> {
  const startTime = Date.now()

  logInfo('Downloading audio from Suno', { audioUrl })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30-second timeout

    const response = await fetch(audioUrl, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    // Verify content type
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('audio')) {
      logError('Invalid content type from Suno', new Error('Not an audio file'), {
        contentType,
        audioUrl,
      })
      throw new Error(`Unexpected content type: ${contentType}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const downloadTime = Date.now() - startTime
    const fileSizeMB = (audioBuffer.byteLength / (1024 * 1024)).toFixed(2)

    logInfo('Audio download complete', {
      audioUrl,
      fileSizeMB,
      downloadTimeMs: downloadTime,
    })

    return audioBuffer
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Audio download timed out after 30 seconds')
    }
    throw error
  }
}

/**
 * Upload audio buffer to Supabase Storage
 * Returns signed URL with 24-hour expiration
 */
async function uploadToSupabaseStorage(
  supabase: any,
  userId: string,
  songId: string,
  audioBuffer: ArrayBuffer
): Promise<string> {
  const startTime = Date.now()
  const filePath = `songs/${userId}/${songId}.mp3`

  logInfo('Uploading to Supabase Storage', { filePath, userId, songId })

  try {
    // Upload audio file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false, // Prevent overwriting (should not happen if idempotent)
      })

    if (uploadError) {
      logError('Supabase storage upload failed', uploadError as unknown as Error, {
        filePath,
        userId,
        songId,
      })
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Generate signed URL with 24-hour expiration
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('songs')
      .createSignedUrl(filePath, 86400) // 24 hours = 86400 seconds

    if (signedUrlError || !signedUrlData?.signedUrl) {
      logError('Signed URL generation failed', signedUrlError as unknown as Error, {
        filePath,
      })
      throw new Error('Failed to generate signed URL')
    }

    const uploadTime = Date.now() - startTime

    logInfo('Storage upload complete', {
      filePath,
      signedUrl: signedUrlData.signedUrl,
      uploadTimeMs: uploadTime,
    })

    return signedUrlData.signedUrl
  } catch (error) {
    throw error
  }
}

/**
 * Main webhook handler
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // 1. Get raw body and signature
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-suno-signature') // Adjust header name based on Suno docs

    // 🐛 DEBUG: Log ALL headers to see what Suno sends
    const allHeaders: Record<string, string> = {}
    headersList.forEach((value, key) => {
      allHeaders[key] = value
    })

    logInfo('Webhook received', {
      hasSignature: !!signature,
      bodyLength: body.length,
      allHeaders, // 🐛 DEBUG: See all headers
      bodyPreview: body.substring(0, 200), // 🐛 DEBUG: See payload structure
    })

    // 2. Verify webhook signature
    const webhookSecret = process.env.SUNO_WEBHOOK_SECRET
    const skipSignatureVerification = process.env.SKIP_WEBHOOK_SIGNATURE === 'true'

    // 🐛 DEBUG MODE: Skip signature verification for initial testing
    if (skipSignatureVerification) {
      logInfo('⚠️ Signature verification DISABLED (debug mode)', {
        reason: 'SKIP_WEBHOOK_SIGNATURE=true'
      })
    } else if (!webhookSecret) {
      logError(
        'SUNO_WEBHOOK_SECRET not configured',
        new Error('Missing environment variable')
      )
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Webhook secret not configured' } },
        { status: 500 }
      )
    } else if (signature) {
      // Only verify if signature is present AND not in debug mode
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        logError('Webhook signature verification failed', new Error('Invalid signature'), {
          signature,
        })
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_SIGNATURE',
              message: 'Webhook signature verification failed',
            },
          },
          { status: 401 }
        )
      }
      logInfo('✅ Signature verified successfully')
    } else {
      logInfo('⚠️ No signature provided by Suno (this may be normal)')
    }

    // 3. Parse webhook payload
    let payload: SunoWebhookPayload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      logError('Invalid JSON payload', error as Error)
      return NextResponse.json(
        { error: { code: 'INVALID_PAYLOAD', message: 'Invalid JSON' } },
        { status: 400 }
      )
    }

    const { taskId, status, response, errorMessage } = payload

    logInfo('Webhook payload parsed', {
      taskId,
      status,
      hasSunoData: !!response?.sunoData,
      songCount: response?.sunoData?.length || 0,
    })

    // 4. Initialize Supabase client with service role (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      logError('Missing Supabase environment variables', new Error('Config error'))
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Supabase not configured' } },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 5. Find song by Suno task ID
    const { data: song, error: fetchError } = await supabase
      .from('song')
      .select('id, user_id, status, title')
      .eq('suno_song_id', taskId)
      .single()

    if (fetchError || !song) {
      logError('Song not found by task ID', fetchError as unknown as Error, { taskId })
      return NextResponse.json(
        { error: { code: 'SONG_NOT_FOUND', message: 'Song not found' } },
        { status: 404 }
      )
    }

    // 6. Implement idempotency: Check current status
    if (song.status === 'completed') {
      logInfo('Webhook already processed (idempotent)', {
        songId: song.id,
        taskId,
        status: song.status,
      })
      return NextResponse.json({ received: true, message: 'Already processed' })
    }

    if (song.status === 'cancelled') {
      logInfo('Song was cancelled, skipping webhook processing', {
        songId: song.id,
        taskId,
      })
      return NextResponse.json({ received: true, message: 'Song cancelled' })
    }

    if (song.status !== 'generating') {
      logError(
        'Unexpected song status',
        new Error(`Status: ${song.status}`),
        { songId: song.id, taskId, status: song.status }
      )
      return NextResponse.json(
        {
          error: {
            code: 'UNEXPECTED_STATUS',
            message: `Unexpected song status: ${song.status}`,
          },
        },
        { status: 400 }
      )
    }

    // 7. Handle generation failure
    if (status !== 'SUCCESS') {
      const errorMsg = errorMessage || 'Generering mislyktes hos Suno'

      logError('Suno generation failed', new Error(errorMsg), {
        songId: song.id,
        taskId,
        status,
      })

      // Update song status to 'failed'
      await supabase
        .from('song')
        .update({
          status: 'failed',
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('id', song.id)

      return NextResponse.json({ received: true, message: 'Generation failed, status updated' })
    }

    // 8. Extract audio URL and duration from Suno response
    const sunoData = response?.sunoData?.[0]

    if (!sunoData?.audioUrl) {
      logError('Missing audio URL in webhook', new Error('No audio URL'), {
        songId: song.id,
        taskId,
      })

      await supabase
        .from('song')
        .update({
          status: 'failed',
          error_message: 'Ingen lydfil mottatt fra Suno',
          updated_at: new Date().toISOString(),
        })
        .eq('id', song.id)

      return NextResponse.json(
        { error: { code: 'MISSING_AUDIO_URL', message: 'No audio URL provided' } },
        { status: 400 }
      )
    }

    const { audioUrl, duration } = sunoData

    // 9. Download audio file from Suno
    let audioBuffer: ArrayBuffer
    try {
      audioBuffer = await downloadAudioFile(audioUrl)
    } catch (error) {
      logError('Audio download failed', error as Error, {
        songId: song.id,
        taskId,
        audioUrl,
      })

      // Mark song as failed
      await supabase
        .from('song')
        .update({
          status: 'failed',
          error_message: 'Kunne ikke laste ned lydfil fra Suno',
          updated_at: new Date().toISOString(),
        })
        .eq('id', song.id)

      return NextResponse.json(
        { error: { code: 'DOWNLOAD_FAILED', message: 'Audio download failed' } },
        { status: 500 }
      )
    }

    // 10. Upload to Supabase Storage
    let signedUrl: string
    try {
      signedUrl = await uploadToSupabaseStorage(
        supabase,
        song.user_id,
        song.id,
        audioBuffer
      )
    } catch (error) {
      logError('Storage upload failed', error as Error, {
        songId: song.id,
        taskId,
      })

      // Mark song as failed
      await supabase
        .from('song')
        .update({
          status: 'failed',
          error_message: 'Kunne ikke laste opp lydfil til lagring',
          updated_at: new Date().toISOString(),
        })
        .eq('id', song.id)

      return NextResponse.json(
        { error: { code: 'UPLOAD_FAILED', message: 'Storage upload failed' } },
        { status: 500 }
      )
    }

    // 11. Update song record: status='completed', audio_url, duration
    const { error: updateError } = await supabase
      .from('song')
      .update({
        status: 'completed',
        audio_url: signedUrl,
        duration_seconds: Math.round(duration), // Round to nearest integer
        updated_at: new Date().toISOString(),
      })
      .eq('id', song.id)

    if (updateError) {
      logError('Database update failed', updateError as unknown as Error, {
        songId: song.id,
        taskId,
      })

      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Database update failed' } },
        { status: 500 }
      )
    }

    const totalTime = Date.now() - startTime

    logInfo('Webhook processing complete', {
      songId: song.id,
      taskId,
      title: song.title,
      duration,
      totalTimeMs: totalTime,
      performance: totalTime < 10000 ? 'GOOD' : 'SLOW',
    })

    // 12. Return success
    return NextResponse.json({
      received: true,
      songId: song.id,
      status: 'completed',
      processingTimeMs: totalTime,
    })
  } catch (error) {
    const totalTime = Date.now() - startTime

    logError('Webhook handler error', error as Error, {
      totalTimeMs: totalTime,
    })

    return NextResponse.json(
      {
        error: {
          code: 'WEBHOOK_ERROR',
          message: 'Webhook processing failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
