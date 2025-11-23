#!/usr/bin/env ts-node
/**
 * Apply SQL migration to Supabase database
 * Usage: npx ts-node scripts/apply-migration.ts <migration-file-path>
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration(migrationPath: string) {
  try {
    console.log(`📄 Reading migration: ${migrationPath}`)
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log(`🚀 Applying migration...`)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully')
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

const migrationPath = process.argv[2]
if (!migrationPath) {
  console.error('Usage: npx ts-node scripts/apply-migration.ts <migration-file-path>')
  process.exit(1)
}

applyMigration(migrationPath)
