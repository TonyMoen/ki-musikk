-- =====================================================
-- Database Cleanup & Maintenance
-- Date: 2026-05-03
-- Purpose:
--   1. Drop unused mastering_request table (feature never shipped)
--   2. Add maintenance functions for rate-limit + stale Vipps payment rows
--
-- Notes:
--   - Soft-deleted song rows are intentionally NOT purged here (per Tony, defer)
--   - Maintenance functions are callable but NOT scheduled.
--     Schedule from Vercel cron or wire into pg_cron once enabled.
-- =====================================================

-- =====================================================
-- 1. DROP UNUSED TABLE: mastering_request
-- =====================================================
-- Defined in 20251120_initial_schema.sql but never wired to any code path.
-- The live DB may or may not have this table — guard the whole block on
-- to_regclass so this migration is safe to re-run and works whether or not
-- the table was ever created.
--
-- Safety:
--   - DROP RESTRICT (not CASCADE) — fails loudly if any data exists.
--     If you want to drop with data, change to CASCADE explicitly.
--
-- src/types/supabase.ts will need regeneration after apply.

DO $$
BEGIN
  IF to_regclass('public.mastering_request') IS NOT NULL THEN
    DROP POLICY IF EXISTS mastering_request_select ON mastering_request;
    DROP POLICY IF EXISTS mastering_request_insert ON mastering_request;
    DROP POLICY IF EXISTS mastering_request_update ON mastering_request;
    DROP INDEX IF EXISTS idx_mastering_request_status;
    DROP TABLE mastering_request RESTRICT;
    RAISE NOTICE 'Dropped mastering_request table.';
  ELSE
    RAISE NOTICE 'mastering_request table does not exist — nothing to drop.';
  END IF;
END $$;

-- =====================================================
-- 2. MAINTENANCE: cleanup_lyrics_rate_limit
-- =====================================================
-- Anonymous entries: 24h retention (matches anon rate-limit window)
-- Authenticated entries: 1h retention (matches user rate-limit window)
-- Returns count of rows deleted for observability.

CREATE OR REPLACE FUNCTION cleanup_lyrics_rate_limit()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  WITH purged AS (
    DELETE FROM lyrics_rate_limit
    WHERE
      (user_id IS NULL  AND created_at < NOW() - INTERVAL '24 hours')
      OR
      (user_id IS NOT NULL AND created_at < NOW() - INTERVAL '1 hour')
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM purged;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION cleanup_lyrics_rate_limit IS
  'Purge expired rate-limit rows. Anon: >24h. Authed: >1h. Returns rows deleted.';

-- =====================================================
-- 3. MAINTENANCE: cleanup_stale_vipps_payments
-- =====================================================
-- Vipps payments stuck in 'pending' beyond a safe window are abandoned
-- checkouts. Mark them as 'cancelled' to free the unique reference and
-- reflect reality.
--
-- 30-minute window: Vipps mobile checkout typically completes in <5min.
-- 30min is generous and avoids racing live callbacks.

CREATE OR REPLACE FUNCTION cleanup_stale_vipps_payments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  WITH cancelled AS (
    UPDATE vipps_payment
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '30 minutes'
    RETURNING id
  )
  SELECT count(*) INTO v_updated FROM cancelled;

  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION cleanup_stale_vipps_payments IS
  'Mark Vipps payments stuck pending >30min as cancelled. Returns rows updated.';

-- =====================================================
-- 4. RETENTION: soft_delete_old_songs
-- =====================================================
-- Song retention policy (matches user-facing T&C "Lagring og sletting"):
--   - 30 days after created_at: soft-delete (hidden from user — matches T&C)
--   - 60 days after created_at: hard-delete (row + storage MP3 removed)
--
-- The 30-day gap between soft and hard delete is an internal ops safety
-- window. From the user's perspective, songs disappear at day 30 as promised.
--
-- Hard-delete is NOT done here — it lives in /api/cron/song-retention because
-- it must also remove files from the Supabase Storage bucket via the JS API.
-- This SQL function only handles step 1 (soft-delete).
--
-- Idempotent: running twice in the same minute is a no-op (deleted_at IS NULL filter).

CREATE OR REPLACE FUNCTION soft_delete_old_songs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  WITH soft_deleted AS (
    UPDATE song
    SET deleted_at = NOW(),
        updated_at = NOW()
    WHERE deleted_at IS NULL
      AND created_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT count(*) INTO v_updated FROM soft_deleted;

  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION soft_delete_old_songs IS
  'Soft-delete songs older than 30 days (matches T&C). Returns rows updated. Hard-delete at 60d handled by cron route.';

-- =====================================================
-- 5. POST-APPLY CHECKLIST (run manually)
-- =====================================================
-- a) Verify mastering_request gone:
--      SELECT to_regclass('public.mastering_request');  -- expect NULL
--
-- b) Smoke-test maintenance functions:
--      SELECT cleanup_lyrics_rate_limit();
--      SELECT cleanup_stale_vipps_payments();
--      SELECT soft_delete_old_songs();
--
-- c) TS types already cleaned in src/types/supabase.ts and src/lib/constants.ts.
--
-- d) Cron wiring:
--      - Song retention runs daily via /api/cron/song-retention (Vercel cron, see vercel.json).
--        Set CRON_SECRET in Vercel env to authenticate the route.
--      - Rate-limit + Vipps cleanup are NOT yet scheduled. Either:
--          (i)  Add additional Vercel cron entries hitting new API routes
--          (ii) Enable pg_cron in Supabase dashboard, then:
--                 SELECT cron.schedule('lyrics-rl-cleanup', '*/15 * * * *',
--                   'SELECT cleanup_lyrics_rate_limit()');
--                 SELECT cron.schedule('vipps-stale-cleanup', '*/10 * * * *',
--                   'SELECT cleanup_stale_vipps_payments()');
