/**
 * Suno variant capture
 *
 * Suno's /api/v1/generate returns TWO song variants per credit. Historically we
 * processed only sunoData[0] and dropped the second. These helpers let the
 * webhook + polling paths capture variant #2 as a separate `song` row, so the
 * user gets both audio files in their library for the same credit cost.
 *
 * Design:
 * - Primary row is the one created at /api/songs/generate time (suno_song_id = taskId).
 * - Variant rows are inserted lazily when SUCCESS arrives. They're keyed by the
 *   per-track Suno ID (sunoData[i].id) for idempotency.
 * - `processSongAudio` downloads + uploads + flags the row complete. Works for
 *   both the primary row (already exists) and a freshly cloned variant row.
 *
 * Errors:
 * - Variant processing is best-effort. If it fails, the primary still completes
 *   and the user gets at least one song. We log loudly but don't fail the webhook.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/utils/logger'

/**
 * Variant payload shape from Suno (subset of what the API returns).
 * Suno mixes snake_case and camelCase across endpoints — accept both.
 */
export interface VariantSongData {
  id: string
  audio_url?: string
  audioUrl?: string
  image_url?: string
  imageUrl?: string
  source_image_url?: string
  duration?: number
  title?: string
}

const VARIANT_TITLE_SUFFIX = ' · alternativ'
const AUDIO_DOWNLOAD_TIMEOUT_MS = 30_000

interface PrimarySongRow {
  id: string
  user_id: string
  title: string
}

/**
 * Idempotency check: has this variant already been ingested?
 * Returns the existing variant row's id, or null if it's the first time.
 */
export async function findExistingVariantRow(
  supabase: SupabaseClient,
  variantSunoId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('song')
    .select('id')
    .eq('suno_song_id', variantSunoId)
    .maybeSingle()

  if (error) {
    logError('findExistingVariantRow query failed', error as unknown as Error, {
      variantSunoId,
    })
    return null
  }
  return data?.id ?? null
}

/**
 * Insert a new song row that mirrors the primary's metadata but is keyed to
 * the variant's Suno track id. Title gets a small disambiguation suffix so the
 * library shows "Tittel" and "Tittel · alternativ" side by side.
 */
export async function cloneSongRowForVariant(
  supabase: SupabaseClient,
  primarySongId: string,
  variantSunoId: string
): Promise<{ id: string; user_id: string; title: string } | null> {
  // Pull the full primary row so we can copy creative fields (lyrics, concept,
  // genre, phonetic flag). Avoids re-deriving them from the request payload.
  const { data: primary, error: fetchError } = await supabase
    .from('song')
    .select(
      'user_id, title, genre, concept, original_lyrics, optimized_lyrics, phonetic_enabled'
    )
    .eq('id', primarySongId)
    .single()

  if (fetchError || !primary) {
    logError('cloneSongRowForVariant: primary not found', fetchError as unknown as Error, {
      primarySongId,
    })
    return null
  }

  const variantTitle = `${primary.title}${VARIANT_TITLE_SUFFIX}`

  const { data: inserted, error: insertError } = await supabase
    .from('song')
    .insert({
      user_id: primary.user_id,
      title: variantTitle,
      genre: primary.genre,
      concept: primary.concept,
      original_lyrics: primary.original_lyrics,
      optimized_lyrics: primary.optimized_lyrics,
      phonetic_enabled: primary.phonetic_enabled,
      suno_song_id: variantSunoId,
      status: 'generating',
    })
    .select('id, user_id, title')
    .single()

  if (insertError || !inserted) {
    logError('cloneSongRowForVariant: insert failed', insertError as unknown as Error, {
      primarySongId,
      variantSunoId,
    })
    return null
  }

  logInfo('Variant song row cloned', {
    primarySongId,
    variantSongId: inserted.id,
    variantSunoId,
  })

  return inserted
}

async function downloadAudioBuffer(audioUrl: string): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AUDIO_DOWNLOAD_TIMEOUT_MS)
  try {
    const response = await fetch(audioUrl, { method: 'GET', signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Audio download failed: ${response.status} ${response.statusText}`)
    }
    return await response.arrayBuffer()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Download the variant's audio, upload it to Supabase Storage at
 * `{user_id}/{song_id}.mp3`, and flip the row to status='completed' with
 * audio_url + canvas_url + duration filled in.
 *
 * Works for the primary row (already exists) and for a freshly cloned variant
 * row — the storage path is keyed to song_id so they don't collide.
 *
 * Returns true on success, false on any failure (caller decides whether the
 * failure is fatal).
 */
export async function processSongAudio(
  supabase: SupabaseClient,
  song: PrimarySongRow,
  variant: VariantSongData
): Promise<boolean> {
  const audioUrl = variant.audio_url || variant.audioUrl
  const imageUrl = variant.image_url || variant.imageUrl || variant.source_image_url
  const duration = variant.duration

  if (!audioUrl) {
    logError('processSongAudio: missing audio URL', new Error('No audio URL'), {
      songId: song.id,
      variantSunoId: variant.id,
    })
    await supabase
      .from('song')
      .update({
        status: 'failed',
        error_message: 'Ingen lydfil mottatt fra Suno',
        updated_at: new Date().toISOString(),
      })
      .eq('id', song.id)
    return false
  }

  // Download
  let audioBuffer: ArrayBuffer
  try {
    audioBuffer = await downloadAudioBuffer(audioUrl)
  } catch (error) {
    logError('processSongAudio: download failed', error as Error, {
      songId: song.id,
      variantSunoId: variant.id,
    })
    await supabase
      .from('song')
      .update({
        status: 'failed',
        error_message: 'Kunne ikke laste ned lydfil fra Suno',
        updated_at: new Date().toISOString(),
      })
      .eq('id', song.id)
    return false
  }

  // Upload
  const filePath = `${song.user_id}/${song.id}.mp3`
  const { error: uploadError } = await supabase.storage
    .from('songs')
    .upload(filePath, audioBuffer, {
      contentType: 'audio/mpeg',
      // Suno can deliver duplicate webhooks — upsert so the second one is a
      // no-op rather than an error.
      upsert: true,
    })

  if (uploadError) {
    logError('processSongAudio: upload failed', uploadError as unknown as Error, {
      songId: song.id,
      filePath,
    })
    await supabase
      .from('song')
      .update({
        status: 'failed',
        error_message: 'Kunne ikke laste opp lydfil til lagring',
        updated_at: new Date().toISOString(),
      })
      .eq('id', song.id)
    return false
  }

  const storagePath = `songs/${filePath}`

  // Mark complete
  const { error: updateError } = await supabase
    .from('song')
    .update({
      status: 'completed',
      audio_url: storagePath,
      canvas_url: imageUrl || null,
      duration_seconds: duration ? Math.round(duration) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', song.id)

  if (updateError) {
    logError('processSongAudio: row update failed', updateError as unknown as Error, {
      songId: song.id,
    })
    // Roll back the orphaned storage object so we don't leak it.
    await supabase.storage.from('songs').remove([filePath])
    return false
  }

  logInfo('processSongAudio: completed', {
    songId: song.id,
    variantSunoId: variant.id,
    storagePath,
    duration: duration ? Math.round(duration) : null,
  })
  return true
}

/**
 * Top-level: ingest variant #2 if Suno returned one.
 * Idempotent — calling twice with the same variant data is safe.
 *
 * The primary song's audio processing is the caller's responsibility; this
 * helper only adds the variant row.
 */
export async function captureSecondVariantIfPresent(
  supabase: SupabaseClient,
  primarySongId: string,
  sunoData: VariantSongData[] | undefined
): Promise<void> {
  if (!sunoData || sunoData.length < 2) return

  const variant = sunoData[1]
  if (!variant?.id) {
    logError('captureSecondVariantIfPresent: variant missing id',
      new Error('No variant id'), { primarySongId })
    return
  }

  // Idempotency: skip if this variant was already ingested
  const existingId = await findExistingVariantRow(supabase, variant.id)
  if (existingId) {
    logInfo('captureSecondVariantIfPresent: variant already ingested, skipping', {
      primarySongId,
      variantSongId: existingId,
    })
    return
  }

  const variantRow = await cloneSongRowForVariant(supabase, primarySongId, variant.id)
  if (!variantRow) return

  // Best-effort: log on failure but don't surface to caller.
  await processSongAudio(supabase, variantRow, variant)
}
