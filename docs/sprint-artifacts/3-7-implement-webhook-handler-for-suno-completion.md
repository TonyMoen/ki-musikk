# Story 3.7: Implement Webhook Handler for Suno Completion

Status: ready-for-dev

## Story

As a **developer**,
I want to receive Suno completion webhooks and download audio files immediately,
so that songs are available to users as soon as Suno finishes generation.

## Acceptance Criteria

**Given** Suno has completed song generation
**When** Suno webhook calls `/api/webhooks/suno`
**Then** Webhook verifies request signature (security)
**And** Audio file is downloaded from Suno URL immediately (before 3-day auto-deletion)
**And** Audio file is uploaded to Supabase Storage bucket `songs`
**And** Song record is updated: status='completed', audio_url={signed URL}, duration_seconds
**And** User receives notification if they're still online
**And** If webhook fails, polling fallback detects completion within 10 seconds

## Tasks / Subtasks

- [ ] Task 1: Create webhook endpoint structure (AC: Webhook receives and processes Suno callbacks)
  - [ ] Create `/src/app/api/webhooks/suno/route.ts` with POST handler
  - [ ] Parse incoming webhook payload (JSON body)
  - [ ] Extract song ID, audio URL, duration, status from webhook payload
  - [ ] Add CORS headers if needed for sunoapi.org webhooks
  - [ ] Return 200 OK response immediately (acknowledge receipt)
  - [ ] Log all webhook events for debugging and monitoring

- [ ] Task 2: Implement webhook signature verification (AC: Security - verify request authenticity)
  - [ ] Add SUNO_WEBHOOK_SECRET to environment variables (.env.local)
  - [ ] Extract signature from webhook headers (e.g., x-suno-signature)
  - [ ] Compute expected signature using HMAC-SHA256 with secret + payload
  - [ ] Compare computed signature with received signature
  - [ ] Return 401 Unauthorized if signature mismatch
  - [ ] Log signature verification failures for security monitoring

- [ ] Task 3: Download audio file from Suno (AC: Download before 3-day auto-deletion)
  - [ ] Extract audio_url from webhook payload
  - [ ] Use fetch() or axios to download audio file from Suno URL
  - [ ] Stream download to buffer or temp file (handle large files efficiently)
  - [ ] Verify download successful (check Content-Type: audio/mpeg)
  - [ ] Handle download errors gracefully (log + retry once)
  - [ ] Set timeout: 30 seconds max (Suno files are typically 3-5MB)

- [ ] Task 4: Upload audio to Supabase Storage (AC: Store in `songs` bucket)
  - [ ] Initialize Supabase server client with service role key
  - [ ] Generate unique file path: `songs/{userId}/{songId}.mp3`
  - [ ] Upload downloaded audio buffer to Supabase Storage bucket `songs`
  - [ ] Set content type: `audio/mpeg`
  - [ ] Verify upload successful (check for error response)
  - [ ] Generate signed URL with 24-hour expiration for client access
  - [ ] Handle storage errors (log + return error response)

- [ ] Task 5: Update song record in database (AC: Status='completed', audio_url, duration)
  - [ ] Query song by Suno song ID from webhook payload
  - [ ] Verify song exists and is currently status='generating'
  - [ ] Update song record atomically:
    - status='completed'
    - audio_url={signed URL from Supabase Storage}
    - duration_seconds={from webhook payload}
    - updated_at=NOW()
  - [ ] Use RLS policies to ensure only service role can update
  - [ ] Handle race condition: Check if already updated (idempotency)

- [ ] Task 6: Implement idempotency for duplicate webhooks (AC: Handle webhook firing multiple times)
  - [ ] Check song current status before processing
  - [ ] If status='completed', return 200 OK immediately (already processed)
  - [ ] If status='cancelled', return 200 OK (skip processing, credits already refunded)
  - [ ] If status='failed', log warning (unexpected state)
  - [ ] Only process if status='generating' (expected state)
  - [ ] Prevent duplicate downloads and storage uploads

- [ ] Task 7: Implement error handling and rollback (AC: Graceful failure handling)
  - [ ] Wrap entire webhook handler in try-catch block
  - [ ] If download fails: Mark song as 'failed', log error, return 500
  - [ ] If storage upload fails: Mark song as 'failed', log error, return 500
  - [ ] If database update fails: Log error, retry once, return 500
  - [ ] Store error_message in song record for user visibility
  - [ ] Do NOT refund credits on webhook failure (generation completed, issue is download)
  - [ ] Log all errors with full context for debugging

- [ ] Task 8: Add monitoring and logging (AC: Observability for webhook processing)
  - [ ] Log webhook received event: timestamp, song ID, Suno song ID
  - [ ] Log signature verification result (success/failure)
  - [ ] Log download progress: started, size, completed
  - [ ] Log storage upload progress: started, size, completed
  - [ ] Log database update result: success/failure
  - [ ] Log total processing time (target: <10 seconds)
  - [ ] Use structured logging format for easier querying

- [ ] Task 9: Test webhook flow end-to-end (AC: All acceptance criteria verified)
  - [ ] Test successful webhook: Verify audio downloaded, uploaded, song updated
  - [ ] Test signature verification: Send webhook with invalid signature, verify 401 response
  - [ ] Test idempotency: Send duplicate webhook, verify no duplicate processing
  - [ ] Test download failure: Mock failed download, verify song marked as 'failed'
  - [ ] Test storage upload failure: Mock failed upload, verify error handling
  - [ ] Test cancelled song: Send webhook for cancelled song, verify skipped processing
  - [ ] Test completed song: Send webhook for completed song, verify skipped processing
  - [ ] Verify signed URL accessibility: Fetch audio from signed URL in browser
  - [ ] Test performance: Verify total processing time <10 seconds

## Dev Notes

### Requirements Context

**From Epic 3: Norwegian Song Creation (CORE)**

Story 3.7 implements the webhook handler that receives Suno completion notifications and downloads audio files to Supabase Storage. This is the critical bridge between Suno's async generation (Story 3.5) and the client-side polling mechanism (Story 3.6).

**Key Requirements:**
- **FR17**: System downloads generated audio files immediately upon completion
- **FR19**: Audio files are stored securely in Supabase Storage with signed URLs
- **FR66**: Webhook signature verification for security
- **FR67**: Idempotent webhook processing (handle duplicates gracefully)
- **Core Pattern**: Async generation with webhook + polling fallback (ADR-007)

**Technical Constraints from Architecture:**
- **Endpoint Path**: `/src/app/api/webhooks/suno/route.ts` (POST handler)
- **Security**: HMAC-SHA256 signature verification with SUNO_WEBHOOK_SECRET
- **Storage**: Upload to Supabase Storage bucket `songs` with path `songs/{userId}/{songId}.mp3`
- **Signed URLs**: Generate 24-hour expiration signed URLs for client access
- **Idempotency**: Check song status before processing (skip if already completed/cancelled)
- **Error Handling**: Mark song as 'failed' if download or upload fails
- **Performance**: Process webhook in <10 seconds (download + upload + database update)
- **Logging**: Structured logging for monitoring and debugging

**From Epic 3 - Story 3.7 Specifications:**

Webhook processing flow:
1. **Receive Webhook**: Suno calls `/api/webhooks/suno` with song completion data
2. **Verify Signature**: HMAC-SHA256 verification with secret key
3. **Download Audio**: Fetch audio file from Suno URL (before 3-day expiration)
4. **Upload to Storage**: Store in Supabase Storage `songs` bucket
5. **Update Database**: Mark song as 'completed', set audio_url and duration
6. **Acknowledge**: Return 200 OK to Suno

Security considerations:
- Webhook signature verification prevents spoofing attacks
- Service role key for storage operations (bypasses RLS)
- Signed URLs with 24-hour expiration for secure client access
- Idempotency to prevent duplicate processing

[Source: docs/epics/epic-3-norwegian-song-creation-core.md, docs/architecture.md - ADR-007]

### Project Structure Notes

**Files to Create:**
- `/src/app/api/webhooks/suno/route.ts` - POST webhook handler for Suno completion
- Environment variable: `SUNO_WEBHOOK_SECRET` - Secret key for webhook signature verification

**Files to Modify:**
- `.env.local` - Add SUNO_WEBHOOK_SECRET environment variable
- `/src/types/suno.ts` (create if not exists) - TypeScript types for Suno webhook payload

**Existing Components to Leverage (from Previous Stories):**
- `/src/lib/supabase/server.ts` - Supabase server client with service role (Story 1.3)
- `/src/lib/api/suno.ts` - Suno API wrapper (Story 3.5)
- `/src/types/song.ts` - Song type definitions (Story 3.5)
- `/src/app/api/songs/[id]/route.ts` - Song status polling endpoint (Story 3.5)
- Supabase Storage bucket `songs` - Created in Story 1.3

**Supabase Storage Configuration:**
- Bucket: `songs` (audio files)
- Path format: `songs/{userId}/{songId}.mp3`
- Access: Private (requires signed URLs)
- File size limit: 10MB (typical Suno songs are 3-5MB)
- Expiration: 14-day auto-deletion (per architecture)

**Webhook Payload Structure (Expected from Suno):**
```typescript
{
  suno_song_id: string,      // Suno's internal song ID
  status: 'completed' | 'failed',
  audio_url: string,          // URL to download audio file
  duration_seconds: number,   // Song duration
  error_message?: string      // If status='failed'
}
```

[Source: docs/architecture.md - Integration Points]

### Architecture Alignment

**Webhook + Polling Pattern (from ADR-007):**

This story implements the webhook half of the async generation pattern:

1. **Webhook (Primary)**:
   - Suno calls `/api/webhooks/suno` when generation completes
   - Downloads audio immediately (before 3-day Suno expiration)
   - Updates database: status='completed', audio_url, duration
   - Client polling (Story 3.6) detects status change and stops

2. **Polling Fallback**:
   - If webhook fails or is delayed, client continues polling
   - Polling endpoint (Story 3.5) checks Suno API directly
   - Downloads audio if not already done by webhook
   - Ensures reliability even if webhook mechanism fails

**Idempotency Pattern:**

Critical for handling duplicate webhooks (Suno may retry on timeout):

```typescript
// Check current status before processing
const { data: song } = await supabase
  .from('song')
  .select('status')
  .eq('suno_song_id', webhookPayload.suno_song_id)
  .single()

// Skip if already processed
if (song.status === 'completed') {
  console.log('Webhook already processed, returning 200 OK')
  return NextResponse.json({ message: 'Already processed' }, { status: 200 })
}

// Skip if cancelled
if (song.status === 'cancelled') {
  console.log('Song was cancelled, skipping webhook processing')
  return NextResponse.json({ message: 'Song cancelled' }, { status: 200 })
}

// Process only if status='generating'
if (song.status !== 'generating') {
  console.warn(`Unexpected song status: ${song.status}`)
  return NextResponse.json({ error: 'Unexpected status' }, { status: 400 })
}

// Proceed with download and upload...
```

**Signature Verification Pattern:**

```typescript
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

**Supabase Storage Upload Pattern:**

```typescript
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Download from Suno
const audioResponse = await fetch(webhookPayload.audio_url)
const audioBuffer = await audioResponse.arrayBuffer()

// Upload to Supabase Storage
const filePath = `songs/${userId}/${songId}.mp3`
const { data, error } = await supabase.storage
  .from('songs')
  .upload(filePath, audioBuffer, {
    contentType: 'audio/mpeg',
    upsert: false  // Prevent overwriting
  })

// Generate signed URL
const { data: signedUrl } = await supabase.storage
  .from('songs')
  .createSignedUrl(filePath, 86400)  // 24-hour expiration
```

[Source: docs/architecture.md - Implementation Patterns, Integration Points]

### Learnings from Previous Story

**From Story 3-6-create-ai-generation-progress-modal-component (Status: done)**

- **Polling Endpoint**: Client polls `/api/songs/[id]` every 5 seconds - webhook updates status to 'completed'
- **Cancellation Status**: Added 'cancelled' status to Song types - webhook must skip processing for cancelled songs
- **Norwegian UI**: All user-facing error messages in Norwegian (e.g., "Noe gikk galt under genereringen")
- **Credit Refund**: Cancel endpoint refunds 10 credits - webhook should NOT refund on failure (generation completed)
- **Status Transitions**: 'generating' → 'completed' (success) or 'failed' (error) or 'cancelled' (user action)
- **Integration Point**: Webhook updates database, polling detects change and stops

**New Files Created in Story 3.6:**
- `/src/app/api/songs/[id]/cancel/route.ts` - Cancellation endpoint (pattern reference for webhook)
- `/src/components/generation-progress-modal.tsx` - Polling component that consumes webhook updates

**From Story 3-5-implement-song-generation-api-with-suno-integration (Status: done)**

- **Suno API Wrapper**: `/src/lib/api/suno.ts` contains Suno API integration (may include webhook URL registration)
- **Song Status Endpoint**: `/api/songs/[id]` returns current song status (polling fallback if webhook fails)
- **Database Structure**: Song table has fields: suno_song_id, audio_url, duration_seconds, status, error_message
- **Credit Deduction**: 10 credits deducted on generation start - DO NOT refund if webhook processing fails
- **Async Pattern**: Generation returns 202 Accepted, webhook notifies on completion
- **Error Handling**: Mark song as 'failed' with error_message if download or upload fails

**Architectural Patterns to Follow:**
- **Service Role Key**: Use SUPABASE_SERVICE_ROLE_KEY for webhook operations (bypasses RLS)
- **Idempotency**: Always check current status before processing (prevent duplicate downloads)
- **Security**: Verify webhook signature before processing (prevent spoofing)
- **Error Messages**: Store Norwegian error messages in song.error_message for user visibility
- **Logging**: Structured logging for monitoring and debugging (timestamp, song ID, event type)
- **Performance**: Target <10 seconds total processing time (download + upload + database update)

**Integration Points:**
- Receives webhook from Suno (sunoapi.org completion callback)
- Downloads audio from Suno URL (before 3-day expiration)
- Uploads to Supabase Storage (bucket: songs, path: songs/{userId}/{songId}.mp3)
- Updates song record (status='completed', audio_url, duration_seconds)
- Polling endpoint (Story 3.5) detects status change and returns to client
- Progress modal (Story 3.6) stops polling when status='completed'

**Potential Issues to Address:**
- **Duplicate Webhooks**: Suno may retry on timeout - implement idempotency check
- **Large Files**: Audio files are 3-5MB - stream download to prevent memory issues
- **Webhook Failures**: If webhook fails, polling fallback (Story 3.5) must download audio
- **Signature Verification**: Prevent spoofing attacks - verify HMAC-SHA256 signature
- **Race Condition**: Webhook and polling may process simultaneously - use database locks or check status
- **Storage Quota**: Monitor Supabase Storage usage - 14-day auto-deletion helps
- **Signed URL Expiration**: 24-hour expiration - client must refresh if expired
- **Error Visibility**: Store Norwegian error messages in database for user feedback
- **Network Timeouts**: Set 30-second timeout for Suno downloads
- **Cancelled Songs**: Skip processing if song was cancelled (credits already refunded)

**Testing Considerations:**
- Test successful webhook with real Suno payload
- Test signature verification failure (401 Unauthorized)
- Test idempotency (duplicate webhooks)
- Test download failure (mark song as 'failed')
- Test upload failure (mark song as 'failed')
- Test cancelled song (skip processing)
- Test completed song (skip processing, idempotency)
- Test signed URL generation (verify accessibility)
- Test performance (<10 seconds processing time)
- Verify polling fallback works if webhook fails

[Source: docs/sprint-artifacts/3-6-create-ai-generation-progress-modal-component.md#Dev-Agent-Record, docs/sprint-artifacts/3-5-implement-song-generation-api-with-suno-integration.md]

### References

- [Epic 3 Story 3.7 Acceptance Criteria](../epics/epic-3-norwegian-song-creation-core.md#story-37-implement-webhook-handler-for-suno-completion)
- [Architecture - ADR-007: Async Song Generation](../architecture.md#adr-007-async-song-generation-with-webhook--polling-fallback)
- [Architecture - Webhook Endpoints](../architecture.md#webhook-endpoints)
- [Architecture - Supabase Integration](../architecture.md#supabase-integration)
- [PRD - FR17 (Audio Download)](../prd.md#song-generation--processing)
- [PRD - FR66-FR67 (Webhook Security)](../prd.md#error-handling--resilience)
- [Story 3.5 - Song Generation API](./3-5-implement-song-generation-api-with-suno-integration.md)
- [Story 3.6 - Progress Modal](./3-6-create-ai-generation-progress-modal-component.md)
- [Story 1.3 - Supabase Setup](./1-3-set-up-supabase-project-and-environment-variables.md)

## Change Log

**2025-11-24 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 3: Norwegian Song Creation (CORE)
- Source: docs/epics/epic-3-norwegian-song-creation-core.md
- Prerequisites: Story 3.5 (Song generation API), Story 1.3 (Supabase Storage)
- Implements FR17, FR66-FR67 (Webhook handler with security and idempotency)
- Integrated learnings from Story 3.6: Status transitions, cancellation handling, polling integration
- Integrated learnings from Story 3.5: Suno API integration, database structure, async pattern
- Next step: Run story-context workflow to generate technical context XML, then implement with dev-story workflow

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/3-7-implement-webhook-handler-for-suno-completion.context.xml` - Complete story context including documentation references, existing code artifacts, interfaces, constraints, and testing guidance

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
