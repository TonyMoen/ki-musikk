-- =====================================================
-- Add image_url to song table
-- Story 1.5: Unified Music Player with Lyrics Display
-- Generated: 2025-11-29
-- =====================================================

-- Add image_url column to song table
-- This stores the Suno-generated cover image URL
ALTER TABLE song ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN song.image_url IS 'Suno-generated cover image URL for the song';
