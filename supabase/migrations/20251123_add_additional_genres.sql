-- =====================================================
-- Add Additional Genres for Genre Selection Component
-- Story 3.1: Create Genre Selection Component
-- Generated: 2025-11-23
-- =====================================================

-- Add 6 more genres to reach the 8+ genre requirement
INSERT INTO genre (name, display_name, description, emoji, suno_prompt_template, sort_order, is_active) VALUES
  (
    'rap-hiphop',
    'Rap/Hip-Hop',
    'Norwegian rap with urban rhythmic flow and modern beats',
    '🎤',
    'Hip-hop, rap, Norwegian flow, urban, rhythmic, modern beats',
    5,
    true
  ),
  (
    'rock-ballad',
    'Rock Ballad',
    'Emotional rock ballad with powerful vocals and guitar solo',
    '🎸',
    'Rock, ballad, emotional, guitar solo, powerful vocals',
    6,
    true
  ),
  (
    'indie-pop',
    'Indie Pop',
    'Indie pop with dreamy atmosphere and creative production',
    '✨',
    'Indie, pop, dreamy, atmospheric, creative, modern production',
    7,
    true
  ),
  (
    'blues-rock',
    'Blues Rock',
    'Blues rock with soulful guitar and gritty vocals',
    '🎵',
    'Blues, rock, soulful, guitar, gritty, emotional vocals',
    8,
    true
  ),
  (
    'electronic-dance',
    'Electronic Dance',
    'Upbeat electronic dance music with energetic beats',
    '🎧',
    'Electronic, dance, EDM, upbeat, energetic, synth, bass',
    9,
    true
  ),
  (
    'acoustic-singer-songwriter',
    'Acoustic Singer-Songwriter',
    'Intimate acoustic performance with heartfelt lyrics',
    '🎼',
    'Acoustic, singer-songwriter, intimate, heartfelt, guitar, vocal focus',
    10,
    true
  );

COMMENT ON TABLE genre IS 'Genre reference data with 10 Norwegian-optimized song genres';
