# Story 3.6: Create AI Generation Progress Modal Component

Status: ready-for-dev

## Story

As a **user**,
I want to see real-time progress while my song is generating,
so that I know the system is working and approximately how long it will take.

## Acceptance Criteria

**Given** Song generation has been initiated
**When** The progress modal is displayed
**Then** I see a full-screen modal overlay with center card (white, rounded)
**And** Animated progress circle shows 0-100% completion
**And** Status text updates through stages:
  - 0-30%: "🎵 AI skriver norske tekster..."
  - 30-50%: "🎤 Optimerer uttale..."
  - 50-100%: "🎸 Genererer musikk med Suno..."
**And** Estimated time remaining displayed: "~2 minutter igjen"
**And** "Avbryt generering" (Cancel Generation) button at bottom (refunds credits)
**And** On success: Transition to celebration animation (confetti)
**And** On error: Display error message with "Prøv igjen" (Retry) button

## Tasks / Subtasks

- [ ] Task 1: Create progress modal component shell (AC: Full-screen modal overlay)
  - [ ] Create `/src/components/generation-progress-modal.tsx` with TypeScript
  - [ ] Use shadcn/ui Dialog component as base for modal overlay
  - [ ] Implement full-screen overlay with backdrop blur
  - [ ] Create centered white card with rounded corners (Playful Nordic theme)
  - [ ] Make modal non-dismissible during generation (no close X button)
  - [ ] Add responsive design: full-width on mobile, max-width on desktop

- [ ] Task 2: Implement animated progress circle (AC: 0-100% completion animation)
  - [ ] Create circular progress indicator using SVG or shadcn/ui Progress component
  - [ ] Animate progress from 0% to 100% smoothly (CSS transitions)
  - [ ] Display percentage number in center of circle (e.g., "75%")
  - [ ] Use primary red color (#E94560) for progress fill
  - [ ] Gray background ring for unfilled portion
  - [ ] Add pulsing animation during generation for visual feedback

- [ ] Task 3: Implement stage-based status messages (AC: Status text updates through stages)
  - [ ] Define three generation stages with Norwegian text:
    - Stage 1 (0-30%): "🎵 AI skriver norske tekster..."
    - Stage 2 (30-50%): "🎤 Optimerer uttale..."
    - Stage 3 (50-100%): "🎸 Genererer musikk med Suno..."
  - [ ] Calculate current stage based on progress percentage
  - [ ] Update status text dynamically as progress advances
  - [ ] Add fade transition when switching between stages
  - [ ] Display emoji + text below progress circle

- [ ] Task 4: Implement time estimation logic (AC: Estimated time remaining)
  - [ ] Calculate estimated total time (120-180 seconds from Suno API)
  - [ ] Calculate elapsed time since generation started
  - [ ] Estimate remaining time based on current progress percentage
  - [ ] Display as "~X minutter igjen" or "~X sekunder igjen"
  - [ ] Update countdown every second
  - [ ] Handle edge case: If over estimated time, show "Snart ferdig..."

- [ ] Task 5: Implement polling mechanism for real-time status (AC: Real-time progress)
  - [ ] Poll `/api/songs/[id]` endpoint every 5 seconds
  - [ ] Extract song status from API response: 'generating', 'completed', 'failed'
  - [ ] Update progress percentage based on estimated time and elapsed time
  - [ ] Stop polling when status becomes 'completed' or 'failed'
  - [ ] Handle network errors gracefully (retry with exponential backoff)
  - [ ] Cleanup polling interval on component unmount

- [ ] Task 6: Implement cancel generation functionality (AC: Cancel button refunds credits)
  - [ ] Add "Avbryt generering" button at bottom of modal (secondary style)
  - [ ] Create `/src/app/api/songs/[id]/cancel/route.ts` endpoint for cancellation
  - [ ] POST to cancel endpoint: Mark song as 'cancelled', refund 10 credits
  - [ ] Use credit refund RPC function: `refund_credits(user_id, 10, song_id)`
  - [ ] Show confirmation dialog: "Er du sikker? Kreditter blir refundert."
  - [ ] On confirm: Call API, close modal, show toast: "Generering avbrutt. 10 kreditter refundert."
  - [ ] Disable cancel button if generation is >90% complete

- [ ] Task 7: Implement success celebration animation (AC: Confetti on success)
  - [ ] Install canvas-confetti library: `npm install canvas-confetti`
  - [ ] Trigger confetti animation when status='completed' and progress=100%
  - [ ] Display success message: "🎉 Sangen din er klar!"
  - [ ] Show "Spill av nå" (Play Now) button to proceed to song player
  - [ ] Auto-close modal after 3 seconds or when user clicks button
  - [ ] Confetti colors: Primary red (#E94560) and accent yellow (#FFD93D)

- [ ] Task 8: Implement error handling UI (AC: Error message with retry)
  - [ ] Detect when status='failed' from API response
  - [ ] Display error icon (red X or alert triangle)
  - [ ] Show Norwegian error message from API: `song.error_message`
  - [ ] Generic fallback: "Noe gikk galt under genereringen."
  - [ ] Display "Prøv igjen" button (restarts generation flow)
  - [ ] Display "Lukk" button (closes modal, no retry)
  - [ ] Verify credits were refunded (show balance update)

- [ ] Task 9: Integration and testing (AC: All)
  - [ ] Test full flow: Click "Generate Song" → Modal opens → Progress updates → Success
  - [ ] Test cancellation: Click "Avbryt" → Confirm → Credits refunded → Modal closes
  - [ ] Test error scenario: Simulate Suno failure → Error UI shown → Retry works
  - [ ] Test time estimates: Verify countdown accuracy and "Snart ferdig" fallback
  - [ ] Test stage transitions: Verify status messages update at correct percentages
  - [ ] Test responsive design: Mobile (full-width) and desktop (centered card)
  - [ ] Test confetti animation: Verify colors and timing
  - [ ] Test accessibility: Keyboard navigation, screen reader announcements
  - [ ] Verify Norwegian UI text throughout

## Dev Notes

### Requirements Context

**From Epic 3: Norwegian Song Creation (CORE)**

Story 3.6 creates the progress modal component that provides real-time visual feedback during song generation (Story 3.5). This is a critical UX component that bridges the gap between initiating song generation and receiving the completed audio file.

**Key Requirements:**
- **FR16**: Users can view real-time generation status and progress
- **FR17**: Users can cancel pending song generation requests with credit refund
- **FR18**: System provides estimated time remaining during generation
- **Core UX**: Keep users engaged during 1-3 minute generation wait time

**Technical Constraints from Architecture:**
- **Component Path**: `/src/components/generation-progress-modal.tsx` (custom component)
- **Polling Pattern**: Poll `/api/songs/[id]` every 5 seconds for status updates
- **Progress Estimation**: Calculate based on elapsed time vs estimated total time (120-180s)
- **Cancellation API**: Create `/src/app/api/songs/[id]/cancel/route.ts` endpoint
- **Credit Refund**: Use RPC `refund_credits()` on cancellation
- **Success Animation**: Use canvas-confetti library for celebration
- **Norwegian UI**: All text labels and messages in Norwegian

**From Epic 3 - Story 3.6 Specifications:**

Modal UI specifications:
- **Layout**: Full-screen overlay with centered card (white background, rounded corners)
- **Progress Circle**: Animated SVG or shadcn/ui Progress component (0-100%)
- **Stage Messages**: Three Norwegian status messages based on progress percentage
- **Time Display**: Countdown timer showing estimated time remaining
- **Cancel Button**: Secondary style button at bottom (hidden if >90% complete)
- **Success Animation**: Confetti with Playful Nordic colors (red #E94560, yellow #FFD93D)
- **Error UI**: Red icon, error message, "Prøv igjen" and "Lukk" buttons

[Source: docs/epics/epic-3-norwegian-song-creation-core.md, docs/ux-design-specification.md - AI Generation Progress Modal]

### Project Structure Notes

**Files to Create:**
- `/src/components/generation-progress-modal.tsx` - Main progress modal component
- `/src/app/api/songs/[id]/cancel/route.ts` - POST endpoint for cancellation + credit refund

**Files to Modify:**
- `/src/app/page.tsx` or song creation page - Integrate modal with "Generate Song" button
- `package.json` - Add canvas-confetti dependency

**Existing Components to Leverage (from Previous Stories):**
- `/src/components/ui/dialog.tsx` - shadcn/ui Dialog component for modal base (Story 1.4)
- `/src/components/ui/progress.tsx` - shadcn/ui Progress component for circle animation (Story 1.4)
- `/src/components/ui/button.tsx` - shadcn/ui Button for actions (Story 1.4)
- `/src/app/api/songs/[id]/route.ts` - Song status polling endpoint (Story 3.5)
- `/src/lib/credits/transaction.ts` - Credit refund RPC function (Story 2.6)
- `/src/lib/supabase/server.ts` - Supabase server client (Story 1.3)

**Styling (from UX Design Specification):**
- Modal overlay: `backdrop-blur-sm bg-black/50` (semi-transparent dark overlay)
- Card: `bg-white rounded-lg shadow-xl p-8` (white rounded card)
- Progress circle: Primary red (#E94560) fill, gray background ring
- Stage text: Center-aligned below circle, font-size 18px, bold
- Cancel button: Secondary style (gray border, white background)
- Success message: Large emoji + text, primary red color
- Confetti: Red (#E94560) and yellow (#FFD93D) colors

[Source: docs/ux-design-specification.md - Components]

### Architecture Alignment

**Polling Pattern (from Story 3.5):**

This component implements the client-side polling mechanism for async song generation:

1. **Initiate Polling**:
   - Component receives `songId` as prop (from Story 3.5 API response)
   - Starts polling `/api/songs/[id]` every 5 seconds
   - Initial progress: 0%

2. **Update Progress**:
   - Calculate progress based on elapsed time and estimated time (120-180s)
   - Update progress circle, stage message, time remaining
   - If status='generating': Continue polling
   - If status='completed': Stop polling, show success
   - If status='failed': Stop polling, show error

3. **Cleanup**:
   - Clear polling interval on component unmount
   - Clear interval when generation completes or fails

**Cancellation Flow:**

1. User clicks "Avbryt generering" button
2. Show confirmation dialog: "Er du sikker? Kreditter blir refundert."
3. On confirm: POST to `/api/songs/[songId]/cancel`
4. API handler:
   - Verify user owns song (RLS policy)
   - Update song status to 'cancelled'
   - Call `refund_credits(user_id, 10, 'Cancelled song generation', song_id)`
   - Return success response
5. Client: Stop polling, close modal, show toast notification

**Norwegian UI Language:**
- Progress stages: "AI skriver norske tekster", "Optimerer uttale", "Genererer musikk med Suno"
- Time remaining: "~2 minutter igjen", "~30 sekunder igjen"
- Cancel button: "Avbryt generering"
- Confirmation: "Er du sikker? Kreditter blir refundert."
- Success: "🎉 Sangen din er klar!"
- Error: "Noe gikk galt under genereringen."
- Retry button: "Prøv igjen"
- Close button: "Lukk"

[Source: docs/architecture.md - Language & Localization, Implementation Patterns]

### Learnings from Previous Story

**From Story 3-5-implement-song-generation-api-with-suno-integration (Status: done)**

- **Suno API Integration**: Song generation returns 202 Accepted with `songId` and `estimatedTime` - use these for polling
- **Polling Endpoint**: `/api/songs/[id]` returns current status ('generating', 'completed', 'failed')
- **Credit System**: Use existing RPC functions for refunds (`refund_credits`) - DO NOT recreate
- **Norwegian UI**: All user-facing text must be in Norwegian (buttons, messages, labels)
- **Error Handling**: Norwegian error messages with toast notifications
- **TypeScript Types**: Use existing `Song` type from `/src/types/song.ts`
- **Real-time Status**: Poll every 5 seconds, stop when status changes from 'generating'
- **Estimated Time**: Suno returns estimated time (120-180s) - use this for progress calculation

**New Files Created in Story 3.5:**
- `/src/lib/api/suno.ts` - Suno API wrapper (contains error codes, status checks)
- `/src/app/api/songs/[id]/route.ts` - Song status polling endpoint (GET)

**Architectural Patterns to Follow:**
- **Component Structure**: Props → State → Effects → Event Handlers → Render
- **Polling Pattern**: `useEffect` with `setInterval`, cleanup on unmount
- **Modal Management**: Use shadcn/ui Dialog with controlled `open` state
- **Credit Operations**: Always use RPC functions, never direct database queries
- **Error Messages**: Consistent Norwegian throughout, toast notifications for user feedback
- **Progress Calculation**: `Math.min((elapsedSeconds / estimatedSeconds) * 100, 100)`

**Integration Points:**
- Receives `songId` from Story 3.5 (song generation API response)
- Polls song status endpoint from Story 3.5 (GET /api/songs/[id])
- Uses credit refund from Story 2.6 (RPC function for cancellation)
- Integrates with song creation page (Story 3.1 + 3.2 + 3.3 + 3.4)
- Transitions to song player from Story 3.8 on success (future integration)

**Potential Issues to Address:**
- **Infinite Polling**: Set max polling attempts (60 × 5s = 5 minutes max)
- **Stale Progress**: If Suno takes longer than estimated, show "Snart ferdig..." instead of negative time
- **Network Errors**: Retry polling with exponential backoff (1s, 2s, 4s...)
- **Component Unmount**: Clean up polling interval to prevent memory leaks
- **Race Condition**: Handle user closing page during generation (polling stops gracefully)
- **Cancellation Timing**: Disable cancel button if >90% complete (Suno may finish before cancel processes)
- **Double Refund**: Ensure cancellation endpoint is idempotent (check current status first)
- **Confetti Overload**: Trigger confetti only once when status changes to 'completed'

**Testing Considerations:**
- Test with mock polling data (simulate 'generating' → 'completed')
- Test cancellation flow with real credit refund (verify transaction logged)
- Test error scenario (simulate 'failed' status, verify error UI)
- Test responsive design (mobile full-screen, desktop centered)
- Test confetti animation (verify colors and performance)
- Test time estimates with different estimated times (30s, 120s, 180s)
- Test stage transitions at correct percentages (0%, 30%, 50%, 100%)
- Test accessibility (keyboard navigation, screen reader announcements)
- Verify Norwegian text throughout

[Source: docs/sprint-artifacts/3-5-implement-song-generation-api-with-suno-integration.md#Dev-Agent-Record]

### References

- [Epic 3 Story 3.6 Acceptance Criteria](../epics/epic-3-norwegian-song-creation-core.md#story-36-create-ai-generation-progress-modal-component)
- [UX Design - AI Generation Progress Modal](../ux-design-specification.md#61-custom-component-ai-generation-progress-modal)
- [Architecture - Implementation Patterns](../architecture.md#implementation-patterns)
- [PRD - FR16-FR17 (Progress & Cancellation)](../prd.md#song-generation--processing)
- [Story 3.5 - Song Generation API](./3-5-implement-song-generation-api-with-suno-integration.md)
- [Story 2.6 - Credit Deduction/Refund](./2-6-implement-atomic-credit-deduction-with-rollback.md)
- [Story 1.4 - shadcn/ui Components](./1-4-install-shadcn-ui-and-core-components.md)

## Change Log

**2025-11-24 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 3: Norwegian Song Creation (CORE)
- Source: docs/epics/epic-3-norwegian-song-creation-core.md
- Prerequisites: Story 3.5 (Song generation API), Story 1.4 (shadcn/ui), Story 2.6 (Credit refund)
- Implements FR16-FR17 (Progress modal with real-time status and cancellation)
- Integrated learnings from Story 3.5: Polling pattern, Norwegian UI, credit refund system, async generation flow
- Next step: Run story-context workflow to generate technical context XML, then implement with dev-story workflow

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/3-6-create-ai-generation-progress-modal-component.context.xml` - Comprehensive technical context including 5 documentation artifacts, 7 code artifacts, 4 interfaces, 9 constraints, full dependency tree, and 8 test scenarios

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
