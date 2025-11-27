# Story 1.3: Redesigned Lyrics Section

**Status:** Review

---

## User Story

As a **user**,
I want **a clear lyrics input where I can type directly or optionally use AI**,
So that **I understand how to create songs with my own text or get AI help**.

---

## Acceptance Criteria

**AC #1:** Given I view the homepage, when I see the lyrics section, then there is a main textarea labeled "Tekst" that is always visible

**AC #2:** Given the textarea is visible, when I type in it, then my text is captured as lyrics (no AI involved)

**AC #3:** Given the "Norsk uttale" toggle is visible, when I toggle it on/off, then phonetic optimization is applied/removed from my lyrics

**AC #4:** Given I click "Generer tekst", when the button is clicked, then a concept input area expands below

**AC #5:** Given I enter a concept and click generate, when AI generates lyrics, then the generated text populates the main textarea and the concept input collapses

---

## Implementation Details

### Tasks / Subtasks

- [x] Create `src/components/lyrics-input-section.tsx` (AC: #1, #2, #4, #5)
  - [x] Add main Textarea with "Tekst" label (always visible)
  - [x] Add lyrics state management
  - [x] Add "Generer tekst" button (collapsed state)
  - [x] Add expandable concept input section
  - [x] Integrate ConceptInput component when expanded
  - [x] Handle AI generation → populate textarea → collapse
  - [x] Handle manual typing
- [x] Integrate pronunciation toggle (AC: #3)
  - [x] Import and add PronunciationToggle component
  - [x] Wire up toggle state
  - [x] Apply/remove optimization when toggled
- [x] Modify `src/components/pronunciation-toggle.tsx` (AC: #3)
  - [x] Change label from "Uttalelse Bokmål" to "Norsk uttale"
- [x] Modify `src/app/page.tsx` (AC: #1, #2, #3, #4, #5)
  - [x] Remove old lyrics generation flow
  - [x] Import LyricsInputSection
  - [x] Replace current lyrics area with new component
  - [x] Adjust state management for new flow
  - [x] Remove "Generer tekst med AI" as primary button
- [x] Manual testing
  - [x] Verify textarea labeled "Tekst" is visible
  - [x] Verify typing directly works
  - [x] Verify toggle labeled "Norsk uttale"
  - [x] Verify "Generer tekst" expands concept input
  - [x] Verify AI generation populates textarea
  - [x] Verify concept area collapses after generation

### Technical Summary

Create a new `LyricsInputSection` component that inverts the current flow. The main textarea for lyrics is always visible and editable. The "Norsk uttale" toggle applies phonetic optimization. The "Generer tekst" button is secondary - clicking it expands the concept input for AI generation. After AI generates, the text populates the main textarea and the concept area collapses. This supports both manual and AI-assisted workflows clearly.

### Project Structure Notes

- **Files to modify:**
  - `src/components/lyrics-input-section.tsx` (CREATE)
  - `src/components/pronunciation-toggle.tsx` (MODIFY - rename label)
  - `src/app/page.tsx` (MODIFY - use new component)
- **Expected test locations:** Manual testing via localhost:3000
- **Estimated effort:** 2 story points
- **Prerequisites:** None (can be done in parallel with Story 1.1)

### Key Code References

- Current lyrics flow: `src/app/page.tsx:94-163`
- LyricsEditor component: `src/components/lyrics-editor.tsx`
- PronunciationToggle: `src/components/pronunciation-toggle.tsx`
- ConceptInput: `src/components/concept-input.tsx`
- Textarea component: `src/components/ui/textarea.tsx`
- Switch component: `src/components/ui/switch.tsx`

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
1. Create new LyricsInputSection component with redesigned flow
2. Move pronunciation toggle into the new component
3. Change label from "Uttalelse Bokmål" to "Norsk uttale"
4. Update page.tsx to use the new component

### Completion Notes

**New LyricsInputSection Component:**
- Main "Tekst" textarea always visible (users can type directly)
- Integrated "Norsk uttale" toggle with InfoTooltip
- Expandable "Generer tekst med AI" section with chevron animation
- ConceptInput appears when expanded
- Auto-collapses after AI generation completes
- Shows phonetic change preview button when optimization applied
- Re-optimize button when lyrics manually edited

**UX Flow Changes:**
- Before: Concept → Generate → Lyrics appear
- After: Lyrics textarea visible → Optional AI generation via expandable section
- Users now understand they can type directly OR use AI

**Pronunciation Toggle:**
- Renamed from "Uttalelse Bokmål" to "Norsk uttale" (clearer)
- Updated both original component and new integrated version

All acceptance criteria satisfied:
- AC #1: Textarea labeled "Tekst" always visible ✓
- AC #2: Typing directly captures lyrics (no AI) ✓
- AC #3: "Norsk uttale" toggle applies/removes optimization ✓
- AC #4: "Generer tekst" expands concept input ✓
- AC #5: AI populates textarea and collapses ✓

### Files Modified

- `src/components/lyrics-input-section.tsx` (CREATED)
- `src/components/pronunciation-toggle.tsx` (MODIFIED - label change)
- `src/app/page.tsx` (MODIFIED - use new component)

### Test Results

- Build: ✓ Compiled successfully
- Lint: ✓ No ESLint warnings or errors
- Type-check: ✓ All types valid

---

## Review Notes

<!-- Will be populated during code review -->
