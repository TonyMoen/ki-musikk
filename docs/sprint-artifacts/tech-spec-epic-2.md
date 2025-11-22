# Epic Technical Specification: User Authentication & Credit System

Date: 2025-11-21
Author: BIP
Epic ID: 2
Status: Complete

---

## Overview

Epic 2 establishes the foundational authentication and monetization infrastructure for Musikkfabrikken. This epic enables users to create accounts via Google OAuth, view their credit balance, purchase credit packages through Stripe Checkout, and ensures atomic credit transactions with automatic rollback on generation failures. The credit system implements a pre-paid model that creates a financial buffer against API costs (Suno: $0.06/song, OpenAI: ~$0.03/request), addressing the core business requirement for sustainable operations. This epic directly supports FR1-FR4 (User Account & Authentication) and FR28-FR34 (Credit System & Payments) from the PRD, enabling all subsequent song generation features.

## Objectives and Scope

**In Scope:**
- Google OAuth authentication flow using Supabase Auth Helpers for Next.js
- User profile management with credit balance display
- Stripe Checkout integration for credit purchases (3 packages: Starter $15/150cr, Pro $45/600cr, Premium $99/1500cr)
- Credit transaction history with pagination and filtering
- Low credit balance warnings (below 20 credits)
- Atomic credit deduction with database-level rollback on API failures
- Prevention of concurrent double-charging through database row locking
- Session persistence across browser tabs and page refreshes
- User logout functionality
- Credit cost display before generation actions

**Out of Scope (Deferred to Later Epics):**
- Vipps payment integration (Norwegian payment method) - Phase 2 enhancement
- Norwegian language UI localization - English acceptable for MVP
- Social login beyond Google (Facebook, Apple) - Future enhancement
- Subscription-based pricing model - Pre-paid credit model validated first
- Credit gifting or transfers between users
- Refund request workflow (manual process for MVP, automated later)
- User profile editing (display name, avatar) - Settings epic
- Account deletion/GDPR data export - Compliance epic
- Credit expiration policies - Not applicable for MVP

## System Architecture Alignment

This epic directly implements **ADR-002 (Supabase for Backend Services)** and **ADR-008 (Stripe Checkout for Payment Processing)** from the architecture document. Authentication leverages Supabase Auth with Google OAuth integration via `@supabase/auth-helpers-nextjs`, ensuring Row Level Security (RLS) enforces data isolation at the database layer. The credit system follows **ADR-005 (Pre-Paid Credit System)** with atomic transactions using PostgreSQL stored procedures (`deduct_credits()`) to prevent race conditions and ensure financial integrity.

**Component Mapping:**
- `/src/app/auth/*` - Authentication pages and OAuth callback handling
- `/src/middleware.ts` - Route protection and session management
- `/src/lib/supabase/` - Supabase client initialization (browser + server)
- `/src/app/api/credits/*` - Credit management API routes
- `/src/app/api/webhooks/stripe/route.ts` - Payment confirmation webhook
- `/src/stores/credits-store.ts` - Zustand store for global credit balance state (ADR-003)
- Database: `user_profile`, `credit_transaction` tables with RLS policies

**Architectural Constraints:**
- JWT tokens stored in HTTP-only cookies (security requirement)
- Stripe handles all payment data (PCI compliance, no card storage)
- Credit costs defined as constants: `CREDIT_COSTS.SONG_GENERATION = 10`
- Database transactions required for all credit operations (atomicity guarantee)

## Detailed Design

### Services and Modules

| Module | Responsibilities | Inputs | Outputs | Owner |
|--------|-----------------|--------|---------|-------|
| **Auth Service** (`/src/lib/supabase/`) | Supabase client initialization, session management, OAuth flow | Google OAuth tokens, user credentials | JWT session tokens, user profile | Backend |
| **Auth Middleware** (`/src/middleware.ts`) | Route protection, session validation, redirect logic | HTTP requests, cookies | Protected routes, redirects | Backend |
| **Credit Store** (`/src/stores/credits-store.ts`) | Global credit balance state management | Credit transactions, API responses | Real-time balance updates | Frontend |
| **Credit Purchase API** (`/src/app/api/credits/purchase/route.ts`) | Create Stripe Checkout sessions | Package selection (starter/pro/premium) | Stripe Checkout URL | Backend |
| **Stripe Webhook Handler** (`/src/app/api/webhooks/stripe/route.ts`) | Process payment confirmations, add credits | Stripe webhook events | Credit fulfillment, transaction records | Backend |
| **Credit Balance API** (`/src/app/api/credits/balance/route.ts`) | Fetch user credit balance and transaction history | User ID (from session) | Balance, transactions list | Backend |
| **Database Layer** (Supabase PostgreSQL) | Atomic credit operations, RLS enforcement | SQL queries via Supabase SDK | User profiles, credit transactions | Database |

### Data Models and Contracts

**user_profile** (PostgreSQL Table via Supabase)
```sql
CREATE TABLE user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  credit_balance INTEGER DEFAULT 0 CHECK (credit_balance >= 0),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY user_profile_select ON user_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY user_profile_update ON user_profile FOR UPDATE USING (auth.uid() = id);
```

**credit_transaction** (Transaction Audit Log)
```sql
CREATE TABLE credit_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- Positive for purchase, negative for deduction
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund')),
  description TEXT NOT NULL,
  stripe_session_id TEXT,  -- For purchases
  song_id UUID REFERENCES song(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transaction_user_id ON credit_transaction(user_id);
CREATE INDEX idx_credit_transaction_created_at ON credit_transaction(created_at DESC);

-- RLS Policy
CREATE POLICY credit_transaction_select ON credit_transaction FOR SELECT USING (auth.uid() = user_id);
```

**Stored Procedure: deduct_credits()**
```sql
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_song_id UUID DEFAULT NULL
) RETURNS credit_transaction AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction credit_transaction;
BEGIN
  -- Lock user profile row for atomic update
  SELECT credit_balance INTO v_current_balance
  FROM user_profile
  WHERE id = p_user_id
  FOR UPDATE;

  -- Validate sufficient credits
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_current_balance, p_amount;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update user balance
  UPDATE user_profile
  SET credit_balance = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transaction (user_id, amount, balance_after, transaction_type, description, song_id)
  VALUES (p_user_id, -p_amount, v_new_balance, 'deduction', p_description, p_song_id)
  RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql;
```

**TypeScript Types** (`/src/types/`)
```typescript
// user.ts
export interface UserProfile {
  id: string
  display_name: string | null
  credit_balance: number
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

// credit.ts
export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  balance_after: number
  transaction_type: 'purchase' | 'deduction' | 'refund'
  description: string
  stripe_session_id?: string
  song_id?: string
  created_at: string
}

export interface CreditPackage {
  id: 'starter' | 'pro' | 'premium'
  name: string
  price: number  // USD cents
  credits: number
  description: string
  badge?: string  // e.g., "MOST POPULAR"
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', name: 'Starter', price: 1500, credits: 150, description: '~5 songs' },
  { id: 'pro', name: 'Pro', price: 4500, credits: 600, description: '~20 songs', badge: 'MOST POPULAR' },
  { id: 'premium', name: 'Premium', price: 9900, credits: 1500, description: '~50 songs + extras' }
]

export const CREDIT_COSTS = {
  SONG_GENERATION: 10,
  CANVAS_GENERATION: 5,
  MASTERING_SERVICE: 20,
  FREE_PREVIEW: 0
} as const
```

### APIs and Interfaces

**Authentication Flow**

**GET `/auth/login`** (Page)
- Renders Google sign-in button using Supabase Auth UI
- Redirects to Google OAuth consent screen
- On success: redirects to `/auth/callback`

**GET `/auth/callback`** (API Route)
- Handles OAuth callback from Google
- Exchanges code for JWT session token
- Creates user profile in `user_profile` if first login
- Sets HTTP-only cookie with session token
- Redirects to `/` (home page)

**POST `/api/auth/logout`** (API Route)
- Request: None (authenticated user from session)
- Response: `{ success: true }`
- Clears session cookie
- Invalidates JWT token in Supabase

---

**Credit Management APIs**

**GET `/api/credits/balance`**
- Request: None (user ID from authenticated session)
- Response:
```typescript
{
  data: {
    balance: number,
    transactions: CreditTransaction[]  // Last 10, sorted by created_at DESC
  }
}
```
- Status: 200 OK, 401 Unauthorized

**POST `/api/credits/purchase`**
- Request:
```typescript
{
  packageId: 'starter' | 'pro' | 'premium'
}
```
- Response:
```typescript
{
  data: {
    checkoutUrl: string  // Stripe Checkout URL
  }
}
```
- Creates Stripe Checkout session with:
  - Success URL: `/settings?payment=success`
  - Cancel URL: `/settings?payment=cancelled`
  - Metadata: `{ userId, packageId, credits }`
- Status: 200 OK, 400 Bad Request, 401 Unauthorized

**POST `/api/webhooks/stripe`** (Webhook Handler)
- Request: Stripe webhook event (JSON)
- Validates webhook signature using `STRIPE_WEBHOOK_SECRET`
- Handles events:
  - `checkout.session.completed`: Add credits to user account
  - `payment_intent.succeeded`: Confirm payment (redundant check)
- Creates `credit_transaction` record with type='purchase'
- Updates `user_profile.credit_balance` atomically
- Response: `{ received: true }` (200 OK)
- Status: 200 OK, 400 Bad Request (invalid signature)

---

**Credit Deduction (Internal Function)**

**Function: `deductCredits(userId, amount, description, songId?)`**
- Location: `/src/lib/credits/transaction.ts`
- Calls database stored procedure `deduct_credits()`
- Returns: `CreditTransaction` or throws error
- Usage:
```typescript
try {
  const transaction = await deductCredits(
    userId,
    CREDIT_COSTS.SONG_GENERATION,
    'Song generation',
    songId
  )
  // Proceed with Suno API call
} catch (error) {
  if (error.message.includes('Insufficient credits')) {
    return { error: { code: 'INSUFFICIENT_CREDITS', message: 'Not enough credits' } }
  }
  throw error
}
```

**Function: `refundCredits(userId, amount, description, originalTransactionId?)`**
- Location: `/src/lib/credits/transaction.ts`
- Creates compensating transaction with type='refund'
- Atomically updates `user_profile.credit_balance`
- Usage: When song generation fails, refund deducted credits
```typescript
await refundCredits(userId, CREDIT_COSTS.SONG_GENERATION, 'Generation failed', txnId)
```

### Workflows and Sequencing

**Workflow 1: User Registration & Login (Google OAuth)**

```
Actor: User
System: Musikkfabrikken Backend, Supabase Auth, Google OAuth

1. User clicks "Sign in with Google" on /auth/login
2. Frontend redirects to Google OAuth consent screen
3. User grants permission to Google
4. Google redirects to /auth/callback?code=<oauth_code>
5. Backend exchanges code for JWT token via Supabase Auth
6. Backend checks if user_profile exists for this user_id
   a. If NOT exists: Create user_profile with credit_balance=0
   b. If exists: Load existing profile
7. Backend sets HTTP-only cookie with session token (7-day expiration)
8. Backend redirects user to / (home page)
9. Frontend fetches user profile and credit balance
10. Credit balance displayed in UI (bottom nav badge)
```

**Workflow 2: Credit Purchase Flow**

```
Actor: User
System: Musikkfabrikken Backend, Stripe Checkout

1. User navigates to /settings page
2. User views credit balance (e.g., "50 credits")
3. User clicks "Purchase Credits"
4. Frontend displays credit packages modal (Starter/Pro/Premium)
5. User selects package (e.g., "Pro - $45, 600 credits")
6. Frontend sends POST /api/credits/purchase { packageId: 'pro' }
7. Backend creates Stripe Checkout session:
   - Line item: "Pro Credit Package - 600 credits", $45.00
   - Metadata: { userId: <uuid>, packageId: 'pro', credits: 600 }
   - Success URL: /settings?payment=success
   - Cancel URL: /settings?payment=cancelled
8. Backend returns { checkoutUrl: 'https://checkout.stripe.com/...' }
9. Frontend redirects to Stripe Checkout
10. User enters payment information (Stripe hosted form)
11. Stripe processes payment
12. Stripe sends webhook to /api/webhooks/stripe
    Event: checkout.session.completed
13. Backend validates webhook signature
14. Backend extracts metadata: { userId, credits: 600 }
15. Backend atomically updates user_profile:
    - SET credit_balance = credit_balance + 600
16. Backend creates credit_transaction:
    - type: 'purchase', amount: 600, stripe_session_id: <id>
17. Backend returns 200 OK to Stripe
18. Stripe redirects user to /settings?payment=success
19. Frontend displays success toast: "✓ 600 credits added!"
20. Frontend refreshes credit balance (now 650 credits)
```

**Workflow 3: Credit Deduction with Rollback**

```
Actor: User, Backend
System: Musikkfabrikken Backend, Supabase DB, Suno API

1. User initiates song generation (e.g., clicks "Generate Song with AI")
2. Frontend sends POST /api/songs/generate { genre, concept, ... }
3. Backend validates user is authenticated (JWT from cookie)
4. Backend checks credit balance >= CREDIT_COSTS.SONG_GENERATION (10)
   - If insufficient: Return 403 { error: 'INSUFFICIENT_CREDITS' }
5. Backend calls deductCredits(userId, 10, 'Song generation')
6. Database executes stored procedure deduct_credits():
   a. Lock user_profile row (FOR UPDATE)
   b. Validate balance >= 10
   c. Deduct: credit_balance = credit_balance - 10
   d. Insert credit_transaction (type='deduction', amount=-10)
   e. Commit transaction
7. Backend receives transaction record { id, balance_after: 640 }
8. Backend calls Suno API to generate song
   a. SUCCESS: Song ID returned, proceed with webhook wait
   b. FAILURE: API error returned
9. IF FAILURE:
   a. Backend calls refundCredits(userId, 10, 'Generation failed')
   b. Database atomically updates: credit_balance = credit_balance + 10
   c. Database inserts credit_transaction (type='refund', amount=+10)
   d. Backend returns error to frontend with refund confirmation
   e. Frontend displays: "❌ Generation failed. Credits refunded."
10. IF SUCCESS:
    a. Backend returns 202 Accepted { songId, status: 'generating' }
    b. Frontend displays progress modal
    c. Credits remain deducted (balance: 640)
```

**Workflow 4: Concurrent Request Protection**

```
Scenario: User clicks "Generate Song" button twice rapidly

Request 1 (Thread A):
1. Arrives at /api/songs/generate
2. Calls deduct_credits() → Acquires row lock on user_profile
3. Deducts 10 credits (balance: 650 → 640)
4. Calls Suno API (takes 2 seconds)
5. Releases row lock

Request 2 (Thread B):
1. Arrives at /api/songs/generate (1 second after Request 1)
2. Calls deduct_credits() → WAITS for row lock (held by Thread A)
3. Thread A releases lock after 2 seconds
4. Thread B acquires lock, reads balance: 640
5. Deducts 10 credits (balance: 640 → 630)
6. Calls Suno API

Result: No double-charging. Each request deducts credits sequentially.
Database row locking ensures atomicity.
```

## Non-Functional Requirements

### Performance

**Authentication Performance:**
- OAuth callback processing: <2 seconds (Supabase Auth exchange)
- Session validation (middleware): <100ms per request
- Profile fetch on login: <500ms (single DB query with index on user_id)

**Credit Operations:**
- Credit balance check: <200ms (indexed query on user_profile.id)
- Credit deduction (stored procedure): <300ms (includes row lock + transaction + insert)
- Transaction history fetch (10 records): <500ms (indexed on user_id + created_at)
- Stripe Checkout session creation: <1 second (external API call)

**Targets from PRD NFR-Performance:**
- Credit transaction processing: <1 second for atomic deduction/rollback ✓
- Query response time: <500ms for balance checks and transaction history ✓

**Scalability Considerations:**
- Supabase connection pooling handles concurrent users (default: 15 connections on free tier, scales with plan)
- Database row locking prevents contention but may cause brief waits (<500ms) under high concurrent load
- Stripe webhook processing is async, does not block user experience

### Security

**Authentication Security (FR1-FR4, PRD NFR-Security):**
- **Google OAuth 2.0**: Industry-standard authentication, no password storage
- **JWT Tokens**: Issued by Supabase Auth, signed and verified, stored in HTTP-only cookies (XSS protection)
- **Session Expiration**: 7-day JWT expiration with automatic refresh (sliding window)
- **Cookie Security**: `Secure` flag (HTTPS only), `SameSite=Lax` (CSRF protection), `HttpOnly` (no JS access)

**Authorization & Access Control:**
- **Row Level Security (RLS)**: PostgreSQL RLS policies enforce `auth.uid() = user_id` for all user data
- **Middleware Protection**: `/src/middleware.ts` validates JWT on every protected route
- **API Route Guards**: All credit APIs validate authenticated user before processing

**Payment Security (FR28-FR34, PRD NFR-Security):**
- **PCI Compliance**: Stripe Checkout handles all payment data (no card data in app database)
- **Webhook Verification**: Stripe webhook signature validation using `stripe.webhooks.constructEvent()`
- **Idempotency**: Webhook processing checks for duplicate `stripe_session_id` before adding credits
- **Metadata Validation**: Backend validates userId from webhook metadata matches authenticated session

**Data Protection:**
- **HTTPS Everywhere**: TLS encryption for all connections (enforced by Vercel)
- **API Key Protection**: All secrets in environment variables, never exposed to client
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- **Input Validation**: Zod schemas validate all API inputs (packageId must be 'starter'|'pro'|'premium')
- **SQL Injection Prevention**: Supabase SDK uses parameterized queries, stored procedure uses typed parameters

**Audit Trail:**
- **Transaction Log**: All credit operations recorded in `credit_transaction` table with immutable timestamps
- **User Actions**: Logins, profile updates, credit purchases logged for audit compliance

### Reliability/Availability

**Target Availability (PRD NFR-Scalability):**
- **Supabase Auth**: 99.9% uptime SLA (Supabase Pro plan)
- **Stripe**: 99.99% uptime (Stripe guarantees)
- **Application**: Target 99.5% uptime (limited by Vercel free tier, upgrade for production)

**Failure Handling:**

**Authentication Failures:**
- **Google OAuth down**: Display user-friendly error "Google login temporarily unavailable. Try again in a few minutes."
- **Supabase Auth down**: Fallback to cached session validation (5-minute grace period)
- **JWT expired**: Automatic token refresh via Supabase SDK, transparent to user

**Credit Transaction Failures:**
- **Database connection failure**: Retry with exponential backoff (3 attempts, 1s/2s/4s delays)
- **Row lock timeout**: Return 503 "Service temporarily busy. Please retry." after 10-second wait
- **Credit deduction succeeds but Suno fails**: Automatic refund via compensating transaction (Workflow 3)
- **Stripe webhook missed**: Polling fallback checks payment status after 5 minutes

**Payment Failures:**
- **Stripe Checkout unreachable**: Display error "Payment service unavailable. Try again later."
- **Payment declined**: Stripe handles user communication, app receives webhook event
- **Webhook delivery failure**: Stripe retries webhooks with exponential backoff (up to 3 days)

**Degradation Behavior:**
- **Auth service down**: Anonymous browsing allowed, "Create Song" disabled with tooltip
- **Payment service down**: Credit purchases disabled, existing credits remain functional
- **Database read-only**: Credit balance displays last cached value with warning banner

**Data Integrity Guarantees:**
- **Atomic Transactions**: All credit operations use database transactions (ACID compliance)
- **No Lost Payments**: Stripe webhook retries + idempotency checks prevent credit loss
- **Audit Trail**: Immutable `credit_transaction` log for reconciliation and support

### Observability

**Logging Requirements (PRD NFR-Observability):**

**Log Signals:**
- `AUTH_LOGIN_SUCCESS`: User ID, email, timestamp, OAuth provider
- `AUTH_LOGIN_FAILURE`: Error code, OAuth provider, timestamp
- `AUTH_LOGOUT`: User ID, timestamp
- `CREDIT_PURCHASE_INITIATED`: User ID, package ID, amount, Stripe session ID
- `CREDIT_PURCHASE_COMPLETED`: User ID, package ID, credits added, balance after, Stripe session ID
- `CREDIT_DEDUCTION`: User ID, amount, description, balance after, transaction ID
- `CREDIT_REFUND`: User ID, amount, reason, balance after, original transaction ID
- `STRIPE_WEBHOOK_RECEIVED`: Event type, session ID, processing status
- `STRIPE_WEBHOOK_FAILED`: Event type, error message, session ID

**Log Format (Architecture: Logging Strategy):**
```json
{
  "timestamp": "2025-11-21T14:32:15Z",
  "level": "INFO",
  "message": "Credit purchase completed",
  "context": {
    "userId": "abc-123",
    "packageId": "pro",
    "creditsAdded": 600,
    "balanceAfter": 650,
    "stripeSessionId": "cs_test_...",
    "transactionId": "tx-456"
  }
}
```

**Metrics to Track:**
- **Authentication Metrics**:
  - Login success rate (target: >98%)
  - OAuth callback latency (p50, p95, p99)
  - Active sessions count
- **Credit Metrics**:
  - Credit purchases per day
  - Average package purchased (Starter vs Pro vs Premium)
  - Credit deduction success rate (target: >99%)
  - Refund rate (target: <5%)
  - Average credit balance per user
- **Payment Metrics**:
  - Stripe Checkout conversion rate (sessions created vs completed)
  - Payment failure rate
  - Webhook delivery success rate (target: >99.9%)
  - Revenue per day (sum of completed purchases)

**Tracing:**
- Distributed tracing for credit purchase flow:
  - Span 1: Frontend → POST /api/credits/purchase
  - Span 2: Backend → Stripe Checkout session creation
  - Span 3: Stripe → Webhook delivery
  - Span 4: Backend → Credit fulfillment
- Trace correlation ID: Stripe session ID propagated across all spans

**Monitoring Tools:**
- **Logs**: Vercel Logs (structured JSON logs)
- **Metrics**: Supabase Dashboard (DB queries, connections)
- **Tracing**: Optional Sentry integration for error tracking
- **Alerting**:
  - Alert if credit refund rate >10% in 1 hour (potential API issue)
  - Alert if Stripe webhook failure rate >5% (payment processing at risk)
  - Alert if authentication failure rate >20% (OAuth provider issue)

## Dependencies and Integrations

**External Service Dependencies:**

| Service | Purpose | Version/Plan | Critical? | Fallback |
|---------|---------|--------------|-----------|----------|
| **Supabase Auth** | Google OAuth, JWT session management | Free tier → Pro on launch | Yes | 5-min cached session grace period |
| **Supabase PostgreSQL** | User profiles, credit transactions | PostgreSQL 15+ | Yes | None (single point of failure) |
| **Stripe** | Payment processing, checkout, webhooks | Standard pricing (2.9% + $0.30) | Yes | Manual credit addition by admin |
| **Google OAuth** | User authentication provider | Free | Yes | Display error, retry after delay |

**NPM Dependencies (from package.json):**

**Core Framework:**
- `next@^14.2.3` - Next.js App Router framework
- `react@^18.2.0`, `react-dom@^18.2.0` - React library
- `typescript@^5` - TypeScript compiler

**Supabase Integration:**
- `@supabase/supabase-js@^2.84.0` - Supabase client SDK
- `@supabase/ssr@^0.7.0` - Server-side rendering helpers for auth

**UI Components (shadcn/ui dependencies):**
- `@radix-ui/react-dialog@^1.1.15` - Modal/dialog primitives
- `@radix-ui/react-label@^2.1.8` - Form label primitives
- `@radix-ui/react-progress@^1.1.8` - Progress bar (for loading states)
- `@radix-ui/react-select@^2.2.6` - Dropdown select
- `@radix-ui/react-slot@^1.2.4` - Component composition utility
- `@radix-ui/react-switch@^1.2.6` - Toggle switch
- `@radix-ui/react-tabs@^1.1.13` - Tab navigation
- `@radix-ui/react-toast@^1.2.15` - Toast notifications
- `lucide-react@^0.554.0` - Icon library
- `class-variance-authority@^0.7.1` - Component variant styling
- `clsx@^2.1.1` - Conditional class names
- `tailwind-merge@^3.4.0` - Merge Tailwind classes
- `tailwindcss-animate@^1.0.7` - Animation utilities

**Additional Dependencies Needed (Not Yet Installed):**
```bash
npm install stripe @stripe/stripe-js  # Stripe SDK for payments
npm install zod  # Input validation schemas
npm install zustand  # Credit balance state management
```

**Environment Variables Required:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only, full DB access

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Server-side only
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signature verification

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For OAuth redirects
```

**Integration Points:**

**Supabase Auth Integration:**
- Client: `createBrowserClient()` for browser-side auth operations
- Server: `createServerComponentClient()` for Next.js Server Components
- Middleware: `createMiddlewareClient()` for route protection
- OAuth callback: `/auth/callback` receives code, exchanges for session

**Stripe Integration:**
- Client: `@stripe/stripe-js` for redirecting to Checkout
- Server: `stripe` SDK for creating sessions and verifying webhooks
- Webhook endpoint: `/api/webhooks/stripe` receives payment confirmations
- Webhook signature: `stripe.webhooks.constructEvent()` validates authenticity

**Database Integration:**
- Supabase client automatically handles RLS policy enforcement
- Connection pooling: Default 15 connections (free tier), scales with plan
- Stored procedures: Called via `supabase.rpc('deduct_credits', params)`

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance:**
This epic is complete when users can sign up, log in, purchase credits, and use credits for song generation with automatic rollback on failures.

**Story 2.1: Google OAuth Authentication**
- AC1: User can click "Sign in with Google" and complete OAuth flow
- AC2: After successful OAuth, user profile created in `user_profile` with 0 credits
- AC3: User session persists across browser tabs and page refreshes
- AC4: JWT token stored in HTTP-only cookie (secure, SameSite)
- AC5: User redirected to home page after successful login

**Story 2.2: User Profile with Credit Balance**
- AC1: Settings page displays user's display name, email, account creation date
- AC2: Credit balance prominently displayed (large number, yellow accent)
- AC3: "Purchase Credits" button visible (primary red)
- AC4: Credit balance updates in real-time after transactions
- AC5: User can log out from Settings page

**Story 2.3: Credit Purchase Flow**
- AC1: User sees 3 credit packages: Starter ($15/150cr), Pro ($45/600cr), Premium ($99/1500cr)
- AC2: "Pro" package has "MOST POPULAR" badge
- AC3: Selecting package redirects to Stripe Checkout
- AC4: After successful payment, user redirected back with success message
- AC5: Credit balance updated immediately (visible in UI)
- AC6: Transaction record created in `credit_transaction` table with type='purchase'
- AC7: Stripe webhook handler validates signature before adding credits

**Story 2.4: Transaction History**
- AC1: Settings page shows transaction history sorted by date (newest first)
- AC2: Each transaction displays: Type, Amount (+/-), Description, Date, Balance after
- AC3: Purchases show truncated Stripe session ID
- AC4: Deductions link to associated song (if applicable)
- AC5: List paginated (10 per page)
- AC6: User can filter by transaction type (Purchase/Deduction/Refund)

**Story 2.5: Credit Balance Warnings**
- AC1: When balance <20 credits, yellow warning banner appears: "💡 Low credits! You have X credits left. Purchase more?"
- AC2: Banner dismissible but re-appears on next session
- AC3: When balance = 0, error toast on generation attempt: "❌ Insufficient credits"
- AC4: Generation buttons disabled with tooltip "Need credits to generate"
- AC5: "Purchase Credits" button prominently displayed

**Story 2.6: Atomic Credit Deduction with Rollback**
- AC1: Credit deduction uses database stored procedure `deduct_credits()`
- AC2: If Suno API succeeds, credits remain deducted
- AC3: If Suno API fails, credits automatically refunded via compensating transaction
- AC4: Refund toast displayed: "✓ Credits refunded due to generation failure"
- AC5: Transaction audit trail includes both deduction and refund records
- AC6: Concurrent requests prevented via database row locking (no double-charging)
- AC7: Insufficient credits returns 403 error with clear message

## Traceability Mapping

| Acceptance Criteria | Spec Section(s) | Component(s)/API(s) | Test Idea |
|---------------------|-----------------|---------------------|-----------|
| **Story 2.1 AC1-5** | Workflows: OAuth Flow | `/auth/login`, `/auth/callback`, `middleware.ts` | E2E: Complete OAuth flow, verify profile creation, check cookie |
| **Story 2.2 AC1-5** | APIs: GET `/api/credits/balance` | `/settings/page.tsx`, Zustand store | Unit: Profile rendering, Integration: Balance fetch API |
| **Story 2.3 AC1-7** | Workflows: Credit Purchase, APIs: POST `/api/credits/purchase`, Webhook handler | `/api/credits/purchase/route.ts`, `/api/webhooks/stripe/route.ts` | Integration: Stripe Checkout creation, Unit: Webhook signature validation, E2E: Full purchase flow with Stripe test mode |
| **Story 2.4 AC1-6** | APIs: GET `/api/credits/balance`, Data Models: `credit_transaction` | `/settings/page.tsx`, Transaction list component | Integration: Transaction history query with pagination, Unit: Filter by type |
| **Story 2.5 AC1-5** | Credit Store: Balance warnings | Credit balance hook, Warning banner component | Unit: Warning trigger at balance <20, E2E: Dismiss behavior, localStorage check |
| **Story 2.6 AC1-7** | Workflows: Credit Deduction with Rollback, Data Models: `deduct_credits()` stored procedure | `/lib/credits/transaction.ts`, `/api/songs/generate/route.ts` | Unit: Stored procedure with insufficient credits, Integration: Rollback on Suno API failure, Concurrency: Simulate rapid double-clicks |

**FR to AC Mapping:**
- **FR1** (Google OAuth signup) → Story 2.1 AC1-2
- **FR2** (Login & session persistence) → Story 2.1 AC3-5
- **FR3** (View profile & balance) → Story 2.2 AC1-4
- **FR4** (Logout) → Story 2.2 AC5
- **FR28** (View credit balance) → Story 2.2 AC2, Story 2.5 AC1-3
- **FR29** (Purchase credit packages) → Story 2.3 AC1-6
- **FR30** (Low balance warnings) → Story 2.5 AC1-5
- **FR31** (Transaction history) → Story 2.4 AC1-6
- **FR32** (Display credit cost) → Story 2.5 AC4 (implicit in button state)
- **FR33** (Prevent actions if insufficient) → Story 2.5 AC3-4, Story 2.6 AC7
- **FR34** (Refunds for failures) → Story 2.6 AC3-4

**Architecture to Implementation Mapping:**
- **ADR-002** (Supabase Backend) → Stories 2.1, 2.2, 2.6 (Auth + RLS + stored procedures)
- **ADR-003** (Zustand State) → Story 2.2 (Credit balance store)
- **ADR-005** (Pre-Paid Credits) → Stories 2.3, 2.6 (Credit packages + atomic deduction)
- **ADR-008** (Stripe Checkout) → Story 2.3 (Payment integration)

## Risks, Assumptions, Open Questions

**Risks:**

1. **RISK: Stripe Webhook Delivery Failure**
   - Impact: Credits not added after successful payment, user frustration
   - Probability: Low (Stripe has 99.99% uptime, retries webhooks)
   - Mitigation: Implement polling fallback after 5 minutes, check payment status manually
   - Owner: Backend Dev

2. **RISK: Google OAuth Provider Downtime**
   - Impact: Users cannot sign up or log in during outage
   - Probability: Low (Google has 99.9%+ uptime)
   - Mitigation: Display friendly error, cache session for 5-min grace period, consider secondary auth method post-MVP
   - Owner: Backend Dev

3. **RISK: Database Row Lock Contention**
   - Impact: Slow credit deduction under high concurrent load (>50 simultaneous requests)
   - Probability: Medium (possible during viral spikes)
   - Mitigation: Database row locking has 10-second timeout, Supabase Pro plan increases connection pool, optimize stored procedure
   - Owner: Backend Dev, DBA

4. **RISK: Currency Exchange Rate Fluctuations**
   - Impact: Credit packages priced in USD, Norwegian users may see varying local costs
   - Probability: High (NOK/USD exchange rate varies)
   - Mitigation: Accept as business decision, consider Vipps integration (NOK) in Phase 2
   - Owner: Product

5. **RISK: Refund Abuse**
   - Impact: Users intentionally trigger failures to test refund system
   - Probability: Low
   - Mitigation: Log all refund events, monitor refund rate (alert if >10% in 1 hour), rate limit generation requests
   - Owner: Backend Dev

**Assumptions:**

1. **ASSUMPTION: Users Prefer Pre-Paid Credits Over Subscription**
   - Validation: PRD states pre-paid model creates financial buffer, founder preference
   - Impact if wrong: May need to add subscription option post-launch
   - Next step: Validate with early beta testers

2. **ASSUMPTION: Google OAuth Sufficient for MVP (No Email/Password)**
   - Validation: PRD specifies Google OAuth only for MVP
   - Impact if wrong: Some users may not have Google accounts
   - Next step: Track "cannot sign up" support requests, add email auth if >5% of inquiries

3. **ASSUMPTION: 10 Credits Per Song Generation is Acceptable**
   - Validation: Based on API costs ($0.06 Suno + $0.03 OpenAI = $0.09), 10 credits = ~$0.90 margin on Starter package
   - Impact if wrong: Unit economics break down if credit cost too low
   - Next step: Monitor user feedback on perceived value

4. **ASSUMPTION: Supabase Free Tier Sufficient for MVP (<1000 Users)**
   - Validation: Free tier: 500MB DB, 2GB storage, 50MB file uploads, 2 simultaneous connections
   - Impact if wrong: Need to upgrade to Pro plan ($25/month) earlier than expected
   - Next step: Monitor DB size, connection usage via Supabase Dashboard

**Open Questions:**

1. **QUESTION: Should we offer credit refunds for user-requested cancellations (not just API failures)?**
   - Owner: Product
   - Decision needed by: Before Story 2.6 implementation
   - Options: (A) Only refund on technical failures, (B) Allow manual refund requests within 24 hours
   - Recommendation: Start with (A) for MVP, add manual refund policy post-launch based on support requests

2. **QUESTION: What is the credit expiration policy (if any)?**
   - Owner: Product, Legal
   - Decision needed by: Before launch (must be in Terms of Service)
   - Options: (A) No expiration, (B) 1-year expiration, (C) Credits expire if account inactive for 6 months
   - Current assumption: No expiration for MVP (simplicity)

3. **QUESTION: Should we show Stripe test mode badge in development environments?**
   - Owner: Frontend Dev
   - Decision needed by: Before Story 2.3 implementation
   - Options: (A) Yes, show "TEST MODE" banner, (B) No, treat like production
   - Recommendation: (A) - Prevents confusion during testing

4. **QUESTION: Do we need to support multiple currencies (NOK, EUR, SEK)?**
   - Owner: Product, Business
   - Decision needed by: Post-MVP (Phase 2)
   - Current assumption: USD only for MVP, Stripe handles currency conversion
   - Next step: Monitor international user acquisition, add Vipps (NOK) if Norwegian users >80%

## Test Strategy Summary

**Test Pyramid Approach:**

**Unit Tests (60% of tests):**
- **Database Stored Procedures**: Test `deduct_credits()` with sufficient/insufficient balances, concurrent calls
- **Credit Functions**: Test `deductCredits()`, `refundCredits()` with mocked DB
- **Stripe Webhook Handler**: Test signature verification, duplicate session handling, metadata extraction
- **Validation Schemas**: Test Zod schemas for credit purchase API (valid/invalid packageIds)
- **Component Logic**: Test credit balance warning triggers (<20, =0), transaction history filtering

**Tools:** Jest, React Testing Library
**Coverage Target:** >80% for credit logic modules

**Integration Tests (30% of tests):**
- **OAuth Flow**: Test complete Google OAuth flow with Supabase Auth (use test Google account)
- **Credit Purchase API**: Test Stripe Checkout session creation (use Stripe test mode)
- **Webhook Processing**: Test webhook receipt → credit addition flow (simulate Stripe events)
- **Credit Deduction + Rollback**: Test deduction → mock Suno failure → verify refund
- **Transaction History Query**: Test pagination, filtering, sorting with real database

**Tools:** Playwright, Supabase local development
**Environment:** Staging with Stripe test mode, Supabase dev project

**End-to-End Tests (10% of tests):**
- **E2E-1: Complete User Signup & Login**: Click "Sign in with Google" → Complete OAuth → Verify profile created with 0 credits
- **E2E-2: Purchase Credits**: Login → Navigate to Settings → Purchase Pro package → Complete Stripe Checkout (test card) → Verify 600 credits added
- **E2E-3: Low Balance Warning**: Set user balance to 15 credits → Trigger warning banner → Dismiss → Refresh → Verify re-appears
- **E2E-4: Generation with Insufficient Credits**: Set balance to 5 credits → Attempt song generation (10 credits) → Verify error toast + disabled button

**Tools:** Playwright (headless browser)
**Environment:** Staging environment with Stripe test mode

**Manual Testing:**
- **Stripe Webhook Retry**: Manually stop webhook endpoint, make purchase, restart, verify Stripe retries
- **Concurrent Credit Deduction**: Use browser DevTools to simulate 2 rapid generation requests, verify no double-charging
- **Session Persistence**: Login → Close tab → Reopen → Verify still logged in
- **OAuth Error Handling**: Revoke OAuth permissions mid-flow, verify friendly error message

**Edge Cases to Test:**
- **Exactly 0 Credits**: User has exactly 10 credits, generates song, balance = 0, verify warnings appear
- **Negative Balance Prevention**: Database constraint prevents negative balance, verify stored procedure raises error
- **Expired JWT**: Force JWT expiration, verify automatic refresh
- **Stripe Webhook Duplicate**: Send same webhook event twice, verify idempotency (credits added once)
- **Refund Without Deduction**: Attempt refund without prior deduction, verify error handling

**Performance Tests:**
- **Credit Balance Query**: Load test 100 concurrent balance checks, verify <500ms p95
- **Stored Procedure Under Load**: Simulate 50 concurrent credit deductions, verify no deadlocks or timeouts
- **Stripe Checkout Creation**: Measure latency for creating 100 checkout sessions sequentially

**Security Tests:**
- **JWT Tampering**: Modify JWT token, attempt API calls, verify 401 Unauthorized
- **RLS Bypass Attempt**: Use User A's token to fetch User B's credit balance, verify 403 Forbidden
- **Stripe Webhook Signature Forgery**: Send webhook with invalid signature, verify 400 Bad Request
- **SQL Injection**: Attempt SQL injection in packageId parameter, verify input validation blocks

**Test Data:**
- **Test Users**: 3 Google test accounts (user-low-credits@test.com, user-high-credits@test.com, user-no-credits@test.com)
- **Stripe Test Cards**: 4242 4242 4242 4242 (success), 4000 0000 0000 9995 (declined)
- **Database Seed**: Pre-populate test DB with transaction history for pagination testing

**Definition of Done (Testing):**
- All unit tests pass (>80% coverage)
- All integration tests pass
- Critical E2E flows pass (signup, purchase, deduction)
- Manual edge cases tested and documented
- No P0/P1 bugs open for this epic
