# Epic 8: System Resilience & Operations

**Goal:** Ensure the system handles errors gracefully, monitors API health, and provides operational visibility.

**User Value:** Reliable service that handles failures transparently and maintains high availability.

**FRs Covered:** FR60-FR65 (System Admin), FR66-FR70 (Error Handling)

---

### Story 8.1: Implement Comprehensive Error Logging

As a **developer/founder**,
I want all errors logged to a centralized system,
So that I can diagnose issues and improve service reliability.

**Acceptance Criteria:**

**Given** The application is running in production
**When** Any error occurs (client-side or server-side)
**Then** Error is logged with context: Error message, Stack trace, User ID (if authenticated), Request details, Timestamp
**And** Client errors are caught by Error Boundary components
**And** API errors are caught in try-catch blocks
**And** Logs are stored in Vercel Logs (free tier) or Sentry (paid)
**And** Founder can search logs by: Date, User, Error type, Severity
**And** Critical errors (payment failures, API outages) trigger alerts

**Prerequisites:** None (foundational)

**Technical Notes:**
- Client error logging: React Error Boundaries + `window.onerror`
- Server error logging: Try-catch in all API routes + global error handler
- Log service: Vercel Logs (basic) or Sentry (advanced with error grouping)
- Log format: JSON structured logs with severity levels
- Sensitive data: Never log passwords, API keys, or PII
- Setup Sentry: `npm install @sentry/nextjs`, configure DSN

---

### Story 8.2: Implement Suno API Health Monitoring

As a **founder**,
I want real-time monitoring of Suno API health,
So that I'm alerted immediately when song generation is failing.

**Acceptance Criteria:**

**Given** Suno API is integrated for song generation
**When** API health check runs every 5 minutes
**Then** System pings Suno API with test request
**And** Response time and success rate are tracked
**And** If 3 consecutive failures occur within 15 minutes
**Then** Founder receives alert: Email or Slack notification "Suno API is down!"
**And** Dashboard displays API status: Green (healthy), Yellow (degraded), Red (down)
**And** When API recovers, recovery notification is sent
**And** Historical uptime data is available (last 7 days, 30 days)

**Prerequisites:** Story 3.5 (Suno Integration)

**Technical Notes:**
- Health check: Vercel Cron job runs every 5 minutes
- Create `/src/app/api/cron/suno-health-check/route.ts`
- Test endpoint: Lightweight Suno API call (get status or quota)
- Store health status in database: `api_health_log` table
- Alerting: Use Resend email or Slack webhook
- Dashboard: `/src/app/admin/monitoring/page.tsx` (founder only)

---

### Story 8.3: Implement API Cost Monitoring and Alerts

As a **founder**,
I want daily alerts when API costs exceed thresholds,
So that I can prevent runaway expenses.

**Acceptance Criteria:**

**Given** Application uses multiple paid APIs (Suno, OpenAI, Google)
**When** Daily cost monitoring job runs at midnight
**Then** Total API costs for the day are calculated:
  - Suno: $0.06 per song
  - OpenAI: ~$0.03 per lyric generation + phonetic optimization
  - Google: ~$0.50 per canvas
**And** If daily costs exceed $50 threshold
**Then** Founder receives alert: "API costs today: $65 (threshold: $50)"
**And** If weekly costs exceed $200 threshold
**Then** Higher-priority alert: "API costs this week: $250!"
**And** Cost dashboard shows: Daily breakdown, Cost per user, Cost per feature
**And** Cost projections: "At current rate, monthly costs = $1,500"

**Prerequisites:** Story 3.5 (Suno), Story 3.2 (OpenAI), Story 6.1 (Google)

**Technical Notes:**
- Create `/src/app/api/cron/cost-monitor/route.ts`
- Track API calls in database: `api_usage_log` table with cost per call
- Calculate daily totals: SUM(cost) WHERE created_at >= TODAY
- Alert thresholds: Configurable via environment variable
- Dashboard: `/src/app/admin/costs/page.tsx` with charts
- Consider: Circuit breaker if costs spike unexpectedly (pause new generations)

---

### Story 8.4: Implement Automatic Retry Logic for API Failures

As a **user**,
I want the system to automatically retry failed API calls,
So that transient errors don't cause my song generation to fail unnecessarily.

**Acceptance Criteria:**

**Given** An API call to Suno, OpenAI, or Google fails due to network error or timeout
**When** The error is detected as transient (5xx error, timeout, connection refused)
**Then** System automatically retries the request up to 3 times
**And** Retry uses exponential backoff: 1s, 2s, 4s delays between attempts
**And** If all retries fail, user sees friendly error message
**And** Credits are not deducted until successful API response
**And** Retry attempts are logged for monitoring
**And** User sees progress indicator during retries: "Retrying... (attempt 2 of 3)"

**Prerequisites:** Story 3.5 (Suno), Story 3.2 (OpenAI), Story 6.1 (Google)

**Technical Notes:**
- Create retry utility: `/src/lib/utils/retry.ts` with exponential backoff
- Wrap all external API calls with retry logic
- Detect transient errors: HTTP 5xx, ECONNREFUSED, ETIMEDOUT
- Max retries: 3 attempts (configurable)
- Backoff: 1s, 2s, 4s (exponential)
- Log retries: Include attempt number, delay, final outcome
- Non-retriable errors: 4xx client errors (bad request, unauthorized) - fail immediately

---

### Story 8.5: Implement Session State Persistence During Downtime

As a **user**,
I want my song creation progress saved even if APIs fail,
So that I don't lose my work if something goes wrong.

**Acceptance Criteria:**

**Given** I am creating a song and have entered lyrics and selected a genre
**When** An API failure occurs (Suno down, network issue)
**Then** My song creation state is automatically saved to local storage
**And** I see error message: "We're having trouble connecting. Your progress is saved."
**And** When I return to the app (even after closing browser)
**Then** My song creation state is restored: Genre selection, lyrics, phonetic settings
**And** I can retry generation without re-entering information
**And** Saved state expires after 24 hours (prevent stale data)

**Prerequisites:** Story 3.5 (Song Generation)

**Technical Notes:**
- Auto-save to localStorage: `localStorage.setItem('songDraft', JSON.stringify(state))`
- Save triggers: Every 30 seconds, on navigation, on error
- Restore on mount: Check localStorage for 'songDraft', hydrate form
- State to save: genre, lyrics, title, phoneticEnabled, phoneticOverrides
- Expiration: Check `savedAt` timestamp, discard if > 24h old
- Clear saved state: After successful song generation

---

### Story 8.6: Implement Webhook Polling Fallback Mechanism

As a **developer**,
I want polling fallback if Suno webhooks fail,
So that song generation still completes even if webhook delivery fails.

**Acceptance Criteria:**

**Given** Song generation has been initiated with Suno
**When** Webhook notification is expected but doesn't arrive within 5 minutes
**Then** System automatically switches to polling mode
**And** Client polls `/api/songs/[id]` every 10 seconds
**And** Polling checks song status: 'generating' → 'completed' or 'failed'
**And** When status changes to 'completed', polling stops
**And** User experience is identical whether webhook or polling completes
**And** Webhook failure is logged for monitoring

**Prerequisites:** Story 3.7 (Webhook Handler), Story 3.5 (Song Generation)

**Technical Notes:**
- Client-side polling: Start after 5 minutes if status still 'generating'
- Use React Query or SWR with `refetchInterval: 10000` (10 seconds)
- Stop polling when: status='completed', status='failed', or 10 minutes elapsed
- Webhook timeout detection: Server-side job checks songs 'generating' > 10 minutes
- Fallback: Manually query Suno API for song status if stuck
- Log webhook failures: Track delivery success rate

---

### Story 8.7: Prevent Double-Charging on Concurrent Requests

As a **user**,
I want protection against double-charging if I accidentally submit twice,
So that I'm never charged multiple times for the same song generation.

**Acceptance Criteria:**

**Given** I have clicked "Generate Song" button
**When** I accidentally click again before the first request completes
**Then** The second request is blocked with message: "Generation already in progress"
**And** Only one song generation is initiated
**And** Only one credit deduction occurs (10 credits, not 20)
**And** Database row locking prevents concurrent credit deductions
**And** User sees clear UI feedback: Button disabled during generation
**And** Re-enabling happens only after: Success, failure, or 5-minute timeout

**Prerequisites:** Story 2.6 (Atomic Credit Deduction), Story 3.5 (Song Generation)

**Technical Notes:**
- Client-side: Disable button immediately on click, add loading spinner
- Server-side: Use database row locking in `deduct_credits()` function
- Idempotency: Check for existing song with status='generating' for user
- If duplicate request: Return existing song_id instead of creating new record
- Atomic operation: SELECT FOR UPDATE in PostgreSQL transaction
- Timeout: After 5 minutes, allow retry (consider previous generation failed)

---

### Story 8.8: Create Founder Admin Dashboard

As a **founder**,
I want an admin dashboard to monitor system health and user activity,
So that I can proactively manage the platform.

**Acceptance Criteria:**

**Given** I am logged in as the founder
**When** I navigate to `/admin` (protected route)
**Then** I see key metrics:
  - Total users (registered)
  - Active users (created song in last 7 days)
  - Total songs generated (today, this week, all time)
  - Revenue: Total credit sales, MRR estimate
  - API health: Suno, OpenAI, Google (green/yellow/red status)
  - Pending mastering requests (count + oldest request age)
  - Top shared songs (most viral)
**And** Quick actions available: Process mastering request, Refund user credits, View user details
**And** Charts display trends: Songs per day, New users per week, Revenue over time

**Prerequisites:** Story 8.1 (Logging), Story 8.2 (Monitoring)

**Technical Notes:**
- Create `/src/app/admin/page.tsx` (founder only, check user email)
- Protect route: Middleware checks if `user.email === FOUNDER_EMAIL` from env
- Fetch metrics: Aggregate queries on database (COUNT, SUM, GROUP BY)
- Charts: Use Recharts or Chart.js for visualization
- Real-time data: Refresh every 60 seconds or manual refresh button
- Consider: Add Stripe Dashboard embed for payment details

---

---
