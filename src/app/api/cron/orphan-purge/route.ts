/**
 * Orphan Storage Purge
 *
 * Removes storage objects in the 'songs' bucket that have no matching
 * song.audio_url. These accumulate when hard-delete in song-retention
 * cron fails its storage.remove() call but succeeds on the row delete
 * (logged but tolerated — see retention cron's storageErrors counter).
 *
 * Auth: Bearer ${CRON_SECRET}, same pattern as /api/cron/song-retention.
 *
 * Idempotent: querying again finds zero orphans, returns count=0.
 *
 * One-time invocation:
 *   curl https://kimusikk.no/api/cron/orphan-purge \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * Schedulable (optional, weekly): add to vercel.json crons array.
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

const STORAGE_BUCKET = 'songs'
// Supabase storage API removes up to 100 paths per call. Going higher
// would require multiple calls anyway — keep batches small for clearer
// failure attribution in logs.
const REMOVE_BATCH_SIZE = 100

interface OrphanRow {
  name: string
  size_bytes: number
}

export async function GET(_request: Request) {
  const startTime = Date.now()

  // 1. Auth
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

  // 3. Find orphans via the SQL function (security definer, joins
  //    storage.objects against public.song). The JS client can't reach
  //    storage.objects directly, so we route through the RPC.
  let orphans: OrphanRow[] = []
  try {
    const { data, error } = await supabase.rpc('find_orphan_storage_objects')
    if (error) throw error
    orphans = (data ?? []) as OrphanRow[]
  } catch (err) {
    logError('orphan-purge: RPC failed', err as Error)
    return NextResponse.json(
      { error: { code: 'QUERY_FAILED', message: 'Could not list orphans' } },
      { status: 500 }
    )
  }

  if (orphans.length === 0) {
    const totalMs = Date.now() - startTime
    logInfo('orphan-purge: nothing to do', { durationMs: totalMs })
    return NextResponse.json({
      ok: true,
      orphansFound: 0,
      purgedFiles: 0,
      bytesFreed: 0,
      durationMs: totalMs,
    })
  }

  const totalBytes = orphans.reduce((sum, o) => sum + (o.size_bytes ?? 0), 0)
  logInfo('orphan-purge: orphans identified', {
    count: orphans.length,
    totalBytes,
  })

  // 4. Remove in batches via the storage API (the only path that
  //    guarantees the underlying object is freed, not just the metadata
  //    row).
  let purgedFiles = 0
  let bytesFreed = 0
  let errorBatches = 0

  for (let i = 0; i < orphans.length; i += REMOVE_BATCH_SIZE) {
    const batch = orphans.slice(i, i + REMOVE_BATCH_SIZE)
    const paths = batch.map((o) => o.name)
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    if (error) {
      errorBatches++
      logError(
        'orphan-purge: batch remove failed',
        error as unknown as Error,
        { batchSize: batch.length, batchStart: i }
      )
      continue
    }
    purgedFiles += batch.length
    bytesFreed += batch.reduce((sum, o) => sum + (o.size_bytes ?? 0), 0)
  }

  const totalMs = Date.now() - startTime
  const summary = {
    ok: true,
    orphansFound: orphans.length,
    purgedFiles,
    bytesFreed,
    bytesFreedMB: Math.round(bytesFreed / (1024 * 1024)),
    errorBatches,
    durationMs: totalMs,
  }
  logInfo('orphan-purge: complete', summary)
  return NextResponse.json(summary)
}
