/**
 * Song Retention Cron
 *
 * Runs daily (configured in vercel.json). Two-stage retention matching T&C
 * "Lagring og sletting":
 *   1. Soft-delete songs older than 30 days (DB only, via RPC) — user no
 *      longer sees them, matching the T&C promise of 30-day retention.
 *   2. Hard-delete songs older than 60 days (DB row + storage MP3) — internal
 *      30-day safety window between soft and hard delete.
 *
 * Auth: Verifies `Authorization: Bearer ${CRON_SECRET}` to prevent unauthorized
 *       invocations. Vercel cron sends this header automatically when CRON_SECRET
 *       is set in env.
 *
 * Idempotent: safe to re-run; both stages filter on already-actioned rows.
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

const HARD_DELETE_DAYS = 60
const STORAGE_BUCKET = 'songs'

interface PurgeCandidate {
  id: string
  audio_url: string | null
  user_id: string
}

function extractStoragePath(audioUrl: string): string | null {
  // Stored as 'songs/{userId}/{songId}.mp3' — strip the bucket prefix.
  if (audioUrl.startsWith(`${STORAGE_BUCKET}/`)) {
    return audioUrl.slice(STORAGE_BUCKET.length + 1)
  }
  // Legacy format with full URL — extract the path after /songs/
  const match = audioUrl.match(/\/songs\/([^?]+)/)
  return match ? match[1] : null
}

export async function GET(_request: Request) {
  const startTime = Date.now()

  // 1. Auth: verify CRON_SECRET
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    logError('CRON_SECRET not configured', new Error('Missing env var'))
    return NextResponse.json(
      { error: { code: 'CONFIG_ERROR', message: 'Cron secret not configured' } },
      { status: 500 }
    )
  }

  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    logError('Unauthorized cron invocation', new Error('Bad auth header'))
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid cron auth' } },
      { status: 401 }
    )
  }

  // 2. Init service-role client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Missing Supabase env vars', new Error('Config error'))
    return NextResponse.json(
      { error: { code: 'CONFIG_ERROR', message: 'Supabase not configured' } },
      { status: 500 }
    )
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 3. Stage 1: soft-delete old songs (delegated to SQL function)
  let softDeleted = 0
  try {
    const { data, error } = await supabase.rpc('soft_delete_old_songs')
    if (error) throw error
    softDeleted = (data as number | null) ?? 0
    logInfo('Soft-delete stage complete', { count: softDeleted })
  } catch (err) {
    logError('Soft-delete stage failed', err as Error)
    return NextResponse.json(
      { error: { code: 'SOFT_DELETE_FAILED', message: 'Stage 1 failed' } },
      { status: 500 }
    )
  }

  // 4. Stage 2: hard-delete songs past HARD_DELETE_DAYS
  // Anchor on created_at (per retention policy), not deleted_at.
  const cutoffDate = new Date(
    Date.now() - HARD_DELETE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  let candidates: PurgeCandidate[] = []
  try {
    const { data, error } = await supabase
      .from('song')
      .select('id, audio_url, user_id')
      .lt('created_at', cutoffDate)
      .not('deleted_at', 'is', null)
    if (error) throw error
    candidates = (data ?? []) as PurgeCandidate[]
  } catch (err) {
    logError('Purge candidate query failed', err as Error)
    return NextResponse.json(
      { error: { code: 'QUERY_FAILED', message: 'Could not list purge candidates' } },
      { status: 500 }
    )
  }

  logInfo('Purge candidates identified', { count: candidates.length })

  let purgedRows = 0
  let purgedFiles = 0
  let storageErrors = 0
  let dbErrors = 0

  // 5. For each candidate: remove storage file (if any), then delete row.
  // Process serially — volume is low (cron runs daily) and isolation is more
  // important than throughput.
  for (const song of candidates) {
    if (song.audio_url) {
      const path = extractStoragePath(song.audio_url)
      if (path) {
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([path])
        if (storageError) {
          // Log but proceed to row delete — orphan storage will be caught by
          // the orphan-purge script. Stuck DB rows are worse than stuck files.
          storageErrors++
          logError('Storage delete failed during retention purge',
            storageError as unknown as Error,
            { songId: song.id, path })
        } else {
          purgedFiles++
        }
      }
    }

    const { error: deleteError } = await supabase
      .from('song')
      .delete()
      .eq('id', song.id)
    if (deleteError) {
      dbErrors++
      logError('Row delete failed during retention purge',
        deleteError as unknown as Error,
        { songId: song.id })
    } else {
      purgedRows++
    }
  }

  const totalMs = Date.now() - startTime
  const summary = {
    softDeleted,
    candidatesEvaluated: candidates.length,
    purgedRows,
    purgedFiles,
    storageErrors,
    dbErrors,
    durationMs: totalMs,
  }

  logInfo('Song retention cron complete', summary)
  return NextResponse.json({ ok: true, ...summary })
}
