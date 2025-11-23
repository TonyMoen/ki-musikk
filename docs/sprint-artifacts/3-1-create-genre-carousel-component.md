# Story 3.1: Create Genre Selection Component

Status: ready-for-dev

## Story

As a **user**,
I want to see and select genre options from a clear grid of buttons,
so that I can quickly choose the music style for my Norwegian song without extra navigation.

## Acceptance Criteria

**Given** I am on the "Create Song" page
**When** I see the genre selection section
**Then** I see 8+ genre buttons displayed in a responsive grid/wrap layout
**And** Each button shows: Genre emoji/icon, Genre name (e.g., "Country Rock", "Norwegian Pop")
**And** All genres are visible at once (no scrolling or swiping required)
**And** Selected genre has a 3px primary red border (#E94560) and solid background
**And** Unselected genres have a lighter background and border
**And** Tapping/clicking a button selects that genre
**And** Keyboard tab and enter/space keys work for selection (accessibility)

## Tasks / Subtasks

- [ ] Task 1: Set up genre database seeding (AC: 8+ genres available)
  - [ ] Create seed data for 8-10 genres with Norwegian names
  - [ ] Include genre properties: name, emoji, Suno prompt template
  - [ ] Verify genres are inserted into `genre` table
  - [ ] Test data retrieval from database

- [ ] Task 2: Create genre selection component (AC: Grid layout with all genres visible)
  - [ ] Create `/src/components/genre-selection.tsx` component
  - [ ] Implement responsive grid layout (2-3 columns mobile, 4-5 columns desktop)
  - [ ] Use flexbox with wrap for automatic row breaking
  - [ ] Display genre emoji and name on each button
  - [ ] Ensure all genres visible without scrolling

- [ ] Task 3: Style genre buttons (AC: Visual selection states)
  - [ ] Create base button style with emoji and text
  - [ ] Apply 3px red border (#E94560) to selected genre
  - [ ] Use solid background color for selected state
  - [ ] Use lighter background and border for unselected state
  - [ ] Add hover states for better UX
  - [ ] Ensure minimum touch target size (44x44px for accessibility)

- [ ] Task 4: Implement genre selection state (AC: Selection and state management)
  - [ ] Add state management for selected genre (useState or props)
  - [ ] Emit selection event to parent component
  - [ ] Persist selected genre in component state
  - [ ] Handle click/tap events on buttons
  - [ ] Ensure only one genre can be selected at a time

- [ ] Task 5: Implement keyboard navigation (AC: Tab and Enter/Space)
  - [ ] Ensure buttons are keyboard focusable (native button element)
  - [ ] Tab key navigates between genre buttons
  - [ ] Enter or Space key selects focused genre
  - [ ] Ensure focus states are clearly visible (focus ring)
  - [ ] Add ARIA labels for screen readers (role="radiogroup")

- [ ] Task 6: Integrate with database and test (AC: All)
  - [ ] Fetch genres from database using Supabase client
  - [ ] Handle loading state (skeleton or spinner)
  - [ ] Handle error state with Norwegian error message
  - [ ] Verify all acceptance criteria met
  - [ ] Test responsive behavior on mobile and desktop
  - [ ] Test keyboard navigation thoroughly

## Dev Notes

### Requirements Context

**From Epic 3: Norwegian Song Creation (CORE)**

Story 3.1 implements the first user interaction point for the song creation flow. The genre carousel is the entry point where users select their desired music style before entering lyrics or concepts. This component is critical for user experience as it sets the tone for the entire song creation process.

**Key Requirements:**
- **FR5**: User can select from multiple music genres
- **FR51**: Genre templates optimized for Norwegian music styles
- **UX Priority**: Mobile-first design with touch-friendly interactions

**Technical Constraints from Architecture:**
- **Component Location**: `/src/components/genre-carousel.tsx` (architecture component structure)
- **Database**: Genres stored in `genre` table with emoji, name, prompt template
- **UI Framework**: shadcn/ui components + custom styling with Tailwind CSS
- **Accessibility**: WCAG 2.1 AA compliance (keyboard navigation, ARIA labels)

**From Epic 3 - Genre Selection (Updated Design):**

Component specifications:
- **Layout**: Responsive grid with flexbox wrap (2-3 columns mobile, 4-5 desktop)
- **Button Size**: Minimum 44x44px touch target (accessibility), auto-width based on content
- **Selection Visual**: 3px red border (#E94560) for selected, solid background; lighter background for unselected
- **Interaction**: Click/tap selection, keyboard tab navigation, Enter/Space to select

[Source: docs/epics/epic-3-norwegian-song-creation-core.md, docs/architecture.md]

### Architecture Alignment

**Component Mapping (from Architecture):**

This story creates the first custom component for Epic 3:

1. **Genre Selection Component** (`/src/components/genre-selection.tsx`) - NEW
   - Responsive grid layout with flexbox wrap
   - Genre button display with emoji and name
   - Selection state management
   - Click/tap interactions
   - Accessibility features (ARIA radiogroup, keyboard nav)

2. **Genre API Endpoint** (`/src/app/api/genres/route.ts`) - NEW (if needed)
   - Fetch active genres from database
   - Return genre data with emoji, name, gradient colors
   - Cache response for performance

3. **Database Seed** (`/supabase/seed.sql`) - UPDATE
   - Seed 8-10 Norwegian-optimized genres
   - Include genre prompt templates for Suno

**Existing Components (from Previous Stories):**
- `/src/components/ui/*` - shadcn/ui components (Story 1.4)
- `/src/lib/supabase/client.ts` - Supabase client for database queries (Story 1.3)
- `genre` table - Schema created (Story 1.6)

**Database Schema (from Architecture):**

```sql
-- Genre table (already exists from Story 1.6)
CREATE TABLE genre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  suno_prompt_template TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Seed data example
INSERT INTO genre (name, display_name, emoji, suno_prompt_template, sort_order, is_active)
VALUES
  ('country-rock', 'Country Rock', '🎸', 'Country, rock, anthem, twangy guitar, catchy fiddle, drum, bass, Norwegian vocals', 1, true),
  ('norwegian-pop', 'Norwegian Pop', '🎤', 'Pop, Norwegian, catchy melody, electronic, upbeat, modern production', 2, true),
  ('folk-ballad', 'Folk Ballad', '🪕', 'Folk, acoustic, Norwegian traditional, heartfelt, storytelling', 3, true),
  ('party-anthem', 'Party Anthem', '🎉', 'Dance, party, energetic, sing-along, festive, Norwegian celebration', 4, true),
  ('rap-hiphop', 'Rap/Hip-Hop', '🎤', 'Hip-hop, rap, Norwegian flow, urban, rhythmic, modern beats', 5, true),
  ('rock-ballad', 'Rock Ballad', '🎸', 'Rock, ballad, emotional, guitar solo, powerful vocals, Norwegian', 6, true);
```

[Source: docs/architecture.md - Database Schema]

### Project Structure Notes

**Files to Create:**
- `/src/components/genre-selection.tsx` - Main genre selection component
- `/supabase/seed-genres.sql` - Genre seed data (or add to existing seed.sql)

**Files to Modify:**
- `/src/app/page.tsx` - Home page to integrate genre carousel component
- `/supabase/seed.sql` - Add genre seed data if not separate file

**Component Structure:**

```typescript
// /src/components/genre-selection.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string
  sort_order: number
}

interface GenreSelectionProps {
  onGenreSelect?: (genreId: string) => void
  defaultSelectedId?: string
}

export function GenreSelection({ onGenreSelect, defaultSelectedId }: GenreSelectionProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch genres from database
  useEffect(() => {
    async function fetchGenres() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('genre')
        .select('id, name, display_name, emoji, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Failed to fetch genres:', error)
        setIsLoading(false)
        return
      }

      setGenres(data || [])
      setIsLoading(false)

      // Auto-select first genre if none selected
      if (!selectedId && data && data.length > 0) {
        setSelectedId(data[0].id)
        onGenreSelect?.(data[0].id)
      }
    }

    fetchGenres()
  }, [])

  const handleGenreClick = (genreId: string) => {
    setSelectedId(genreId)
    onGenreSelect?.(genreId)
  }

  if (isLoading) {
    return <p className="text-gray-500">Laster sjangre...</p>
  }

  return (
    <div role="radiogroup" aria-label="Velg sjanger" className="w-full">
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {genres.map((genre) => (
          <Button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            variant={selectedId === genre.id ? 'default' : 'outline'}
            className={`
              min-h-[44px] px-4 py-2 rounded-lg
              transition-all duration-200
              flex items-center gap-2
              ${selectedId === genre.id
                ? 'border-[3px] border-[#E94560] bg-[#E94560] text-white hover:bg-[#E94560]/90'
                : 'border border-gray-300 bg-white hover:bg-gray-50'
              }
            `}
            role="radio"
            aria-checked={selectedId === genre.id}
          >
            <span className="text-2xl">{genre.emoji}</span>
            <span className="font-medium">{genre.display_name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
```

[Source: docs/architecture.md - Code Organization, UX Design Specification]

### Learnings from Previous Story

**From Story 2-6-implement-atomic-credit-deduction-with-rollback (Status: review)**

- **Database Migrations Pattern**: Supabase migrations stored in `/supabase/migrations/` with timestamp prefix - follow same pattern for genre seed data
- **Structured Logging**: Created `logger.ts` utility for consistent JSON logging - use for debug logs in genre carousel if needed
- **Norwegian UI Consistency**: All user-facing text must be in Norwegian - genre carousel should have Norwegian labels, error messages
- **Type Safety**: Created custom TypeScript types for domain models - create Genre interface type
- **Error Handling**: Comprehensive try-catch with user-friendly Norwegian error messages
- **Supabase Client Usage**: Use `createClient()` from `/src/lib/supabase/client.ts` for browser queries

**New Services/Patterns Created:**
- **Credit Transaction Module**: `/src/lib/credits/transaction.ts` - pattern for creating utility modules
- **Structured Logger**: `/src/lib/utils/logger.ts` - reusable for genre carousel debug logging
- **Custom Error Classes**: InsufficientCreditsError pattern - create GenreLoadError if needed
- **Database Stored Procedures**: RPC pattern for complex operations - not needed for simple genre queries

**Technical Patterns to Follow:**
- **Norwegian Error Messages**: All user-facing errors in Norwegian, code/logs in English
- **Type Definitions**: Create types in `/src/types/` directory for Genre interface
- **Component Props**: Use TypeScript interfaces for component props (GenreCarouselProps)
- **Client Components**: Use 'use client' directive for components with interactivity
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

**Files to Leverage:**
- `/src/lib/supabase/client.ts` - Supabase client for database queries
- `/src/lib/utils/logger.ts` - Structured logging if debug logs needed
- `/src/components/ui/*` - shadcn/ui primitives if needed
- Previous story migration pattern: Timestamp-based migration files

**Potential Issues to Address:**
- **Genre Loading Performance**: Cache genres in client state to avoid repeated queries
- **Empty Genre State**: Handle case where no genres exist in database (show helpful message)
- **Button Wrapping**: Test layout with different screen sizes to ensure proper wrapping
- **Touch Target Size**: Ensure buttons meet minimum 44x44px accessibility guideline
- **Long Genre Names**: Handle text overflow/wrapping for longer genre names
- **Screen Reader**: Verify ARIA radiogroup and radio roles work with screen readers
- **Auto-selection**: First genre auto-selected - ensure this behavior is intuitive
- **Button Styling**: Ensure selected state is clearly distinguishable from unselected

**Integration Points:**
- Genre selection will be integrated into home page (Create Song flow)
- Selected genre will be passed to lyric generation component (Story 3.2)
- Genre prompt template will be used for Suno API calls (Story 3.5)
- Database seed data must be applied before component can function

**Design Change Rationale:**
- Original carousel design required unnecessary swipes/scrolling to find genres
- Grid button layout shows all genres at once for faster selection
- Simpler interaction model: click/tap to select (no swipe gestures needed)
- Better accessibility: standard button interactions work with all input methods
- Reduced cognitive load: users can see all options immediately

[Source: docs/sprint-artifacts/2-6-implement-atomic-credit-deduction-with-rollback.md#Dev-Agent-Record]

### References

- [Epic 3 Story 3.1 Acceptance Criteria](../epics/epic-3-norwegian-song-creation-core.md#story-31-create-genre-carousel-component) (Note: Updated to grid button layout per user feedback)
- [Architecture - Component Structure](../architecture.md#project-structure)
- [Architecture - Naming Conventions](../architecture.md#naming-conventions)
- [Architecture - Database Schema - Genre Table](../architecture.md#database-schema-postgresql-17-via-supabase)
- [UX Design Specification - Genre Carousel Component](#) (if available)
- [Story 1.4 - shadcn/ui Installation](./1-4-install-shadcn-ui-and-core-components.md)
- [Story 1.6 - Database Schema (genre table)](./1-6-set-up-database-schema-with-supabase-migrations.md)

## Change Log

**2025-11-23 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 3: Norwegian Song Creation (CORE)
- Source: docs/epics/epic-3-norwegian-song-creation-core.md, docs/architecture.md
- Prerequisites: Story 1.4 (shadcn/ui), Story 1.6 (Database schema)
- Includes learnings from Story 2.6: Supabase client patterns, Norwegian UI, type safety, structured logging
- Implements FR5 (Genre selection) and FR51 (Norwegian genre templates)
- First story in Epic 3 - no previous Epic 3 stories for learnings
- Next step: Run story-context workflow to generate technical context XML and mark ready for development

**2025-11-23 - Design Updated (still drafted status)**
- Updated design from carousel to grid button layout per user feedback
- Rationale: Carousel requires unnecessary swipes/scrolling; button grid shows all options at once
- Changed component name from genre-carousel to genre-selection
- Simplified interaction: click/tap only (no swipe gestures)
- Improved accessibility: standard button navigation
- Updated acceptance criteria, tasks, and component structure accordingly

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/3-1-create-genre-carousel-component.context.xml` (Generated: 2025-11-23)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List
