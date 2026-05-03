#!/usr/bin/env tsx
/**
 * Purge orphan files from the `songs` storage bucket.
 *
 * "Orphan" = a file in storage.objects with no matching row in `song`
 * referencing its name in `audio_url`.
 *
 * Usage:
 *   npx tsx scripts/purge-orphan-storage.ts             # DRY RUN (default)
 *   npx tsx scripts/purge-orphan-storage.ts --execute   # actually delete
 *
 * Reports byte totals before any destructive action. Deletes in batches of 100.
 */

import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'
import * as path from 'path'

// Load .env.local from project root (script is in scripts/)
loadEnv({ path: path.resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const EXECUTE = process.argv.includes('--execute')
const BUCKET = 'songs'
const BATCH = 100

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface OrphanRow {
  name: string
  size_bytes: number | null
  created_at: string
}

async function findOrphans(): Promise<OrphanRow[]> {
  // Page through storage.objects via the storage admin API.
  // We can't run arbitrary SQL from the JS client without an exec_sql RPC,
  // so we replicate the join in-memory: list all objects, list all audio_url
  // values, diff. With ~hundreds of files this is trivial.

  const { data: objects, error: objErr } = await supabase
    .schema('storage')
    .from('objects')
    .select('name, metadata, created_at')
    .eq('bucket_id', BUCKET)

  if (objErr) throw objErr

  const { data: songs, error: songErr } = await supabase
    .from('song')
    .select('audio_url')
    .not('audio_url', 'is', null)

  if (songErr) throw songErr

  const referencedUrls: string[] = []
  for (const s of songs ?? []) {
    if (s.audio_url) referencedUrls.push(s.audio_url as string)
  }

  const orphans: OrphanRow[] = []
  for (const o of objects ?? []) {
    const name = o.name as string
    // A song row is "referencing" this object if its audio_url contains the name.
    // Match the SQL preview logic: s.audio_url LIKE '%' || o.name || '%'
    const isReferenced = referencedUrls.some((url) => url.includes(name))
    if (!isReferenced) {
      orphans.push({
        name,
        size_bytes:
          o.metadata && typeof o.metadata === 'object' && 'size' in o.metadata
            ? Number((o.metadata as Record<string, unknown>).size)
            : null,
        created_at: o.created_at as string,
      })
    }
  }

  return orphans
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`
  return `${(b / 1024 ** 3).toFixed(2)} GB`
}

async function deleteBatch(names: string[]): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove(names)
  if (error) throw error
}

async function main() {
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (will delete)' : 'DRY RUN'}`)
  console.log(`Bucket: ${BUCKET}\n`)

  console.log('Scanning for orphans...')
  const orphans = await findOrphans()

  const totalBytes = orphans.reduce((acc, o) => acc + (o.size_bytes ?? 0), 0)

  console.log(`\nFound ${orphans.length} orphan files.`)
  console.log(`Total reclaimable: ${fmtBytes(totalBytes)}\n`)

  if (orphans.length === 0) {
    console.log('Nothing to do.')
    return
  }

  console.log('First 10 orphans:')
  for (const o of orphans.slice(0, 10)) {
    console.log(
      `  ${o.name}  ${o.size_bytes ? fmtBytes(o.size_bytes) : '?'}  ${o.created_at}`,
    )
  }

  if (!EXECUTE) {
    console.log('\nDRY RUN — no deletions performed.')
    console.log('Re-run with --execute to delete.')
    return
  }

  console.log(`\nDeleting in batches of ${BATCH}...`)
  let deleted = 0
  for (let i = 0; i < orphans.length; i += BATCH) {
    const slice = orphans.slice(i, i + BATCH).map((o) => o.name)
    await deleteBatch(slice)
    deleted += slice.length
    console.log(`  ${deleted}/${orphans.length}`)
  }

  console.log(`\nDone. Deleted ${deleted} files (~${fmtBytes(totalBytes)}).`)
  console.log('Storage size on dashboard updates within ~1 hour.')
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
