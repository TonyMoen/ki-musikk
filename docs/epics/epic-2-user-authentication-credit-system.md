# Epic 2: User Authentication & Credit System

**Goal:** Enable users to sign up, log in, view their account, and purchase credits for song generation.

**User Value:** Users can create accounts and fund their accounts with credits to generate Norwegian songs.

**FRs Covered:** FR1-FR4 (Authentication), FR28-FR34 (Credits & Payments)

---

### Story 2.1: Implement Google OAuth Authentication

As a **user**,
I want to sign up and log in using my Google account,
So that I can access Musikkfabrikken without creating a new password.

**Acceptance Criteria:**

**Given** I am on the home page without authentication
**When** I click "Sign in with Google" button
**Then** I am redirected to Google OAuth consent screen
**And** After granting permission, I am redirected back to Musikkfabrikken
**And** My user session is established with JWT token in HTTP-only cookie
**And** My user profile is created in `user_profile` table with default 0 credits
**And** I am redirected to the main "Create Song" page
**And** Session persists across browser tabs and page refreshes

**Prerequisites:** Story 1.3 (Supabase), Story 1.6 (Database schema)

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "Authentication & Authorization"
- Use Supabase Auth Helpers for Next.js: `@supabase/auth-helpers-nextjs`
- Create `/src/app/auth/login/page.tsx` with Google sign-in button
- Create `/src/app/auth/callback/route.ts` for OAuth callback handling
- Create `/src/middleware.ts` to protect authenticated routes
- Test session expiration and automatic refresh

---

### Story 2.2: Display User Profile with Credit Balance

As a **user**,
I want to view my account profile with current credit balance,
So that I know how many credits I have available for song generation.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to the Settings page (bottom nav: "Settings")
**Then** I see my profile information: Display name, Email (from Google), Account created date
**And** I see my current credit balance prominently displayed (large number, accent yellow color)
**And** I see a "Purchase Credits" button (primary red)
**And** Credit balance updates in real-time when credits are added or deducted
**And** I can log out from this page

**Prerequisites:** Story 2.1

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "5.1 User Journey - Journey 1"
- Create `/src/app/settings/page.tsx` for user profile/settings
- Fetch user profile and credit balance from Supabase
- Use Zustand store for global credit balance state (`/src/stores/credits-store.ts`)
- Display credit balance in bottom navigation badge (always visible)
- Update balance via real-time subscription or polling after transactions

---

### Story 2.3: Implement Credit Purchase Flow with Stripe Checkout

As a **user**,
I want to purchase credit packages via Stripe,
So that I can generate songs using my purchased credits.

**Acceptance Criteria:**

**Given** I am on the Settings page viewing my credit balance
**When** I click "Purchase Credits"
**Then** I see credit package options:
  - Starter: $15 (150 credits, 5 songs)
  - Pro: $45 (600 credits, 20 songs) - Badge: "MOST POPULAR"
  - Premium: $99 (1500 credits, 50 songs + extras)
**And** When I select a package, I am redirected to Stripe Checkout
**And** After successful payment, I am redirected back to Musikkfabrikken
**And** My credit balance is updated immediately
**And** I see a success toast: "✓ Credits added to your account!"
**And** A transaction record is created in `credit_transaction` table

**Prerequisites:** Story 2.2

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "ADR-008: Stripe Checkout"
- Install Stripe SDKs: `npm install stripe @stripe/stripe-js`
- Create `/src/app/api/credits/purchase/route.ts` to create Stripe Checkout session
- Create `/src/app/api/webhooks/stripe/route.ts` for payment confirmation webhook
- Environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Webhook verifies signature, adds credits atomically, creates transaction record
- Test with Stripe test mode credit cards

---

### Story 2.4: Display Credit Transaction History

As a **user**,
I want to view my credit transaction history,
So that I can see all purchases, deductions, and refunds.

**Acceptance Criteria:**

**Given** I have credit transactions (purchases, deductions)
**When** I navigate to Settings page and scroll to "Transaction History"
**Then** I see a list of all transactions sorted by date (most recent first)
**And** Each transaction shows: Type (Purchase/Deduction/Refund), Amount (+/- credits), Description, Date, Balance after transaction
**And** Purchases show Stripe session ID (truncated)
**And** Deductions link to the song generated (if applicable)
**And** List is paginated (10 transactions per page)
**And** I can filter by transaction type (Purchase/Deduction/Refund)

**Prerequisites:** Story 2.3

**Technical Notes:**
- Query `credit_transaction` table filtered by current user
- Use shadcn/ui Table component for transaction list
- Format dates as relative ("2 minutes ago") or absolute ("Jan 15, 2025")
- Link to song detail page if transaction has `song_id`
- Implement pagination with URL search params (?page=2)

---

### Story 2.5: Implement Credit Balance Warnings

As a **user**,
I want to receive warnings when my credit balance is low,
So that I can purchase more credits before running out.

**Acceptance Criteria:**

**Given** I am logged in with active credit balance
**When** My balance drops below 20 credits (2 songs)
**Then** I see a warning banner at top of screen: "💡 Low credits! You have 15 credits left. Purchase more?"
**And** Banner is yellow (#FFC93C background), dismissible but re-appears on next session
**When** My balance reaches 0 credits
**Then** I see an error toast when attempting any action: "❌ Insufficient credits. Purchase a package to continue."
**And** All generation buttons are disabled with tooltip "Need credits to generate"
**And** "Purchase Credits" button is prominently displayed

**Prerequisites:** Story 2.3

**Technical Notes:**
- Check credit balance before any action (client-side + server-side validation)
- Display warning banner using Toast or inline Alert component
- Store dismissal state in localStorage (per-session)
- Disable buttons and show tooltips when balance = 0
- Credit check happens in API route: `/src/app/api/songs/generate/route.ts`

---

### Story 2.6: Implement Atomic Credit Deduction with Rollback

As a **developer**,
I want credit deduction to be atomic with automatic rollback on failure,
So that users are never charged for failed song generations.

**Acceptance Criteria:**

**Given** A user initiates song generation with sufficient credits
**When** The system deducts credits before calling Suno API
**Then** Credits are deducted atomically using database transaction
**And** If Suno API call succeeds, transaction is committed and credit deduction persists
**And** If Suno API call fails, credits are automatically rolled back (refunded)
**And** A credit transaction record is created for audit trail (deduction + refund if applicable)
**And** User sees toast notification: "✓ Credits refunded due to generation failure"
**And** No double-charging occurs even with concurrent requests

**Prerequisites:** Story 1.6 (Database schema with `deduct_credits()` function), Story 2.3

**Technical Notes:**
- Use stored procedure: `deduct_credits(user_id, amount, description, song_id)`
- Stored procedure locks user_profile row for atomic update
- Implement try-catch in `/src/app/api/songs/generate/route.ts`
- On API failure: call refund function or create compensating transaction
- Test with intentional Suno API failure (invalid API key)
- Prevent concurrent deductions with database row locking

---
