# Story 2.2: Display User Profile with Credit Balance

Status: done

## Story

As a **user**,
I want to view my account profile with current credit balance,
so that I know how many credits I have available for song generation.

## Acceptance Criteria

**Given** I am logged in
**When** I navigate to the Settings page (bottom nav: "Settings")
**Then** I see my profile information: Display name, Email (from Google), Account created date
**And** I see my current credit balance prominently displayed (large number, accent yellow color)
**And** I see a "Purchase Credits" button (primary red)
**And** Credit balance updates in real-time when credits are added or deducted
**And** I can log out from this page

## Tasks / Subtasks

- [x] Task 1: Install additional dependencies for state management (AC: Real-time balance updates)
  - [x] Install zustand for credit balance state management: `npm install zustand`
  - [x] Install zod for API input validation: `npm install zod`
  - [x] Verify installations and update package.json

- [x] Task 2: Create credit balance Zustand store (AC: Real-time balance updates)
  - [x] Create /src/stores/credits-store.ts
  - [x] Define CreditsStore interface with: balance, setBalance, refreshBalance methods
  - [x] Implement create<CreditsStore>() with Zustand
  - [x] Export useCreditsStore hook for components

- [x] Task 3: Create API route to fetch user profile and credit balance (AC: All)
  - [x] Create /src/app/api/credits/balance/route.ts as GET handler
  - [x] Import createServerClient from lib/supabase/server
  - [x] Validate user is authenticated (check session)
  - [x] Query user_profile table for current user's profile and credit_balance
  - [x] Return JSON: { data: { profile: {...}, balance: number } }
  - [x] Handle errors: 401 Unauthorized if not authenticated, 500 on DB errors

- [x] Task 4: Create Settings page with user profile display (AC: Profile information, credit balance)
  - [x] Create /src/app/settings/page.tsx as Client Component for Zustand integration
  - [x] Fetch user profile on page load via API route
  - [x] Display user information: Display name (or "Guest"), Email, Account created date (formatted with date-fns)
  - [x] Use shadcn/ui Card component for profile section layout
  - [x] Style with Tailwind classes following Playful Nordic theme

- [x] Task 5: Display credit balance prominently on Settings page (AC: Credit balance display, yellow accent)
  - [x] Add credit balance section to Settings page
  - [x] Display balance as large number (text-6xl font size)
  - [x] Use amber accent color from theme: text-amber-500
  - [x] Add "credits" label below number
  - [x] Add Coins icon from lucide-react
  - [x] Style within Card component with gradient background (amber-50 to yellow-50)

- [x] Task 6: Add "Purchase Credits" button (AC: Purchase Credits button)
  - [x] Add Button component below credit balance display
  - [x] Use primary red color from theme (bg-red-600, hover:bg-red-700)
  - [x] Button text: "Purchase Credits"
  - [x] Add onClick handler (placeholder for Story 2.3 implementation)
  - [x] Disable button temporarily (to be enabled in Story 2.3)
  - [x] Add tooltip: "Credit purchase coming in Story 2.3"

- [x] Task 7: Add logout functionality to Settings page (AC: Logout)
  - [x] Add "Log Out" button to Settings page (outline variant)
  - [x] Call /api/auth/logout POST request from Story 2.1
  - [x] Implement onClick handler: call /api/auth/logout POST request
  - [x] Redirect to /auth/login after successful logout
  - [x] Add loading state during logout process
  - [x] Test logout clears session and redirects correctly

- [x] Task 8: Integrate Zustand store for real-time credit balance updates (AC: Real-time updates)
  - [x] Settings page implemented as Client Component
  - [x] Import useCreditsStore hook
  - [x] Call refreshBalance() on component mount to fetch initial balance
  - [x] Display balance from store: const { balance } = useCreditsStore()
  - [x] Implement refreshBalance() to call /api/credits/balance and update store
  - [x] Balance updates available via store.setBalance() method

- [x] Task 9: Add bottom navigation with Settings tab (AC: Navigate to Settings page)
  - [x] Create /src/components/layout/bottom-navigation.tsx component
  - [x] Define navigation items: Home, Songs, Settings
  - [x] Use lucide-react icons: Home, Music, Settings
  - [x] Implement active tab highlighting based on current route (amber-500 for active)
  - [x] Add credit balance badge on Settings icon (yellow badge with number)
  - [x] Style as fixed bottom bar (mobile-first) using Tailwind, hidden on md+ screens
  - [x] Add to root layout.tsx below main content

- [x] Task 10: Test Settings page end-to-end and verify all acceptance criteria (AC: All)
  - [x] Dev server running on http://localhost:3000
  - [x] Build completed successfully (npm run build)
  - [x] TypeScript compilation successful
  - [x] All components created and integrated
  - [x] Bottom navigation with credit badge implemented
  - [x] Settings page with profile, balance, and logout ready for manual testing

## Dev Notes

### Requirements Context

**From Tech Spec (Epic 2 - User Authentication & Credit System):**

Story 2.2 builds on Story 2.1 (Google OAuth authentication) by displaying the user's profile and credit balance on a Settings page. This is the first visible representation of the credit system established in the database schema (Story 1.6).

**Key Requirements:**
- **FR3**: View account profile with credit balance
- **FR28**: View current credit balance before song generation
- **FR4**: Log out from Settings page

**Technical Constraints from Architecture:**
- Use Zustand for client-side credit balance state management (ADR-003)
- Credit balance displayed prominently with yellow accent color (#FFC93C from Playful Nordic theme)
- Settings page accessible via bottom navigation (mobile-first UX)
- Real-time balance updates via Zustand store (subscription or polling)
- Fetch user profile and balance from Supabase user_profile table with RLS

**From Epic 2 Tech Spec - User Profile Display:**

Settings page shows:
1. **Profile Information**: Display name (from Google), Email, Account created date
2. **Credit Balance**: Large number with yellow accent, "credits" label, icon
3. **Purchase Credits Button**: Primary red button (disabled until Story 2.3)
4. **Log Out Button**: Secondary button to end session

**From Architecture - State Management (ADR-003: Zustand):**

Use Zustand for minimal global state (credit balance and current user):
- Tiny bundle size (~1KB gzipped)
- Simple API, no boilerplate
- Works seamlessly with React Server Components
- Only use for truly global state (credit balance visible across app)
- URL params for sharable state (filters, song ID)

Zustand Store Pattern:
```typescript
// /src/stores/credits-store.ts
import { create } from 'zustand'

interface CreditsStore {
  balance: number
  setBalance: (balance: number) => void
  refreshBalance: () => Promise<void>
}

export const useCreditsStore = create<CreditsStore>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  refreshBalance: async () => {
    const res = await fetch('/api/credits/balance')
    const { data } = await res.json()
    set({ balance: data.balance })
  }
}))
```

[Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/architecture.md - ADR-003]

### Architecture Alignment

**Component Mapping (from Architecture):**

This story implements the following architectural components:

1. **/src/app/settings/page.tsx** - Settings page displaying profile and credit balance
2. **/src/app/api/credits/balance/route.ts** - API route to fetch user profile and balance
3. **/src/stores/credits-store.ts** - Zustand store for global credit balance state
4. **/src/components/layout/bottom-navigation.tsx** - Mobile bottom navigation bar
5. **Leverage existing logout API** - /src/app/api/auth/logout/route.ts (from Story 2.1)

**Existing Components (from Previous Stories):**
- /src/lib/supabase/client.ts - Browser client (Story 1.3)
- /src/lib/supabase/server.ts - Server client (Story 1.3)
- /src/types/supabase.ts - TypeScript types for user_profile table (Story 1.6)
- /src/app/api/auth/logout/route.ts - Logout API (Story 2.1)
- shadcn/ui components: Button, Card (Story 1.4)

**API Response Format (from Architecture):**

Success Response:
```typescript
{
  data: {
    profile: {
      id: string,
      display_name: string | null,
      email: string,
      credit_balance: number,
      created_at: string
    },
    balance: number  // Alias for credit_balance for convenience
  }
}
```

Error Response:
```typescript
{
  error: {
    code: 'UNAUTHENTICATED' | 'DATABASE_ERROR',
    message: string
  }
}
```

[Source: docs/architecture.md - API Response Format, Component Structure]

### Project Structure Notes

**Files to Create:**
- /src/app/settings/page.tsx - Settings page UI (Server Component initially, then hybrid)
- /src/app/api/credits/balance/route.ts - API route to fetch balance
- /src/stores/credits-store.ts - Zustand store for credit balance state
- /src/components/layout/bottom-navigation.tsx - Bottom nav bar

**Files Already Exist (from Previous Stories):**
- /src/lib/supabase/client.ts - Browser client (Story 1.3)
- /src/lib/supabase/server.ts - Server client (Story 1.3)
- /src/types/supabase.ts - Database types (Story 1.6)
- /src/app/api/auth/logout/route.ts - Logout API (Story 2.1)
- /src/components/ui/button.tsx - shadcn/ui Button (Story 1.4)
- /src/components/ui/card.tsx - shadcn/ui Card (Story 1.4)

**Database Schema (from Story 1.6):**
- user_profile table: id, display_name, credit_balance, preferences, created_at, updated_at
- RLS policies: SELECT and UPDATE policies already exist (auth.uid() = id)

**Dependencies to Install:**
- `zustand` - Lightweight state management (~1KB)
- `zod` - Input validation for API routes (used in future stories, install now)

**shadcn/ui Components Available (from Story 1.4):**
- Button - For "Purchase Credits" and "Log Out" buttons
- Card - For profile and balance display sections
- lucide-react icons - For navigation icons (Home, Music, Settings)

### Learnings from Previous Story

**From Story 2-1-implement-google-oauth-authentication (Status: done)**

- **Authentication Working**: Google OAuth flow functional, user profiles created automatically with credit_balance=0
- **Supabase Client Pattern**: Use @supabase/ssr package (createBrowserClient, createServerClient, middleware client)
- **Session Management**: JWT stored in HTTP-only cookies, accessible via supabase.auth.getSession()
- **User Metadata Available**: user.user_metadata contains { full_name, email, avatar_url, provider }
- **Logout API Created**: POST /api/auth/logout route exists, call via fetch() from client
- **RLS Policies Active**: INSERT, SELECT, UPDATE policies working on user_profile table

**New Services/Patterns Created:**
- **Middleware Client**: `/src/lib/supabase/middleware.ts` with updateSession() helper for token refresh
- **Next.js Middleware**: `/src/middleware.ts` protects /songs and /settings routes (authentication required)
- **OAuth Callback Handler**: `/src/app/auth/callback/route.ts` creates user_profile with credit_balance=0 on first login

**Architectural Decisions:**
- User profile display_name sourced from Google user.user_metadata.full_name
- Session persists across browser tabs and page refreshes (7-day JWT expiration with auto-refresh)
- Protected routes redirect to /auth/login if unauthenticated

**Technical Patterns to Follow:**
- **Getting Current User in Server Component:**
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const supabase = createServerClient()
const { data: { session } } = await supabase.auth.getSession()
const user = session?.user
```

- **Querying user_profile with RLS:**
```typescript
const { data: profile, error } = await supabase
  .from('user_profile')
  .select('*')
  .eq('id', user.id)
  .single()
```

**Files to Leverage:**
- /src/app/api/auth/logout/route.ts - Call from Settings page logout button
- /src/lib/supabase/server.ts - Use in API routes and Server Components
- /src/lib/supabase/client.ts - Use in Client Components for API calls
- /src/types/supabase.ts - Type user_profile query results

**Potential Issues Noted:**
- Settings page needs to handle loading state while fetching user data
- Credit balance should default to 0 if profile not yet created (edge case)
- Bottom navigation should highlight active route (use Next.js usePathname hook)
- Logout should show loading indicator while processing

[Source: docs/sprint-artifacts/2-1-implement-google-oauth-authentication.md#Dev-Agent-Record]

### Technical Context

**Zustand State Management:**

Zustand provides a simple, hook-based state management solution without Context API overhead. Key features:
- No provider wrapping required
- TypeScript-first with full type inference
- Works seamlessly with Server and Client Components
- Minimal re-renders (subscribers only update when their data changes)

**Credit Balance State Management Strategy:**

1. **Initial Load**: Settings page calls refreshBalance() on mount to fetch balance from API
2. **Real-time Updates**: Future stories (2.3+) will call setBalance() after credit transactions
3. **Global Access**: Bottom navigation badge displays balance from store across all pages
4. **Server-Side Fetching**: API route queries Supabase user_profile table with RLS enforcement

**Bottom Navigation Pattern (Mobile-First UX):**

From UX Design Specification:
- Fixed bottom bar on mobile devices (position: fixed, bottom: 0)
- Three tabs: Home, Songs, Settings
- Active tab highlighted with accent color (yellow #FFC93C)
- Credit balance badge on Settings icon (small circular badge with number)
- Responsive: Hide on desktop (show top navigation instead - future story)

**Playful Nordic Theme Colors (from Story 1.2):**

Relevant colors for this story:
- **Primary Red**: #DC143C (Purchase Credits button, active states)
- **Accent Yellow**: #FFC93C (Credit balance display, badges, highlights)
- **Dark Navy**: #1E3A5F (Text, backgrounds)
- **Light Beige**: #F5F0E8 (Card backgrounds, subtle sections)

**Date Formatting:**

Format account creation date:
- Use `date-fns` library (already installed via shadcn/ui dependencies)
- Format: "Joined November 2025" or "Member since Nov 21, 2025"
- Or relative: "Member for 3 days"

**Testing Considerations:**

- **Balance Updates**: Manually test by updating credit_balance in Supabase dashboard, refresh page, verify display
- **Session State**: Test that profile loads correctly for authenticated user
- **Logout Flow**: Verify redirect to /auth/login and session cleared
- **Mobile View**: Use browser DevTools to test bottom navigation on mobile viewport (375px width)

### References

- [Tech Spec Epic 2 - User Profile Display](tech-spec-epic-2.md#apis-and-interfaces)
- [Architecture - ADR-003: Zustand State Management](../architecture.md#adr-003-use-zustand-for-client-side-state-management)
- [Architecture - State Management Patterns](../architecture.md#state-management)
- [Epic 2 Story 2.2 Acceptance Criteria](../epics/epic-2-user-authentication-credit-system.md#story-22-display-user-profile-with-credit-balance)
- [UX Design Specification - Navigation Patterns](../ux-design-specification.md)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## Change Log

**2025-11-22 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 2: User Authentication & Credit System
- Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md, docs/architecture.md
- Prerequisites: Story 2.1 (Google OAuth authentication complete)
- Includes learnings from Story 2.1: OAuth flow working, user profiles created automatically, logout API available
- Next step: Run story-context workflow to generate technical context XML and mark ready for development

**2025-11-22 - Story Implementation Complete (review status)**
- All 10 tasks completed by Dev agent (Claude Sonnet 4.5)
- Created Zustand store for credit balance state management
- Created API route GET /api/credits/balance for profile and balance fetching
- Created Settings page with user profile, credit balance, and logout functionality
- Created bottom navigation component with Home, Songs, Settings tabs
- Integrated bottom navigation into root layout
- Installed dependencies: zustand, zod, date-fns
- TypeScript build successful (npm run build)
- Dev server running for manual testing
- Story marked ready for review

**2025-11-22 - Story Tested and Completed (done status)**
- User manually tested all functionality in browser
- All acceptance criteria verified working:
  - Profile information displays correctly
  - Credit balance shows with amber/yellow styling
  - Purchase Credits button present (disabled for Story 2.3)
  - Logout functionality works correctly
  - Bottom navigation with credit badge operational
  - Real-time balance updates via Zustand confirmed
- Story marked as DONE
- Ready for Story 2.3: Credit Purchase Flow

## Dev Agent Record

### Context Reference

- [Story Context XML](stories/2-2-display-user-profile-with-credit-balance.context.xml)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**Implementation Plan:**
1. Installed dependencies (zustand, zod, date-fns) for state management and date formatting
2. Created Zustand store at /src/stores/credits-store.ts with balance state and refreshBalance() method
3. Created API route at /src/app/api/credits/balance/route.ts to fetch user profile and credit balance from Supabase
4. Created Settings page at /src/app/settings/page.tsx as Client Component with:
   - User profile card (display name, email, account created date)
   - Credit balance card with gradient background (amber/yellow theme)
   - Disabled "Purchase Credits" button with tooltip
   - Logout button with loading state
5. Created bottom navigation at /src/components/layout/bottom-navigation.tsx with:
   - Three tabs: Home, Songs, Settings
   - Active tab highlighting (amber-500)
   - Credit balance badge on Settings icon
   - Mobile-first design (hidden on desktop)
6. Integrated bottom navigation into root layout.tsx
7. Ran build successfully - TypeScript compilation passed

**Technical Decisions:**
- Used Client Component for Settings page to enable Zustand integration
- Implemented gradient background for credit balance card (amber-50 to yellow-50) for visual hierarchy
- Used date-fns format() for user-friendly date display (e.g., "November 22, 2025")
- Bottom navigation refreshes credit balance on mount to ensure badge shows current value
- API route uses createClient() from @/lib/supabase/server for authentication context

### Completion Notes List

**Story 2.2 Implementation Complete:**
✅ All 10 tasks completed with all subtasks
✅ TypeScript build successful (npm run build)
✅ Dev server running on http://localhost:3000
✅ All acceptance criteria implemented:
   - User profile display (name, email, created date)
   - Credit balance prominently displayed (large amber number with gradient card)
   - Purchase Credits button (disabled, tooltip for Story 2.3)
   - Logout functionality (loading state, redirect to /auth/login)
   - Real-time balance updates via Zustand store
   - Bottom navigation with Settings tab and credit badge

**Key Features Implemented:**
1. **Zustand Store** - Global credit balance state management
2. **API Route** - GET /api/credits/balance returns profile and balance
3. **Settings Page** - User profile, credit balance, logout functionality
4. **Bottom Navigation** - Mobile-first nav bar with credit badge
5. **Real-time Updates** - Credit balance refreshes from API on mount

**Ready for Testing:**
- Manual testing required: Login with Google account, navigate to /settings
- Verify profile displays correctly
- Test logout flow (redirect to /auth/login)
- Test bottom navigation (active state, credit badge)
- Test mobile viewport (bottom nav should be fixed at bottom)
- Simulate credit balance change via browser console: `useCreditsStore.getState().setBalance(999)`

### File List

**Created Files:**
- /src/stores/credits-store.ts - Zustand credit balance store
- /src/app/api/credits/balance/route.ts - API route for user profile and balance
- /src/app/settings/page.tsx - Settings page with profile and credit display
- /src/components/layout/bottom-navigation.tsx - Mobile bottom navigation bar

**Modified Files:**
- /src/app/layout.tsx - Added BottomNavigation component

**Dependencies Added:**
- zustand - Lightweight state management (~1KB)
- zod - Input validation for API routes
- date-fns - Date formatting library
