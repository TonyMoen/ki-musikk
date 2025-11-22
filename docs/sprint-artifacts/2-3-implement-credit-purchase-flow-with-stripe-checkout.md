# Story 2.3: Implement Credit Purchase Flow with Stripe Checkout

Status: ready-for-dev

## Story

As a **user**,
I want to purchase credit packages via Stripe,
so that I can generate songs using my purchased credits.

## Acceptance Criteria

**Given** I am on the Settings page viewing my credit balance
**When** I click "Purchase Credits"
**Then** I see credit package options:
  - Starter: $15 (500 credits, ~50 songs)
  - Pro: $25 (1000 credits, ~100 songs) - Badge: "MOST POPULAR"
  - Premium: $50 (2500 credits, ~250 songs)
**And** When I select a package, I am redirected to Stripe Checkout
**And** After successful payment, I am redirected back to Musikkfabrikken
**And** My credit balance is updated immediately
**And** I see a success toast: "✓ Credits added to your account!"
**And** A transaction record is created in `credit_transaction` table

## Tasks / Subtasks

- [ ] Task 1: Install Stripe dependencies (AC: Stripe integration)
  - [ ] Install Stripe SDK: `npm install stripe @stripe/stripe-js`
  - [ ] Verify installations in package.json
  - [ ] Set up environment variables in .env.local (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)

- [ ] Task 2: Define credit package constants (AC: Package options)
  - [ ] Create /src/lib/constants.ts if not exists
  - [ ] Define CREDIT_PACKAGES array with 3 packages:
    - Starter: { id: 'starter', name: 'Starter', price: 1500 (cents), credits: 500, description: '~50 songs' }
    - Pro: { id: 'pro', name: 'Pro', price: 2500, credits: 1000, description: '~100 songs', badge: 'MOST POPULAR' }
    - Premium: { id: 'premium', name: 'Premium', price: 5000, credits: 2500, description: '~250 songs' }
  - [ ] Define CREDIT_COSTS constant with SONG_GENERATION: 10
  - [ ] Export types: CreditPackage interface

- [ ] Task 3: Create Stripe client initialization (AC: Stripe integration)
  - [ ] Create /src/lib/stripe.ts for server-side Stripe client
  - [ ] Initialize Stripe with STRIPE_SECRET_KEY
  - [ ] Export stripe client instance
  - [ ] Add type safety with TypeScript

- [ ] Task 4: Create credit purchase API route (AC: Select package → redirect to Stripe)
  - [ ] Create /src/app/api/credits/purchase/route.ts as POST handler
  - [ ] Validate user is authenticated (session check)
  - [ ] Validate request body with Zod schema (packageId must be 'starter'|'pro'|'premium')
  - [ ] Look up selected package from CREDIT_PACKAGES
  - [ ] Create Stripe Checkout session with:
    - Line item: package name, price, quantity 1
    - Metadata: { userId, packageId, credits }
    - Success URL: /settings?payment=success
    - Cancel URL: /settings?payment=cancelled
  - [ ] Return JSON: { data: { checkoutUrl: string } }
  - [ ] Handle errors: 400 Bad Request (invalid packageId), 401 Unauthorized

- [ ] Task 5: Create Stripe webhook handler (AC: Credits added after payment)
  - [ ] Create /src/app/api/webhooks/stripe/route.ts as POST handler
  - [ ] Verify webhook signature using STRIPE_WEBHOOK_SECRET
  - [ ] Parse Stripe event from raw request body
  - [ ] Handle event type 'checkout.session.completed':
    - Extract metadata: { userId, credits }
    - Check for duplicate stripe_session_id (idempotency)
    - Atomically update user_profile.credit_balance += credits
    - Create credit_transaction record (type: 'purchase', amount: +credits, stripe_session_id)
  - [ ] Return 200 OK: { received: true }
  - [ ] Handle errors: 400 Bad Request (invalid signature), 500 on DB errors

- [ ] Task 6: Create credit purchase modal UI (AC: Package selection UI)
  - [ ] Create /src/components/credit-purchase-modal.tsx
  - [ ] Use shadcn/ui Dialog component
  - [ ] Display 3 credit packages as cards:
    - Package name, price ($XX), credits, description
    - "MOST POPULAR" badge on Pro package (yellow accent)
    - Select button (primary red) for each package
  - [ ] Implement onClick handler for each package:
    - Call POST /api/credits/purchase with selected packageId
    - Redirect to Stripe Checkout URL
  - [ ] Add loading state during API call
  - [ ] Style with Tailwind (Playful Nordic theme)

- [ ] Task 7: Integrate purchase modal into Settings page (AC: Click "Purchase Credits")
  - [ ] Import CreditPurchaseModal into /src/app/settings/page.tsx
  - [ ] Add state to control modal visibility (useState)
  - [ ] Enable "Purchase Credits" button (currently disabled from Story 2.2)
  - [ ] Attach onClick handler to show modal
  - [ ] Render modal conditionally based on state

- [ ] Task 8: Handle payment success/cancel redirects (AC: Success toast, balance update)
  - [ ] In Settings page, check URL query params for ?payment=success or ?payment=cancelled
  - [ ] If success:
    - Display success toast: "✓ Credits added to your account!"
    - Call useCreditsStore refreshBalance() to update UI
    - Clear query param from URL (router.replace)
  - [ ] If cancelled:
    - Display info toast: "Credit purchase cancelled"
    - Clear query param from URL
  - [ ] Use shadcn/ui Toast component for notifications

- [ ] Task 9: Test Stripe integration end-to-end (AC: All)
  - [ ] Configure Stripe webhook in Stripe Dashboard (test mode):
    - Endpoint: http://localhost:3000/api/webhooks/stripe
    - Events: checkout.session.completed
    - Copy webhook secret to STRIPE_WEBHOOK_SECRET env variable
  - [ ] Test full flow with Stripe test card (4242 4242 4242 4242):
    - Login → Settings → Purchase Credits → Select Pro package
    - Complete Stripe Checkout
    - Verify redirect to /settings?payment=success
    - Verify credit balance updated (1000 credits added)
    - Verify success toast displayed
    - Verify transaction record created in credit_transaction table
  - [ ] Test webhook signature verification (invalid signature should return 400)
  - [ ] Test idempotency (webhook sent twice should only add credits once)

- [ ] Task 10: Build and verify production readiness (AC: All)
  - [ ] Run `npm run build` to verify TypeScript compilation
  - [ ] Run `npm run lint` to check code quality
  - [ ] Verify all Stripe environment variables configured
  - [ ] Document Stripe setup in Dev Notes
  - [ ] Test error handling: insufficient credits, invalid package ID, webhook failure

## Dev Notes

### Requirements Context

**From Tech Spec (Epic 2 - User Authentication & Credit System):**

Story 2.3 implements the monetization foundation for Musikkfabrikken by integrating Stripe Checkout for credit purchases. This is the first revenue-generating feature, enabling the pre-paid credit system that buffers against API costs (Suno: $0.06/song, OpenAI: ~$0.03/request).

**Key Requirements:**
- **FR29**: Purchase credit packages via Stripe (Starter/Pro/Premium tiers)
- **FR31**: Transaction history (created in credit_transaction table)
- **FR28**: Credit balance updates immediately after purchase

**Technical Constraints from Architecture:**
- **ADR-008**: Use Stripe Checkout (hosted payment page) instead of Stripe Elements
- **ADR-005**: Pre-paid credit system creates financial buffer
- **Security**: PCI compliance handled by Stripe (no card data in app database)
- **Atomicity**: Webhook processing must be idempotent (handle duplicate events)

**From Epic 2 Tech Spec - Credit Purchase Flow:**

Credit packages (updated pricing - more generous):
1. **Starter**: $15 (1500 cents) → 500 credits → ~50 full songs (10 credits per song)
2. **Pro**: $25 (2500 cents) → 1000 credits → ~100 songs (badge: "MOST POPULAR")
3. **Premium**: $50 (5000 cents) → 2500 credits → ~250 songs

**Credit Cost Economics:**
- Song generation: 10 credits = ~$0.30 cost per song (Suno $0.06 + OpenAI $0.03 = $0.09 actual API cost)
- Canvas generation: 5 credits (future story)
- Mastering service: 20 credits (future story)
- Free preview: 0 credits
- Pricing strategy: More affordable, higher volume model to encourage user adoption

[Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/prd.md - Credit System]

### Architecture Alignment

**Component Mapping (from Architecture):**

This story implements the following architectural components:

1. **/src/lib/stripe.ts** - Server-side Stripe client initialization
2. **/src/lib/constants.ts** - CREDIT_PACKAGES and CREDIT_COSTS definitions
3. **/src/app/api/credits/purchase/route.ts** - Create Stripe Checkout session
4. **/src/app/api/webhooks/stripe/route.ts** - Process payment confirmation webhooks
5. **/src/components/credit-purchase-modal.tsx** - Package selection UI
6. **Update /src/app/settings/page.tsx** - Enable purchase button, handle redirects

**Existing Components (from Previous Stories):**
- /src/stores/credits-store.ts - Zustand store with setBalance() (Story 2.2)
- /src/app/api/credits/balance/route.ts - Fetch credit balance (Story 2.2)
- /src/lib/supabase/server.ts - Server client for DB operations (Story 1.3)
- /src/types/supabase.ts - TypeScript types for user_profile and credit_transaction tables (Story 1.6)
- shadcn/ui components: Dialog, Button, Card, Toast (Story 1.4)

**Database Schema (from Story 1.6):**

```sql
-- credit_transaction table
CREATE TABLE credit_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- Positive for purchase
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund')),
  description TEXT NOT NULL,
  stripe_session_id TEXT,  -- For purchases (idempotency check)
  song_id UUID REFERENCES song(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Stripe Integration Points (from Tech Spec):**

**Workflow: Credit Purchase Flow**
1. User clicks "Purchase Credits" → Modal displays 3 packages
2. User selects package → Frontend calls POST /api/credits/purchase
3. Backend creates Stripe Checkout session with metadata
4. User redirects to Stripe Checkout (hosted payment form)
5. User enters payment information → Stripe processes
6. Stripe sends webhook to /api/webhooks/stripe (event: checkout.session.completed)
7. Backend validates webhook signature → Adds credits atomically
8. Backend creates credit_transaction record
9. Stripe redirects user to /settings?payment=success
10. Frontend displays success toast → Refreshes credit balance

**Security Requirements:**
- **Webhook Signature Verification**: Use stripe.webhooks.constructEvent() with STRIPE_WEBHOOK_SECRET
- **Idempotency**: Check for existing transaction with same stripe_session_id before adding credits
- **Metadata Validation**: Verify userId from webhook metadata matches session
- **PCI Compliance**: Stripe Checkout handles all card data (no storage in app)

[Source: docs/architecture.md - ADR-008, docs/sprint-artifacts/tech-spec-epic-2.md - Workflows]

### Project Structure Notes

**Files to Create:**
- /src/lib/stripe.ts - Stripe client initialization (server-side only)
- /src/lib/constants.ts - CREDIT_PACKAGES and CREDIT_COSTS constants
- /src/app/api/credits/purchase/route.ts - Create Stripe Checkout session
- /src/app/api/webhooks/stripe/route.ts - Webhook handler for payment confirmation
- /src/components/credit-purchase-modal.tsx - Package selection modal UI

**Files to Modify:**
- /src/app/settings/page.tsx - Enable purchase button, add modal, handle redirects
- /src/types/credit.ts (or constants.ts) - Add CreditPackage type definition

**Environment Variables Required:**
```env
# Stripe (Test Mode for Development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Stripe Setup Steps:**
1. Create Stripe account (or use existing test mode)
2. Get API keys from Stripe Dashboard → Developers → API keys
3. Configure webhook endpoint:
   - URL: http://localhost:3000/api/webhooks/stripe (development)
   - Events: checkout.session.completed
   - Copy webhook signing secret

**NPM Dependencies:**
- `stripe` - Server-side Stripe SDK (API calls, webhook verification)
- `@stripe/stripe-js` - Client-side Stripe SDK (redirect to Checkout)
- `zod` - Already installed (Story 2.2) for request validation

**shadcn/ui Components Needed:**
- Dialog - For credit purchase modal (already installed)
- Toast - For success/error notifications (already installed)
- Badge - For "MOST POPULAR" label on Pro package (check if installed)

[Source: docs/sprint-artifacts/tech-spec-epic-2.md - Dependencies]

### Learnings from Previous Story

**From Story 2-2-display-user-profile-with-credit-balance (Status: done)**

- **Zustand Store Working**: useCreditsStore with refreshBalance() method tested and operational
- **API Route Pattern**: /src/app/api/credits/balance/route.ts successfully queries user_profile with RLS
- **Settings Page Structure**: Client Component at /src/app/settings/page.tsx with user authentication
- **Toast Notifications**: shadcn/ui Toast component available for success/error messages
- **Bottom Navigation**: Credit balance badge updates when store.setBalance() called

**New Services/Patterns Created:**
- **Credits Store**: `/src/stores/credits-store.ts` with setBalance() and refreshBalance() methods
- **Credit Balance API**: `/src/app/api/credits/balance/route.ts` returns profile and balance
- **Settings Page**: Displays profile, balance, logout - ready for purchase modal integration

**Technical Patterns to Follow:**
- **Authenticated API Routes**: Check session, return 401 if not authenticated
- **Zustand State Updates**: Call store.setBalance() after successful purchase
- **Toast Pattern**: Use toast from shadcn/ui for user notifications
- **Query Params**: Use Next.js router to check ?payment=success

**Files to Leverage:**
- /src/stores/credits-store.ts - Call refreshBalance() after successful payment
- /src/app/settings/page.tsx - Integrate purchase modal, handle redirects
- /src/lib/supabase/server.ts - Use in webhook handler for DB operations
- shadcn/ui Dialog, Toast components - Use for UI

**Potential Issues Noted:**
- Stripe webhook must validate signature before trusting payload
- Must handle duplicate webhook events (Stripe retries on failure)
- Credit balance update must be atomic (use database transaction)
- Redirect URL must be absolute (include full domain for production)
- Test mode vs production mode environment variables must be managed

**Purchase Button Integration:**
- Story 2.2 created disabled "Purchase Credits" button with tooltip
- This story enables the button and attaches onClick handler
- Modal state managed with useState in Settings page

[Source: docs/sprint-artifacts/2-2-display-user-profile-with-credit-balance.md#Dev-Agent-Record]

### Technical Context

**Stripe Checkout vs Stripe Elements:**

From Architecture ADR-008:
- **Stripe Checkout**: Hosted payment page (redirects user to Stripe domain)
  - ✅ PCI compliance handled by Stripe
  - ✅ Mobile-optimized checkout flow
  - ✅ Supports multiple payment methods (card, Apple Pay, Google Pay)
  - ✅ Automatic 3D Secure, fraud detection
  - ⚠️ Redirect UX (leaves app briefly)
- **Stripe Elements**: Custom form embedded in app (not chosen for MVP)

**Webhook Reliability:**

Stripe webhook delivery guarantees:
- 99.99% uptime SLA
- Automatic retries with exponential backoff (up to 3 days)
- Webhook signature verification prevents forgery
- Events delivered in order (mostly)

**Idempotency Strategy:**

Prevent duplicate credit additions:
1. Webhook handler checks `credit_transaction` table for existing `stripe_session_id`
2. If found: Return 200 OK (already processed), do nothing
3. If not found: Proceed with credit addition and transaction creation

**Atomic Credit Addition:**

Use Supabase transaction or direct SQL update:
```typescript
// Option 1: Direct SQL update (atomic)
await supabase.rpc('add_credits', { p_user_id: userId, p_amount: credits })

// Option 2: Manual transaction
const { data: profile } = await supabase
  .from('user_profile')
  .select('credit_balance')
  .eq('id', userId)
  .single()

const newBalance = profile.credit_balance + credits

await supabase
  .from('user_profile')
  .update({ credit_balance: newBalance })
  .eq('id', userId)

await supabase
  .from('credit_transaction')
  .insert({
    user_id: userId,
    amount: credits,
    balance_after: newBalance,
    transaction_type: 'purchase',
    description: `Credit purchase: ${packageId}`,
    stripe_session_id: sessionId
  })
```

**Webhook Signature Verification:**

```typescript
import Stripe from 'stripe'

const sig = request.headers.get('stripe-signature')!
const body = await request.text()  // Raw body required for signature

let event: Stripe.Event
try {
  event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
} catch (err) {
  return new Response('Webhook signature verification failed', { status: 400 })
}
```

**Stripe Checkout Session Creation:**

```typescript
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${packageName} Credit Package`,
          description: `${credits} credits for Musikkfabrikken`,
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${APP_URL}/settings?payment=success`,
  cancel_url: `${APP_URL}/settings?payment=cancelled`,
  metadata: {
    userId: user.id,
    packageId: packageId,
    credits: credits.toString(),
  },
})

return { checkoutUrl: session.url }
```

**Testing with Stripe Test Cards:**

- **Success**: 4242 4242 4242 4242 (any future expiry, any CVC)
- **Declined**: 4000 0000 0000 9995
- **Requires 3D Secure**: 4000 0025 0000 3155

[Source: docs/architecture.md - ADR-008, Stripe documentation]

### References

- [Tech Spec Epic 2 - Credit Purchase Flow](tech-spec-epic-2.md#workflows-and-sequencing)
- [Architecture - ADR-008: Stripe Checkout](../architecture.md#adr-008-stripe-checkout-for-payment-processing)
- [Architecture - ADR-005: Pre-Paid Credit System](../architecture.md#adr-005-pre-paid-credit-system-for-api-cost-management)
- [Epic 2 Story 2.3 Acceptance Criteria](../epics/epic-2-user-authentication-credit-system.md#story-23-implement-credit-purchase-flow-with-stripe-checkout)
- [PRD - Credit System Requirements](../prd.md#credit-system--payments)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Next.js Integration Guide](https://stripe.com/docs/checkout/quickstart?lang=node)

## Change Log

**2025-11-22 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 2: User Authentication & Credit System
- Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md, docs/architecture.md
- Prerequisites: Story 2.2 (User profile and credit balance display complete)
- Includes learnings from Story 2.2: Zustand store working, Settings page ready, Toast component available
- Next step: Run story-context workflow to generate technical context XML and mark ready for development

## Dev Agent Record

### Context Reference

- [Story Context File](./2-3-implement-credit-purchase-flow-with-stripe-checkout.context.xml) - Generated 2025-11-22

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
