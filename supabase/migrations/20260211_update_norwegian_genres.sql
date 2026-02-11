-- Migration: Update Norwegian genre list with optimized Suno prompts
-- Date: 2026-02-11
-- Description: Replaces old genre set with 8 Norwegian-optimized genres.
--   Each Suno prompt includes "Norwegian" twice for vocal optimization.
--   Adds Russelåt as new genre. Removes Folkeballade, Rockballade.

-- Step 1: Deactivate all existing genres
UPDATE genre SET is_active = false;

-- Step 2: Upsert new genres (insert or update by name)

-- 1. Elektronisk (replaces electronic-dance / Dans/Elektronisk)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'elektronisk',
  'Elektronisk',
  'Energetic electronic dance music with synth drops',
  '💃',
  'Norwegian elektronisk, energetic synth drops, driving four-on-the-floor beat, festival EDM, euphoric build-ups, powerful Norwegian vocals, modern production',
  '{"from": "#06D6A0", "to": "#3B82F6"}'::jsonb,
  1,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 2. Festlåt (replaces party-anthem)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'festlaat',
  'Festlåt',
  'Sing-along party anthems for celebrations',
  '🎉',
  'Norwegian festlåt, sing-along party anthem, catchy hook, upbeat tempo, allsang-vennlig, brass hits, clap-along rhythm, energetic Norwegian group vocals, feel-good celebration',
  '{"from": "#FFC93C", "to": "#E94560"}'::jsonb,
  2,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 3. Rap/Hip-Hop (keeps rap-hiphop)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'rap-hiphop',
  'Rap/Hip-Hop',
  'Norwegian rap with hard-hitting beats',
  '🎤',
  'Norwegian rap, hard-hitting 808 bass, trap drums, aggressive flow, dark atmospheric synths, modern hip-hop production, confident Norwegian rap vocals',
  '{"from": "#0F3460", "to": "#8B5CF6"}'::jsonb,
  3,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 4. Russelåt (NEW genre)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'russelaat',
  'Russelåt',
  'High-energy party anthem for russ celebrations',
  '🚌',
  'Norwegian russelåt, high-energy party, heavy bass drops, EDM-trap fusion, anthemic chants, festival production, youthful Norwegian vocals, celebratory',
  '{"from": "#E94560", "to": "#8B5CF6"}'::jsonb,
  4,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 5. Pop (replaces norwegian-pop / Norsk pop)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'pop',
  'Pop',
  'Modern Norwegian pop with polished production',
  '🎵',
  'Norwegian pop, polished studio production, catchy melodic hooks, warm synth pads, tight drums, radio-friendly, emotional Norwegian vocals, uplifting, modern Scandinavian sound',
  '{"from": "#0F3460", "to": "#E94560"}'::jsonb,
  5,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 6. Rock (replaces rock-ballad / Rockballade)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'rock',
  'Rock',
  'Driving rock with electric guitar riffs',
  '🎸',
  'Norwegian rock, driving electric guitar riffs, punchy live drums, distorted power chords, anthemic chorus, arena energy, raw Norwegian vocals',
  '{"from": "#8B5CF6", "to": "#E94560"}'::jsonb,
  6,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 7. Country (replaces country-rock / Countryrock)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'country',
  'Country',
  'Acoustic country with Norwegian warmth',
  '🤠',
  'Norwegian country, acoustic steel-string guitar, fiddle, warm storytelling, steady backbeat, Americana-inspired, heartfelt Norwegian vocals, rustic and authentic',
  '{"from": "#E94560", "to": "#FFC93C"}'::jsonb,
  7,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 8. Akustisk (replaces singer-songwriter)
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, gradient_colors, sort_order, is_active)
VALUES (
  'akustisk',
  'Akustisk',
  'Intimate acoustic singer-songwriter',
  '🎹',
  'Norwegian akustisk, fingerpicked acoustic guitar, intimate and warm, soft percussion, gentle piano, singer-songwriter, vulnerable breathy Norwegian vocals, stripped-back production',
  '{"from": "#FB923C", "to": "#92400E"}'::jsonb,
  8,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  suno_prompt_template = EXCLUDED.suno_prompt_template,
  gradient_colors = EXCLUDED.gradient_colors,
  sort_order = EXCLUDED.sort_order,
  is_active = true;
