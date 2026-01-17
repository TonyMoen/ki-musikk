# Story 11-4: Add Genre Library Modal with Active/Archived/Standard Tabs

**Epic:** 11 - Genre Management & AI Assistant
**Story ID:** 11-4
**Story Key:** 11-4-add-genre-library-modal-with-tabs
**Status:** review
**Change Request:** CR-005
**Priority:** MEDIUM
**Type:** Feature Development
**Estimated Effort:** 12 hours

---

## User Story

**As a** user managing my genre collection,
**I want** a library modal where I can view active, archived, and standard genres,
**So that** I can restore removed genres, explore templates, and manage my full genre catalog.

---

## Context

This is the final story in the Genre Management epic. It provides a centralized location to:
- View all active genres (currently in main grid)
- Restore archived genres (removed in edit mode)
- Browse and add standard genre templates
- Search across all genres
- Permanently delete archived genres if needed

**Dependencies:**
- Story 11-1: Genre Edit Mode (archives genres)
- Story 11-2: Undo Snackbar (quick restore)
- Story 11-3: AI Prompt Assistant (creates custom genres)

---

## Acceptance Criteria

**Given** I want to manage my genre library
**When** I interact with the library modal
**Then**:

### Modal & Navigation (5 criteria)
1. ✅ Library button appears in header/genre section (icon or text)
2. ✅ Clicking library button opens full-screen modal
3. ✅ Modal has "Sjanger-bibliotek" header with search bar
4. ✅ Three tabs visible: "Aktive", "Arkiverte", "Standard"
5. ✅ Each tab has badge showing count (e.g., "Aktive (4)")

### Active Tab (4 criteria)
6. ✅ Shows all genres currently in main grid
7. ✅ Each genre displays: name, Suno prompt preview
8. ✅ "Arkiver" button on each genre
9. ✅ Clicking "Arkiver" moves genre to Arkiverte tab

### Archived Tab (5 criteria)
10. ✅ Shows all removed genres with archive timestamp
11. ✅ Each genre displays: name, prompt, "Arkivert {date}"
12. ✅ "Gjenopprett" button restores genre to main grid
13. ✅ "Slett permanent" button shows confirmation dialog
14. ✅ Permanently deleted genres cannot be recovered

### Standard Tab (4 criteria)
15. ✅ Shows 8 pre-made genre templates (hardcoded)
16. ✅ Each template displays: name, Suno prompt
17. ✅ "Legg til" button adds template to active genres
18. ✅ Templates include: Classic Rock, Chill Lofi, Epic Orchestral, Indie Folk, Synthwave, Jazz Smooth, EDM Banger, Acoustic Ballad

### Search Functionality (3 criteria)
19. ✅ Search bar filters genres by name or prompt text
20. ✅ Search works across current visible tab only
21. ✅ Empty state message when no results found

### Data Persistence (4 criteria)
22. ✅ Active genres persist to localStorage on change
23. ✅ Archived genres persist to localStorage
24. ✅ Genres reload from localStorage on page load
25. ✅ No console errors or warnings

---

## Tasks & Subtasks

### Task 1: Create Genre Library Components
- [x] 1.1: Create `src/components/genre-library/modal.tsx` with tabs
- [x] 1.2: Create `src/components/genre-library/genre-card.tsx` for individual genres
- [x] 1.3: Tab content integrated directly in modal.tsx (simpler approach)
- [x] 1.4: Add search bar to modal header

### Task 2: Implement Genre Library State Management
- [x] 2.1: Create `src/hooks/use-genre-library.ts` with state logic
- [x] 2.2: Implement archive/restore/delete functions
- [x] 2.3: Add localStorage persistence (save on change)
- [x] 2.4: Add localStorage loading (on mount)
- [x] 2.5: Implement search filtering logic

### Task 3: Create Standard Genre Templates
- [x] 3.1: Create `src/lib/standard-genres.ts` with 8 templates
- [x] 3.2: Define Genre interface/type (LibraryGenre)
- [x] 3.3: Add templates: Classic Rock, Chill Lofi, Epic Orchestral, Indie Folk
- [x] 3.4: Add templates: Synthwave, Jazz Smooth, EDM Banger, Acoustic Ballad

### Task 4: Integrate with Genre Selection
- [x] 4.1: Add library button to `src/components/genre-selection.tsx`
- [x] 4.2: Integrate with existing custom-genres-storage for compatibility
- [x] 4.3: Display activeGenres in main grid via callback handlers
- [x] 4.4: Handle modal open/close state

### Task 5: Testing and Validation
- [x] 5.1: Build passes successfully
- [x] 5.2: Lint passes with no errors
- [x] 5.3: TypeScript compilation successful
- [ ] 5.4: Manual testing required (empty states, flows)
- [ ] 5.5: Mobile responsiveness testing required
- [ ] 5.6: Console error verification required

---

## Implementation Details

### Files to Create

1. **src/components/genre-library/modal.tsx** (NEW)
   - Main library modal with tabs
   - Search bar integration
   - Tab switching logic

2. **src/components/genre-library/genre-card.tsx** (NEW)
   - Individual genre card component
   - Shows name, prompt, metadata
   - Action buttons (Arkiver, Gjenopprett, Slett, Legg til)

3. **src/components/genre-library/tab-content.tsx** (NEW)
   - Genre list for each tab
   - Empty state handling
   - Search result filtering

4. **src/hooks/use-genre-library.ts** (NEW)
   - Genre library state management
   - Archive/restore/delete logic
   - localStorage persistence
   - Search filtering

5. **src/lib/standard-genres.ts** (NEW)
   - Hardcoded standard genre templates
   - Template data structure

### Files to Update

6. **src/components/genre-selection.tsx** (UPDATE)
   - Add library button to header
   - Integrate with genre library state
   - Load genres from localStorage on mount

7. **src/app/page.tsx** (UPDATE - if needed)
   - Ensure genre persistence across page navigation

### Technical Approach

**1. Standard Genre Templates (src/lib/standard-genres.ts):**
```typescript
export interface Genre {
  id: string
  name: string
  display_name: string
  sunoPrompt: string
  isCustom?: boolean
  isStandard?: boolean
  createdAt?: Date
  archivedAt?: Date
}

export const STANDARD_GENRES: Genre[] = [
  {
    id: 'std-classic-rock',
    name: 'Classic Rock',
    display_name: 'Classic Rock',
    sunoPrompt: 'classic rock, electric guitar, drums, bass, powerful vocals, 70s style',
    isStandard: true
  },
  {
    id: 'std-chill-lofi',
    name: 'Chill Lofi',
    display_name: 'Chill Lofi',
    sunoPrompt: 'lofi hip hop, chill beats, mellow piano, vinyl crackle, relaxed atmosphere',
    isStandard: true
  },
  {
    id: 'std-epic-orchestral',
    name: 'Epic Orchestral',
    display_name: 'Epic Orchestral',
    sunoPrompt: 'cinematic orchestral, strings, brass, epic drums, dramatic, movie soundtrack',
    isStandard: true
  },
  {
    id: 'std-indie-folk',
    name: 'Indie Folk',
    display_name: 'Indie Folk',
    sunoPrompt: 'indie folk, acoustic guitar, soft vocals, organic sound, intimate atmosphere',
    isStandard: true
  },
  {
    id: 'std-synthwave',
    name: 'Synthwave',
    display_name: 'Synthwave',
    sunoPrompt: '80s synthwave, retro synthesizers, electronic drums, neon atmosphere, nostalgic',
    isStandard: true
  },
  {
    id: 'std-jazz-smooth',
    name: 'Jazz Smooth',
    display_name: 'Jazz Smooth',
    sunoPrompt: 'smooth jazz, saxophone, piano, upright bass, sophisticated, lounge atmosphere',
    isStandard: true
  },
  {
    id: 'std-edm-banger',
    name: 'EDM Banger',
    display_name: 'EDM Banger',
    sunoPrompt: 'edm, heavy bass drops, synth leads, high energy, festival anthem, 128 bpm',
    isStandard: true
  },
  {
    id: 'std-acoustic-ballad',
    name: 'Acoustic Ballad',
    display_name: 'Acoustic Ballad',
    sunoPrompt: 'acoustic ballad, fingerstyle guitar, emotional vocals, intimate, slow tempo',
    isStandard: true
  }
]
```

**2. Genre Library Hook (src/hooks/use-genre-library.ts):**
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Genre } from '@/lib/standard-genres'

const STORAGE_KEY_ACTIVE = 'aimusikk_active_genres'
const STORAGE_KEY_ARCHIVED = 'aimusikk_archived_genres'

export function useGenreLibrary() {
  const [activeGenres, setActiveGenres] = useState<Genre[]>([])
  const [archivedGenres, setArchivedGenres] = useState<Genre[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const loadGenres = () => {
      try {
        const activeStr = localStorage.getItem(STORAGE_KEY_ACTIVE)
        const archivedStr = localStorage.getItem(STORAGE_KEY_ARCHIVED)

        if (activeStr) {
          setActiveGenres(JSON.parse(activeStr))
        }
        if (archivedStr) {
          setArchivedGenres(JSON.parse(archivedStr))
        }
      } catch (error) {
        console.error('Failed to load genres from localStorage:', error)
      }
    }

    loadGenres()
  }, [])

  // Persist active genres
  useEffect(() => {
    if (activeGenres.length > 0) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeGenres))
    }
  }, [activeGenres])

  // Persist archived genres
  useEffect(() => {
    if (archivedGenres.length > 0) {
      localStorage.setItem(STORAGE_KEY_ARCHIVED, JSON.stringify(archivedGenres))
    }
  }, [archivedGenres])

  const archiveGenre = useCallback((genreId: string) => {
    const genre = activeGenres.find(g => g.id === genreId)
    if (!genre) return

    const archivedGenre = {
      ...genre,
      archivedAt: new Date()
    }

    setArchivedGenres(prev => [...prev, archivedGenre])
    setActiveGenres(prev => prev.filter(g => g.id !== genreId))
  }, [activeGenres])

  const restoreGenre = useCallback((genreId: string) => {
    const genre = archivedGenres.find(g => g.id === genreId)
    if (!genre) return

    const { archivedAt, ...restoredGenre } = genre

    setActiveGenres(prev => [...prev, restoredGenre])
    setArchivedGenres(prev => prev.filter(g => g.id !== genreId))
  }, [archivedGenres])

  const permanentDelete = useCallback((genreId: string) => {
    const genre = archivedGenres.find(g => g.id === genreId)
    if (!genre) return

    const confirmDelete = window.confirm(
      `Er du sikker på at du vil slette "${genre.name}" permanent? Dette kan ikke angres.`
    )

    if (confirmDelete) {
      setArchivedGenres(prev => prev.filter(g => g.id !== genreId))
    }
  }, [archivedGenres])

  const addGenre = useCallback((genre: Genre) => {
    // Check if already exists
    if (activeGenres.some(g => g.id === genre.id)) {
      return
    }

    setActiveGenres(prev => [...prev, genre])
  }, [activeGenres])

  const filterGenres = useCallback((genres: Genre[], query: string) => {
    if (!query.trim()) return genres

    const lowerQuery = query.toLowerCase()
    return genres.filter(
      genre =>
        genre.name.toLowerCase().includes(lowerQuery) ||
        genre.display_name.toLowerCase().includes(lowerQuery) ||
        genre.sunoPrompt.toLowerCase().includes(lowerQuery)
    )
  }, [])

  return {
    activeGenres,
    archivedGenres,
    searchQuery,
    setSearchQuery,
    archiveGenre,
    restoreGenre,
    permanentDelete,
    addGenre,
    filterGenres,
    activeCount: activeGenres.length,
    archivedCount: archivedGenres.length
  }
}
```

**3. Genre Library Modal (src/components/genre-library/modal.tsx):**
```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { GenreCard } from './genre-card'
import { useGenreLibrary } from '@/hooks/use-genre-library'
import { STANDARD_GENRES } from '@/lib/standard-genres'

interface GenreLibraryModalProps {
  open: boolean
  onClose: () => void
}

export function GenreLibraryModal({ open, onClose }: GenreLibraryModalProps) {
  const library = useGenreLibrary()
  const [activeTab, setActiveTab] = useState('active')

  const filteredActive = library.filterGenres(library.activeGenres, library.searchQuery)
  const filteredArchived = library.filterGenres(library.archivedGenres, library.searchQuery)
  const filteredStandard = library.filterGenres(STANDARD_GENRES, library.searchQuery)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">Sjanger-bibliotek</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Søk etter sjanger eller stil..."
              value={library.searchQuery}
              onChange={(e) => library.setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 grid w-auto grid-cols-3 mb-4">
            <TabsTrigger value="active">
              Aktive ({library.activeCount})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Arkiverte ({library.archivedCount})
            </TabsTrigger>
            <TabsTrigger value="standard">
              Standard (8)
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TabsContent value="active" className="mt-0 space-y-3">
              {filteredActive.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  {library.searchQuery
                    ? 'Ingen aktive sjangere matchet søket'
                    : 'Ingen aktive sjangere ennå'}
                </div>
              ) : (
                filteredActive.map((genre) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    actions={[
                      {
                        label: 'Arkiver',
                        onClick: () => library.archiveGenre(genre.id),
                        variant: 'secondary'
                      }
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="archived" className="mt-0 space-y-3">
              {filteredArchived.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  {library.searchQuery
                    ? 'Ingen arkiverte sjangere matchet søket'
                    : 'Ingen arkiverte sjangere'}
                </div>
              ) : (
                filteredArchived.map((genre) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    showArchiveDate
                    actions={[
                      {
                        label: 'Gjenopprett',
                        onClick: () => library.restoreGenre(genre.id),
                        variant: 'primary'
                      },
                      {
                        label: 'Slett permanent',
                        onClick: () => library.permanentDelete(genre.id),
                        variant: 'danger'
                      }
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="standard" className="mt-0 space-y-3">
              {filteredStandard.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  Ingen standard sjangere matchet søket
                </div>
              ) : (
                filteredStandard.map((genre) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    actions={[
                      {
                        label: 'Legg til',
                        onClick: () => {
                          library.addGenre(genre)
                        },
                        variant: 'primary',
                        disabled: library.activeGenres.some(g => g.id === genre.id)
                      }
                    ]}
                  />
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

**4. Genre Card Component (src/components/genre-library/genre-card.tsx):**
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Genre } from '@/lib/standard-genres'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

interface GenreCardAction {
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

interface GenreCardProps {
  genre: Genre
  actions: GenreCardAction[]
  showArchiveDate?: boolean
}

export function GenreCard({ genre, actions, showArchiveDate }: GenreCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h4 className="font-bold text-text-primary">{genre.display_name}</h4>
          {showArchiveDate && genre.archivedAt && (
            <p className="text-xs text-text-secondary mt-1">
              Arkivert {formatDistanceToNow(new Date(genre.archivedAt), {
                addSuffix: true,
                locale: nb
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {actions.map((action, i) => (
            <Button
              key={i}
              onClick={action.onClick}
              disabled={action.disabled}
              size="sm"
              variant={action.variant === 'danger' ? 'destructive' : 'outline'}
              className={
                action.variant === 'primary'
                  ? 'bg-primary hover:bg-primary-hover text-white'
                  : ''
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-sm text-text-secondary">{genre.sunoPrompt}</p>
    </div>
  )
}
```

---

## Testing Requirements

### Manual Testing Checklist

1. **Library Button & Modal:**
   - [ ] "Bibliotek" button visible in genre section header
   - [ ] Click button → modal opens
   - [ ] Modal shows "Sjanger-bibliotek" header
   - [ ] Search bar visible at top
   - [ ] Three tabs visible with counts

2. **Active Tab:**
   - [ ] Shows genres currently in main grid
   - [ ] Each genre shows: name, Suno prompt
   - [ ] "Arkiver" button on each genre
   - [ ] Click "Arkiver" → genre moves to Arkiverte tab
   - [ ] Active count badge updates

3. **Archived Tab:**
   - [ ] Shows previously removed genres
   - [ ] Each genre shows archive timestamp (e.g., "Arkivert 2 dager siden")
   - [ ] "Gjenopprett" and "Slett permanent" buttons visible
   - [ ] Click "Gjenopprett" → genre returns to main grid
   - [ ] Click "Slett permanent" → confirmation dialog appears
   - [ ] Confirm delete → genre disappears permanently

4. **Standard Tab:**
   - [ ] Shows 8 pre-made templates
   - [ ] Templates: Classic Rock, Chill Lofi, Epic Orchestral, Indie Folk, Synthwave, Jazz Smooth, EDM Banger, Acoustic Ballad
   - [ ] Each shows name and Suno prompt
   - [ ] "Legg til" button on each template
   - [ ] Click "Legg til" → genre appears in main grid
   - [ ] Button becomes disabled if already added

5. **Search Functionality:**
   - [ ] Type in search bar → filters current tab
   - [ ] Search matches genre names
   - [ ] Search matches Suno prompt text
   - [ ] Empty state shows when no results
   - [ ] Clear search → all genres reappear

6. **LocalStorage Persistence:**
   - [ ] Add custom genre → refresh page → genre persists
   - [ ] Archive genre → refresh page → stays archived
   - [ ] Add standard template → refresh page → persists
   - [ ] Genres load from localStorage on mount

7. **Cross-Story Integration:**
   - [ ] Genres removed in edit mode (Story 1) appear in Arkiverte tab
   - [ ] Custom genres from AI assistant (Story 3) appear in Aktive tab
   - [ ] Undo snackbar (Story 2) restores genre to Aktive

8. **Edge Cases:**
   - [ ] What if no active genres? (Shows empty state)
   - [ ] What if no archived genres? (Shows empty state)
   - [ ] Add all 8 standard templates → all buttons disabled
   - [ ] Search with no matches → empty state
   - [ ] Very long genre names or prompts → truncates or scrolls

9. **Mobile Experience:**
   - [ ] Modal is responsive on mobile
   - [ ] Tabs scroll if needed
   - [ ] Genre cards stack properly
   - [ ] Action buttons are tappable
   - [ ] Search bar full-width

10. **Console & Build:**
    - [ ] No TypeScript errors
    - [ ] No console warnings
    - [ ] Build compiles successfully
    - [ ] No localStorage quota errors

---

## Dev Agent Record

**Context Reference:**
- docs/sprint-artifacts/stories/11-4-add-genre-library-modal-with-tabs.context.xml

**Implementation Notes:**
- Created `src/lib/standard-genres.ts` with LibraryGenre interface and 8 standard templates
- Created `src/hooks/use-genre-library.ts` that integrates with existing `custom-genres-storage.ts`
- Uses `musikkfabrikken_archived_genres` localStorage key for archived genres
- Created `src/components/genre-library/modal.tsx` with Radix UI Tabs
- Created `src/components/genre-library/genre-card.tsx` with date-fns for Norwegian locale
- Updated `src/components/genre-selection.tsx` with Library icon button and modal integration
- Permanent delete uses double-click confirmation pattern (click once shows "Bekreft slett", click again deletes)
- Tab content integrated directly in modal.tsx (simpler than separate tab-content.tsx)

**Testing Notes:**
- Build: PASSED
- Lint: PASSED (no warnings or errors)
- TypeScript: PASSED (no type errors)
- Manual testing pending: archive/restore flows, search filtering, localStorage persistence, mobile responsiveness

---

## Definition of Done

- [ ] Code implemented and committed
- [ ] All 25 acceptance criteria met
- [ ] Manual testing checklist 100% complete
- [ ] Genre library modal created with 3 tabs
- [ ] Active, Archived, Standard tabs functional
- [ ] Search filters genres correctly
- [ ] Archive/restore/delete logic works
- [ ] LocalStorage persistence implemented
- [ ] 8 standard templates hardcoded and functional
- [ ] Badge counts update dynamically
- [ ] Integration with edit mode and AI assistant
- [ ] No TypeScript or console errors
- [ ] Build successful
- [ ] Tested on mobile, tablet, desktop
- [ ] Ready to merge

---

## Reference

**Change Request:** See `docs/AIMusikk_Change_Requests.md` section "CR-005: Add Genre Library Modal"

**Related Files:**
- `src/components/genre-library/modal.tsx` - NEW (Main modal)
- `src/components/genre-library/genre-card.tsx` - NEW (Genre display)
- `src/components/genre-library/tab-content.tsx` - NEW (Tab rendering)
- `src/hooks/use-genre-library.ts` - NEW (State management)
- `src/lib/standard-genres.ts` - NEW (Templates)
- `src/components/genre-selection.tsx` - UPDATE (Integration)

**Design References:**
- Spotify library management
- Apple Music genre browsing
- Material Design: Tabs and search patterns

---

**Story Created:** 2026-01-16
**Story Drafted:** 2026-01-16
**Estimated Effort:** 12 hours (second largest story in epic)
