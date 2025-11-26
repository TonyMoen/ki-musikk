# Story 9.1: Responsive Header with Navigation and Auth State

Status: review

## Story

As a **user**,
I want a consistent header across all pages showing navigation and my account status,
so that I can easily navigate the app and always know my credit balance.

## Acceptance Criteria

1. **Desktop Header (Logged In)**
   - **Given** I am logged in
   - **When** I view any page
   - **Then** I see a header with:
     - Logo "Musikkfabrikken" on the left (clickable → home/create page)
     - Navigation links: "Mine Sanger", "Priser"
     - User dropdown on the right showing: Avatar (or initials), credit balance (e.g., "25 kr")
   - **And** User dropdown menu contains: "Innstillinger", "Kjøp kreditter", "Logg ut"
   - **And** Header is sticky (fixed to top on scroll)

2. **Desktop Header (Logged Out)**
   - **Given** I am not logged in
   - **When** I view any page
   - **Then** I see a header with:
     - Logo "Musikkfabrikken" on the left (clickable → home)
     - Navigation links: "Priser"
     - Auth buttons: "Logg inn" (secondary), "Kom i gang" (primary CTA)

3. **Mobile Header (Logged In)**
   - **Given** I am on a mobile device and logged in
   - **When** I view any page
   - **Then** I see a compact header with:
     - Logo (icon or short text) on the left
     - Credit balance indicator (e.g., "25 kr")
     - Hamburger menu icon on the right
   - **And** Tapping hamburger opens slide-out menu with:
     - "Lag Sang" (home/create)
     - "Mine Sanger"
     - "Priser"
     - "Innstillinger"
     - "Kjøp kreditter"
     - "Logg ut"
   - **And** Menu can be closed by tapping outside or X button

4. **Mobile Header (Logged Out)**
   - **Given** I am on a mobile device and not logged in
   - **When** I view any page
   - **Then** I see a compact header with:
     - Logo on the left
     - Hamburger menu with: "Priser", "Logg inn", "Kom i gang"

5. **Loading State**
   - **Given** auth state is being determined
   - **When** page loads
   - **Then** User area shows skeleton loader (no flickering between logged in/out states)

6. **Credit Balance Display**
   - **Given** I am logged in
   - **When** I view any page
   - **Then** My current credit balance is displayed prominently in header
   - **And** Balance updates in real-time when credits are used/purchased

7. **Build Verification**
   - Production build succeeds with no TypeScript or ESLint errors

## Tasks / Subtasks

- [x] Task 1: Create Header Component Structure (AC: #1, #2, #5)
  - [x] Create `/src/components/layout/header.tsx` - main header component
  - [x] Implement sticky header with `fixed top-0` positioning
  - [x] Create logo component with link to home page
  - [x] Add skeleton loader for auth loading state

- [x] Task 2: Create Desktop Navigation (AC: #1, #2)
  - [x] Add navigation links for "Mine Sanger", "Priser" (visible when logged in)
  - [x] Add "Priser" only (visible when logged out)
  - [x] Style active link state
  - [x] Use Next.js Link component for client-side navigation

- [x] Task 3: Create User Menu Dropdown (AC: #1, #6)
  - [x] Create `/src/components/layout/user-menu.tsx` - dropdown component
  - [x] Display user avatar (initials if no picture)
  - [x] Display credit balance prominently
  - [x] Add dropdown items: "Innstillinger", "Kjøp kreditter", "Logg ut"
  - [x] Use shadcn/ui DropdownMenu component

- [x] Task 4: Create Mobile Navigation Sheet (AC: #3, #4)
  - [x] Create `/src/components/layout/mobile-nav.tsx` - slide-out navigation
  - [x] Add hamburger menu icon trigger
  - [x] Implement full navigation menu items
  - [x] Add close button and outside-click dismiss
  - [x] Use shadcn/ui Sheet component

- [x] Task 5: Integrate Auth State (AC: #1, #2, #3, #4, #5)
  - [x] Use Supabase client to get current session
  - [x] Query user's credit balance from user_profile table
  - [x] Handle auth loading state with skeleton
  - [x] Conditionally render logged in vs logged out views
  - [x] Handle sign out functionality

- [x] Task 6: Add Header to Root Layout (AC: #1, #2, #3, #4)
  - [x] Update `/src/app/layout.tsx` to include Header component
  - [x] Ensure main content has proper top padding for sticky header
  - [x] Test on all existing pages

- [x] Task 7: Implement Responsive Breakpoints (AC: #1, #3)
  - [x] Mobile view: < 768px (hamburger menu)
  - [x] Desktop view: >= 768px (full navigation)
  - [x] Test on various screen sizes

- [x] Task 8: Build Verification and Testing (AC: #7)
  - [x] Run `npm run build` - ensure success
  - [x] Run `npm run lint` - no errors
  - [x] Manual test: Navigation works on desktop and mobile
  - [x] Manual test: Auth states display correctly
  - [x] Manual test: Credit balance updates

## Dev Notes

### Architecture Alignment

**From `/docs/architecture.md` - Project Structure:**
```
src/
├── components/
│   ├── layout/                 # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
```

**From `/docs/architecture.md` - Implementation Patterns:**
- **Language & Localization**: All UI text in Norwegian (Bokmål), code in English
- **Components**: PascalCase names, Props interfaces: `ComponentNameProps`
- **Files**: kebab-case for component files (e.g., `header.tsx`, `user-menu.tsx`)
- **Responsive**: Mobile-first CSS with Tailwind utilities

**From `/docs/architecture.md` - Authentication Pattern:**
```typescript
// Server Component or API Route
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabase = createServerComponentClient({ cookies })
const { data: { session } } = await supabase.auth.getSession()
const user = session?.user
```

### Project Structure Notes

**Files to Create:**
- `/src/components/layout/header.tsx` - Main header component
- `/src/components/layout/mobile-nav.tsx` - Mobile slide-out Sheet
- `/src/components/layout/user-menu.tsx` - User dropdown with avatar, credits

**Files to Modify:**
- `/src/app/layout.tsx` - Add Header to root layout

**Existing Components to Reuse:**
- shadcn/ui: `DropdownMenu`, `Sheet`, `Button`, `Avatar`, `Skeleton`
- Existing auth hooks and Supabase client

### Learnings from Previous Stories

**From Story 7.5 (Error Messages) - Status: review**

- **Error Handling Pattern**: Use `useErrorToast` hook for any errors in header (e.g., sign out failures)
- **Norwegian Messages**: All UI text in Norwegian - "Logg inn", "Logg ut", "Kjøp kreditter", etc.
- **Files Created**: `src/lib/error-messages.ts`, `src/hooks/use-error-toast.tsx`

**From Epic 2 (Auth & Credits)**:
- User profile with credit balance stored in `user_profile` table
- Credit balance query: `SELECT credit_balance FROM user_profile WHERE id = auth.uid()`
- Supabase auth helpers already configured in the project

### Technical Implementation Notes

**Header Component Structure:**
```typescript
// /src/components/layout/header.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'

export function Header() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // ... auth state logic

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      {/* Desktop: Logo | Nav | UserMenu */}
      {/* Mobile: Logo | Credits | Hamburger */}
    </header>
  )
}
```

**Mobile Navigation Sheet:**
```typescript
// /src/components/layout/mobile-nav.tsx
'use client'

import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'

export function MobileNav({ user, credits, onSignOut }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        {/* Navigation items */}
      </SheetContent>
    </Sheet>
  )
}
```

**User Menu Dropdown:**
```typescript
// /src/components/layout/user-menu.tsx
'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserMenu({ user, credits, onSignOut }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span className="font-medium">{credits} kr</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>{getInitials(user)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Innstillinger</DropdownMenuItem>
        <DropdownMenuItem>Kjøp kreditter</DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>Logg ut</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Norwegian UI Labels

| Element | Norwegian Text |
|---------|---------------|
| Logo | Musikkfabrikken |
| Nav: My Songs | Mine Sanger |
| Nav: Pricing | Priser |
| Nav: Create Song | Lag Sang |
| Settings | Innstillinger |
| Buy Credits | Kjøp kreditter |
| Log Out | Logg ut |
| Log In | Logg inn |
| Get Started (CTA) | Kom i gang |
| Credit display | {amount} kr |

### References

- [Epic 9 - Core Navigation & Layout](../epics/epic-9-core-navigation-layout.md)
- [Architecture Document - Project Structure](../architecture.md#project-structure)
- [Architecture Document - Authentication Pattern](../architecture.md#authentication-pattern)
- [UX Design Specification - Navigation](../ux-design-specification.md)
- [shadcn/ui DropdownMenu](https://ui.shadcn.com/docs/components/dropdown-menu)
- [shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet)
- [shadcn/ui Avatar](https://ui.shadcn.com/docs/components/avatar)

## Change Log

**2025-11-26 - Story Completed (review status)**
- All 8 tasks completed successfully
- Created header.tsx, user-menu.tsx, mobile-nav.tsx components
- Installed shadcn/ui components: dropdown-menu, sheet, avatar, skeleton
- Updated root layout.tsx with Header and proper spacing
- Build and lint pass with no errors
- Ready for code review

**2025-11-26 - Story Created (drafted status)**
- Story drafted by SM agent using create-story workflow
- Extracted from Epic 9: Core Navigation & Layout Components (Story 9.1)
- Source: docs/epics/epic-9-core-navigation-layout.md
- Dependencies: Epic 2 (User Authentication & Credit System) - completed
- All UI text specified in Norwegian (Bokmål) per config
- Learnings incorporated from Story 7.5 (error handling pattern)
- Next step: Run story-context workflow or proceed to development

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/9-1-responsive-header-with-navigation-and-auth-state.context.xml`

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Installed missing shadcn/ui components: dropdown-menu, sheet, avatar, skeleton
- Adapted navigation links since /priser page doesn't exist - linked to /settings?openPurchaseModal=true
- Used existing credits-store for balance fetching
- Followed existing patterns from bottom-navigation.tsx

### Completion Notes List

- Created responsive header with sticky positioning (fixed top-0)
- Desktop view shows full navigation with Mine Sanger, Priser links for logged-in users
- Desktop logged-out view shows "Logg inn" and "Kom i gang" buttons
- Mobile view shows compact header with credit balance and hamburger menu
- Mobile slide-out Sheet contains all navigation items with user profile info
- Auth state loading shows skeleton loader to prevent flickering
- Credit balance displays prominently (desktop: in dropdown trigger, mobile: in header)
- Balance updates via credits-store (Zustand) with real-time refresh capability
- Build and lint pass with no errors

### File List

**Created:**
- src/components/layout/header.tsx
- src/components/layout/user-menu.tsx
- src/components/layout/mobile-nav.tsx
- src/components/ui/dropdown-menu.tsx (shadcn)
- src/components/ui/sheet.tsx (shadcn)
- src/components/ui/avatar.tsx (shadcn)
- src/components/ui/skeleton.tsx (shadcn)

**Modified:**
- src/app/layout.tsx (added Header, adjusted main content padding)

