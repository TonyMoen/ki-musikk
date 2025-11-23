# Story 2.4: Display Credit Transaction History

Status: ready-for-dev

## Story

As a **user**,
I want to view my credit transaction history,
so that I can see all purchases, deductions, and refunds.

## Acceptance Criteria

**Given** I have credit transactions (purchases, deductions)
**When** I navigate to Settings page and scroll to "Transaction History"
**Then** I see a list of all transactions sorted by date (most recent first)
**And** Each transaction shows: Type (Purchase/Deduction/Refund), Amount (+/- credits), Description, Date, Balance after transaction
**And** Purchases show Stripe session ID (truncated)
**And** Deductions link to the song generated (if applicable)
**And** List is paginated (10 transactions per page)
**And** I can filter by transaction type (Purchase/Deduction/Refund)

## Tasks / Subtasks

- [ ] Task 1: Update credit balance API to include transaction history (AC: All)
  - [ ] Modify /src/app/api/credits/balance/route.ts to query credit_transaction table
  - [ ] Add pagination support via URL query params (?page=1, default 10 per page)
  - [ ] Add filter support via query param (?type=purchase|deduction|refund)
  - [ ] Query transactions with ORDER BY created_at DESC
  - [ ] Return paginated response with total count and current page
  - [ ] Ensure RLS policy enforces user can only see own transactions

- [ ] Task 2: Create transaction history component (AC: Display transactions)
  - [ ] Create /src/components/transaction-history.tsx
  - [ ] Use shadcn/ui Table component for transaction list
  - [ ] Create columns: Type (badge), Amount (with +/- prefix), Description, Date, Balance After
  - [ ] Format dates as relative ("2 minutes ago") using date-fns or relative time function
  - [ ] Display transaction type as colored badge (Purchase=green, Deduction=red, Refund=yellow)
  - [ ] Truncate Stripe session ID to first 12 chars with ellipsis
  - [ ] Make song_id clickable link if present (deduction transactions only)

- [ ] Task 3: Implement pagination controls (AC: Paginated list)
  - [ ] Add pagination component below transaction table
  - [ ] Use URL search params for page state (?page=2)
  - [ ] Display "Previous" and "Next" buttons
  - [ ] Show current page and total pages (e.g., "Page 2 of 5")
  - [ ] Disable "Previous" on page 1, disable "Next" on last page
  - [ ] Update URL without full page reload (router.push)

- [ ] Task 4: Implement transaction type filter (AC: Filter by type)
  - [ ] Add filter dropdown using shadcn/ui Select component
  - [ ] Options: "All", "Purchases", "Deductions", "Refunds"
  - [ ] Use URL search param for filter state (?type=purchase)
  - [ ] Update transactions query when filter changes
  - [ ] Reset pagination to page 1 when filter changes
  - [ ] Display active filter in UI (highlight selected option)

- [ ] Task 5: Integrate transaction history into Settings page (AC: Navigate to Settings)
  - [ ] Import TransactionHistory component into /src/app/settings/page.tsx
  - [ ] Add section header "Transaction History" below credit balance
  - [ ] Render TransactionHistory component
  - [ ] Fetch initial transaction data on page load
  - [ ] Handle loading state (skeleton or spinner)
  - [ ] Handle empty state (no transactions yet)

- [ ] Task 6: Add date formatting utility (AC: Display date)
  - [ ] Create /src/lib/utils/date-format.ts (or add to existing utils.ts)
  - [ ] Implement relativeTime() function for recent dates (<7 days)
  - [ ] Format absolute dates for older transactions (e.g., "Jan 15, 2025")
  - [ ] Use native Date or date-fns library for formatting
  - [ ] Handle timezone conversion to user's local time

- [ ] Task 7: Handle empty and error states (AC: All)
  - [ ] Display friendly message when no transactions: "No transactions yet. Purchase credits to get started!"
  - [ ] Handle API errors gracefully with toast notification
  - [ ] Display loading skeleton during initial fetch
  - [ ] Show pagination skeleton during page change
  - [ ] Handle network timeout with retry button

- [ ] Task 8: Test transaction history with mock data (AC: All)
  - [ ] Verify transaction list displays correctly with existing transaction from Story 2.3
  - [ ] Test pagination with >10 transactions (create additional test purchases if needed)
  - [ ] Test filtering by Purchase, Deduction, Refund types
  - [ ] Verify date formatting for recent and old transactions
  - [ ] Test empty state (new user with 0 transactions)
  - [ ] Verify Stripe session ID truncation and display

- [ ] Task 9: Build and verify production readiness (AC: All)
  - [ ] Run `npm run build` to verify TypeScript compilation
  - [ ] Run `npm run lint` to check code quality
  - [ ] Verify transaction history accessible from Settings page
  - [ ] Test responsive design (mobile, tablet, desktop)
  - [ ] Verify accessibility (keyboard navigation, screen readers)

## Dev Notes

### Requirements Context

**From Tech Spec (Epic 2 - User Authentication & Credit System):**

Story 2.4 provides transparency into credit usage by displaying a complete audit trail of all credit transactions. This supports FR31 (View transaction history) and provides users visibility into purchases, song generation costs, and any refunds.

**Key Requirements:**
- **FR31**: Transaction history with filtering and pagination
- **FR28**: Display credit balance (already implemented in Story 2.2)
- **FR34**: Show refunds for failed generations (will be visible in transaction list)

**Technical Constraints from Architecture:**
- **Database**: Query `credit_transaction` table with RLS enforcement
- **Performance**: Target <500ms for transaction history query (10 records)
- **Pagination**: 10 transactions per page (Architecture: API patterns)
- **Date Format**: Relative time for recent (<7 days), absolute for older

**From Epic 2 Tech Spec - Transaction History Display:**

Transaction record structure (from database schema):
```sql
credit_transaction (
  id UUID,
  user_id UUID,
  amount INTEGER,  -- Positive for purchase, negative for deduction
  balance_after INTEGER,
  transaction_type TEXT (purchase | deduction | refund),
  description TEXT,
  stripe_session_id TEXT,  -- For purchases only
  song_id UUID,  -- For deductions/refunds only
  created_at TIMESTAMPTZ
)
```

**Display Requirements:**
- **Type Badge**: Color-coded (Purchase=green, Deduction=red, Refund=yellow)
- **Amount Format**: "+500 credits" for purchase, "-10 credits" for deduction
- **Date Format**: "2 minutes ago" or "Jan 15, 2025"
- **Stripe ID**: Truncate to 12 chars (e.g., "cs_test_abc1...") for purchases
- **Song Link**: Clickable link to song detail if song_id present

[Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md]

### Architecture Alignment

**Component Mapping (from Architecture):**

This story implements the following architectural components:

1. **Update /src/app/api/credits/balance/route.ts** - Add transaction history query with pagination/filtering
2. **/src/components/transaction-history.tsx** - Transaction list table with pagination and filters
3. **/src/lib/utils/date-format.ts** - Date formatting utilities for relative/absolute time
4. **Update /src/app/settings/page.tsx** - Integrate transaction history component

**Existing Components (from Previous Stories):**
- /src/app/api/credits/balance/route.ts - Credit balance API (Story 2.2) - will be extended
- /src/app/settings/page.tsx - Settings page (Story 2.2) - will add transaction history section
- /src/lib/supabase/server.ts - Server client for DB operations (Story 1.3)
- /src/types/supabase.ts - TypeScript types for credit_transaction table (Story 1.6)
- shadcn/ui components: Table, Select, Badge (Story 1.4)

**Database Schema (from Story 1.6):**

```sql
-- credit_transaction table (already created)
CREATE TABLE credit_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund')),
  description TEXT NOT NULL,
  stripe_session_id TEXT,
  song_id UUID REFERENCES song(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transaction_user_id ON credit_transaction(user_id);
CREATE INDEX idx_credit_transaction_created_at ON credit_transaction(created_at DESC);

-- RLS Policy (already in place)
CREATE POLICY credit_transaction_select ON credit_transaction FOR SELECT USING (auth.uid() = user_id);
```

**API Response Format (from Architecture):**

```typescript
// GET /api/credits/balance?page=1&type=purchase
{
  data: {
    balance: number,
    transactions: CreditTransaction[],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalCount: number,
      pageSize: number
    }
  }
}
```

[Source: docs/architecture.md - API Response Format, docs/sprint-artifacts/tech-spec-epic-2.md]

### Project Structure Notes

**Files to Create:**
- /src/components/transaction-history.tsx - Transaction list table with pagination and filters
- /src/lib/utils/date-format.ts (or extend existing utils.ts) - Date formatting utilities

**Files to Modify:**
- /src/app/api/credits/balance/route.ts - Add transaction query with pagination and filtering
- /src/app/settings/page.tsx - Add transaction history section

**shadcn/ui Components Needed:**
- Table - For transaction list (check if installed, install if needed)
- Select - For transaction type filter (already installed)
- Badge - For transaction type display (already installed)
- Skeleton - For loading states (check if installed)

**NPM Dependencies:**
- `date-fns` (optional) - For date formatting utilities, or use native Date methods

**TypeScript Types:**

```typescript
// /src/types/credit.ts (extend existing)
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

export interface TransactionListProps {
  transactions: CreditTransaction[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onFilterChange: (type: string) => void
  activeFilter: string
}
```

[Source: docs/sprint-artifacts/tech-spec-epic-2.md - Data Models]

### Learnings from Previous Story

**From Story 2-3-implement-credit-purchase-flow-with-stripe-checkout (Status: review)**

- **Stripe Integration Working**: Credit purchase flow fully functional, webhook handler creates transaction records in `credit_transaction` table
- **Transaction Records Created**: Purchases create records with type='purchase', amount=+credits, stripe_session_id populated
- **Database Trigger Added**: User profile creation on signup handled by database trigger (20251122_add_user_profile_trigger.sql)
- **Service Role Key Pattern**: Webhook handler uses service role key to bypass RLS (pattern to follow for server-side operations)
- **Settings Page Ready**: Settings page has sections for profile, credit balance, purchase modal - ready for transaction history

**New Services/Patterns Created:**
- **Constants Defined**: `/src/lib/constants.ts` with CREDIT_PACKAGES and CREDIT_COSTS
- **Stripe Client**: `/src/lib/stripe.ts` for server-side Stripe operations
- **Purchase API**: `/src/app/api/credits/purchase/route.ts` creates Stripe Checkout sessions
- **Webhook Handler**: `/src/app/api/webhooks/stripe/route.ts` processes payments and creates transactions
- **Purchase Modal**: `/src/components/credit-purchase-modal.tsx` displays credit packages

**Technical Patterns to Follow:**
- **Authenticated API Routes**: Check session, return 401 if not authenticated (existing pattern)
- **RLS Enforcement**: Use authenticated Supabase client for user-scoped queries
- **Error Handling**: Return consistent error format with toast notifications
- **Loading States**: Show skeleton/spinner during data fetch
- **URL State Management**: Use search params for pagination/filtering (Next.js router)

**Files to Leverage:**
- /src/lib/supabase/server.ts - Use for transaction history query
- /src/app/settings/page.tsx - Add transaction history section below credit balance
- shadcn/ui components - Table, Badge, Select for transaction display
- /src/types/supabase.ts - CreditTransaction type already defined

**Transaction Data Available:**
- Story 2.3 completed successfully with E2E testing
- At least one purchase transaction exists in database (Starter package, 500 credits)
- Transaction record includes: type='purchase', amount=500, stripe_session_id, created_at
- Perfect for testing transaction history display with real data

**Potential Issues to Address:**
- **Empty State**: New users may have 0 transactions, display helpful message
- **Performance**: Ensure query is indexed (idx_credit_transaction_user_id, idx_credit_transaction_created_at)
- **Song Links**: song_id will be NULL for purchases, only populated for deductions (Story 2.6)
- **Date Timezone**: Convert UTC timestamps to user's local timezone
- **Pagination Edge Case**: Last page may have <10 transactions, handle gracefully
- **Filter Reset**: When changing filter, reset to page 1 to avoid empty results

**Integration Points:**
- Transaction history will display purchase from Story 2.3
- Future deduction transactions will appear when song generation implemented (Epic 3)
- Refund transactions will appear when rollback logic implemented (Story 2.6)

[Source: docs/sprint-artifacts/2-3-implement-credit-purchase-flow-with-stripe-checkout.md#Dev-Agent-Record]

### Technical Context

**Pagination Strategy:**

Use offset-based pagination with query parameters:
```typescript
// GET /api/credits/balance?page=2&type=purchase

const page = parseInt(searchParams.get('page') || '1')
const type = searchParams.get('type') || 'all'
const pageSize = 10

const offset = (page - 1) * pageSize

let query = supabase
  .from('credit_transaction')
  .select('*', { count: 'exact' })
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(offset, offset + pageSize - 1)

if (type !== 'all') {
  query = query.eq('transaction_type', type)
}

const { data, count, error } = await query
```

**Date Formatting Approach:**

```typescript
// /src/lib/utils/date-format.ts

export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Recent transactions (<7 days): relative time
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else if (diffDays < 7) {
    return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`
  }

  // Older transactions: absolute date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) // e.g., "Jan 15, 2025"
}
```

**Transaction Type Badge Styling:**

```typescript
// In transaction-history.tsx component

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'purchase': return 'success'  // Green
    case 'deduction': return 'destructive'  // Red
    case 'refund': return 'warning'  // Yellow
    default: return 'secondary'
  }
}

<Badge variant={getTypeBadgeVariant(transaction.transaction_type)}>
  {transaction.transaction_type.toUpperCase()}
</Badge>
```

**Amount Display Format:**

```typescript
const formatAmount = (amount: number, type: string) => {
  const prefix = type === 'deduction' ? '-' : '+'
  return `${prefix}${Math.abs(amount)} credits`
}

// Examples:
// Purchase: "+500 credits"
// Deduction: "-10 credits"
// Refund: "+10 credits"
```

**Song Link (for deductions):**

```typescript
{transaction.song_id ? (
  <Link href={`/songs/${transaction.song_id}`} className="text-blue-500 hover:underline">
    View Song
  </Link>
) : (
  <span className="text-gray-400">N/A</span>
)}
```

**Empty State Component:**

```typescript
{transactions.length === 0 && (
  <div className="text-center py-8 text-gray-500">
    <p className="text-lg">No transactions yet</p>
    <p className="text-sm mt-2">Purchase credits to get started!</p>
    <Button onClick={openPurchaseModal} className="mt-4">
      Purchase Credits
    </Button>
  </div>
)}
```

[Source: docs/architecture.md - Implementation Patterns, docs/sprint-artifacts/tech-spec-epic-2.md]

### References

- [Tech Spec Epic 2 - Transaction History](tech-spec-epic-2.md#story-24-display-credit-transaction-history)
- [Architecture - Data Architecture](../architecture.md#data-architecture)
- [Architecture - API Response Format](../architecture.md#api-response-format)
- [Epic 2 Story 2.4 Acceptance Criteria](../epics/epic-2-user-authentication-credit-system.md#story-24-display-credit-transaction-history)
- [PRD - Credit System Requirements](../prd.md#credit-system--payments)
- [Story 2.3 - Credit Purchase Implementation](./2-3-implement-credit-purchase-flow-with-stripe-checkout.md)

## Change Log

**2025-11-23 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 2: User Authentication & Credit System
- Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md, docs/architecture.md
- Prerequisites: Story 2.3 (Credit purchase flow complete, transaction records exist in database)
- Includes learnings from Story 2.3: Transaction records created, Settings page ready, shadcn/ui components available
- Transaction data available from Story 2.3 testing (Starter package purchase with 500 credits)
- Next step: Run story-context workflow to generate technical context XML and mark ready for development

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/stories/2-4-display-credit-transaction-history.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
