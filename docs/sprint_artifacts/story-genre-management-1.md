# Story 1: Add Genre Edit Mode with Remove Functionality

**Epic:** Genre Management & AI Assistant
**Story ID:** genre-management-1
**Change Request:** CR-003
**Priority:** MEDIUM
**Type:** Feature Enhancement
**Estimated Effort:** 6 hours

---

## User Story

**As a** user managing my music genres,
**I want** to enter an edit mode where I can remove genres from the main grid,
**So that** I can customize my genre selection and remove genres I don't use.

---

## Context

Currently, the genre selection grid displays 4 default genres with no way to remove or customize them. Users need the ability to manage their active genres by removing ones they don't use. This story implements an edit mode with visual remove buttons and archive functionality (soft delete).

**Dependencies:**
- UI Modernization Epic completed (CR-002 simplified genre grid)

**Related Change Requests:**
- CR-006: Undo snackbar (Story 2 - will enhance this feature)
- CR-004: AI prompt assistant (Story 3 - will add new genres)
- CR-005: Genre library modal (Story 4 - will manage archived genres)

---

## Acceptance Criteria

**Given** I am viewing the genre selection section
**When** I interact with edit mode
**Then**:

1. ✅ "Rediger" button appears in genre section header (top-right)
2. ✅ Clicking "Rediger" toggles edit mode ON
3. ✅ In edit mode:
   - Button text changes to "Ferdig"
   - Button background becomes orange (active state)
   - Red X button appears on each genre chip (top-right corner)
   - Genre chips cannot be selected (selection disabled)
   - Cursor shows "not-allowed" on hover
4. ✅ Clicking X button removes genre from grid
5. ✅ Removed genre is archived (not permanently deleted)
6. ✅ Clicking "Ferdig" exits edit mode
7. ✅ Edit mode state persists until manually toggled off
8. ✅ X buttons have smooth hover states (scale up, darker red)
9. ✅ No console errors or warnings
10. ✅ Works on mobile, tablet, and desktop

**Out of Scope (Future Stories):**
- Undo snackbar (Story 2)
- Restoring archived genres (Story 4 - Genre Library)
- Genre persistence across sessions (Story 4)

---

## Implementation Details

### Files to Create/Update

1. **src/components/genre-selection.tsx** (PRIMARY)
   - Add edit mode state management
   - Add "Rediger" toggle button in header
   - Add X remove buttons on genre chips
   - Disable genre selection in edit mode
   - Implement genre removal with archive logic

2. **src/lib/constants.ts** (OPTIONAL)
   - Add `ENABLE_GENRE_EDIT_MODE` feature flag if needed

3. **src/app/globals.css** (STYLING)
   - Add edit button styles
   - Add remove button (X) styles
   - Add active state styling

### Technical Approach

**1. State Management (genre-selection.tsx):**
```typescript
import { useState } from 'react'
import { X } from 'lucide-react'

const [editMode, setEditMode] = useState(false)

const toggleEditMode = () => {
  setEditMode(!editMode)
}

const removeGenre = (genreId: string) => {
  if (!editMode) return

  // Archive genre (soft delete - keep for future restore)
  const updatedGenres = displayGenres.filter(g => g.id !== genreId)

  // TODO: In Story 2, this will trigger undo snackbar
  // TODO: In Story 4, archived genres will be stored for restore

  console.log(`Genre ${genreId} archived`)
}
```

**2. Edit Button (Section Header):**
```tsx
<div className="flex items-center justify-between mb-3">
  <div className="text-sm font-bold text-text-secondary uppercase tracking-wide">
    Velg sjanger
  </div>
  <button
    onClick={toggleEditMode}
    className={cn(
      "px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all",
      "border border-border hover:border-border-focus",
      editMode
        ? "bg-primary text-white border-primary"
        : "bg-transparent text-text-secondary"
    )}
  >
    {editMode ? 'Ferdig' : 'Rediger'}
  </button>
</div>
```

**3. Genre Chip with Remove Button:**
```tsx
<Button
  key={genre.id}
  onClick={() => !editMode && handleGenreSelect(genre.id)}
  className={cn(
    "relative h-[70px] px-4 text-[15px] font-bold rounded-lg",
    "transition-all border-2",
    selectedGenre === genre.id && !editMode
      ? "bg-primary text-white border-primary"
      : "bg-surface border-border hover:border-border-focus",
    editMode && "cursor-not-allowed opacity-75"
  )}
  disabled={editMode}
>
  {genre.display_name}

  {editMode && (
    <button
      onClick={(e) => {
        e.stopPropagation()
        removeGenre(genre.id)
      }}
      className={cn(
        "absolute top-2 right-2 w-6 h-6 rounded-full",
        "bg-red-600 hover:bg-red-700 flex items-center justify-center",
        "transition-all hover:scale-110"
      )}
    >
      <X className="w-4 h-4 text-white" />
    </button>
  )}
</Button>
```

**4. CSS Additions (globals.css):**
```css
/* Edit mode button active state */
.edit-btn.active {
  background: hsl(var(--primary));
  color: white;
  border-color: hsl(var(--primary));
}

/* Remove button (X) */
.genre-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(239, 71, 111, 0.9); /* Red */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.genre-remove-btn:hover {
  background: rgba(220, 38, 81, 1); /* Darker red */
  transform: scale(1.1);
}
```

---

## Testing Requirements

### Manual Testing Checklist

1. **Edit Button Visibility:**
   - [ ] "Rediger" button appears in genre section header
   - [ ] Button has pill shape (rounded-full)
   - [ ] Button has border and proper padding

2. **Toggling Edit Mode:**
   - [ ] Click "Rediger" → text changes to "Ferdig"
   - [ ] Background changes to orange (#FF6B35)
   - [ ] Text becomes white
   - [ ] Border becomes orange

3. **Edit Mode Active State:**
   - [ ] Red X buttons appear on ALL genre chips
   - [ ] X buttons are positioned in top-right corner
   - [ ] Genre chips cannot be clicked (selection disabled)
   - [ ] Cursor shows "not-allowed" when hovering genres
   - [ ] Chips have reduced opacity (75%)

4. **Remove Functionality:**
   - [ ] Click X button → genre disappears from grid
   - [ ] Click doesn't also trigger genre selection
   - [ ] Removing genre doesn't exit edit mode
   - [ ] Can remove multiple genres sequentially

5. **Exiting Edit Mode:**
   - [ ] Click "Ferdig" → edit mode turns off
   - [ ] X buttons disappear
   - [ ] Genre selection re-enabled
   - [ ] Button reverts to "Rediger" text
   - [ ] Background becomes transparent

6. **Visual & Interaction:**
   - [ ] X button hover effect (scales up, darker red)
   - [ ] Smooth transitions on all state changes
   - [ ] No layout shifts when toggling modes
   - [ ] Works on 375px mobile width
   - [ ] Works on 768px tablet width
   - [ ] Works on 1440px desktop width

7. **Edge Cases:**
   - [ ] What happens if user removes all genres? (Grid should be empty)
   - [ ] Can user toggle edit mode rapidly? (No errors)
   - [ ] Does "+ Legg til sjanger" button still work? (Yes, should work)

8. **Console & Build:**
   - [ ] No TypeScript errors
   - [ ] No console warnings
   - [ ] Build compiles successfully
   - [ ] No React key warnings

---

## Dependencies

**Prerequisites:**
- Story 3 from UI Modernization Epic (Genre Grid Simplification) - COMPLETE ✅

**Blocks:**
- Story 2: Undo Snackbar (will add undo functionality to remove action)
- Story 4: Genre Library Modal (will show archived genres and restore)

---

## Technical Notes

**Why Archive Instead of Delete:**
- Preserves data for undo functionality (Story 2)
- Allows restoration via Genre Library (Story 4)
- No data loss if user removes by accident
- Easy rollback if needed

**Future Enhancements (Not in This Story):**
1. **Story 2**: Snackbar appears on remove with "Angre" button
2. **Story 4**: Archived genres viewable in library modal
3. **Story 4**: Genres persist to localStorage or database
4. **Story 4**: Can restore archived genres from library

**Performance Considerations:**
- Edit mode is pure client-side state (no API calls)
- Removing genres filters array (O(n) operation, acceptable for <50 genres)
- No database updates in this story (localStorage will come in Story 4)

---

## Definition of Done

- [ ] Code implemented and committed
- [ ] All 10 acceptance criteria met
- [ ] Manual testing checklist 100% complete
- [ ] "Rediger" button visible and functional
- [ ] Edit mode toggles correctly
- [ ] X buttons appear only in edit mode
- [ ] Genres can be removed from grid
- [ ] Removed genres are archived (not deleted)
- [ ] No TypeScript or console errors
- [ ] Build successful
- [ ] Tested on mobile, tablet, desktop
- [ ] Ready to merge

---

## Implementation Summary

**Status:** BACKLOG (Ready for Development)

**Next Steps:**
1. DEV: Implement edit mode state in genre-selection.tsx
2. DEV: Add "Rediger" button to section header
3. DEV: Add X remove buttons with conditional rendering
4. DEV: Implement genre removal with archive logic
5. DEV: Add CSS styles for edit button and remove button
6. DEV: Test on all screen sizes
7. DEV: Commit changes and mark story ready for review

**After This Story:**
- Move to Story 2: Add Undo Snackbar (CR-006)
- Then Story 3: AI Prompt Assistant (CR-004)
- Then Story 4: Genre Library Modal (CR-005)

---

## Reference

**Change Request:** See `docs/AIMusikk_Change_Requests.md` section "CR-003: Add Genre Edit Mode"

**Related Files:**
- `src/components/genre-selection.tsx` - Genre grid component
- `src/lib/constants.ts` - Constants and feature flags
- `src/app/globals.css` - Global styles
- `docs/epic-ui-modernization.md` - Previous epic (prerequisite)

---

**Story Created:** 2026-01-16
**Story Ready for Development:** YES ✅
