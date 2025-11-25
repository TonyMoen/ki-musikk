# Code Review & Quality Backlog

**Project:** Musikkfabrikken (ibe160)
**Generated:** 2025-11-25
**Purpose:** Track pending code reviews and quality improvements from Epic 2 & Epic 3

---

## Status Overview

| Epic | Total Stories | Done | In Review | Pending Review |
|------|---------------|------|-----------|----------------|
| **Epic 2** | 6 | 3 | 3 | 3 |
| **Epic 3** | 10 | 4 | 6 | 6 |
| **Total** | 16 | 7 | 9 | **9 stories** |

---

## Epic 2: User Authentication & Credit System

### ✅ Completed & Reviewed
- **2-1:** Google OAuth Authentication (done)
- **2-2:** User Profile with Credit Balance (done)
- **2-3:** Credit Purchase Flow with Stripe Checkout (done) ✅ **Reviewed 2025-11-25**

### 🔍 Pending Code Review

#### Story 2-4: Display Credit Transaction History
**Status:** review
**Priority:** High
**Description:** Display paginated transaction history with filtering (Purchase/Deduction/Refund)

**Review Checklist:**
- [ ] Verify pagination works correctly (10 transactions per page)
- [ ] Check filter functionality (Purchase/Deduction/Refund types)
- [ ] Validate transaction display format (Type, Amount, Description, Date, Balance after)
- [ ] Test link to song detail from deduction transactions
- [ ] Verify date formatting (relative vs absolute)
- [ ] Check mobile responsiveness of transaction list

**Estimated Review Time:** 30-45 minutes

---

#### Story 2-5: Implement Credit Balance Warnings
**Status:** review
**Priority:** High
**Description:** Low balance warnings (<20 credits) and zero balance error states

**Review Checklist:**
- [ ] Verify warning banner appears when balance < 20 credits
- [ ] Check warning text: "💡 Low credits! You have X credits left. Purchase more?"
- [ ] Test banner dismissal and re-appearance on next session
- [ ] Verify zero balance error toast when attempting actions
- [ ] Check disabled state on generation buttons with tooltip
- [ ] Test "Purchase Credits" button prominence in error state
- [ ] Validate localStorage dismissal state handling

**Estimated Review Time:** 30 minutes

---

#### Story 2-6: Implement Atomic Credit Deduction with Rollback
**Status:** review
**Priority:** CRITICAL ⚠️
**Description:** Database transaction with automatic rollback on API failures

**Review Checklist:**
- [ ] **CRITICAL:** Verify `deduct_credits()` stored procedure exists and works
- [ ] Test credit deduction before Suno API call
- [ ] **CRITICAL:** Verify automatic rollback on Suno API failure
- [ ] Check transaction audit trail (deduction + refund records)
- [ ] Test refund toast notification: "✓ Credits refunded due to generation failure"
- [ ] **CRITICAL:** Test concurrent request protection (database row locking)
- [ ] Verify insufficient credits returns 403 error
- [ ] Test idempotency (no double-charging)

**Security Checks:**
- [ ] Row-level locking prevents race conditions
- [ ] Transaction atomicity guaranteed
- [ ] Proper error handling on all failure paths

**Estimated Review Time:** 60-90 minutes (CRITICAL STORY)

---

## Epic 3: Norwegian Song Creation (CORE VALUE PROP)

### ✅ Completed Stories
- **3-4:** Phonetic Diff Viewer Component (done)
- **3-5:** Song Generation API with Suno Integration (done)
- **3-6:** AI Generation Progress Modal Component (done)
- **3-8:** Song Player Card Component (done)

### 🔍 Pending Code Review

#### Story 3-1: Create Genre Carousel Component
**Status:** review
**Priority:** High
**Description:** Horizontal swipe carousel with genre cards (TikTok-style)

**Review Checklist:**
- [ ] Verify horizontal scroll/swipe functionality
- [ ] Check snap points for genre cards
- [ ] Test touch/drag scrolling on mobile
- [ ] Verify selected genre highlighting (border #E94560, 3px)
- [ ] Test keyboard navigation (arrow keys)
- [ ] Check gradient backgrounds on genre cards
- [ ] Verify emoji/icon display
- [ ] Test auto-scroll to center selected item

**Estimated Review Time:** 45 minutes

---

#### Story 3-2: Implement AI Lyric Generation with Song Concept Input
**Status:** review
**Priority:** CRITICAL ⚠️
**Description:** OpenAI GPT-4 integration for Norwegian lyric generation

**Review Checklist:**
- [ ] **CRITICAL:** Verify OpenAI API integration and error handling
- [ ] Test prompt engineering for Norwegian cultural context
- [ ] Check temperature setting (0.7 for creativity balance)
- [ ] Verify input validation (concept length, content filtering)
- [ ] Test inappropriate content detection
- [ ] Check API cost tracking (~$0.03 per request)
- [ ] Verify lyric output format and structure

**Security Checks:**
- [ ] OpenAI API key stored securely (environment variable)
- [ ] Input sanitization to prevent prompt injection
- [ ] Rate limiting on lyric generation

**Estimated Review Time:** 60 minutes

---

#### Story 3-3: Build Norwegian Pronunciation Optimizer with GPT-4
**Status:** review
**Priority:** CRITICAL ⚠️ (CORE VALUE PROP)
**Description:** Phonetic optimization for authentic Norwegian pronunciation

**Review Checklist:**
- [ ] **CRITICAL:** Verify phonetic rules application
- [ ] Test GPT-4 phonetic analysis accuracy
- [ ] Check before/after diff generation
- [ ] Verify per-line override functionality
- [ ] Test toggle "Uttalelse Bokmål" on/off
- [ ] Validate Norwegian language rules implementation
- [ ] Check edge cases (place names, proper nouns)

**Quality Checks:**
- [ ] Founder validation of pronunciation accuracy (80k listener expertise)
- [ ] Test with various Norwegian dialects (Bokmål focus)
- [ ] Verify visual diff clarity in UI

**Estimated Review Time:** 90 minutes (CORE DIFFERENTIATOR)

---

#### Story 3-7: Implement Webhook Handler for Suno Completion
**Status:** review
**Priority:** CRITICAL ⚠️
**Description:** Receive Suno completion notifications, download audio, update DB

**Review Checklist:**
- [ ] **CRITICAL:** Verify webhook signature validation (if Suno provides)
- [ ] Test event parsing and metadata extraction
- [ ] Check audio file download from Suno URL
- [ ] Verify Supabase Storage upload (songs bucket)
- [ ] Test database update (song status: generating → completed)
- [ ] Check error handling for failed downloads
- [ ] Verify idempotency (duplicate webhook handling)

**Security Checks:**
- [ ] Webhook endpoint authentication/validation
- [ ] Proper error logging without exposing secrets

**Estimated Review Time:** 60 minutes

---

#### Story 3-9: Implement Free 30-Second Preview Generation
**Status:** review
**Priority:** Medium
**Description:** Generate watermarked 30-second previews (0 credits)

**Review Checklist:**
- [ ] Verify 0 credit cost for preview generation
- [ ] Check 30-second duration limit enforcement
- [ ] Test watermark application (audio or metadata)
- [ ] Verify preview quality vs full song
- [ ] Check storage in separate bucket or flag
- [ ] Test conversion flow: preview → full song purchase

**Estimated Review Time:** 45 minutes

---

#### Story 3-10: Add Genre Prompt Templates to Database
**Status:** review
**Priority:** Medium
**Description:** Seed genre table with Suno prompt templates

**Review Checklist:**
- [ ] Verify genre table seeding script/migration
- [ ] Check all genres have prompt templates
- [ ] Test template format for Suno API compatibility
- [ ] Verify genre display names and descriptions
- [ ] Check emoji/icon associations
- [ ] Test sort_order and is_active flags

**Estimated Review Time:** 30 minutes

---

## Action Items from Story 2-3 (Completed Review)

### Medium Priority
- [ ] **[Med]** Add rate limiting to `/api/credits/purchase` endpoint
  - **Details:** Implement 5 requests/minute per user limit
  - **File:** `src/app/api/credits/purchase/route.ts`
  - **Reason:** Prevent abuse (rapid Stripe Checkout session creation)
  - **Suggested Epic:** Epic 8 (System Resilience)

### Low Priority
- [ ] **[Low]** Replace `alert()` with toast notification in credit purchase modal
  - **File:** `src/components/credit-purchase-modal.tsx:55`
  - **Reason:** UX consistency across app

- [ ] **[Low]** Add structured logging library (Winston/Pino) for production
  - **Files:** Multiple API routes
  - **Reason:** Better observability and debugging in production
  - **Suggested Epic:** Epic 8 (System Resilience)

---

## Test Coverage Gaps (Advisory)

### Epic 2 Testing Needs
- [ ] Unit tests for webhook handler (signature verification, idempotency)
- [ ] Integration tests for credit purchase flow (mock Stripe)
- [ ] E2E test for full purchase flow (Stripe test mode)
- [ ] Concurrency tests for credit deduction (Story 2-6)

### Epic 3 Testing Needs
- [ ] Unit tests for phonetic optimizer rules
- [ ] Integration tests for OpenAI lyric generation
- [ ] E2E tests for song creation flow
- [ ] Webhook handler integration tests (Suno)

---

## Review Priority Recommendation

### Critical Path (Do First)
1. **Story 2-6** (Atomic Credit Deduction) ⚠️ CRITICAL
2. **Story 3-2** (AI Lyric Generation) ⚠️ CRITICAL
3. **Story 3-3** (Pronunciation Optimizer) ⚠️ CORE VALUE PROP
4. **Story 3-7** (Suno Webhook) ⚠️ CRITICAL

### High Priority (Do Next)
5. **Story 2-4** (Transaction History)
6. **Story 2-5** (Credit Warnings)
7. **Story 3-1** (Genre Carousel)

### Medium Priority (Can Wait)
8. **Story 3-9** (Free Preview)
9. **Story 3-10** (Genre Templates)

---

## Estimated Total Review Time

| Priority Level | Stories | Est. Time |
|----------------|---------|-----------|
| **Critical** | 4 | 5-6 hours |
| **High** | 3 | 2-3 hours |
| **Medium** | 2 | 1.5 hours |
| **Total** | **9 stories** | **8.5-10.5 hours** |

---

## Notes

- All stories marked "review" have implementation complete per sprint-status.yaml
- Reviews should follow the systematic validation protocol (zero-tolerance for false completions)
- Action items from reviews will be logged in this document
- Critical stories (2-6, 3-2, 3-3, 3-7) block major functionality and should be prioritized
- Epic 4 (Song Library) depends on Epic 3 completion

---

**Last Updated:** 2025-11-25
**Next Review:** Story 2-6 or 3-2 (Critical Path)
