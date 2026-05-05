-- =====================================================
-- Orphan Storage Finder
-- Date: 2026-05-05
-- Purpose:
--   Provide an RPC the orphan-purge cron route can call to identify
--   storage objects in the 'songs' bucket that have no matching
--   song.audio_url pointing at them. These are files left behind by
--   past hard-delete operations where storage.remove() failed and the
--   cron logged the error but proceeded with the row delete (per the
--   comment in /api/cron/song-retention).
--
-- Returns: TABLE(name TEXT, size_bytes BIGINT)
--   - name: the storage object key (relative to the bucket)
--   - size_bytes: file size from object metadata
--
-- Why a SECURITY DEFINER function:
--   - storage.objects isn't exposed to the Supabase JS client by default
--   - service-role can read it directly, but routing through a defined
--     function keeps the orphan logic in one place and lets us extend
--     it later (e.g. only orphans older than N days)
-- =====================================================

CREATE OR REPLACE FUNCTION public.find_orphan_storage_objects()
RETURNS TABLE(name TEXT, size_bytes BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT
    so.name::TEXT,
    COALESCE((so.metadata->>'size')::BIGINT, 0) AS size_bytes
  FROM storage.objects AS so
  WHERE so.bucket_id = 'songs'
    AND NOT EXISTS (
      SELECT 1 FROM public.song AS s
      WHERE s.audio_url LIKE '%' || so.name || '%'
    );
$$;

COMMENT ON FUNCTION public.find_orphan_storage_objects IS
  'Returns storage.objects entries in the songs bucket with no matching song.audio_url. Used by /api/cron/orphan-purge.';
