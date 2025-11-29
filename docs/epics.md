# ibe160 - Epic Breakdown

**Date:** 2025-11-27
**Project Level:** Quick-Flow (Brownfield)

---

## Epic 1: UX Refinements

**Slug:** ux-refinements

### Goal

Improve the song creation user experience by making songs immediately accessible from the homepage, removing the blocking generation modal, and clarifying the lyrics input flow to support both manual and AI-assisted workflows.

### Scope

**In Scope:**
- Homepage song section with pagination
- Inline generation status (no blocking modal)
- Redesigned lyrics input section
- Norwegian UI labels

**Out of Scope:**
- Song generation API changes
- Suno integration changes
- Song library page modifications
- Social sharing features

### Success Criteria

1. Users can see and play their songs directly from the homepage
2. Song generation no longer blocks the UI
3. Users can write lyrics manually or generate with AI via clear flow
4. All UI text in Norwegian

### Dependencies

- Existing `SongCard` and `SongPlayerCard` components
- Existing `GET /api/songs` endpoint
- Existing phonetic optimization system

---

## Story Map - Epic 1

```
Epic: UX Refinements (11 points)
│
├── Story 1.1: Homepage Song Section (3 points) ✓ DONE
│   Dependencies: None
│   Delivers: Paginated song list on homepage
│
├── Story 1.2: Inline Generation Status (3 points) ✓ DONE
│   Dependencies: Story 1.1 (uses HomepageSongs component)
│   Delivers: Non-blocking generation with status in list
│
├── Story 1.3: Redesigned Lyrics Section (2 points) ✓ DONE
│   Dependencies: None (can be done in parallel with 1.1)
│   Delivers: Manual-first lyrics input with optional AI
│
├── Story 1.4: Enhanced Lyrics Input with Dual-Mode UX (3 points)
│   Dependencies: Story 1.3 (existing lyrics section)
│   Delivers: AI-first lyrics with custom text toggle + phonetic optimization link
│
└── Story 1.5: Unified Music Player with Lyrics Display (8 points) ← NEW
    Dependencies: None (replaces song-player-card.tsx)
    Delivers: TikTok-style player with image bg, scrollable lyrics, swipe nav
```

---

## Stories - Epic 1

### Story 1.1: Homepage Song Section

As a **user**,
I want **to see my songs on the homepage with pagination**,
So that **I can quickly access my music without navigating to a separate page**.

**Acceptance Criteria:**
- AC #1: Homepage displays up to 10 songs below the create form
- AC #2: "Neste" button loads next 10 songs
- AC #3: "Forrige" button loads previous 10 songs
- AC #4: Clicking a song opens player modal
- AC #5: Empty state shows friendly message if no songs

**Prerequisites:** None

**Technical Notes:** Create `HomepageSongs` component reusing `SongCard`, `SongPlayerCard`, and existing API

**Estimated Effort:** 3 points

---

### Story 1.2: Inline Generation Status

As a **user**,
I want **to see my song generating in the list instead of a blocking modal**,
So that **I can continue browsing while my song is being created**.

**Acceptance Criteria:**
- AC #1: No blocking modal during generation
- AC #2: Generating song appears at top of list with spinner
- AC #3: Status updates in real-time via polling
- AC #4: Completed song becomes normal list item
- AC #5: Failed generation shows toast error

**Prerequisites:** Story 1.1 (HomepageSongs component)

**Technical Notes:** Create Zustand store for generation state, add generating variant to SongCard, reuse polling logic

**Estimated Effort:** 3 points

---

### Story 1.3: Redesigned Lyrics Section

As a **user**,
I want **a clear lyrics input where I can type directly or optionally use AI**,
So that **I understand how to create songs with my own text or get AI help**.

**Acceptance Criteria:**
- AC #1: Main textarea labeled "Tekst" is always visible
- AC #2: Users can type lyrics directly
- AC #3: "Norsk uttale" toggle controls phonetic optimization
- AC #4: "Generer tekst" button expands concept input
- AC #5: AI-generated lyrics populate main textarea

**Prerequisites:** None

**Technical Notes:** Create `LyricsInputSection` component, rename `PronunciationToggle` label

**Estimated Effort:** 2 points

---

### Story 1.4: Enhanced Lyrics Input with Dual-Mode UX

As a **user**,
I want **a dual-mode lyrics input that defaults to AI generation with an option for custom text**,
So that **I can quickly describe what I want or paste my own lyrics with Norwegian pronunciation optimization**.

**Acceptance Criteria:**

**Mode 1: AI Generated (Default)**
- AC #1: Textarea labeled "Beskriv sangen" with placeholder "F.eks: Bursdagssang til Per som alltid kommer for sent og snakker om båten sin..."
- AC #2: User enters keywords/description of desired song
- AC #3: "✨ Lag tekst" button below textarea generates lyrics via AI
- AC #4: Generated lyrics appear in editable textarea

**Mode 2: Custom Text (Toggle)**
- AC #5: "Egen tekst" toggle switches to custom text mode
- AC #6: When enabled, label changes to "Skriv sangteksten din"
- AC #7: Placeholder changes to "Skriv eller lim inn sangteksten din her..."
- AC #8: "Lag tekst" button is hidden in this mode

**Phonetic Optimization**
- AC #9: "Optimaliser tekst" link visible bottom-right when text exists in field
- AC #10: Clicking runs Norwegian phonetic optimization on current text
- AC #11: Optimized text replaces current textarea content

**Prerequisites:** Story 1.3 (existing lyrics section)

**Technical Notes:**
- Refactor existing `LyricsInputSection` component with mode state
- Reuse existing phonetic optimization API (`/api/optimize-pronunciation`)
- AI lyrics generation uses existing GPT integration

**Estimated Effort:** 3 points

---

### Story 1.5: Unified Music Player with Lyrics Display

As a **user**,
I want **a full-screen music player that shows lyrics over the song's artwork with swipe navigation**,
So that **I can enjoy my songs in an immersive, modern interface like TikTok/Spotify on any device**.

**Acceptance Criteria:**

**Layout & Responsive Design:**
- AC #1: Mobile displays full-screen vertical player (100vh), desktop displays large modal/panel
- AC #2: Suno-generated image fills background with semi-transparent overlay for text readability
- AC #3: Song title and metadata displayed at top-left
- AC #4: Lyrics displayed in scrollable area over background
- AC #5: Bottom player bar with controls (back, play/pause, progress, loop)

**Image Handling:**
- AC #6: Database schema updated to store `image_url` from Suno API
- AC #7: Webhook handler saves Suno `imageUrl` when song completes
- AC #8: Player displays image if available, gradient fallback if not

**Navigation:**
- AC #9: Mobile: swipe up/down navigates to previous/next song
- AC #10: Desktop: click arrows or keyboard ←/→ navigates songs
- AC #11: Chevron down (mobile) or X (desktop) closes player

**Actions:**
- AC #12: Download button (circular icon, right side) downloads song
- AC #13: Download reuses existing `downloadSong()` utility

**Audio Controls:**
- AC #14: Play/pause button (center bottom)
- AC #15: Progress bar with time display (current/total)
- AC #16: Back button (seek to start or previous song)
- AC #17: Loop toggle button
- AC #18: Desktop: volume slider in bottom bar

**Prerequisites:** None (replaces existing player)

**Technical Notes:**
- Replace `song-player-card.tsx` with new `unified-player.tsx` component
- Add `image_url` column to `song` table via migration
- Update Suno webhook to extract and store `imageUrl` from response
- Use Howler.js for audio (already in project)
- Use `framer-motion` or native touch events for swipe gestures
- Responsive breakpoints: mobile (<768px), desktop (≥768px)
- Consider lazy loading images with blur placeholder

**Estimated Effort:** 8 points

---

## Implementation Timeline - Epic 1

**Total Story Points:** 19

**Implementation Sequence:**
1. Story 1.1 + Story 1.3 (can be parallel) ✓ DONE
2. Story 1.2 (depends on 1.1) ✓ DONE
3. Story 1.4 (depends on 1.3)
4. Story 1.5 (independent - can start anytime) ← NEXT

---

## Epic 2: UI Polish & Bug Fixes

**Slug:** ui-polish-bug-fixes

### Goal

Improve overall UI quality through visual refinements, translation to Norwegian, and bug fixes across all pages to deliver a polished, consistent user experience.

### Scope

**In Scope:**
- Main page styling and text changes
- Mine sanger page improvements
- Instillinger page fixes and translation
- Mobile navigation translation
- Footer and navbar stability fixes
- Song player timer bug fix

**Out of Scope:**
- New features
- Backend changes
- API modifications

### Success Criteria

1. All UI text displays in Norwegian
2. Consistent styling across all pages (colors, spacing, alignment)
3. No layout shifts on navigation
4. Song player timer works correctly when seeking

### Dependencies

- Existing component library
- Nordic theme color palette

---

## Story Map - Epic 2

```
Epic: UI Polish & Bug Fixes (5 points)
│
└── Story 2.1: UI Polish & Bug Fixes (5 points)
    Dependencies: None
    Delivers: All 15 UI improvements in single pass
```

---

## Stories - Epic 2

### Story 2.1: UI Polish & Bug Fixes

As a **user**,
I want **a polished, consistent UI with Norwegian text and no visual bugs**,
So that **I have a seamless, professional experience using the app**.

**Acceptance Criteria:**

**Main Page:**
- AC #1: Generate song button displays "Generer sang" only
- AC #2: Gender buttons centered, "(valgfritt)" text removed
- AC #3: H1 elements use theme red color
- AC #4: Both gender buttons use same orange background style
- AC #5: Footer content centered
- AC #6: Mobile settings icon has no notification badge
- AC #7: Navbar does not shift when clicking profile/priser

**Mine Sanger Page:**
- AC #8: Song cards have subtle nordic theme gradient background
- AC #9: Genre badge properly sized and text centered
- AC #10: Song modal has single container (outer white box removed, X moved inside)

**Song Player:**
- AC #11: Timer updates correctly when seeking within a song

**Instillinger Page:**
- AC #12: (Mobile) "Alle transaksjoner" dropdown positioned below "Transaksjonshistorikk" text
- AC #13: All content translated to Norwegian

**Mobile Navigation:**
- AC #14: Bottom nav labels in Norwegian

**Footer:**
- AC #15: Footer position stable across page navigation

**Prerequisites:** None

**Technical Notes:** Use existing nordic theme colors. Address layout stability issues with proper CSS.

**Estimated Effort:** 5 points

---

## Implementation Timeline - Epic 2

**Total Story Points:** 5

**Implementation Sequence:**
1. Story 2.1 (all items can be done in single pass)

---
