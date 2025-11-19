# Epic 3: Norwegian Song Creation (CORE)

**Goal:** Enable users to create authentic Norwegian songs with AI-powered lyric generation, pronunciation optimization, and high-quality music generation via Suno.

**User Value:** Users can create genuinely Norwegian-sounding songs in under 5 minutes - THE CORE VALUE PROPOSITION!

**FRs Covered:** FR5-FR8 (Lyrics Input), FR9-FR13 (Pronunciation Optimization), FR14-FR20 (Song Generation), FR21-FR23 (Basic Playback), FR51 (Genre Templates)

---

### Story 3.1: Create Genre Carousel Component

As a **user**,
I want to swipe through genre options in a horizontal carousel,
So that I can quickly select the music style for my Norwegian song.

**Acceptance Criteria:**

**Given** I am on the "Create Song" page
**When** I see the genre carousel at the top
**Then** I see 8+ genre cards in a horizontal scrollable carousel
**And** Each card shows: Genre emoji/icon, Genre name (e.g., "Country Rock", "Norwegian Pop"), Gradient background
**And** I can swipe left/right to scroll through genres (touch on mobile, mouse drag on desktop)
**And** Selected genre has a 3px primary red border (#E94560)
**And** Unselected genres are slightly dimmed (80% opacity)
**And** Tapping a card selects that genre
**And** Keyboard arrows navigate carousel (accessibility)

**Prerequisites:** Story 1.4 (shadcn/ui)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Genre Carousel"
- Create `/src/components/genre-carousel.tsx` as custom component
- Genre data from `genre` table in database (name, emoji, gradient colors)
- Use CSS `scroll-snap-type: x mandatory` for smooth snapping
- Card size: 120x80px on mobile, 140x90px on desktop
- Implement horizontal scroll with snap points
- Touch-friendly: Use pan gesture handler

---

### Story 3.2: Implement AI Lyric Generation with Song Concept Input

As a **user**,
I want to describe my song concept and have AI generate Norwegian lyrics,
So that I don't need to write lyrics myself.

**Acceptance Criteria:**

**Given** I have selected a genre from the carousel
**When** I enter a song concept in the textarea (e.g., "Funny birthday song for my friend Lars who loves fishing")
**Then** Character count appears below textarea (1-500 characters)
**And** When I click "Generate Lyrics with AI" button
**Then** OpenAI GPT-4 generates Norwegian lyrics based on concept + genre
**And** Generated lyrics appear in editable textarea (4-8 verse lines typical)
**And** Lyrics match the genre style (e.g., Country Rock = twangy, upbeat)
**And** Norwegian cultural context is preserved (references Norwegian life, humor)
**And** Generation takes <10 seconds
**And** I can edit generated lyrics manually before proceeding

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `/src/app/api/lyrics/generate/route.ts` for AI lyric generation
- Use OpenAI GPT-4 API: temperature 0.7 for creativity
- Prompt engineering: "Generate Norwegian Bokmål lyrics for a {genre} song about {concept}. Make it authentic, funny, and culturally Norwegian. 4-8 lines."
- Environment variable: OPENAI_API_KEY
- Cost: ~$0.03 per request (acceptable)
- Return lyrics as plain text, display in textarea for editing

---

### Story 3.3: Build Norwegian Pronunciation Optimizer with GPT-4

As a **user**,
I want automatic Norwegian pronunciation optimization applied to my lyrics,
So that Suno generates authentic Norwegian vocals instead of "American-sounding" results.

**Acceptance Criteria:**

**Given** I have Norwegian lyrics entered or generated
**When** "Uttalelse Bokmål" toggle is ON (default)
**Then** System analyzes lyrics for pronunciation issues (silent letters, vowel sounds, stress patterns)
**And** GPT-4 suggests phonetic spellings for Norwegian-specific sounds
**And** Original lyrics are preserved, optimized version created
**And** Phonetic rules applied: Rolled R's, Norwegian vowel patterns, consonant clusters
**And** Optimization completes in <5 seconds
**And** User can preview before/after comparison
**And** User can toggle OFF to use original lyrics

**Prerequisites:** Story 3.2

**Technical Notes:**
- Create `/src/lib/phonetic/optimizer.ts` for core pronunciation logic
- Use OpenAI GPT-4 for intelligent phonetic suggestions
- Prompt: "Analyze these Norwegian lyrics for Suno AI music generation. Suggest phonetic spellings to improve Norwegian pronunciation. Return JSON: [{original, optimized, reason}]"
- Store both `original_lyrics` and `optimized_lyrics` in database
- Cache phonetic rules for common Norwegian words to reduce API calls

---

### Story 3.4: Create Phonetic Diff Viewer Component

As a **user**,
I want to see a side-by-side comparison of original and optimized lyrics,
So that I understand what pronunciation changes are being made.

**Acceptance Criteria:**

**Given** Pronunciation optimization has been applied
**When** I click "Preview Phonetic Changes" button
**Then** A modal opens showing split-screen view: Original (left) | Optimized (right)
**And** Changed words are highlighted in green background (#06D6A0)
**And** Unchanged words are displayed in gray
**And** Each line is numbered (1, 2, 3...)
**And** I can toggle optimization ON/OFF for individual lines (per-line checkbox)
**And** I can close modal and accept changes or revert to original
**And** Mobile view: Stacked layout (Original above, Optimized below)

**Prerequisites:** Story 3.3

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Phonetic Diff Viewer"
- Create `/src/components/phonetic-diff-viewer.tsx`
- Use monospace font for aligned comparison
- Implement diff algorithm: highlight changed words only
- Per-line override: Store overrides in component state, merge before generation
- Accessibility: ARIA labels, keyboard navigation

---

### Story 3.5: Implement Song Generation API with Suno Integration

As a **user**,
I want to generate a full Norwegian song from my lyrics and genre,
So that I can hear my concept brought to life with authentic vocals.

**Acceptance Criteria:**

**Given** I have lyrics ready (original or optimized) and genre selected
**When** I click "Generate Song with AI" button
**Then** System checks credit balance (requires 10 credits for full song)
**And** If sufficient credits, 10 credits are deducted atomically
**And** API calls Suno via sunoapi.org with: lyrics, genre prompt template, model version
**And** A `song` record is created in database with status='generating'
**And** User sees progress modal: "🎵 Generating your Norwegian song... ~2 minutes"
**And** Progress modal shows steps: "Writing lyrics" → "Optimizing pronunciation" → "Generating music"
**And** User can cancel generation (credits refunded)
**And** Suno webhook notifies when complete OR polling fallback after 5 seconds

**Prerequisites:** Story 2.6 (Credit deduction), Story 3.3 (Pronunciation)

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "ADR-007: Async Song Generation"
- Create `/src/app/api/songs/generate/route.ts` for song generation endpoint
- Create `/src/lib/api/suno.ts` for Suno API wrapper
- Environment variable: SUNO_API_KEY (sunoapi.org)
- Cost: $0.06 per song (12 credits × $0.005)
- Async pattern: Return 202 Accepted with songId, client polls /api/songs/[id]
- Store Suno song ID for tracking

---

### Story 3.6: Create AI Generation Progress Modal Component

As a **user**,
I want to see real-time progress while my song is generating,
So that I know the system is working and approximately how long it will take.

**Acceptance Criteria:**

**Given** Song generation has been initiated
**When** The progress modal is displayed
**Then** I see a full-screen modal overlay with center card (white, rounded)
**And** Animated progress circle shows 0-100% completion
**And** Status text updates through stages:
  - 0-30%: "🎵 AI writing Norwegian lyrics..."
  - 30-50%: "🎤 Optimizing pronunciation..."
  - 50-100%: "🎸 Generating music with Suno..."
**And** Estimated time remaining displayed: "~2 minutes left"
**And** "Cancel Generation" button at bottom (refunds credits)
**And** On success: Transition to celebration animation (confetti)
**And** On error: Display error message with "Retry" button

**Prerequisites:** Story 3.5

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: AI Generation Progress Modal"
- Create `/src/components/generation-progress-modal.tsx`
- Poll `/api/songs/[id]` every 5 seconds for status update
- Progress percentage estimated: 0-30% (lyrics), 30-50% (phonetic), 50-100% (Suno time)
- Confetti animation on success: Use `canvas-confetti` library
- Non-dismissible during generation (except cancel button)

---

### Story 3.7: Implement Webhook Handler for Suno Completion

As a **developer**,
I want to receive Suno completion webhooks and download audio files immediately,
So that songs are available to users as soon as Suno finishes generation.

**Acceptance Criteria:**

**Given** Suno has completed song generation
**When** Suno webhook calls `/api/webhooks/suno`
**Then** Webhook verifies request signature (security)
**And** Audio file is downloaded from Suno URL immediately (before 3-day auto-deletion)
**And** Audio file is uploaded to Supabase Storage bucket `songs`
**And** Song record is updated: status='completed', audio_url={signed URL}, duration_seconds
**And** User receives notification if they're still online
**And** If webhook fails, polling fallback detects completion within 10 seconds

**Prerequisites:** Story 3.5, Story 1.3 (Supabase Storage)

**Technical Notes:**
- Create `/src/app/api/webhooks/suno/route.ts`
- Verify webhook signature to prevent spoofing
- Download audio with `axios` or `fetch`, stream to Supabase Storage
- Generate signed URL (24-hour expiration) for secure download
- Update song record atomically: status='completed', audio_url, duration
- Handle idempotency: If webhook fires multiple times, don't re-download

---

### Story 3.8: Build Song Player Card Component

As a **user**,
I want to play my generated song directly in the browser with waveform visualization,
So that I can immediately hear the result without downloading.

**Acceptance Criteria:**

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

**Prerequisites:** Story 3.7

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Song Player Card"
- Create `/src/components/song-player-card.tsx`
- Use Howler.js for audio playback: `npm install howler`
- Use wavesurfer.js for waveform: `npm install wavesurfer.js`
- Audio source: Signed URL from Supabase Storage
- Keyboard controls: Space=play/pause, arrows=scrub
- Accessibility: ARIA labels, screen reader announcements

---

### Story 3.9: Implement Free 30-Second Preview Generation

As a **user**,
I want to generate a 30-second watermarked preview for free,
So that I can test the pronunciation quality before purchasing credits.

**Acceptance Criteria:**

**Given** I am a new user with 0 credits
**When** I complete lyrics and genre selection
**Then** I see TWO buttons: "Generate Free Preview (30s)" and "Generate Full Song (10 credits)"
**And** When I click "Generate Free Preview"
**Then** No credits are deducted
**And** Suno generates 30-second clip with watermark: "Created with Musikkfabrikken"
**And** Preview follows same pronunciation optimization process
**And** I can listen to preview in song player
**And** After preview, I see upgrade prompt: "Love it? Generate full song for 10 credits"
**And** Preview is saved to my track list (marked as "Preview")

**Prerequisites:** Story 3.8

**Technical Notes:**
- Modify `/src/app/api/songs/generate/route.ts` to accept `previewMode: boolean`
- Suno API parameter: `make_instrumental=false, duration=30`
- No credit deduction for preview mode
- Watermark added by Suno or post-processing
- Limit: 1 free preview per user per day (prevent spam)

---

### Story 3.10: Add Genre Prompt Templates to Database

As a **developer**,
I want genre prompt templates seeded in the database,
So that each genre has optimized Suno prompts for authentic Norwegian music styles.

**Acceptance Criteria:**

**Given** Database schema includes `genre` table
**When** I run seed script
**Then** 8-10 genres are inserted with Norwegian-optimized prompt templates:
  - Country Rock: "Country, rock, anthem, twangy guitar, catchy fiddle, drum, bass, Norwegian vocals"
  - Norwegian Pop: "Pop, Norwegian, catchy melody, electronic, upbeat, modern production"
  - Folk Ballad: "Folk, acoustic, Norwegian traditional, heartfelt, storytelling"
  - Party Anthem: "Dance, party, energetic, sing-along, festive, Norwegian celebration"
  - Rap/Hip-Hop: "Hip-hop, rap, Norwegian flow, urban, rhythmic, modern beats"
  - Rock Ballad: "Rock, ballad, emotional, guitar solo, powerful vocals, Norwegian"
**And** Each genre has: name, display_name, emoji, gradient colors, suno_prompt_template
**And** Genres are marked `is_active=true` and ordered by `sort_order`

**Prerequisites:** Story 1.6 (Database schema)

**Technical Notes:**
- Create `/supabase/seed.sql` with genre INSERT statements
- Prompt templates validated by founder's 80k listener expertise
- Test each genre with actual Suno generation
- Emoji examples: Country Rock=🎸, Folk=🪕, Party=🎉, Rap=🎤
- Gradients match Playful Nordic theme (red-to-yellow, blue-to-red, etc.)

---
