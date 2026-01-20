# Story 11-5: Fix Genre Selection UX Workflow

**Epic:** 11 - Genre Management & AI Assistant
**Story ID:** 11-5
**Story Key:** 11-5-fix-genre-selection-ux-workflow
**Status:** review
**Priority:** HIGH
**Type:** UX Fix / Enhancement

---

## User Story

**As a** user creating songs,
**I want** a clear, intuitive genre selection experience,
**So that** I can easily see my selected genre, edit prompts quickly, and add new genres through multiple methods.

---

## Context

The genre library modal (Story 11-4) was implemented but has several UX issues:
- Selected genre is not clearly visible on the main page
- "Legg til sjanger" only opens AI assistant, no option for manual prompt creation
- Genres added from library don't sync to main grid
- No quick way to edit/enhance prompts for existing genres

This story fixes the workflow and improves the overall genre selection UX.

---

## Acceptance Criteria

### AC1: Expandable Selected Genre Card
1. When a genre is selected, it expands below the 2x2 grid
2. Expanded card shows:
   - Genre name with selected indicator (star or checkmark)
   - Full Suno prompt text preview
   - "Rediger" button to edit the prompt
3. Non-selected genres remain in normal button state
4. Only one genre can be expanded at a time
5. Expansion animates smoothly

### AC2: "Legg til sjanger" Choice Modal
6. Clicking "Legg til sjanger" opens a choice modal with 3 options:
   - "Egendefinert prompt" - Opens custom prompt form (name + prompt text)
   - "AI-assistent" - Opens existing AI chat assistant
   - "Bibliotek" - Opens genre library modal
7. Each option has icon and short description
8. Modal closes after selection, opening the chosen flow

### AC3: Custom Prompt Form (from choice modal)
9. "Egendefinert prompt" option opens inline form (same as in library)
10. Form has: genre name input, Suno prompt textarea
11. "Opprett sjanger" button creates and adds to main grid
12. New genre becomes selected automatically

### AC4: Library → Main Page Sync
13. Genres added from library modal appear in main 2x2 grid
14. If grid has 4+ genres, newest additions show (or scroll)
15. localStorage stays in sync with UI state
16. Adding from library auto-selects the new genre

### AC5: Fast Edit on Selected Genre
17. "Rediger" button on expanded card opens edit modal
18. Edit modal shows: genre name (editable), Suno prompt (editable)
19. "Lagre" saves changes, "Avbryt" cancels
20. Changes persist to localStorage
21. Works for both custom genres and standard genres (creates a copy if standard)

### AC6: Visual Clarity
22. Selected genre button has clear visual indicator (border, color, or icon)
23. Expanded section clearly belongs to selected genre
24. Prompt preview is readable but truncated if very long (with "vis mer" option)

---

## Tasks & Subtasks

### Task 1: Create Expandable Selected Genre Component
- [ ] 1.1: Create `src/components/genre-selection/expanded-genre-card.tsx`
- [ ] 1.2: Show genre name, prompt preview, "Rediger" button
- [ ] 1.3: Add smooth expand/collapse animation
- [ ] 1.4: Style with clear "selected" visual treatment

### Task 2: Create "Legg til sjanger" Choice Modal
- [ ] 2.1: Create `src/components/genre-selection/add-genre-modal.tsx`
- [ ] 2.2: Add three option buttons with icons and descriptions
- [ ] 2.3: Handle option selection and routing to correct flow
- [ ] 2.4: Close modal after selection

### Task 3: Integrate Custom Prompt Form
- [ ] 3.1: Reuse/adapt custom prompt form from library modal
- [ ] 3.2: Connect form submission to genre creation
- [ ] 3.3: Auto-select newly created genre

### Task 4: Fix Library → Main Page Sync
- [ ] 4.1: Debug and fix `handleLibraryGenreAdded` callback
- [ ] 4.2: Ensure genres persist to localStorage correctly
- [ ] 4.3: Ensure UI state updates when library adds genre
- [ ] 4.4: Test add → refresh → verify persistence

### Task 5: Implement Fast Edit Flow
- [ ] 5.1: Create edit modal for selected genre
- [ ] 5.2: Load current genre data into form
- [ ] 5.3: Save changes to localStorage and UI state
- [ ] 5.4: Handle standard genres (copy-on-edit)

### Task 6: Update Genre Selection Component
- [ ] 6.1: Replace "Legg til sjanger" direct action with choice modal
- [ ] 6.2: Add expanded card rendering below grid
- [ ] 6.3: Update selection state management
- [ ] 6.4: Ensure proper visual indicators on selected button

### Task 7: Testing and Validation
- [ ] 7.1: Test expandable card shows correct data
- [ ] 7.2: Test all three "Legg til" options work
- [ ] 7.3: Test library sync adds genres correctly
- [ ] 7.4: Test fast edit saves changes
- [ ] 7.5: Test localStorage persistence
- [ ] 7.6: Verify no console errors

---

## Implementation Details

### Expandable Selected Genre Card
```
┌──────────────┐  ┌──────────────┐
│ Classic Rock │  │ Chill Lofi   │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ Epic Orch.   │  │ ★ Indie Folk │ ← Selected (highlighted)
└──────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────┐
│ ★ Indie Folk                              [Rediger] │
│ ─────────────────────────────────────────────────── │
│ "indie folk, acoustic guitar, soft vocals,          │
│  organic sound, intimate atmosphere"                │
└─────────────────────────────────────────────────────┘
```

### Choice Modal Design
```
┌─────────────────────────────────────┐
│         Legg til sjanger            │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ✏️  Egendefinert prompt       │  │
│  │     Skriv din egen stil       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🤖  AI-assistent              │  │
│  │     Få hjelp til å lage       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📚  Bibliotek                 │  │
│  │     Velg fra maler            │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Files to Create
- `src/components/genre-selection/expanded-genre-card.tsx`
- `src/components/genre-selection/add-genre-modal.tsx`

### Files to Update
- `src/components/genre-selection.tsx` - Main component refactor
- `src/components/genre-library/modal.tsx` - Fix sync callbacks
- `src/hooks/use-genre-library.ts` - Ensure proper state updates

---

## Definition of Done

- [ ] Expandable selected genre card implemented
- [ ] Choice modal with 3 options working
- [ ] Custom prompt form accessible from choice modal
- [ ] Library genres sync to main page correctly
- [ ] Fast edit on selected genre working
- [ ] Visual selection indicator clear and prominent
- [ ] All changes persist to localStorage
- [ ] Build passes with no errors
- [ ] Manual testing complete

---

## Dev Agent Record

**Context Reference:**
- docs/sprint-artifacts/stories/11-5-fix-genre-selection-ux-workflow.md

**Implementation Notes:**
- (To be filled during implementation)

**Testing Notes:**
- (To be filled during testing)

---

**Story Created:** 2026-01-20
