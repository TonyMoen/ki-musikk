#!/usr/bin/env node
/**
 * Seed additional genres to Supabase database
 * Story 3.1: Create Genre Selection Component
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const additionalGenres = [
  {
    name: 'rap-hiphop',
    display_name: 'Rap/Hip-Hop',
    description: 'Norwegian rap with urban rhythmic flow and modern beats',
    emoji: '🎤',
    suno_prompt_template: 'Hip-hop, rap, Norwegian flow, urban, rhythmic, modern beats',
    sort_order: 5,
    is_active: true
  },
  {
    name: 'rock-ballad',
    display_name: 'Rock Ballad',
    description: 'Emotional rock ballad with powerful vocals and guitar solo',
    emoji: '🎸',
    suno_prompt_template: 'Rock, ballad, emotional, guitar solo, powerful vocals',
    sort_order: 6,
    is_active: true
  },
  {
    name: 'indie-pop',
    display_name: 'Indie Pop',
    description: 'Indie pop with dreamy atmosphere and creative production',
    emoji: '✨',
    suno_prompt_template: 'Indie, pop, dreamy, atmospheric, creative, modern production',
    sort_order: 7,
    is_active: true
  },
  {
    name: 'blues-rock',
    display_name: 'Blues Rock',
    description: 'Blues rock with soulful guitar and gritty vocals',
    emoji: '🎵',
    suno_prompt_template: 'Blues, rock, soulful, guitar, gritty, emotional vocals',
    sort_order: 8,
    is_active: true
  },
  {
    name: 'electronic-dance',
    display_name: 'Electronic Dance',
    description: 'Upbeat electronic dance music with energetic beats',
    emoji: '🎧',
    suno_prompt_template: 'Electronic, dance, EDM, upbeat, energetic, synth, bass',
    sort_order: 9,
    is_active: true
  },
  {
    name: 'acoustic-singer-songwriter',
    display_name: 'Acoustic Singer-Songwriter',
    description: 'Intimate acoustic performance with heartfelt lyrics',
    emoji: '🎼',
    suno_prompt_template: 'Acoustic, singer-songwriter, intimate, heartfelt, guitar, vocal focus',
    sort_order: 10,
    is_active: true
  }
]

async function seedGenres() {
  try {
    console.log('🌱 Seeding additional genres...')

    // Check existing genres
    const { data: existingGenres, error: fetchError } = await supabase
      .from('genre')
      .select('name')

    if (fetchError) {
      console.error('❌ Error fetching existing genres:', fetchError)
      process.exit(1)
    }

    const existingNames = new Set(existingGenres?.map(g => g.name) || [])
    console.log(`📊 Found ${existingNames.size} existing genres`)

    // Filter out genres that already exist
    const newGenres = additionalGenres.filter(g => !existingNames.has(g.name))

    if (newGenres.length === 0) {
      console.log('✅ All genres already seeded!')
      return
    }

    console.log(`➕ Inserting ${newGenres.length} new genres...`)

    const { data, error } = await supabase
      .from('genre')
      .insert(newGenres)
      .select()

    if (error) {
      console.error('❌ Error inserting genres:', error)
      process.exit(1)
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} new genres!`)

    // Fetch and display all genres
    const { data: allGenres } = await supabase
      .from('genre')
      .select('display_name, emoji, sort_order')
      .eq('is_active', true)
      .order('sort_order')

    console.log('\n📋 All active genres:')
    allGenres?.forEach(g => {
      console.log(`  ${g.emoji} ${g.display_name}`)
    })

    console.log(`\n🎉 Total: ${allGenres?.length || 0} genres available`)

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

seedGenres()
