# Story 3.8: Build Song Player Card Component

Status: ready-for-dev

## Story

As a **user**,
I want to play my generated song directly in the browser with waveform visualization,
so that I can immediately hear the result without downloading.

## Acceptance Criteria

**Given** My song generation is complete
**When** I see the song player card
**Then** I see: Song title, Genre badge, Date created, 60x60px artwork (gradient with emoji)
**And** Large play/pause button (48x48px) is displayed
**And** Waveform visualization shows audio amplitude (SVG)
**And** Progress bar allows scrubbing (drag to seek)
**And** When I tap play, audio plays instantly (<500ms)
**And** Waveform animates during playback
**And** Current time / Total duration displayed (e.g., "1:23 / 2:45")
**And** Volume control slider (mobile: hidden, desktop: visible)

## Tasks / Subtasks

- [ ] Task 1: Create song player card component structure (AC: Display song metadata and artwork)
  - [ ] Create `/src/components/song-player-card.tsx` with TypeScript interface
  - [ ] Add props interface: `SongPlayerCardProps` with songId, title, genre, audioUrl, duration, createdAt
  - [ ] Implement card layout: 60x60px artwork (left), metadata (center), controls (right)
  - [ ] Display song title in Norwegian (max 2 lines with ellipsis)
  - [ ] Show genre badge with appropriate color coding
  - [ ] Format date with Norwegian locale (nb-NO): "19. nov. 2025"
  - [ ] Generate gradient artwork with genre emoji (from genre table)
  - [ ] Apply shadcn/ui Card component for consistent styling
  - [ ] Make layout responsive: mobile (vertical stack), desktop (horizontal)

- [ ] Task 2: Implement audio playback with Howler.js (AC: Audio plays instantly <500ms)
  - [ ] Install Howler.js: `npm install howler @types/howler`
  - [ ] Initialize Howler instance with audioUrl from signed Supabase Storage URL
  - [ ] Create playback state: isPlaying, currentTime, duration, volume
  - [ ] Implement play/pause toggle function
  - [ ] Add 48x48px play/pause button with lucide-react icons (Play, Pause)
  - [ ] Handle audio loading state (show spinner while loading)
  - [ ] Preload audio on component mount for instant playback (<500ms)
  - [ ] Add error handling for failed audio loading (Norwegian error message)
  - [ ] Cleanup Howler instance on component unmount

- [ ] Task 3: Add waveform visualization with wavesurfer.js (AC: Waveform shows amplitude, animates during playback)
  - [ ] Install wavesurfer.js: `npm install wavesurfer.js`
  - [ ] Create waveform container div (full width, 60px height)
  - [ ] Initialize WaveSurfer instance with audioUrl
  - [ ] Configure waveform colors: waveColor='#98c1d9', progressColor='#E94560'
  - [ ] Set responsive: true, height: 60
  - [ ] Sync WaveSurfer playback with Howler (one source of truth: Howler)
  - [ ] Animate waveform progress during playback (update on timeupdate event)
  - [ ] Handle click on waveform to seek (scrubbing)
  - [ ] Cleanup WaveSurfer instance on component unmount

- [ ] Task 4: Implement progress bar with scrubbing (AC: Drag to seek)
  - [ ] Create progress bar container below waveform
  - [ ] Display current time / total duration: "1:23 / 2:45" (Norwegian format)
  - [ ] Use shadcn/ui Slider component for scrubbing
  - [ ] Update slider value on timeupdate event from Howler
  - [ ] Handle slider change to seek audio (update Howler position)
  - [ ] Add touch-friendly dragging (min 48px touch target)
  - [ ] Format time as mm:ss (Norwegian convention)
  - [ ] Show loading state if duration not yet available

- [ ] Task 5: Add volume control (AC: Volume slider on desktop, hidden on mobile)
  - [ ] Create volume control section (desktop only, hidden on mobile via Tailwind)
  - [ ] Use shadcn/ui Slider component for volume (0-100%)
  - [ ] Add volume icon: VolumeX (muted), Volume1 (low), Volume2 (high)
  - [ ] Initialize volume at 80% default
  - [ ] Update Howler volume on slider change
  - [ ] Save volume preference to localStorage
  - [ ] Add mute/unmute toggle button
  - [ ] Apply media query: `hidden md:flex` for mobile hiding

- [ ] Task 6: Implement keyboard controls (AC: Accessibility - Space=play/pause, arrows=scrub)
  - [ ] Add keyboard event listener for Space key (play/pause toggle)
  - [ ] Add ArrowLeft key (skip backward 5 seconds)
  - [ ] Add ArrowRight key (skip forward 5 seconds)
  - [ ] Add ArrowUp key (increase volume 10%)
  - [ ] Add ArrowDown key (decrease volume 10%)
  - [ ] Prevent default browser behavior (space shouldn't scroll page)
  - [ ] Add ARIA labels for screen reader accessibility
  - [ ] Focus management: Card receives focus when clicked

- [ ] Task 7: Add ARIA labels and screen reader support (AC: Accessibility compliance)
  - [ ] Add role="region" to card with aria-label="Sangavspiller" (Norwegian: Song player)
  - [ ] Add aria-label to play/pause button: "Spill av" / "Pause"
  - [ ] Add aria-label to progress slider: "Søk i sangen"
  - [ ] Add aria-label to volume slider: "Volum"
  - [ ] Announce playback state changes to screen readers
  - [ ] Add aria-live region for time updates
  - [ ] Ensure all interactive elements are keyboard accessible
  - [ ] Test with VoiceOver (Mac) or NVDA (Windows)

- [ ] Task 8: Style component with Playful Nordic theme (AC: Match UX design spec)
  - [ ] Apply Tailwind classes for card styling: rounded-lg, shadow-md, bg-card
  - [ ] Use Playful Nordic colors: Primary red (#E94560) for progress, accents
  - [ ] Add genre badge colors from theme (e.g., Country Rock = yellow-red gradient)
  - [ ] Implement hover states: Play button scales slightly, waveform brightens
  - [ ] Add smooth transitions for all state changes (200ms ease)
  - [ ] Apply mobile-first responsive design (vertical stack on mobile)
  - [ ] Match card dimensions from UX spec: mobile (full width), desktop (max 600px)
  - [ ] Add subtle drop shadow on hover (elevation effect)

- [ ] Task 9: Integrate with song data and test (AC: All acceptance criteria verified)
  - [ ] Fetch song data from `/api/songs/[id]` endpoint
  - [ ] Handle signed URL expiration (refresh if needed)
  - [ ] Test with completed song: Play, pause, scrub, volume
  - [ ] Test keyboard controls: Space, arrows
  - [ ] Test mobile layout: Vertical stack, no volume slider
  - [ ] Test desktop layout: Horizontal layout, volume slider visible
  - [ ] Test accessibility: Screen reader, keyboard navigation
  - [ ] Test error states: Failed audio load, missing audio URL
  - [ ] Verify performance: Audio plays <500ms after click
  - [ ] Test waveform animation during playback

## Dev Notes

### Requirements Context

**From Epic 3: Norwegian Song Creation (CORE)**

Story 3.8 implements the song player card component, which provides instant audio playback with waveform visualization for completed songs. This is the final UI component in the song generation flow, allowing users to immediately listen to their generated Norwegian songs.

**Key Requirements:**
- **FR21**: Users can play generated songs directly in browser
- **FR22**: Audio player includes waveform visualization and scrubbing
- **FR23**: Playback controls are touch-friendly and accessible
- **FR51**: Genre-specific visual styling (gradient artwork with emoji)
- **UX**: Card-based design inspired by Spotify player cards

**Technical Constraints from Architecture:**
- **Component Path**: `/src/components/song-player-card.tsx` (custom component)
- **Audio Library**: Howler.js for reliable cross-browser playback
- **Waveform Library**: wavesurfer.js for SVG waveform visualization
- **UI Framework**: shadcn/ui components (Card, Slider) for consistency
- **Audio Source**: Signed URLs from Supabase Storage (24-hour expiration)
- **Styling**: Tailwind CSS with Playful Nordic theme colors
- **Accessibility**: WCAG 2.1 AA compliant (keyboard controls, ARIA labels, screen reader support)
- **Performance**: Audio preload for <500ms playback start time
- **Responsive**: Mobile-first design (vertical stack on mobile, horizontal on desktop)

**From Epic 3 - Story 3.8 Specifications:**

Visual design elements:
- **Artwork**: 60x60px gradient background with genre emoji (from genre table)
- **Play Button**: 48x48px circular button (Play/Pause icons from lucide-react)
- **Waveform**: Full width, 60px height, SVG-based with smooth animation
- **Progress**: Current time / Total duration (e.g., "1:23 / 2:45" in Norwegian format)
- **Genre Badge**: Colored badge with genre name (matches genre carousel styling)
- **Volume**: Slider with icon (desktop only, hidden on mobile)

Interaction patterns:
- **Play/Pause**: Large button for primary action
- **Scrubbing**: Click/drag on waveform or progress slider to seek
- **Volume**: Slider + mute toggle (desktop only)
- **Keyboard**: Space (play/pause), arrows (seek/volume)

[Source: docs/epics/epic-3-norwegian-song-creation-core.md, docs/ux-design-specification.md, docs/architecture.md]

### Project Structure Notes

**Files to Create:**
- `/src/components/song-player-card.tsx` - Main song player component with waveform and controls

**Dependencies to Install:**
- `npm install howler @types/howler` - Audio playback engine
- `npm install wavesurfer.js` - Waveform visualization

**Existing Components to Leverage (from Previous Stories):**
- `/src/components/ui/card.tsx` - shadcn/ui Card component (Story 1.4)
- `/src/components/ui/slider.tsx` - shadcn/ui Slider for progress/volume (Story 1.4)
- `/src/components/ui/button.tsx` - shadcn/ui Button component (Story 1.4)
- `/src/lib/supabase/client.ts` - Supabase client for fetching song data (Story 1.3)
- `/src/types/song.ts` - Song type definitions (Story 3.5)
- `/src/app/api/songs/[id]/route.ts` - Song data endpoint (Story 3.5)

**Integration Points:**
- Consumes song data from database (completed songs from Story 3.7 webhook)
- Uses signed audio URLs from Supabase Storage (Story 3.7 webhook creates these)
- Displays genre data from genre table (Story 3.10 seed data)
- Used by "My Songs" page (Story 4.1, future)
- May be embedded in song detail modal (Story 4.2, future)

**Styling References:**
- UX Design Specification: Section 6.1 "Custom Component: Song Player Card"
- Playful Nordic colors: Primary red (#E94560), accents from genre-specific gradients
- Card-based design matching genre carousel from Story 3.1
- Typography: Song title (16px semibold), metadata (12px gray)

[Source: docs/architecture.md - Project Structure, docs/ux-design-specification.md]

### Architecture Alignment

**Audio Playback Pattern:**

Use Howler.js as the single source of truth for audio state:

```typescript
import { Howl } from 'howler'

const sound = new Howl({
  src: [audioUrl],
  html5: true,  // Stream audio, don't load entirely
  preload: true,  // Preload for <500ms playback start
  onplay: () => setIsPlaying(true),
  onpause: () => setIsPlaying(false),
  onend: () => setIsPlaying(false),
  onload: () => setDuration(sound.duration()),
  onloaderror: (id, error) => console.error('Audio load failed:', error)
})
```

**Waveform Visualization Pattern:**

Sync WaveSurfer with Howler (Howler controls playback, WaveSurfer displays waveform):

```typescript
import WaveSurfer from 'wavesurfer.js'

const wavesurfer = WaveSurfer.create({
  container: waveformRef.current,
  waveColor: '#98c1d9',
  progressColor: '#E94560',
  height: 60,
  responsive: true
})

wavesurfer.load(audioUrl)

// Sync WaveSurfer with Howler time updates
sound.on('play', () => {
  const updateWaveform = () => {
    if (sound.playing()) {
      const progress = sound.seek() / sound.duration()
      wavesurfer.seekTo(progress)
      requestAnimationFrame(updateWaveform)
    }
  }
  updateWaveform()
})
```

**Responsive Design Pattern:**

Mobile-first layout with Tailwind responsive utilities:

```tsx
<Card className="flex flex-col md:flex-row gap-4 p-4">
  {/* Artwork */}
  <div className="w-full md:w-16 h-16 flex-shrink-0">
    <GradientArtwork genre={genre} />
  </div>

  {/* Metadata + Waveform */}
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div ref={waveformRef} className="mt-2" />
  </div>

  {/* Controls (vertical on mobile, horizontal on desktop) */}
  <div className="flex flex-col md:flex-row gap-2 items-center">
    <Button size="lg" onClick={togglePlay}>
      {isPlaying ? <Pause /> : <Play />}
    </Button>
    <div className="hidden md:flex">
      <VolumeSlider />
    </div>
  </div>
</Card>
```

**Date/Time Formatting (Norwegian):**

```typescript
// Format date with Norwegian locale
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Format time as mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

[Source: docs/architecture.md - Implementation Patterns, Language & Localization]

### Learnings from Previous Story

**From Story 3-7-implement-webhook-handler-for-suno-completion (Status: review)**

- **Audio URL Source**: Webhook creates signed URLs (24-hour expiration) stored in `song.audio_url`
- **URL Refresh**: If signed URL expires, need to regenerate from Supabase Storage path
- **Song Status**: Only play songs with status='completed' (skip 'generating', 'failed', 'cancelled')
- **Duration Data**: `song.duration_seconds` provided by webhook from Suno payload
- **File Location**: Audio files stored at `songs/{userId}/{songId}.mp3` in Supabase Storage
- **Error Messages**: Norwegian error messages stored in `song.error_message` (display in UI if failed)
- **Integration**: Player consumes webhook-processed songs (status='completed', audio_url exists)

**New Files Created in Story 3.7:**
- `/src/app/api/webhooks/suno/route.ts` - Webhook handler that creates signed URLs (pattern reference)

**From Story 3-6-create-ai-generation-progress-modal-component (Status: done)**

- **Norwegian UI Pattern**: All user-facing text in Norwegian (e.g., "Spill av", "Pause", "Noe gikk galt")
- **Progress Display**: Show current/total time in Norwegian format
- **Error Handling**: Display Norwegian error messages to users
- **Loading States**: Show spinner while audio loads (similar to progress modal pattern)
- **State Management**: Use React hooks (useState, useEffect) for component state

**From Story 3-5-implement-song-generation-api-with-suno-integration (Status: done)**

- **Song Data Endpoint**: `/api/songs/[id]` returns song data including title, genre, audio_url, duration, status
- **Song Types**: TypeScript types defined in `/src/types/song.ts`
- **Database Fields**: song.title, song.genre, song.audio_url, song.duration_seconds, song.created_at, song.status

**From Story 3-1-create-genre-carousel-component (Status: review)**

- **Genre Styling**: Genre-specific gradient backgrounds and emojis (can reuse for artwork generation)
- **Card-Based Design**: Similar card layout patterns (shadcn/ui Card component)
- **Responsive Scroll**: CSS scroll-snap for smooth scrolling (may apply to song list)
- **Touch-Friendly**: Large touch targets (48px minimum) for mobile interactions

**Architectural Patterns to Follow:**

- **Norwegian UI**: All labels, messages, tooltips in Norwegian
  - "Spill av" (Play)
  - "Pause" (Pause)
  - "Volum" (Volume)
  - "Søk i sangen" (Seek in song)
  - "Noe gikk galt med lydavspillingen" (Something went wrong with audio playback)

- **Accessibility (WCAG 2.1 AA):**
  - Keyboard navigation (Space, arrows)
  - ARIA labels for screen readers
  - Focus states visible
  - Contrast ratios meet AA standards
  - Touch targets minimum 48x48px

- **Error Handling:**
  - Graceful fallback if audio fails to load
  - Display Norwegian error message to user
  - Log full error details for debugging
  - Retry mechanism for temporary network failures

- **Performance:**
  - Preload audio for instant playback (<500ms)
  - Use html5: true for Howler (stream, don't download entirely)
  - Cleanup audio instances on unmount (prevent memory leaks)
  - Debounce scrubbing updates to reduce CPU usage

- **Responsive Design:**
  - Mobile-first approach (vertical stack)
  - Desktop enhancements (horizontal layout, volume slider)
  - Media queries via Tailwind (md:, lg: breakpoints)

**Potential Issues to Address:**

- **Signed URL Expiration**: Audio URLs expire after 24 hours - need refresh mechanism
- **Browser Autoplay Policies**: iOS Safari may block autoplay - require user interaction first
- **Memory Leaks**: Must cleanup Howler/WaveSurfer instances on component unmount
- **Waveform Load Time**: Large audio files may delay waveform rendering - show loading state
- **Volume Persistence**: Save volume preference to localStorage for better UX
- **Seek Accuracy**: Waveform scrubbing must be precise (avoid jump artifacts)
- **Mobile Data Usage**: Streaming large audio files - consider showing file size warning
- **Concurrent Playback**: If multiple player cards exist, pause others when one plays

**Testing Considerations:**

- Test on iOS Safari (autoplay restrictions, audio format compatibility)
- Test on Android Chrome (touch gestures, waveform rendering)
- Test on desktop browsers (keyboard controls, volume slider)
- Test with screen readers (VoiceOver, NVDA)
- Test with expired signed URLs (should handle gracefully)
- Test with failed audio loads (Norwegian error message)
- Test waveform animation performance (smooth 60fps)
- Test memory usage (no leaks after unmount)
- Verify <500ms playback start time (preload working)
- Test scrubbing accuracy (seeking to specific time)

[Source: docs/sprint-artifacts/3-7-implement-webhook-handler-for-suno-completion.md#Dev-Agent-Record, docs/sprint-artifacts/3-6-create-ai-generation-progress-modal-component.md, docs/architecture.md - Implementation Patterns]

### References

- [Epic 3 Story 3.8 Acceptance Criteria](../epics/epic-3-norwegian-song-creation-core.md#story-38-build-song-player-card-component)
- [UX Design - Custom Component: Song Player Card](../ux-design-specification.md#custom-component-song-player-card)
- [Architecture - Implementation Patterns](../architecture.md#implementation-patterns)
- [Architecture - Language & Localization](../architecture.md#language--localization)
- [Architecture - Accessibility](../architecture.md#accessibility)
- [PRD - FR21-FR23 (Playback Requirements)](../prd.md#track-list--session-management)
- [Story 3.7 - Webhook Handler (Audio URL source)](./3-7-implement-webhook-handler-for-suno-completion.md)
- [Story 3.1 - Genre Carousel (Card design pattern)](./3-1-create-genre-carousel-component.md)
- [Story 1.4 - shadcn/ui Components](./1-4-install-shadcn-ui-and-core-components.md)

## Change Log

**2025-11-24 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 3: Norwegian Song Creation (CORE)
- Source: docs/epics/epic-3-norwegian-song-creation-core.md
- Prerequisites: Story 3.7 (Webhook handler - audio URL source)
- Implements FR21-FR23 (Browser audio playback with waveform)
- Integrated learnings from Story 3.7: Signed URLs, 24-hour expiration, duration data
- Integrated learnings from Story 3.6: Norwegian UI patterns, loading states, error handling
- Integrated learnings from Story 3.5: Song data endpoint, TypeScript types
- Integrated learnings from Story 3.1: Genre styling, card-based design, responsive patterns
- Next step: Run story-context workflow to generate technical context XML, then implement with dev-story workflow

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/3-8-build-song-player-card-component.context.xml` - Generated 2025-11-24

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
