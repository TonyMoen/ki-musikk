# Story 2: Add Undo Snackbar for Genre Deletions

**Epic:** Genre Management & AI Assistant
**Story ID:** genre-management-2
**Change Request:** CR-006
**Priority:** MEDIUM
**Type:** UX Enhancement
**Estimated Effort:** 4 hours

---

## User Story

**As a** user who accidentally removes a genre,
**I want** to see an undo notification with a quick action button,
**So that** I can restore the genre within 5 seconds without going to the library.

---

## Context

After implementing edit mode (Story 1), users can remove genres from their grid. However, accidental deletions are easy and frustrating. This story adds a snackbar notification that appears when a genre is removed, offering a 5-second window to undo the action.

**Dependencies:**
- Story 11-1: Genre Edit Mode (MUST be complete - provides remove functionality)

**Related Change Requests:**
- CR-003: Genre edit mode (Story 1 - triggers the snackbar)
- CR-005: Genre library (Story 4 - permanent restore location)

---

## Acceptance Criteria

**Given** I have removed a genre in edit mode
**When** the genre is archived
**Then**:

1. ✅ Snackbar appears at bottom-center of screen
2. ✅ Snackbar slides up from `bottom: -80px` to `bottom: 24px`
3. ✅ Message shows: "{Genre Name} arkivert"
4. ✅ Orange "Angre" button is visible and clickable
5. ✅ Clicking "Angre" immediately restores the genre to grid
6. ✅ Snackbar auto-dismisses after 5 seconds
7. ✅ Only one snackbar visible at a time (new one replaces old)
8. ✅ Smooth slide-down animation when dismissing
9. ✅ Snackbar is above all other content (z-index: 150)
10. ✅ Works on mobile (doesn't block important UI)
11. ✅ No console errors or warnings
12. ✅ Restored genre appears in same position it was removed from

---

## Implementation Details

### Files to Create/Update

1. **src/components/snackbar.tsx** (NEW)
   - Create reusable Snackbar component
   - Handle visibility, animation, auto-dismiss
   - Accept message and undo callback

2. **src/hooks/use-snackbar.ts** (NEW)
   - Custom hook for snackbar state management
   - Handle show/hide/undo logic
   - Manage timeout for auto-dismiss

3. **src/components/genre-selection.tsx** (UPDATE)
   - Import and use snackbar hook
   - Trigger snackbar on genre removal
   - Implement restore logic for undo

4. **src/app/globals.css** (UPDATE)
   - Add snackbar animation keyframes
   - Add snackbar positioning styles

### Technical Approach

**1. Snackbar Component (src/components/snackbar.tsx):**
```typescript
'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SnackbarProps {
  visible: boolean
  message: string
  onUndo: () => void
  onDismiss: () => void
}

export function Snackbar({ visible, message, onUndo, onDismiss }: SnackbarProps) {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-[150]",
        "bg-elevated border border-border rounded-xl",
        "px-5 py-4 flex items-center gap-4",
        "shadow-lg max-w-[400px] w-[90%]",
        "transition-all duration-300 ease-out",
        visible ? "bottom-6 opacity-100" : "-bottom-20 opacity-0 pointer-events-none"
      )}
    >
      <span className="text-sm text-text-primary flex-1">{message}</span>
      <button
        onClick={onUndo}
        className={cn(
          "px-4 py-2 bg-primary hover:bg-primary-hover",
          "text-white text-[13px] font-bold rounded-md",
          "transition-colors"
        )}
      >
        Angre
      </button>
    </div>
  )
}
```

**2. Snackbar Hook (src/hooks/use-snackbar.ts):**
```typescript
import { useState, useCallback, useRef } from 'react'

interface SnackbarState {
  visible: boolean
  message: string
  undoCallback: (() => void) | null
}

export function useSnackbar() {
  const [state, setState] = useState<SnackbarState>({
    visible: false,
    message: '',
    undoCallback: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  const show = useCallback((message: string, onUndo: () => void) => {
    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState({
      visible: true,
      message,
      undoCallback: onUndo,
    })
  }, [])

  const hide = useCallback(() => {
    setState({
      visible: false,
      message: '',
      undoCallback: null,
    })

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleUndo = useCallback(() => {
    if (state.undoCallback) {
      state.undoCallback()
    }
    hide()
  }, [state.undoCallback, hide])

  return {
    visible: state.visible,
    message: state.message,
    show,
    hide,
    handleUndo,
  }
}
```

**3. Integration with Genre Selection (src/components/genre-selection.tsx):**
```typescript
import { useSnackbar } from '@/hooks/use-snackbar'
import { Snackbar } from '@/components/snackbar'

export function GenreSelection() {
  const snackbar = useSnackbar()
  const [removedGenreRef, setRemovedGenreRef] = useState<Genre | null>(null)

  const removeGenre = (genreId: string) => {
    if (!editMode) return

    const genreToRemove = displayGenres.find(g => g.id === genreId)
    if (!genreToRemove) return

    // Store reference for undo
    setRemovedGenreRef(genreToRemove)

    // Archive genre (remove from display)
    setDisplayGenres(displayGenres.filter(g => g.id !== genreId))

    // Show snackbar with undo callback
    snackbar.show(
      `${genreToRemove.display_name} arkivert`,
      () => restoreGenre(genreToRemove)
    )
  }

  const restoreGenre = (genre: Genre) => {
    // Restore genre to original position (or end of list)
    setDisplayGenres([...displayGenres, genre])
    setRemovedGenreRef(null)
  }

  return (
    <div>
      {/* Genre grid UI */}

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        onUndo={snackbar.handleUndo}
        onDismiss={snackbar.hide}
      />
    </div>
  )
}
```

**4. CSS Animations (src/app/globals.css):**
```css
/* Snackbar animations already handled by Tailwind transitions */
/* Additional styles if needed */

.snackbar-enter {
  animation: snackbar-slide-up 0.3s ease-out;
}

.snackbar-exit {
  animation: snackbar-slide-down 0.3s ease-out;
}

@keyframes snackbar-slide-up {
  from {
    transform: translate(-50%, 120%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes snackbar-slide-down {
  from {
    transform: translate(-50%, 0);
    opacity: 1;
  }
  to {
    transform: translate(-50%, 120%);
    opacity: 0;
  }
}
```

---

## Testing Requirements

### Manual Testing Checklist

1. **Snackbar Appearance:**
   - [ ] Remove a genre in edit mode
   - [ ] Snackbar appears at bottom-center
   - [ ] Message shows correct genre name
   - [ ] "Angre" button is visible and styled orange

2. **Snackbar Animation:**
   - [ ] Slides up smoothly from off-screen
   - [ ] No jarring or instant appearance
   - [ ] Transition takes ~300ms
   - [ ] Smooth slide-down on dismiss

3. **Undo Functionality:**
   - [ ] Click "Angre" within 5 seconds
   - [ ] Genre immediately reappears in grid
   - [ ] Snackbar dismisses instantly
   - [ ] Genre is in same state as before removal

4. **Auto-Dismiss:**
   - [ ] Wait 5 seconds without clicking
   - [ ] Snackbar disappears automatically
   - [ ] Smooth slide-down animation
   - [ ] Genre remains archived (not restored)

5. **Multiple Removals:**
   - [ ] Remove genre A → snackbar shows "A arkivert"
   - [ ] Before 5 seconds, remove genre B → snackbar updates to "B arkivert"
   - [ ] Only one snackbar visible at a time
   - [ ] Previous undo callback is cancelled

6. **Mobile Experience:**
   - [ ] Test on 375px width (iPhone SE)
   - [ ] Snackbar width is 90% of screen
   - [ ] Doesn't block genre grid
   - [ ] "Angre" button easily tappable (44px min)
   - [ ] No horizontal overflow

7. **Edge Cases:**
   - [ ] Remove genre, click undo, remove same genre again (works?)
   - [ ] Remove genre, wait 5 seconds, try to undo (can't - snackbar gone)
   - [ ] Rapidly click remove on multiple genres (only last one undoable)
   - [ ] Exit edit mode while snackbar is visible (snackbar persists)

8. **Z-index & Layering:**
   - [ ] Snackbar appears above genre grid (z-index: 150)
   - [ ] Snackbar appears above modals (if any)
   - [ ] No content blocks the snackbar

9. **Console & Build:**
   - [ ] No TypeScript errors
   - [ ] No console warnings
   - [ ] Build compiles successfully
   - [ ] No memory leaks (timeout cleaned up)

---

## Dependencies

**Prerequisites:**
- Story 11-1: Genre Edit Mode - REQUIRED ✅ (provides remove functionality)

**Blocks:**
- Story 11-4: Genre Library Modal (snackbar provides quick undo, library provides permanent restore)

---

## Technical Notes

**Why 5 Seconds:**
- Industry standard (Google Material Design, iOS)
- Long enough to react to mistake
- Short enough to not annoy users
- Prevents undo queue buildup

**Why Only One Snackbar:**
- Simplifies UX (no stack of notifications)
- Prevents screen clutter
- Latest action is most relevant
- Matches industry patterns (Gmail, Google Drive)

**Undo vs Restore:**
- **Undo (This Story):** Quick 5-second recovery via snackbar
- **Restore (Story 4):** Permanent recovery via Genre Library modal
- Both use same underlying logic (re-add genre to array)

**Performance Considerations:**
- Single timeout per snackbar instance (cleared on unmount)
- No animation libraries needed (CSS transitions sufficient)
- Minimal re-renders (callback refs prevent unnecessary updates)

---

## Definition of Done

- [ ] Code implemented and committed
- [ ] All 12 acceptance criteria met
- [ ] Manual testing checklist 100% complete
- [ ] Snackbar component created and styled
- [ ] useSnackbar hook created and tested
- [ ] Genre selection integrated with snackbar
- [ ] Undo restores genre correctly
- [ ] Auto-dismiss works after 5 seconds
- [ ] Only one snackbar visible at a time
- [ ] No TypeScript or console errors
- [ ] Build successful
- [ ] Tested on mobile, tablet, desktop
- [ ] Ready to merge

---

## Implementation Summary

**Status:** BACKLOG (Waiting for Story 11-1)

**Next Steps:**
1. Wait for Story 11-1 (Genre Edit Mode) to complete
2. Create Snackbar component with animation
3. Create useSnackbar hook with timeout management
4. Integrate snackbar into genre-selection.tsx
5. Test undo functionality thoroughly
6. Test auto-dismiss behavior
7. Commit changes and mark ready for review

**After This Story:**
- Move to Story 3: AI Prompt Assistant Modal (CR-004)
- Then Story 4: Genre Library Modal (CR-005)

---

## Reference

**Change Request:** See `docs/AIMusikk_Change_Requests.md` section "CR-006: Add Undo Snackbar for Deletions"

**Related Files:**
- `src/components/snackbar.tsx` - NEW (Snackbar component)
- `src/hooks/use-snackbar.ts` - NEW (Snackbar state hook)
- `src/components/genre-selection.tsx` - UPDATE (Integration)
- `src/app/globals.css` - UPDATE (Animations)

**Design References:**
- Google Material Design: Snackbars
- iOS Undo Notification patterns
- Gmail undo send feature

---

**Story Created:** 2026-01-16
**Story Ready for Development:** After Story 11-1 complete
