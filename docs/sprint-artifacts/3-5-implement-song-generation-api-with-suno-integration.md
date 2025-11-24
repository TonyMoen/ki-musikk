# Story 3.5: Implement Song Generation API with Suno Integration

Status: ready-for-dev

## Story

As a **user**,
I want to generate a full Norwegian song from my lyrics and genre,
so that I can hear my concept brought to life with authentic vocals.

## Acceptance Criteria

**Given** I have lyrics ready (original or optimized) and genre selected
**When** I click "Generer sang med AI" (Generate Song with AI) button
**Then** System checks credit balance (requires 10 credits for full song)
**And** If sufficient credits, 10 credits are deducted atomically
**And** API calls Suno via sunoapi.org with: lyrics, genre prompt template, model version
**And** A `song` record is created in database with status='generating'
**And** User sees progress modal: "🎵 Genererer din norske sang... ~2 minutter"
**And** Progress modal shows steps: "Skriver tekst" → "Optimerer uttale" → "Genererer musikk"
**And** User can cancel generation (credits refunded)
**And** Suno webhook notifies when complete OR polling fallback after 5 seconds

## Tasks / Subtasks

- [ ] Task 1: Create Suno API wrapper library (AC: API calls Suno via sunoapi.org)
  - [ ] Create `/src/lib/api/suno.ts` with TypeScript interfaces for Suno API
  - [ ] Implement `generateSong()` function with parameters: lyrics, genrePrompt, modelVersion
  - [ ] Add environment variable `SUNO_API_KEY` for authentication
  - [ ] Handle Suno API response: extract song_id, status, estimated_time
  - [ ] Implement error handling for Suno API failures (network, rate limits, invalid params)
  - [ ] Add request/response logging for debugging

- [ ] Task 2: Create song generation API endpoint (AC: API endpoint created)
  - [ ] Create `/src/app/api/songs/generate/route.ts` with POST handler
  - [ ] Validate request body: lyrics (required), genreId (required), phoneticEnabled (boolean)
  - [ ] Authenticate user via Supabase session (reject if not logged in)
  - [ ] Check credit balance >= 10 credits (return 403 if insufficient)
  - [ ] Load genre from database to get `suno_prompt_template`
  - [ ] Select lyrics: use optimized_lyrics if phoneticEnabled=true, else original_lyrics
  - [ ] Implement try-catch for error handling with Norwegian error messages

- [ ] Task 3: Implement atomic credit deduction (AC: 10 credits deducted atomically)
  - [ ] Call Supabase RPC function `deduct_credits(user_id, 10, 'Song generation', song_id)`
  - [ ] Handle insufficient credits error: return 403 with "Ikke nok kreditter" message
  - [ ] Ensure transaction atomicity: credits deducted before Suno API call
  - [ ] Store credit_transaction record with transaction_type='deduction'
  - [ ] Link credit transaction to song record (foreign key song_id)

- [ ] Task 4: Create song database record (AC: Song record created with status='generating')
  - [ ] Insert new `song` record with: user_id, title, genre, concept, lyrics, status='generating'
  - [ ] Store both `original_lyrics` and `optimized_lyrics` (if phonetic enabled)
  - [ ] Set `phonetic_enabled` boolean field based on user choice
  - [ ] Store `suno_song_id` returned from Suno API
  - [ ] Set `created_at` timestamp
  - [ ] Return song UUID to client for polling

- [ ] Task 5: Implement Suno API integration (AC: API calls Suno)
  - [ ] Call Suno API POST `/api/custom_generate` with payload: lyrics, genre prompt, model
  - [ ] Set appropriate timeout (30 seconds) for API call
  - [ ] Handle Suno-specific error codes: rate limit (429), invalid lyrics (400), server error (500)
  - [ ] Store Suno response: song_id, estimated_time
  - [ ] Update song record with suno_song_id for tracking
  - [ ] Log Suno request/response for troubleshooting

- [ ] Task 6: Implement credit rollback on failure (AC: Credits refunded if generation fails)
  - [ ] Wrap Suno API call in try-catch block
  - [ ] If Suno call fails: Call `refund_credits(user_id, 10, song_id, error_message)`
  - [ ] Update song record: status='failed', error_message
  - [ ] Insert refund transaction: transaction_type='refund', amount=+10
  - [ ] Log rollback event with failure reason
  - [ ] Return error to client with Norwegian message: "Generering feilet. Kreditter refundert."

- [ ] Task 7: Implement API response format (AC: Client receives 202 Accepted with song ID)
  - [ ] Return HTTP 202 Accepted (async operation started)
  - [ ] Response body: `{ data: { songId, status: 'generating', estimatedTime } }`
  - [ ] Include estimated time from Suno (~120-180 seconds)
  - [ ] Add CORS headers if needed for API access
  - [ ] Set appropriate cache headers (no-cache for dynamic endpoint)

- [ ] Task 8: Create song status polling endpoint (AC: Polling fallback after 5 seconds)
  - [ ] Create `/src/app/api/songs/[id]/route.ts` with GET handler
  - [ ] Authenticate user and verify song ownership (RLS policy)
  - [ ] Return song record with: id, title, status, audio_url, duration, created_at
  - [ ] If status='generating': return 200 with progress estimate
  - [ ] If status='completed': return 200 with audio_url (signed Supabase URL)
  - [ ] If status='failed': return 200 with error_message
  - [ ] Handle song not found: return 404

- [ ] Task 9: Integration and testing (AC: All)
  - [ ] Test full flow: button click → credit check → deduction → Suno call → song record
  - [ ] Test insufficient credits: verify 403 error with Norwegian message
  - [ ] Test credit rollback: simulate Suno failure, verify refund transaction
  - [ ] Test song polling: verify status updates from 'generating' to 'completed'
  - [ ] Test with phonetic enabled/disabled: verify correct lyrics sent to Suno
  - [ ] Test genre prompt templates: verify template applied correctly
  - [ ] Test error cases: network failure, Suno rate limit, invalid lyrics
  - [ ] Verify Norwegian UI text throughout

## Dev Notes

### Requirements Context

**From Epic 3: Norwegian Song Creation (CORE)**

Story 3.5 implements the core song generation engine - the culmination of the lyric generation (3.2), pronunciation optimization (3.3), and diff viewer (3.4) workflows. This is the critical integration point where user-crafted Norwegian lyrics are transformed into authentic-sounding AI-generated music via the Suno API.

**Key Requirements:**
- **FR15**: Users can generate full-length songs using credits
- **FR16**: Users can view real-time generation status and progress
- **FR17**: Users can cancel pending song generation requests
- **FR18**: System automatically deducts credits upon successful generation
- **FR19**: System automatically rolls back credits if generation fails
- **Core Value**: Transform Norwegian lyrics into authentic-sounding vocals through Suno API integration

**Technical Constraints from Architecture:**
- **API Wrapper Path**: `/src/lib/api/suno.ts` (Suno API integration)
- **API Route Path**: `/src/app/api/songs/generate/route.ts` (POST endpoint)
- **Status Endpoint**: `/src/app/api/songs/[id]/route.ts` (GET endpoint for polling)
- **Credit System**: Atomic deduction using Supabase RPC `deduct_credits()`
- **Async Pattern**: 202 Accepted → client polls → webhook/fallback completion
- **Database**: Store song record with status='generating', update on completion
- **Error Handling**: Automatic credit refund on Suno API failure
- **Security**: Supabase RLS policies ensure users only access their own songs

**From Epic 3 - Story 3.5 Specifications:**

API integration specifications:
- **Suno API Endpoint**: sunoapi.org `/api/custom_generate`
- **Authentication**: API key via environment variable `SUNO_API_KEY`
- **Request Payload**: `{ lyrics, genre_prompt, model_version, webhook_url }`
- **Response**: `{ song_id, status, estimated_time }`
- **Cost**: $0.06 per song generation (covered by 10 credits × $0.005 = $0.05 user payment)
- **Generation Time**: 120-180 seconds typical
- **Webhook**: `/api/webhooks/suno` for completion notification (Story 3.7)
- **Polling Fallback**: Client polls `/api/songs/[id]` every 5 seconds if webhook fails

[Source: docs/epics/epic-3-norwegian-song-creation-core.md, docs/architecture.md - ADR-007: Async Song Generation]

### Project Structure Notes

**Files to Create:**
- `/src/lib/api/suno.ts` - Suno API wrapper with TypeScript interfaces
- `/src/app/api/songs/generate/route.ts` - POST endpoint for song generation
- `/src/app/api/songs/[id]/route.ts` - GET endpoint for song status polling
- `/src/types/song.ts` - TypeScript types for song data structures (if not exists)

**Files to Modify:**
- `/src/app/page.tsx` - Add "Generer sang med AI" button and generation flow
- Environment variables: Add `SUNO_API_KEY`

**Existing Components to Leverage (from Previous Stories):**
- `/src/lib/credits/transaction.ts` - Credit deduction logic with RPC calls (Story 2.6)
- `/src/lib/supabase/client.ts` - Supabase client for database operations (Story 1.3)
- `/src/components/generation-progress-modal.tsx` - Progress modal (Story 3.6, will integrate in future)
- Database schema: `song`, `credit_transaction` tables (Story 1.6)

**Database Schema (from Architecture):**

```sql
-- Song table (from Story 1.6)
CREATE TABLE song (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  concept TEXT,  -- User's original concept/prompt
  original_lyrics TEXT,  -- Before phonetic optimization
  optimized_lyrics TEXT,  -- After phonetic optimization
  phonetic_enabled BOOLEAN DEFAULT true,
  suno_song_id TEXT,  -- Suno API song ID for tracking
  audio_url TEXT,  -- Supabase Storage URL (set by webhook in Story 3.7)
  duration_seconds INTEGER,
  status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy: Users can only access their own songs
ALTER TABLE song ENABLE ROW LEVEL SECURITY;
CREATE POLICY song_select ON song FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY song_insert ON song FOR INSERT WITH CHECK (auth.uid() = user_id);
```

[Source: docs/architecture.md - Database Schema]

### Architecture Alignment

**API Integration Pattern (from Architecture):**

This story implements the async song generation pattern (ADR-007):

1. **Request Phase** (202 Accepted):
   - Client POSTs to `/api/songs/generate` with lyrics + genre
   - Server checks credits, deducts 10 credits atomically
   - Server calls Suno API `/api/custom_generate`
   - Server creates `song` record with status='generating'
   - Server returns `{ songId, status: 'generating', estimatedTime }`

2. **Processing Phase** (Async):
   - Suno generates song (1-3 minutes)
   - Webhook notifies `/api/webhooks/suno` on completion (Story 3.7)
   - If webhook fails, polling detects completion within 10 seconds

3. **Polling Phase** (Client-side):
   - Client polls `/api/songs/[id]` every 5 seconds
   - Returns current status: 'generating', 'completed', or 'failed'
   - When completed: includes audio_url for playback

**Credit System Integration:**

Credit deduction follows atomic transaction pattern (Story 2.6):
- Use Supabase RPC `deduct_credits(p_user_id, p_amount, p_description, p_song_id)`
- RPC locks user row (FOR UPDATE), validates balance, deducts credits
- Records transaction in `credit_transaction` table
- Returns error if insufficient credits (< 10)
- Rollback on Suno failure: Insert refund transaction (+10 credits)

**Norwegian UI Language:**
- Button label: "Generer sang med AI" (not "Generate Song")
- Progress message: "Genererer din norske sang... ~2 minutter"
- Error messages: "Ikke nok kreditter", "Generering feilet. Kreditter refundert."
- Status steps: "Skriver tekst" → "Optimerer uttale" → "Genererer musikk"

[Source: docs/architecture.md - Language & Localization, Implementation Patterns, API Contracts]

### Learnings from Previous Story

**From Story 3-4-create-phonetic-diff-viewer-component (Status: done)**

- **Norwegian UI Consistency**: All user-facing text in Norwegian - apply to all button labels, messages, and progress indicators
- **Component Integration**: PhoneticDiffViewer returns merged lyrics via `onAccept` callback - use this as input to song generation
- **State Management**: Use useState for local state (lyrics, genre, generation status)
- **Error Handling**: Norwegian error messages with toast notifications for user feedback
- **API Patterns**: POST endpoints with validation, authentication, and error responses
- **TypeScript Types**: Create dedicated type files for API request/response structures

**New Files Created in Story 3.4:**
- `/src/lib/phonetic/diff.ts` - Diff algorithm (not directly used here, but pattern reference)
- `/src/components/phonetic-diff-viewer.tsx` - Returns merged lyrics for generation

**Architectural Patterns to Follow:**
- **API Route Structure**: POST handler → validate → authenticate → business logic → return response
- **Credit Check First**: Always verify credits before expensive operations
- **Atomic Transactions**: Use database-level atomicity (RPC functions) for credit operations
- **Async Operations**: Return 202 Accepted for long-running operations, not 200 OK
- **Error Handling**: Try-catch at API route level, Norwegian error messages, log failures
- **Norwegian Labels**: Consistent Norwegian throughout UI and error messages

**Integration Points:**
- Receives optimized lyrics from Story 3.3 (pronunciation optimizer) via PhoneticDiffViewer
- Loads genre prompt template from Story 3.10 (genre templates in database)
- Uses credit system from Story 2.6 (atomic credit deduction with RPC)
- Creates song record in database schema from Story 1.6
- Will trigger progress modal from Story 3.6 (future integration)
- Will trigger webhook handler in Story 3.7 (completion notification)

**Potential Issues to Address:**
- **Suno Rate Limits**: Handle 429 Too Many Requests with retry logic or queue
- **Network Failures**: Robust error handling with automatic retry (3 attempts with exponential backoff)
- **Invalid Lyrics**: Suno may reject certain content - handle 400 errors gracefully
- **Credit Rollback Race Condition**: Ensure rollback only happens once (idempotency check)
- **Long Polling**: Prevent infinite polling loops (max 60 attempts = 5 minutes)
- **Webhook vs Polling**: Ensure webhook and polling don't conflict (use database locks)
- **Audio URL Expiration**: Supabase signed URLs expire after 24 hours - regenerate as needed
- **Genre Template Missing**: Handle case where genre_id doesn't exist in database
- **Empty Lyrics**: Validate lyrics length (min 10 characters, max 5000 characters)
- **User Cancellation**: Implement cancellation endpoint (refund credits, mark as cancelled)

**Testing Considerations:**
- Test with real Suno API (use test API key if available)
- Test credit deduction and rollback with database transactions
- Test polling endpoint with mock data (simulating 'generating' → 'completed')
- Test error cases: insufficient credits, Suno failure, network timeout
- Test with both phonetic enabled/disabled to verify correct lyrics sent
- Test genre prompt template substitution
- Verify Norwegian error messages displayed to user
- Test concurrent requests to ensure no race conditions

[Source: docs/sprint-artifacts/3-4-create-phonetic-diff-viewer-component.md#Dev-Agent-Record]

### References

- [Epic 3 Story 3.5 Acceptance Criteria](../epics/epic-3-norwegian-song-creation-core.md#story-35-implement-song-generation-api-with-suno-integration)
- [Architecture - ADR-007: Async Song Generation](../architecture.md#adr-007-async-song-generation-with-webhook--polling-fallback)
- [Architecture - API Contracts](../architecture.md#api-contracts)
- [Architecture - Database Schema](../architecture.md#database-schema-postgresql-17-via-supabase)
- [Architecture - Credit System Patterns](../architecture.md#credit-system-patterns)
- [PRD - FR15-FR20 (Song Generation)](../prd.md#song-generation--processing)
- [Story 2.6 - Atomic Credit Deduction](./2-6-implement-atomic-credit-deduction-with-rollback.md)
- [Story 3.3 - Pronunciation Optimizer](./3-3-build-norwegian-pronunciation-optimizer-with-gpt4.md)
- [Story 3.4 - Phonetic Diff Viewer](./3-4-create-phonetic-diff-viewer-component.md)
- [Story 3.6 - Progress Modal (Future)](./3-6-create-ai-generation-progress-modal-component.md)
- [Story 3.7 - Webhook Handler (Future)](./3-7-implement-webhook-handler-for-suno-completion.md)

## Change Log

**2025-11-24 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 3: Norwegian Song Creation (CORE)
- Source: docs/epics/epic-3-norwegian-song-creation-core.md
- Prerequisites: Story 2.6 (Credit system), Story 3.3 (Pronunciation), Story 3.4 (Diff viewer)
- Implements FR15-FR20 (Song generation with Suno API integration)
- Integrated learnings from Story 3.4: Norwegian UI, API patterns, error handling, credit system
- Next step: Run story-context workflow to generate technical context XML, then implement with dev-story workflow

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/3-5-implement-song-generation-api-with-suno-integration.context.xml`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
