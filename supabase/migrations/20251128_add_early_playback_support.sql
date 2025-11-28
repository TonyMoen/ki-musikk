-- =====================================================
-- Musikkfabrikken - Early Playback Support Migration
-- Generated: 2025-11-28
-- Description: Add support for early audio playback with FIRST_SUCCESS status
-- Story: 3.11 - Implement Early Audio Playback with FIRST_SUCCESS Status
-- =====================================================

-- =====================================================
-- 1. ADD stream_audio_url COLUMN TO song TABLE
-- Stores the streaming audio URL available at FIRST_SUCCESS (before final download)
-- =====================================================
ALTER TABLE song
ADD COLUMN stream_audio_url TEXT;

COMMENT ON COLUMN song.stream_audio_url IS 'Streaming audio URL from Suno available at FIRST_SUCCESS status, used for early playback before final audio is ready';

-- =====================================================
-- 2. UPDATE status CHECK CONSTRAINT
-- Add 'partial' status for songs with early playback available
-- Add 'cancelled' status for cancelled generations
-- =====================================================

-- First, drop the existing constraint
ALTER TABLE song
DROP CONSTRAINT IF EXISTS song_status_check;

-- Add updated constraint with new statuses
ALTER TABLE song
ADD CONSTRAINT song_status_check
CHECK (status IN ('generating', 'partial', 'completed', 'failed', 'cancelled'));

-- Update comment to reflect new statuses
COMMENT ON COLUMN song.status IS 'Generation status: generating (in progress), partial (first track ready, can play), completed (final audio ready), failed (error), cancelled (user cancelled)';

-- =====================================================
-- Migration Complete
-- Next Steps:
-- 1. Run this migration: npx supabase db push
-- 2. Regenerate TypeScript types: npx supabase gen types typescript
-- 3. Update Song TypeScript interface to include stream_audio_url?: string
-- 4. Update status type to include 'partial' and 'cancelled'
-- =====================================================
