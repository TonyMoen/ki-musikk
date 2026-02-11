#!/usr/bin/env node
/**
 * Update genres with Norwegian-optimized Suno prompts and gradient colors
 *
 * This script:
 * 1. Deactivates all old genres
 * 2. Upserts 8 Norwegian-optimized genres with Suno prompts
 * 3. Each prompt includes "Norwegian" twice for vocal optimization
 * 4. Adds gradient color schemes matching Playful Nordic theme
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Norwegian-optimized genre configurations
// Each prompt includes "Norwegian" twice for Suno vocal optimization
// All prompts are under 200 characters for Suno compatibility
const genreUpdates = [
  {
    name: 'elektronisk',
    display_name: 'Elektronisk',
    description: 'Energetic electronic dance music with synth drops',
    emoji: '💃',
    suno_prompt_template: 'Norwegian elektronisk, energetic synth drops, driving four-on-the-floor beat, festival EDM, euphoric build-ups, powerful Norwegian vocals, modern production',
    gradient_colors: { from: '#06D6A0', to: '#3B82F6' },
    sort_order: 1,
    is_active: true
  },
  {
    name: 'festlaat',
    display_name: 'Festlåt',
    description: 'Sing-along party anthems for celebrations',
    emoji: '🎉',
    suno_prompt_template: 'Norwegian festlåt, sing-along party anthem, catchy hook, upbeat tempo, allsang-vennlig, brass hits, clap-along rhythm, energetic Norwegian group vocals, feel-good celebration',
    gradient_colors: { from: '#FFC93C', to: '#E94560' },
    sort_order: 2,
    is_active: true
  },
  {
    name: 'rap-hiphop',
    display_name: 'Rap/Hip-Hop',
    description: 'Norwegian rap with hard-hitting beats',
    emoji: '🎤',
    suno_prompt_template: 'Norwegian rap, hard-hitting 808 bass, trap drums, aggressive flow, dark atmospheric synths, modern hip-hop production, confident Norwegian rap vocals',
    gradient_colors: { from: '#0F3460', to: '#8B5CF6' },
    sort_order: 3,
    is_active: true
  },
  {
    name: 'russelaat',
    display_name: 'Russelåt',
    description: 'High-energy party anthem for russ celebrations',
    emoji: '🚌',
    suno_prompt_template: 'Norwegian russelåt, high-energy party, heavy bass drops, EDM-trap fusion, anthemic chants, festival production, youthful Norwegian vocals, celebratory',
    gradient_colors: { from: '#E94560', to: '#8B5CF6' },
    sort_order: 4,
    is_active: true
  },
  {
    name: 'pop',
    display_name: 'Pop',
    description: 'Modern Norwegian pop with polished production',
    emoji: '🎵',
    suno_prompt_template: 'Norwegian pop, polished studio production, catchy melodic hooks, warm synth pads, tight drums, radio-friendly, emotional Norwegian vocals, uplifting, modern Scandinavian sound',
    gradient_colors: { from: '#0F3460', to: '#E94560' },
    sort_order: 5,
    is_active: true
  },
  {
    name: 'rock',
    display_name: 'Rock',
    description: 'Driving rock with electric guitar riffs',
    emoji: '🎸',
    suno_prompt_template: 'Norwegian rock, driving electric guitar riffs, punchy live drums, distorted power chords, anthemic chorus, arena energy, raw Norwegian vocals',
    gradient_colors: { from: '#8B5CF6', to: '#E94560' },
    sort_order: 6,
    is_active: true
  },
  {
    name: 'country',
    display_name: 'Country',
    description: 'Acoustic country with Norwegian warmth',
    emoji: '🤠',
    suno_prompt_template: 'Norwegian country, acoustic steel-string guitar, fiddle, warm storytelling, steady backbeat, Americana-inspired, heartfelt Norwegian vocals, rustic and authentic',
    gradient_colors: { from: '#E94560', to: '#FFC93C' },
    sort_order: 7,
    is_active: true
  },
  {
    name: 'akustisk',
    display_name: 'Akustisk',
    description: 'Intimate acoustic singer-songwriter',
    emoji: '🎹',
    suno_prompt_template: 'Norwegian akustisk, fingerpicked acoustic guitar, intimate and warm, soft percussion, gentle piano, singer-songwriter, vulnerable breathy Norwegian vocals, stripped-back production',
    gradient_colors: { from: '#FB923C', to: '#92400E' },
    sort_order: 8,
    is_active: true
  }
]

async function updateGenresWithGradients() {
  try {
    console.log('🎨 Updating genres with Norwegian-optimized prompts and gradient colors...\n')

    // First, check if gradient_colors column exists
    console.log('📋 Checking database schema...')
    const { data: existingGenres, error: fetchError } = await supabase
      .from('genre')
      .select('*')
      .limit(1)

    if (fetchError) {
      console.error('❌ Error fetching genres:', fetchError)
      process.exit(1)
    }

    // Check if gradient_colors field exists
    const hasGradientColors = existingGenres && existingGenres.length > 0 &&
      'gradient_colors' in existingGenres[0]

    if (!hasGradientColors) {
      console.log('⚠️  gradient_colors column not found')
      console.log('   You need to run the migration first:')
      console.log('   supabase/migrations/20251125_add_genre_gradient_colors.sql')
      console.log('\n   To apply it, run this SQL in your Supabase SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/_/sql/new\n')
      process.exit(1)
    }

    console.log('✅ Database schema is up to date\n')

    // Deactivate ALL existing genres first
    console.log('🧹 Deactivating all existing genres...')
    const { error: deactivateError } = await supabase
      .from('genre')
      .update({ is_active: false })
      .neq('name', '___placeholder___') // Match all rows

    if (deactivateError) {
      console.error('❌ Error deactivating genres:', deactivateError)
    } else {
      console.log('   ✅ All existing genres deactivated\n')
    }

    // Upsert each new genre
    let updatedCount = 0
    let insertedCount = 0

    for (const genre of genreUpdates) {
      console.log(`🔄 Processing: ${genre.emoji} ${genre.display_name}`)

      // Check if genre exists
      const { data: existing } = await supabase
        .from('genre')
        .select('name')
        .eq('name', genre.name)
        .single()

      if (existing) {
        // Update existing genre
        const { error: updateError } = await supabase
          .from('genre')
          .update(genre)
          .eq('name', genre.name)

        if (updateError) {
          console.error(`   ❌ Error updating ${genre.name}:`, updateError)
        } else {
          console.log(`   ✅ Updated`)
          updatedCount++
        }
      } else {
        // Insert new genre
        const { error: insertError } = await supabase
          .from('genre')
          .insert([genre])

        if (insertError) {
          console.error(`   ❌ Error inserting ${genre.name}:`, insertError)
        } else {
          console.log(`   ✅ Inserted (new)`)
          insertedCount++
        }
      }
    }

    // Fetch and display all active genres
    console.log('\n📋 Active Norwegian-optimized genres:')
    const { data: finalGenres } = await supabase
      .from('genre')
      .select('display_name, emoji, suno_prompt_template, gradient_colors, sort_order')
      .eq('is_active', true)
      .order('sort_order')

    finalGenres?.forEach((g, i) => {
      const gradientFrom = g.gradient_colors?.from || 'N/A'
      const gradientTo = g.gradient_colors?.to || 'N/A'
      console.log(`  ${i + 1}. ${g.emoji} ${g.display_name}`)
      console.log(`     Prompt: "${g.suno_prompt_template}"`)
      console.log(`     Gradient: ${gradientFrom} → ${gradientTo}`)
    })

    console.log(`\n✨ Summary:`)
    console.log(`   • ${insertedCount} genres inserted`)
    console.log(`   • ${updatedCount} genres updated`)
    console.log(`   • ${finalGenres?.length || 0} total active genres`)
    console.log(`\n🎉 Genres successfully updated with Norwegian optimization!`)

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

updateGenresWithGradients()
