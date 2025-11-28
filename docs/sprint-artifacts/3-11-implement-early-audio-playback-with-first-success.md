# Story 3.11: Implement Early Audio Playback with FIRST_SUCCESS Status

Status: review

## Story

As a **user generating a song**,
I want **to start listening to my song as soon as the first track is ready** (FIRST_SUCCESS status),
so that **I don't have to wait for full generation completion before hearing my creation**.

## Background Research

### Suno API Status Flow
| Status | Meaning |
|--------|---------|
| `PENDING` | Processing/generating |
| `TEXT_SUCCESS` | Lyrics generated |
| `FIRST_SUCCESS` | **First track ready** - partial audio available |
| `SUCCESS` | All tracks complete |

### Available Response Fields
```typescript
sunoData: [{
  id: string
  audioUrl: string        // Final audio URL
  streamAudioUrl: string  // Streaming audio URL (available earlier)
  sourceAudioUrl: string  // Source audio URL
  imageUrl: string
  duration: number
  // ...
}]
```

### Key Insight
When status = `FIRST_SUCCESS`:
- The first generated track is ready
- `streamAudioUrl` should be available for immediate playback
- User can start listening ~20-40 seconds earlier than waiting for `SUCCESS`

## Acceptance Criteria

1. **AC1**: When polling returns `FIRST_SUCCESS` status, extract `streamAudioUrl` from response
2. **AC2**: Update song status in database to `partial` (new status) with `streamAudioUrl`
3. **AC3**: Frontend polling detects `partial` status and enables audio playback immediately
4. **AC4**: Progress UI shows "Ready to play!" state while generation continues
5. **AC5**: When `SUCCESS` status arrives, update to final `audioUrl` and `completed` status
6. **AC6**: If user is already playing `streamAudioUrl`, seamlessly continue (no interruption)
7. **AC7**: Handle case where `FIRST_SUCCESS` audio differs from final `SUCCESS` audio gracefully

## Tasks / Subtasks

- [x] **Task 1: Update Suno API types** (AC: 1)
  - [x] Verify `streamAudioUrl` field is captured in `SunoTaskStatusResponse`
  - [x] Add `FIRST_SUCCESS` to status union type if not present

- [x] **Task 2: Update song table schema** (AC: 2)
  - [x] Add `stream_audio_url` column to `song` table (nullable)
  - [x] Add `partial` to status enum (generating → partial → completed)
  - [x] Create migration file

- [x] **Task 3: Update polling fallback in `/api/songs/[id]`** (AC: 1, 2)
  - [x] Handle `FIRST_SUCCESS` status in addition to `SUCCESS`
  - [x] When `FIRST_SUCCESS`: save `streamAudioUrl` to `stream_audio_url`, set status to `partial`
  - [x] When `SUCCESS`: save final `audioUrl`, download to storage, set status to `completed`

- [x] **Task 4: Update webhook handler** (AC: 1, 2)
  - [x] Handle `FIRST_SUCCESS` callback if Suno sends intermediate callbacks
  - [x] Maintain idempotency (don't overwrite `completed` with `partial`)

- [x] **Task 5: Update frontend polling logic** (AC: 3, 4)
  - [x] In `homepage-songs.tsx`: detect `partial` status
  - [x] Enable playback when `partial` with `streamAudioUrl` available
  - [x] Continue polling until `completed`
  - [x] Update progress UI to show "Ready to play!" state

- [x] **Task 6: Update SongCard component** (AC: 3, 4)
  - [x] Add visual state for `partial` (playable but still generating)
  - [x] Show play button when audio available
  - [x] Show subtle "finalizing..." indicator

- [x] **Task 7: Handle audio URL transition** (AC: 5, 6, 7)
  - [x] If user started playing `streamAudioUrl` and `SUCCESS` arrives:
    - **Chosen: Option A** - Let current playback continue until song ends
    - Implementation: Modal plays URL passed at open time; SUCCESS updates DB but doesn't interrupt
    - When user closes and reopens, they get final audioUrl from completed song
  - [x] No jarring audio transitions or playback interruptions

- [x] **Task 8: Testing** (AC: all)
  - [x] Build passes successfully
  - [x] Lint passes with no errors
  - [x] TypeScript type check passes
  - [ ] Manual testing: `FIRST_SUCCESS` → `SUCCESS` flow (requires Suno API)
  - [ ] Manual testing: Playback during partial state
  - [ ] Manual testing: Error handling if `FIRST_SUCCESS` arrives but no `streamAudioUrl`

## Dev Notes

### Current Implementation Gap
The current polling in `/api/songs/[id]/route.ts` only checks for:
- `SUCCESS` → mark completed
- `CREATE_TASK_FAILED`, `GENERATE_AUDIO_FAILED`, etc. → mark failed

It does NOT handle `FIRST_SUCCESS` which could provide audio 20-40 seconds earlier.

### Architecture Decision Needed
**Question**: Should we download `streamAudioUrl` to Supabase Storage like we do with final `audioUrl`?

Options:
1. **Use directly**: Just store Suno's `streamAudioUrl` in DB, don't download
   - Pro: Faster, no storage cost
   - Con: URL may expire, depends on Suno availability

2. **Download and store**: Download to storage like final audio
   - Pro: Consistent, reliable
   - Con: Extra storage, extra latency, may be replaced soon anyway

**Recommendation**: Use Suno's `streamAudioUrl` directly for `partial` status (don't download), only download final `audioUrl` on `SUCCESS`.

### Testing Strategy
- Mock Suno API responses with different status sequences
- Test UI transitions between states
- Verify no audio glitches when transitioning

### References

- [Source: Suno API Get Music Generation Details](https://docs.sunoapi.org/suno-api/get-music-generation-details)
- [Source: src/lib/api/suno.ts] - Current Suno API wrapper with types
- [Source: src/app/api/songs/[id]/route.ts] - Polling fallback implementation
- [Source: src/app/api/webhooks/suno/route.ts] - Webhook handler
- [Source: src/components/homepage-songs.tsx] - Frontend polling logic

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/3-11-implement-early-audio-playback-with-first-success.context.xml`

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

- Verified Suno API types already include `FIRST_SUCCESS` status and `streamAudioUrl` field
- Created migration `20251128_add_early_playback_support.sql` for `stream_audio_url` column and status enum update
- Updated polling fallback to handle `FIRST_SUCCESS` → `partial` status transition
- Updated webhook handler to process `FIRST_SUCCESS` callbacks with idempotency
- Extended generating-song-store with `isPartial`, `streamAudioUrl`, `duration` fields
- Frontend polling now detects partial status and enables immediate playback
- SongCard shows playable state with subtle "Ferdigstilles..." indicator for partial songs
- SongPlayerCard shows "⏳ Ferdigstilles..." badge for partial playback
- Chose Option A for audio transition: let current playback continue (no interruption)
- Build, lint, and TypeScript all pass

### File List

**New files:**
- `supabase/migrations/20251128_add_early_playback_support.sql`

**Modified files:**
- `src/types/song.ts` - Added `stream_audio_url` field and `partial` status
- `src/types/supabase.ts` - Updated song table types with new fields
- `src/stores/generating-song-store.ts` - Added `isPartial`, `streamAudioUrl`, `duration`, `updateGeneratingSong`
- `src/app/api/songs/[id]/route.ts` - Added FIRST_SUCCESS and partial status handling
- `src/app/api/webhooks/suno/route.ts` - Added FIRST_SUCCESS webhook handling
- `src/components/homepage-songs.tsx` - Added partial status polling and UI updates
- `src/components/song-card.tsx` - Added `isPartial` prop with visual states
- `src/components/song-player-card.tsx` - Added `isPartial` prop with badge

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-28 | Story drafted based on Suno API research | Amelia (Dev Agent) |
