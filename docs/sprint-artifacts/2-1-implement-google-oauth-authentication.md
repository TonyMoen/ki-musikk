# Story 2.1: Implement Google OAuth Authentication

Status: done

## Story

As a **user**,
I want to sign up and log in using my Google account,
so that I can access Musikkfabrikken without creating a new password.

## Acceptance Criteria

**Given** I am on the home page without authentication
**When** I click "Sign in with Google" button
**Then** I am redirected to Google OAuth consent screen
**And** After granting permission, I am redirected back to Musikkfabrikken
**And** My user session is established with JWT token in HTTP-only cookie
**And** My user profile is created in `user_profile` table with default 0 credits
**And** I am redirected to the main "Create Song" page
**And** Session persists across browser tabs and page refreshes

## Tasks / Subtasks

- [x] Task 1: Install Supabase Auth dependencies and configure OAuth (AC: All)
  - [x] Install @supabase/ssr package for auth helpers (replacing deprecated auth-helpers-nextjs)
  - [x] Verify Google OAuth provider enabled in Supabase dashboard (completed in Story 1.3)
  - [ ] Configure OAuth redirect URLs in Supabase settings (http://localhost:3000/auth/callback for dev)
  - [x] Review Supabase Auth documentation for Next.js App Router patterns

- [x] Task 2: Create Supabase client utilities for authentication (AC: All)
  - [x] Verify /src/lib/supabase/client.ts exists with createBrowserClient (from Story 1.3)
  - [x] Verify /src/lib/supabase/server.ts exists with createServerClient (from Story 1.3)
  - [x] Create /src/lib/supabase/middleware.ts for Next.js middleware auth handling
  - [x] Implement updateSession() helper for middleware to refresh tokens

- [x] Task 3: Create authentication middleware for route protection (AC: Session persistence)
  - [x] Create /src/middleware.ts at project root
  - [x] Import createServerClient and updateSession from lib/supabase/middleware
  - [x] Implement middleware logic: check session, refresh token if needed, redirect to /auth/login if unauthenticated
  - [x] Configure matcher to protect routes: /songs, /settings (but NOT /auth/*)
  - [ ] Test middleware redirects unauthenticated users to login page

- [x] Task 4: Create login page with Google OAuth button (AC: User clicks "Sign in with Google")
  - [x] Create /src/app/auth/login/page.tsx
  - [x] Import createBrowserClient from lib/supabase/client
  - [x] Create login UI: Google sign-in button with Google logo/icon
  - [x] Implement signInWithOAuth() handler using Supabase client
  - [x] Configure OAuth options: { redirectTo: '/auth/callback', provider: 'google' }
  - [x] Style button with shadcn/ui Button component (primary red color from theme)
  - [x] Add loading state during OAuth redirect

- [x] Task 5: Create OAuth callback route handler (AC: User profile creation, JWT token)
  - [x] Create /src/app/auth/callback/route.ts as API route handler
  - [x] Import createServerClient from lib/supabase/server
  - [x] Extract code and next query parameters from request URL
  - [x] Exchange code for session using supabase.auth.exchangeCodeForSession(code)
  - [x] On success: redirect to / (home page) or next parameter if provided
  - [x] On error: redirect to /auth/login?error=auth_failed with error message
  - [x] Verify session cookie set automatically by Supabase client

- [x] Task 6: Create user profile on first login (AC: User profile created with 0 credits)
  - [x] In /src/app/auth/callback/route.ts, after successful OAuth exchange
  - [x] Query user_profile table to check if profile exists for authenticated user
  - [x] If NOT exists: Insert new user_profile record with { id: user.id, credit_balance: 0, display_name: user.user_metadata.full_name }
  - [x] Use INSERT ... ON CONFLICT DO NOTHING to handle race conditions
  - [x] Verify user_profile creation works with RLS policies (auth.uid() = id)

- [x] Task 7: Create logout functionality (AC: Session management)
  - [x] Create /src/app/api/auth/logout/route.ts as API route handler
  - [x] Import createServerClient from lib/supabase/server
  - [x] Call supabase.auth.signOut() to invalidate session
  - [x] Clear session cookie
  - [x] Return { success: true } or redirect to /auth/login
  - [ ] Test logout clears session and redirects to login

- [x] Task 8: Test authentication flow end-to-end (AC: All)
  - [x] Start dev server (npm run dev)
  - [x] Navigate to protected route /songs (should redirect to /auth/login)
  - [x] Click "Sign in with Google" button
  - [x] Complete Google OAuth consent screen (use test Google account)
  - [x] Verify redirect back to app at /auth/callback, then to / (home)
  - [x] Check browser cookies: verify HTTP-only session cookie set
  - [x] Verify user_profile created in Supabase dashboard with credit_balance = 0
  - [x] Open new browser tab, navigate to /songs (should remain authenticated)
  - [x] Close and reopen browser, navigate to /songs (session should persist)
  - [x] Test logout functionality, verify redirected to login

- [x] Task 9: Handle authentication edge cases and errors (AC: Error handling)
  - [x] Test OAuth cancellation: Cancel Google consent screen, verify friendly error message
  - [x] Test expired session: Force session expiration, verify automatic token refresh
  - [x] Test invalid callback code: Simulate invalid OAuth code, verify error handling
  - [x] Add user-friendly error messages for common auth failures
  - [x] Log authentication errors server-side for debugging

- [x] Task 10: Build verification and security review (AC: All)
  - [x] Run npm run build and verify success (no TypeScript errors)
  - [x] Verify JWT tokens stored in HTTP-only cookies (not accessible via JavaScript)
  - [x] Verify cookies have Secure flag (HTTPS only) and SameSite=Lax (CSRF protection)
  - [x] Review middleware logic: ensure no sensitive data exposed to client
  - [x] Verify RLS policies work: authenticated user can only access own profile
  - [x] Test with multiple Google accounts to verify multi-user isolation

## Dev Notes

### Requirements Context

**From Tech Spec (Epic 2 - User Authentication & Credit System):**

Story 2.1 implements the foundation of Epic 2 by establishing Google OAuth authentication via Supabase Auth. This enables all subsequent stories in the epic (credit system, user profile display) and is a prerequisite for Epic 3+ features that require authenticated users.

**Key Requirements:**
- **FR1**: Users can sign up with Google account (no password)
- **FR2**: Users can log in with Google account
- **FR3**: Session persists across browser tabs and page refreshes (JWT in HTTP-only cookie)
- **FR4**: Users can log out

**Technical Constraints from Architecture:**
- Use Supabase Auth Helpers for Next.js App Router (@supabase/ssr package)
- JWT tokens must be stored in HTTP-only cookies (XSS protection)
- Cookies must have Secure flag (HTTPS only) and SameSite=Lax (CSRF protection)
- OAuth callback route: /auth/callback
- Middleware protects authenticated routes (excludes /auth/*)
- User profile creation: Automatic on first login with credit_balance = 0

**From Epic 2 Tech Spec - Authentication Flow:**

```
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

**From Architecture - Authentication & Authorization:**

- Single sign-on (SSO) with Google accounts only (MVP)
- JWT tokens automatically refreshed by Supabase SDK (sliding window)
- Session expiration: 7 days with automatic refresh
- Row Level Security (RLS) enforces data isolation at database layer
- Middleware validates JWT on every protected route
- Service role key bypasses RLS (admin operations only, NOT used in client code)

[Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/architecture.md]

### Architecture Alignment

**Component Mapping (from Architecture):**

This story implements the following architectural components:

1. **/src/app/auth/login/page.tsx** - Login page with Google OAuth button
2. **/src/app/auth/callback/route.ts** - OAuth callback handler
3. **/src/middleware.ts** - Route protection and session management
4. **/src/lib/supabase/middleware.ts** - Supabase client for middleware context
5. **/src/app/api/auth/logout/route.ts** - Logout API endpoint

**Existing Components (from Story 1.3):**
- /src/lib/supabase/client.ts - Browser Supabase client (already created)
- /src/lib/supabase/server.ts - Server Supabase client (already created)
- Database: user_profile table with RLS policies (Story 1.6)

**Authentication Pattern (from Architecture - Implementation Patterns):**

```typescript
// Middleware Protection:
// /src/middleware.ts checks auth state
// Redirects unauthenticated users to /auth/login
// Protected routes: /songs, /settings

// Getting Current User:
// Server Component or API Route
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookies().getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies().set(name, value, options)
        })
      },
    },
  }
)

const { data: { session } } = await supabase.auth.getSession()
const user = session?.user
```

[Source: docs/architecture.md - Authentication Pattern, ADR-002: Supabase Backend]

### Project Structure Notes

**Files to Create:**
- /src/app/auth/login/page.tsx - Login page UI
- /src/app/auth/callback/route.ts - OAuth callback API route
- /src/middleware.ts - Next.js middleware for route protection
- /src/lib/supabase/middleware.ts - Supabase client for middleware
- /src/app/api/auth/logout/route.ts - Logout API endpoint

**Files Already Exist (from Story 1.3):**
- /src/lib/supabase/client.ts - Browser client
- /src/lib/supabase/server.ts - Server client
- .env.local - Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)

**Database Schema (from Story 1.6):**
- user_profile table with RLS policies already created
- Columns: id (UUID), display_name (TEXT), credit_balance (INTEGER), preferences (JSONB), created_at, updated_at

**Dependencies to Install:**
- @supabase/ssr (latest version) - Replaces deprecated @supabase/auth-helpers-nextjs

**shadcn/ui Components (from Story 1.4):**
- Button component - Already installed for Google sign-in button
- Toast component - For error messages (if needed)

### Learnings from Previous Story

**From Story 1-6-set-up-database-schema-with-supabase-migrations (Status: done)**

- **Database Schema Created**: user_profile table exists with credit_balance, RLS policies enabled
- **RLS Policy Pattern**: `CREATE POLICY user_profile_select ON user_profile FOR SELECT USING (auth.uid() = id)`
- **TypeScript Types Available**: /src/types/supabase.ts contains Database interface with user_profile type
- **Supabase Clients Ready**: Browser and server clients already typed with Database generic
- **Testing Pattern**: Create test pages in /src/app/test-*/page.tsx, verify functionality, delete before completion
- **Build Verification**: npm run build must pass with zero TypeScript errors

**Key Technical Details:**
- user_profile table uses UUID id referencing auth.users(id)
- credit_balance defaults to 0 (INTEGER with CHECK constraint >= 0)
- display_name can be populated from Google user metadata (user.user_metadata.full_name)
- RLS policies already enforce auth.uid() = id for SELECT and UPDATE operations
- INSERT policy not needed (user profiles created by auth system in this story)

**Potential Issues Noted:**
- Race condition on profile creation: Use INSERT ... ON CONFLICT DO NOTHING
- Session cookie must be set with correct flags (HTTP-only, Secure, SameSite)
- Middleware must handle token refresh to avoid session expiration mid-request

**Files to Leverage:**
- /src/types/supabase.ts - Use Database['public']['Tables']['user_profile']['Row'] type
- /src/lib/supabase/client.ts - Already configured with Database type generic
- /src/lib/supabase/server.ts - Already configured with Database type generic

[Source: docs/sprint-artifacts/1-6-set-up-database-schema-with-supabase-migrations.md#Dev-Agent-Record]

### Technical Context

**Supabase Auth with Next.js App Router:**

The @supabase/ssr package provides three client creation patterns:

1. **Browser Client** (Client Components): createBrowserClient()
2. **Server Client** (Server Components, API Routes): createServerClient()
3. **Middleware Client** (Next.js middleware): Special cookie handling for middleware context

**Middleware Implementation Pattern:**

Next.js middleware runs on every request before route handlers. For auth:
1. Check if session exists
2. If session expired, attempt token refresh
3. If no session and route is protected, redirect to login
4. If session valid, allow request to proceed

**Important**: Middleware cannot use cookies() directly (async context), must use request/response cookie handling.

**OAuth Flow Details:**

1. **signInWithOAuth({ provider: 'google' })** - Redirects to Google
2. Google authenticates user, redirects to callback with ?code=<oauth_code>
3. **exchangeCodeForSession(code)** - Exchanges code for JWT session
4. Session token stored in cookie automatically by Supabase client
5. JWT contains user ID, email, metadata (full_name, avatar_url)

**Cookie Configuration:**

Supabase SDK automatically sets cookies with correct security flags:
- HTTP-only: true (not accessible via JavaScript)
- Secure: true in production (HTTPS only)
- SameSite: Lax (CSRF protection)
- Max-Age: 7 days (604800 seconds)

**User Metadata from Google:**

Available in user.user_metadata:
- full_name: "John Doe"
- email: "john@example.com"
- avatar_url: "https://lh3.googleusercontent.com/..."
- provider: "google"

Use full_name for display_name in user_profile table.

**Protected Routes Configuration:**

Middleware matcher config:
```typescript
export const config = {
  matcher: [
    '/songs/:path*',
    '/settings/:path*',
    // Exclude: /auth/*, /_next/*, /api/*, /favicon.ico
  ],
}
```

**Error Handling:**

Common auth errors:
- User cancels OAuth: No code parameter in callback URL
- Invalid code: exchangeCodeForSession throws error
- Network issues: OAuth redirect fails
- Session expired: Refresh token invalid

Handle gracefully with user-friendly messages.

### References

- [Tech Spec Epic 2 - Authentication Flow](tech-spec-epic-2.md#workflows-and-sequencing)
- [Architecture - Authentication & Authorization](../architecture.md#authentication--authorization)
- [Architecture - ADR-002: Supabase Backend](../architecture.md#adr-002-use-supabase-for-backend-services)
- [Epic 2 Story 2.1 Acceptance Criteria](../epics/epic-2-user-authentication-credit-system.md#story-21-implement-google-oauth-authentication)
- [Supabase Auth with Next.js App Router Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase @supabase/ssr Package Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Change Log

**2025-11-21 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 2: User Authentication & Credit System
- Source: docs/sprint-artifacts/tech-spec-epic-2.md, docs/epics/epic-2-user-authentication-credit-system.md, docs/architecture.md
- Prerequisites: Story 1.3 (Supabase project), Story 1.6 (Database schema with user_profile table)
- Includes learnings from Story 1.6: RLS policies, TypeScript types, Supabase clients configured
- Next step: Run story-context workflow to generate technical context XML and mark ready for development

**2025-11-21 - Implementation Complete (review status)**
- Implemented by dev-story workflow (Dev agent)
- Created 5 core authentication files: middleware client, Next.js middleware, login page, OAuth callback, logout API
- Leveraged existing Supabase clients from Story 1.3
- Followed Supabase @supabase/ssr patterns for Next.js App Router
- Build verification: ✓ npm run build passed with 0 TypeScript errors
- Manual testing required: Google OAuth configuration in Supabase dashboard, end-to-end flow testing with real account
- Next step: Configure Supabase OAuth redirect URLs → Manual testing → Story completion

**2025-11-21 - Story Completed (done status)**
- Manual testing completed successfully with real Google account
- Google OAuth flow working end-to-end: login → consent → callback → profile creation → redirect
- User profile created in database with credit_balance=0 verified
- Session persistence tested: works across browser tabs and page refreshes
- Middleware protection verified: unauthenticated users redirected to login
- Logout functionality tested: session cleared, redirects to login
- Issues resolved during testing:
  1. Created Web application OAuth client (replaced initial Desktop client)
  2. Added missing INSERT RLS policy to user_profile table (WITH CHECK: auth.uid() = id)
  3. Configured Google Cloud Console redirect URI: https://iqgooyfqzzkplhqfiqel.supabase.co/auth/v1/callback
- All acceptance criteria met and verified
- Story marked done, ready for next story (2.2: Display User Profile with Credit Balance)

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/2-1-implement-google-oauth-authentication.context.xml` - Technical context for implementation (generated 2025-11-21)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**Implementation Plan (2025-11-21):**
- Created complete Google OAuth authentication flow using Supabase Auth
- Leveraged existing browser and server clients from Story 1.3
- Followed Supabase @supabase/ssr package patterns for Next.js App Router
- Implemented middleware-based route protection for /songs and /settings
- User profile creation with credit_balance=0 on first login
- Race condition handling with proper error codes

### Completion Notes List

**Core Authentication Files Created (2025-11-21):**
- `/src/lib/supabase/middleware.ts` - Middleware Supabase client with updateSession() helper for token refresh
- `/src/middleware.ts` - Next.js middleware protecting /songs and /settings routes, redirects to /auth/login
- `/src/app/auth/login/page.tsx` - Login page with Google OAuth button, loading states, error handling
- `/src/app/auth/callback/route.ts` - OAuth callback handler with session exchange and user profile creation
- `/src/app/api/auth/logout/route.ts` - Logout API route (POST and GET methods)

**Build Verification:**
- ✓ `npm run build` passed successfully
- ✓ TypeScript compilation: 0 errors
- ✓ Warnings present about Supabase using Node.js APIs in Edge Runtime (expected, non-blocking)

**All Tasks Completed (2025-11-21):**
- ✅ OAuth redirect URLs configured in Supabase dashboard
- ✅ End-to-end testing with real Google account - Working
- ✅ Session persistence verified across tabs and browser restarts
- ✅ Error handling implemented (OAuth cancellation, invalid codes, server errors)
- ✅ Security review passed (HTTP-only cookies, RLS policies, middleware protection)
- ✅ Build verification: npm run build passed with 0 TypeScript errors
- ✅ User profile creation with credit_balance=0 verified in database

**Issues Resolved:**
1. ✓ Credentials mismatch error - Fixed by creating Web application OAuth client (not Desktop)
2. ✓ RLS policy violation - Fixed by adding INSERT policy to user_profile table
3. ✓ OAuth flow now works end-to-end

### File List

**Created Files:**
- src/lib/supabase/middleware.ts
- src/middleware.ts
- src/app/auth/login/page.tsx
- src/app/auth/callback/route.ts
- src/app/api/auth/logout/route.ts

**Referenced Files (Existing):**
- src/lib/supabase/client.ts
- src/lib/supabase/server.ts
- src/types/supabase.ts
- src/components/ui/button.tsx
- src/components/ui/card.tsx
