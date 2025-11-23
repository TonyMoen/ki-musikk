# Story 2.5: Implement Credit Balance Warnings

Status: ready-for-dev

## Story

As a **user**,
I want to receive warnings when my credit balance is low,
so that I can purchase more credits before running out.

## Acceptance Criteria

**Given** I am logged in with active credit balance
**When** My balance drops below 20 credits (2 songs)
**Then** I see a warning banner at top of screen: "💡 Lite kreditter igjen! Du har 15 kreditter. Kjøp mer?"
**And** Banner is yellow (#FFC93C background), dismissible but re-appears on next session
**When** My balance reaches 0 credits
**Then** I see an error toast when attempting any action: "❌ Ikke nok kreditter. Kjøp en pakke for å fortsette."
**And** All generation buttons are disabled with tooltip "Trenger kreditter for å generere"
**And** "Kjøp kreditter" button is prominently displayed

## Tasks / Subtasks

- [ ] Task 1: Create low credit warning banner component (AC: Warning banner)
  - [ ] Create /src/components/low-credit-warning.tsx
  - [ ] Banner displays when credit balance < 20
  - [ ] Yellow background (#FFC93C from Playful Nordic theme), dismiss button
  - [ ] Norwegian warning text: "💡 Lite kreditter igjen! Du har {balance} kreditter. Kjøp mer?"
  - [ ] Include "Kjøp kreditter" button that opens purchase modal
  - [ ] Dismiss functionality stores state in localStorage
  - [ ] Banner re-appears on new session if balance still < 20

- [ ] Task 2: Implement credit balance state management (AC: Balance check)
  - [ ] Update /src/stores/credits-store.ts (or create if doesn't exist using Zustand)
  - [ ] Add balance state with getter/setter
  - [ ] Add computed property: isLowBalance (balance < 20)
  - [ ] Add computed property: hasInsufficientCredits (balance < minimum required for action)
  - [ ] Subscribe to balance updates from credit transactions
  - [ ] Initialize balance from API on app load

- [ ] Task 3: Integrate warning banner into root layout (AC: Top of screen)
  - [ ] Update /src/app/layout.tsx to include LowCreditWarning component
  - [ ] Position banner at top below header (if header exists) or at top of page
  - [ ] Only render if user is authenticated and balance < 20
  - [ ] Check localStorage for dismissal state (key: `low-credit-warning-dismissed-{userId}`)
  - [ ] Reset dismissal state when balance goes above 20

- [ ] Task 4: Implement zero balance handling (AC: Error toast, disabled buttons)
  - [ ] Create utility function: checkSufficientCredits(requiredAmount) in /src/lib/credits/validator.ts
  - [ ] Returns { sufficient: boolean, balance: number, required: number }
  - [ ] Update song generation button to check balance before enabling
  - [ ] Disable button if balance < CREDIT_COSTS.SONG_GENERATION (10 credits)
  - [ ] Add tooltip to disabled button: "Trenger kreditter for å generere"
  - [ ] Display error toast if user attempts action with insufficient credits
  - [ ] Toast message (Norwegian): "❌ Ikke nok kreditter. Kjøp en pakke for å fortsette."

- [ ] Task 5: Add client-side credit validation (AC: Prevent actions)
  - [ ] Update all credit-consuming actions (song generation, canvas, etc.)
  - [ ] Check credit balance before allowing action
  - [ ] Display error toast if insufficient credits
  - [ ] Redirect to credit purchase modal with pre-selected package
  - [ ] Validation happens both client-side (UX) and server-side (security)

- [ ] Task 6: Update Settings page to show warning state (AC: Purchase button prominent)
  - [ ] Add warning card if balance < 20 on /src/app/settings/page.tsx
  - [ ] Norwegian warning text: "⚠️ Lav kredittsaldo! Du har {balance} kreditter igjen."
  - [ ] "Kjøp kreditter" button displayed prominently (primary red)
  - [ ] Show recommended package based on low balance (e.g., Starter or Pro)
  - [ ] Highlight credit balance in red if balance < 20

- [ ] Task 7: Implement localStorage dismissal logic (AC: Dismissible, re-appears)
  - [ ] Store dismissal state in localStorage: `low-credit-warning-dismissed-{userId}`
  - [ ] Store timestamp of dismissal
  - [ ] Clear dismissal state when balance goes above 20
  - [ ] Clear dismissal state on new session (check timestamp, reset if > 24 hours)
  - [ ] Banner re-appears immediately if balance drops below 20 again

- [ ] Task 8: Add credit balance polling/real-time updates (AC: Real-time balance)
  - [ ] Implement polling mechanism to fetch balance every 30 seconds (optional, can use Supabase real-time)
  - [ ] Update Zustand store when balance changes
  - [ ] Trigger warning banner if balance drops below 20
  - [ ] OR: Use Supabase real-time subscription to credit_transaction table for instant updates
  - [ ] Update balance display in UI immediately after transaction

- [ ] Task 9: Test warning banner and zero balance scenarios (AC: All)
  - [ ] Test warning banner appears when balance < 20
  - [ ] Test banner dismissal and localStorage persistence
  - [ ] Test banner re-appears on new session
  - [ ] Test banner hides when balance goes above 20
  - [ ] Test generation button disabled when balance = 0
  - [ ] Test error toast displays on action attempt with 0 balance
  - [ ] Test tooltip displays on disabled button
  - [ ] Test recommended package suggestion based on balance

- [ ] Task 10: Build and verify production readiness (AC: All)
  - [ ] Run `npm run build` to verify TypeScript compilation
  - [ ] Run `npm run lint` to check code quality
  - [ ] Verify warning banner displays correctly on all pages
  - [ ] Test responsive design (mobile, tablet, desktop)
  - [ ] Verify localStorage cleanup on logout
  - [ ] Test edge case: exactly 20 credits (should NOT show warning)
  - [ ] Test edge case: exactly 0 credits (should show error state)

## Dev Notes

### Requirements Context

**From Tech Spec (Epic 2 - User Authentication & Credit System):**

Story 2.5 implements proactive credit balance monitoring to prevent users from running out of credits unexpectedly. This supports FR30 (Low balance warnings) and FR33 (Prevent actions if insufficient credits), ensuring a smooth user experience and encouraging credit purchases before reaching zero balance.

**Key Requirements:**
- **FR30**: Low credit balance warnings when balance < 20 credits (~2 songs)
- **FR33**: Prevent song generation and other credit-consuming actions if insufficient credits
- **FR28**: Display current credit balance (already implemented in Story 2.2)

**Technical Constraints from Architecture:**
- **Warning Threshold**: 20 credits (equivalent to 2 song generations at 10 credits each)
- **Dismissal State**: Store in localStorage with user ID scope
- **Client-Side Validation**: Check balance before actions (UX improvement)
- **Server-Side Validation**: Always validate on API routes (security requirement)
- **Color Theme**: Yellow warning (#FFC93C from Playful Nordic theme)

**From Epic 2 Tech Spec - Credit Balance Warnings:**

Warning display requirements:
- **Low Balance Warning (<20 credits)**: Yellow banner, dismissible, re-appears on new session
- **Zero Balance Error (= 0 credits)**: Error toast, disabled buttons, prominent purchase CTA
- **Tooltip on Disabled**: "Trenger kreditter for å generere" (Norwegian)
- **Purchase Button**: Prominently displayed when balance low or zero

[Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md]

### Architecture Alignment

**Component Mapping (from Architecture):**

This story implements the following architectural components:

1. **/src/components/low-credit-warning.tsx** - Warning banner component (NEW)
2. **/src/stores/credits-store.ts** - Zustand store for credit balance state (NEW, following ADR-003)
3. **/src/lib/credits/validator.ts** - Credit validation utilities (NEW)
4. **Update /src/app/layout.tsx** - Integrate warning banner
5. **Update /src/app/settings/page.tsx** - Add warning card
6. **Update song generation components** - Add credit validation

**Existing Components (from Previous Stories):**
- /src/app/api/credits/balance/route.ts - Credit balance API (Story 2.2)
- /src/components/credit-purchase-modal.tsx - Purchase modal (Story 2.3)
- /src/lib/constants.ts - CREDIT_COSTS defined (Story 2.3)
- /src/app/settings/page.tsx - Settings page (Story 2.2)
- shadcn/ui components: Toast, Alert, Button, Tooltip (Story 1.4)

**State Management (ADR-003: Zustand):**

```typescript
// /src/stores/credits-store.ts
import { create } from 'zustand'

interface CreditsStore {
  balance: number
  setBalance: (balance: number) => void
  isLowBalance: () => boolean  // balance < 20
  hasInsufficientCredits: (required: number) => boolean
}

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  isLowBalance: () => get().balance < 20,
  hasInsufficientCredits: (required) => get().balance < required
}))
```

**Credit Validation Pattern (from Architecture):**

```typescript
// /src/lib/credits/validator.ts
import { CREDIT_COSTS } from '@/lib/constants'

export interface CreditCheckResult {
  sufficient: boolean
  balance: number
  required: number
  shortfall?: number
}

export function checkSufficientCredits(
  balance: number,
  required: number
): CreditCheckResult {
  const sufficient = balance >= required
  return {
    sufficient,
    balance,
    required,
    shortfall: sufficient ? undefined : required - balance
  }
}
```

[Source: docs/architecture.md - State Management, ADR-003]

### Project Structure Notes

**Files to Create:**
- /src/components/low-credit-warning.tsx - Warning banner component
- /src/stores/credits-store.ts - Zustand store for credit balance (if doesn't exist)
- /src/lib/credits/validator.ts - Credit validation utilities

**Files to Modify:**
- /src/app/layout.tsx - Add warning banner component
- /src/app/settings/page.tsx - Add warning card for low balance
- Song generation components (Epic 3) - Add credit validation

**shadcn/ui Components Needed:**
- Toast - For error notifications (check if installed, should be from Story 1.4)
- Alert - For warning banner (check if installed)
- Tooltip - For disabled button explanation (check if installed)

**NPM Dependencies:**
- `zustand` - State management (check if installed, install if needed per ADR-003)

**TypeScript Types:**

```typescript
// /src/types/credit.ts (extend existing)
export interface LowCreditWarningProps {
  balance: number
  userId: string
  onPurchaseClick: () => void
}

export interface CreditCheckResult {
  sufficient: boolean
  balance: number
  required: number
  shortfall?: number
}
```

[Source: docs/architecture.md - State Management, docs/sprint-artifacts/tech-spec-epic-2.md]

### Learnings from Previous Story

**From Story 2-4-display-credit-transaction-history (Status: review)**

- **Settings Page Structure**: Settings page now has profile section, credit balance display, purchase modal, and transaction history - well-organized for adding warning card
- **Credit Balance API**: `/src/app/api/credits/balance/route.ts` returns current balance - can be used to initialize Zustand store
- **Norwegian UI Implemented**: All user-facing text in Norwegian (buttons, labels, messages, date formatting) - follow same pattern for warnings
- **shadcn/ui Components Available**: Table, Badge, Select installed - verify Toast, Alert, Tooltip available
- **Date Formatting Utility**: `formatTransactionDate()` in `/src/lib/utils.ts` - can reference for relative time patterns
- **Empty State Patterns**: Transaction history shows friendly Norwegian empty state message - follow same approach for warning messages

**New Services/Patterns Created:**
- **Transaction History Component**: `/src/components/transaction-history.tsx` with Norwegian headers and messages
- **Norwegian Date Formatting**: "Akkurat nå", "I går", "15. jan. 2025" (nb-NO locale)
- **URL State Management**: Pagination/filtering with search params - not needed for warnings but good reference
- **Loading States**: Transaction history handles loading/empty/error states - follow same patterns

**Technical Patterns to Follow:**
- **Norwegian UI Text**: All user-facing content in Norwegian (warnings, tooltips, error messages)
- **Color Theme**: Use Playful Nordic yellow (#FFC93C) for warning banner background
- **State Management**: Use Zustand for global credit balance (ADR-003)
- **localStorage Pattern**: Store dismissal state with user ID scope (e.g., `low-credit-warning-dismissed-{userId}`)
- **Toast Notifications**: Use shadcn/ui Toast for error messages (consistent with architecture)

**Files to Leverage:**
- /src/app/settings/page.tsx - Add warning card section
- /src/components/credit-purchase-modal.tsx - Open modal when "Kjøp kreditter" clicked
- /src/lib/constants.ts - Use CREDIT_COSTS for validation
- /src/app/api/credits/balance/route.ts - Fetch balance to initialize store

**Potential Issues to Address:**
- **Zustand Installation**: Verify zustand is installed, install if needed: `npm install zustand`
- **shadcn/ui Components**: Verify Toast, Alert, Tooltip installed, add if needed
- **Real-Time Updates**: Balance updates after transaction - ensure warning banner reacts immediately
- **Session Management**: Clear dismissal state on logout to prevent cross-user issues
- **Edge Cases**: Exactly 20 credits should NOT show warning, exactly 0 should show error state
- **Multiple Warnings**: Avoid showing both banner and toast simultaneously - prioritize based on context
- **Tooltip Accessibility**: Ensure disabled button tooltip is keyboard-accessible

**Integration Points:**
- Warning banner will check balance from Zustand store (populated from Story 2.2 API)
- Purchase modal already exists from Story 2.3 - integrate seamlessly
- Transaction history will show credit deductions, triggering warning updates
- Song generation (Epic 3) will check credit validation before allowing generation

[Source: docs/sprint-artifacts/2-4-display-credit-transaction-history.md#Dev-Agent-Record]

### Technical Context

**Warning Banner Implementation:**

```typescript
// /src/components/low-credit-warning.tsx
'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface LowCreditWarningProps {
  balance: number
  userId: string
  onPurchaseClick: () => void
}

export function LowCreditWarning({ balance, userId, onPurchaseClick }: LowCreditWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check localStorage for dismissal state
    const dismissalKey = `low-credit-warning-dismissed-${userId}`
    const dismissalData = localStorage.getItem(dismissalKey)

    if (dismissalData) {
      const { timestamp } = JSON.parse(dismissalData)
      const hoursSinceDismissal = (Date.now() - timestamp) / (1000 * 60 * 60)

      // Reset dismissal after 24 hours or if balance above 20
      if (hoursSinceDismissal < 24 && balance < 20) {
        setIsDismissed(true)
      } else {
        localStorage.removeItem(dismissalKey)
      }
    }
  }, [userId, balance])

  const handleDismiss = () => {
    const dismissalKey = `low-credit-warning-dismissed-${userId}`
    localStorage.setItem(dismissalKey, JSON.stringify({ timestamp: Date.now() }))
    setIsDismissed(true)
  }

  // Don't show if balance >= 20 or user dismissed
  if (balance >= 20 || isDismissed) return null

  return (
    <Alert className="bg-[#FFC93C] border-[#FFC93C] text-gray-900 mb-4">
      <AlertDescription className="flex items-center justify-between">
        <span>
          💡 Lite kreditter igjen! Du har {balance} kreditter. Kjøp mer?
        </span>
        <div className="flex gap-2">
          <Button onClick={onPurchaseClick} size="sm" variant="secondary">
            Kjøp kreditter
          </Button>
          <Button onClick={handleDismiss} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
```

**Zero Balance Error Toast:**

```typescript
// In song generation component (Epic 3)
import { useToast } from '@/hooks/use-toast'
import { useCreditsStore } from '@/stores/credits-store'
import { checkSufficientCredits } from '@/lib/credits/validator'
import { CREDIT_COSTS } from '@/lib/constants'

const { toast } = useToast()
const balance = useCreditsStore((state) => state.balance)

const handleGenerateSong = () => {
  const check = checkSufficientCredits(balance, CREDIT_COSTS.SONG_GENERATION)

  if (!check.sufficient) {
    toast({
      variant: 'destructive',
      title: 'Ikke nok kreditter',
      description: 'Kjøp en pakke for å fortsette.'
    })
    return
  }

  // Proceed with generation
}
```

**Disabled Button with Tooltip:**

```typescript
// In song generation button component
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCreditsStore } from '@/stores/credits-store'
import { CREDIT_COSTS } from '@/lib/constants'

const balance = useCreditsStore((state) => state.balance)
const hasInsufficientCredits = balance < CREDIT_COSTS.SONG_GENERATION

return (
  <Tooltip>
    <TooltipTrigger asChild>
      <span>
        <Button
          onClick={handleGenerateSong}
          disabled={hasInsufficientCredits}
          className="w-full"
        >
          Generer sang med AI
        </Button>
      </span>
    </TooltipTrigger>
    {hasInsufficientCredits && (
      <TooltipContent>
        <p>Trenger kreditter for å generere</p>
      </TooltipContent>
    )}
  </Tooltip>
)
```

**localStorage Cleanup on Logout:**

```typescript
// In logout handler
const handleLogout = async () => {
  // Clear credit warning dismissal state
  const dismissalKey = `low-credit-warning-dismissed-${userId}`
  localStorage.removeItem(dismissalKey)

  // Clear other user-specific localStorage
  // ... existing logout logic
}
```

[Source: docs/architecture.md - State Management, docs/sprint-artifacts/tech-spec-epic-2.md]

### References

- [Tech Spec Epic 2 - Credit Balance Warnings](tech-spec-epic-2.md#story-25-implement-credit-balance-warnings)
- [Architecture - State Management with Zustand](../architecture.md#state-management)
- [Architecture - ADR-003: Zustand for Client State](../architecture.md#adr-003-use-zustand-for-client-side-state-management)
- [Epic 2 Story 2.5 Acceptance Criteria](../epics/epic-2-user-authentication-credit-system.md#story-25-implement-credit-balance-warnings)
- [PRD - Credit System Requirements](../prd.md#credit-system--payments)
- [Story 2.4 - Transaction History (Norwegian UI)](./2-4-display-credit-transaction-history.md)
- [Story 2.3 - Credit Purchase Modal](./2-3-implement-credit-purchase-flow-with-stripe-checkout.md)

## Change Log

**2025-11-23 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 2: User Authentication & Credit System
- Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md, docs/architecture.md
- Prerequisites: Story 2.4 (Transaction history complete, Settings page structure ready)
- Includes learnings from Story 2.4: Norwegian UI patterns, Settings page structure, shadcn/ui components available
- Implements FR30 (Low balance warnings) and FR33 (Prevent actions if insufficient)
- Next step: Run story-context workflow to generate technical context XML and mark ready for development

## Dev Agent Record

### Context Reference

- [Story Context XML](stories/2-5-implement-credit-balance-warnings.context.xml)

### Agent Model Used

<!-- Model name and version will be added here by dev-story workflow -->

### Debug Log References

### Completion Notes List

### File List
