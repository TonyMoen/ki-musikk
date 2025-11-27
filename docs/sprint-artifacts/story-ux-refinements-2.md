# Story 1.2: Inline Generation Status

**Status:** Review

---

## User Story

As a **user**,
I want **to see my song generating in the list instead of a blocking modal**,
So that **I can continue browsing while my song is being created**.

---

## Acceptance Criteria

**AC #1:** Given I start generating a song, when the generation begins, then no blocking modal appears

**AC #2:** Given a song is generating, when I view the homepage songs section, then the generating song appears at the top with a spinner/progress indicator

**AC #3:** Given a song is generating, when I wait, then the status updates in real-time via polling (every 5 seconds)

**AC #4:** Given a song completes, when the status changes to 'completed', then it becomes a normal clickable song in the list

**AC #5:** Given a song fails, when the status changes to 'failed', then a toast error is shown and the generating indicator is removed

---

## Implementation Details

### Tasks / Subtasks

- [x] Create Zustand store `src/stores/generating-song-store.ts` (AC: #1, #2)
  - [x] Define GeneratingSongStore interface
  - [x] Add generatingSong state (id, title, genre, startedAt)
  - [x] Add setGeneratingSong and clearGeneratingSong actions
- [x] Modify `src/components/song-card.tsx` for generating variant (AC: #2)
  - [x] Add `isGenerating?: boolean` prop
  - [x] Render spinner instead of play icon when generating
  - [x] Add pulse animation to card background
  - [x] Disable click handler when generating
  - [x] Show "Genererer..." text
- [x] Modify `src/components/homepage-songs.tsx` (AC: #2, #3, #4, #5)
  - [x] Subscribe to generating song store
  - [x] Render generating song at top of list (if exists)
  - [x] Implement polling logic (reuse from generation-progress-modal)
  - [x] On completion: clear store, refetch songs list
  - [x] On failure: clear store, show error toast
- [x] Modify `src/app/page.tsx` (AC: #1)
  - [x] Remove GenerationProgressModal import and usage
  - [x] Use generating song store instead
  - [x] On generation start: setGeneratingSong with song data
- [x] Manual testing
  - [x] Verify no blocking modal appears
  - [x] Verify generating song shows at top of list
  - [x] Verify status updates via polling
  - [x] Verify completion updates list correctly
  - [x] Verify failure shows toast

### Technical Summary

Replace the blocking `GenerationProgressModal` with inline generation status. Create a Zustand store to track the currently generating song. Modify `SongCard` to render a "generating" variant with spinner and pulse animation. Update `HomepageSongs` to show the generating song at the top and poll for status updates. Reuse existing polling logic from the modal component.

### Project Structure Notes

- **Files to modify:**
  - `src/stores/generating-song-store.ts` (CREATE)
  - `src/components/song-card.tsx` (MODIFY)
  - `src/components/homepage-songs.tsx` (MODIFY)
  - `src/app/page.tsx` (MODIFY - remove modal usage)
- **Expected test locations:** Manual testing via localhost:3000
- **Estimated effort:** 3 story points
- **Prerequisites:** Story 1.1 (HomepageSongs component must exist)

### Key Code References

- Zustand store pattern: `src/stores/credits-store.ts`
- Polling logic: `src/components/generation-progress-modal.tsx:116-176`
- SongCard: `src/components/song-card.tsx`
- Error toast: `src/hooks/use-error-toast.tsx`

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:

- Brownfield codebase analysis
- Framework and library details with versions
- Existing patterns to follow
- Integration points and dependencies
- Complete implementation guidance

**Architecture:** N/A (quick-flow project)

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

**Implementation Plan:**
1. Create Zustand store for tracking generating song state
2. Add generating variant to SongCard with spinner/pulse animation
3. Add polling logic to HomepageSongs to track generation progress
4. Remove blocking modal from page.tsx and use store instead

### Completion Notes

**Zustand Store (`generating-song-store.ts`):**
- Simple store with `generatingSong` state (id, title, genre, startedAt)
- `setGeneratingSong` and `clearGeneratingSong` actions

**SongCard Generating Variant:**
- Added `isGenerating` prop to SongCard
- Shows spinner instead of play icon
- Pulse animation on card
- Disabled click handler
- "Genererer..." and "Vennligst vent..." text

**HomepageSongs Polling:**
- Polls `/api/songs/{id}` every 5 seconds
- Max 60 attempts (5 minute timeout)
- On completion: toast, clear store, refresh list
- On failure: error toast, clear store
- Generating song renders at top of list on first page

**Page.tsx Changes:**
- Removed `GenerationProgressModal` import and usage
- Added generating song store
- On generation start: adds song to store with toast

All acceptance criteria satisfied:
- AC #1: No blocking modal appears ✓
- AC #2: Generating song shows at top with spinner ✓
- AC #3: Status updates via polling (5 second interval) ✓
- AC #4: Completion updates list correctly ✓
- AC #5: Failure shows toast error ✓

### Files Modified

- `src/stores/generating-song-store.ts` (CREATED)
- `src/components/song-card.tsx` (MODIFIED - added isGenerating variant)
- `src/components/homepage-songs.tsx` (MODIFIED - added polling logic)
- `src/app/page.tsx` (MODIFIED - removed modal, use store)

### Test Results

- Build: ✓ Compiled successfully
- Lint: ✓ No ESLint warnings or errors
- Type-check: ✓ All types valid

---

## Review Notes

<!-- Will be populated during code review -->
