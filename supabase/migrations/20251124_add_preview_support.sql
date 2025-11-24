-- =====================================================
-- Musikkfabrikken - Preview Support Migration
-- Generated: 2025-11-24
-- Description: Add support for free 30-second preview songs
-- Story: 3.9 - Implement Free 30-Second Preview Generation
-- =====================================================

-- =====================================================
-- 1. ADD is_preview COLUMN TO song TABLE
-- Marks whether song is a free 30-second preview or full song
-- =====================================================
ALTER TABLE song
ADD COLUMN is_preview BOOLEAN DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN song.is_preview IS 'Whether song is a free 30-second preview (true) or full song (false)';

-- =====================================================
-- 2. CREATE INDEX FOR PREVIEW LIMIT CHECKING
-- Enables efficient checking of preview count per user per day
-- =====================================================
CREATE INDEX idx_user_preview_created ON song(user_id, is_preview, created_at)
WHERE is_preview = true;

COMMENT ON INDEX idx_user_preview_created IS 'Performance index for checking preview limit (1 per user per 24 hours)';

-- =====================================================
-- 3. UPDATE RLS POLICIES FOR PREVIEW SONGS
-- Preview songs don't require credit check, so RLS policies remain unchanged
-- Users can still only access their own songs (preview or full)
-- =====================================================

-- No RLS policy changes needed - existing policies allow preview creation:
-- - song_insert policy checks auth.uid() = user_id (no credit requirement)
-- - Credit validation is handled at application level, not database level

-- =====================================================
-- Migration Complete
-- Next Steps:
-- 1. Run this migration: npx supabase db push
-- 2. Regenerate TypeScript types: npx supabase gen types typescript
-- 3. Update Song TypeScript interface to include is_preview?: boolean
-- 4. Test migration rollback: npx supabase db reset (development only)
-- =====================================================
