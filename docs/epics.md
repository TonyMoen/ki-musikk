# Musikkfabrikken - Epic Breakdown

**Author:** BIP
**Date:** 2025-11-19
**Project Level:** Low-Medium Complexity
**Target Scale:** 1,000 users, 200 paying customers (MVP - 6 months)

---

## Overview

This document provides the complete epic and story breakdown for **Musikkfabrikken**, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Project:** AI-powered Norwegian song creation platform optimized for authentic pronunciation

**Core Value:** Transform "American-sounding" AI music into genuinely Norwegian vocals through proven phonetic optimization techniques

**Context:** This epic breakdown incorporates full context from:
- ✅ PRD (70 functional requirements)
- ✅ UX Design (mobile-first, TikTok-inspired, card-based explorer)
- ✅ Architecture (Next.js 14+ App Router, Supabase, TypeScript, shadcn/ui)

---

## Functional Requirements Inventory

**User Account & Authentication (FR1-FR4)**
- FR1: Users can create accounts using Google OAuth authentication
- FR2: Users can log in securely and maintain sessions across devices
- FR3: Users can view their account profile with credit balance and usage history
- FR4: Users can log out from any device

**Song Creation & Lyrics Input (FR5-FR8)**
- FR5: Users can input Norwegian lyrics for song generation (text entry)
- FR6: Users can select genre/style from pre-configured prompt templates
- FR7: Users can customize song metadata (title, artist name, description)
- FR8: Users can preview their lyrics before submitting for generation

**Norwegian Pronunciation Optimization (FR9-FR13) - CORE VALUE**
- FR9: Users can toggle "Uttalelse Bokmål" pronunciation optimization on/off
- FR10: Users can preview phonetic transformations with visual diff (before/after lyrics comparison)
- FR11: Users can override phonetic suggestions on a per-line basis for edge cases
- FR12: System automatically applies Norwegian pronunciation rules when phonetic toggle is enabled
- FR13: Users can view explanations/disclaimers about pronunciation optimization limitations

**Song Generation & Processing (FR14-FR20)**
- FR14: Users can generate 30-second preview clips for free (watermarked)
- FR15: Users can generate full-length songs using credits
- FR16: Users can view real-time generation status and progress
- FR17: Users can cancel pending song generation requests
- FR18: System automatically deducts credits upon successful generation
- FR19: System automatically rolls back credits if generation fails
- FR20: Users receive notifications when song generation completes

**Track List & Session Management (FR21-FR27)**
- FR21: Users can view all their generated songs in a persistent track list
- FR22: Users can play generated songs directly in the browser
- FR23: Users can download generated songs in common audio formats (MP3, WAV)
- FR24: Users can delete songs from their track list
- FR25: Users can rename/re-title generated songs
- FR26: System persists track list across sessions (survives browser refresh and API failures)
- FR27: System automatically deletes songs after 14 days (with prior user notification)

**Credit System & Payments (FR28-FR34)**
- FR28: Users can view their current credit balance at all times
- FR29: Users can purchase credit packages via Stripe (Starter/Pro/Premium tiers)
- FR30: Users receive low-balance warnings before credits run out
- FR31: Users can view credit transaction history (purchases, deductions, refunds)
- FR32: System displays credit cost for each action before execution
- FR33: System prevents actions if insufficient credits available
- FR34: Users can request refunds for failed generations within policy timeframe

**Premium Features - Canvas Generation (FR35-FR39)**
- FR35: Users can optionally generate visual canvas/album art for their songs
- FR36: Users can provide custom prompts for canvas generation
- FR37: System automatically generates AI-powered canvas prompts based on song metadata
- FR38: Users can preview and download generated canvas images
- FR39: System deducts canvas generation credits separately from song credits

**Premium Features - Mastering Service (FR40-FR45)**
- FR40: Users can book manual mastering service for generated songs
- FR41: Users can view mastering service availability and SLA (24-hour turnaround)
- FR42: System requires binding pre-payment for mastering service bookings
- FR43: Users receive notifications when mastered tracks are ready
- FR44: Users can download mastered versions alongside original versions
- FR45: Users receive free mastering if SLA is missed (service guarantee)

**Storage & File Management (FR46-FR50)**
- FR46: System automatically downloads and stores generated songs from Suno API (immediate transfer to prevent 3-day auto-deletion)
- FR47: System provides signed URLs for secure file downloads (no public file access)
- FR48: System notifies users before 14-day auto-deletion deadline
- FR49: Premium tier users can access extended 30-day storage
- FR50: Users can export/download multiple songs in batch

**User Experience & Help (FR51-FR55)**
- FR51: Users can access genre/style prompt templates with drag-and-drop or selection
- FR52: System displays helpful tooltips and guidance for non-technical users
- FR53: Users can view examples of phonetic optimization in action
- FR54: Users can access FAQ and help documentation
- FR55: System displays clear error messages with actionable guidance when issues occur

**Social Sharing & Viral Features (FR56-FR59)**
- FR56: Users can share generated songs directly to social media platforms (TikTok, Facebook)
- FR57: Free preview clips include Musikkfabrikken watermark/branding
- FR58: Users can generate shareable links for their songs
- FR59: Shared songs display Musikkfabrikken attribution to drive organic discovery

**System Administration (FR60-FR65)**
- FR60: System logs all credit transactions for auditing and support
- FR61: System monitors Suno API health and response times
- FR62: System alerts founder when API costs exceed thresholds
- FR63: System tracks pronunciation quality feedback from users
- FR64: Founder can manually process mastering service requests
- FR65: Founder can monitor test team feedback for quality degradation

**Error Handling & Resilience (FR66-FR70)**
- FR66: System gracefully handles Suno API failures with user-friendly error messages
- FR67: System implements automatic retry logic for transient API failures
- FR68: System maintains session state during API downtime
- FR69: System provides fallback mechanisms for webhook failures (polling)
- FR70: System prevents double-charging on concurrent generation requests

**Total:** 70 functional requirements

---

## Epic Summary

**8 Epics Delivering Incremental User Value:**

1. **Foundation & Infrastructure** - Project setup, deployment pipeline, core dependencies
2. **User Authentication & Credit System** - Users can sign up and purchase credits
3. **Norwegian Song Creation** - THE CORE: Users create authentic Norwegian songs with pronunciation optimization
4. **Song Library & Management** - Users manage their created songs
5. **Social Sharing & Viral Features** - Users share songs to drive organic growth
6. **Premium Features** - Canvas generation, mastering service, extended storage
7. **User Experience & Help** - Polish, guidance, tooltips, documentation
8. **System Resilience & Operations** - Error handling, monitoring, operational excellence

**Why This Structure:**
- ✅ Each epic delivers USER VALUE (not just technical capability)
- ✅ Epic 1 (Foundation) is acceptable greenfield exception
- ✅ Epic 3 combines pronunciation optimization with song creation (integrated core value)
- ✅ Incremental delivery: Users get value after each epic completion
- ✅ NO technical layer breakdown (database/API/frontend) - that's the WRONG pattern!

---

## FR Coverage Map

**Epic 1: Foundation & Infrastructure**
- Covers: Infrastructure needs for all FRs (not directly mapped to specific FRs)

**Epic 2: User Authentication & Credit System**
- Covers: FR1, FR2, FR3, FR4 (Authentication)
- Covers: FR28, FR29, FR30, FR31, FR32, FR33, FR34 (Credits & Payments)

**Epic 3: Norwegian Song Creation (CORE)**
- Covers: FR5, FR6, FR7, FR8 (Lyrics Input)
- Covers: FR9, FR10, FR11, FR12, FR13 (Pronunciation Optimization - CORE VALUE!)
- Covers: FR14, FR15, FR16, FR17, FR18, FR19, FR20 (Song Generation)
- Covers: FR21, FR22, FR23 (Basic Playback)
- Covers: FR51 (Genre templates)

**Epic 4: Song Library & Management**
- Covers: FR24, FR25, FR26, FR27 (Track Management)
- Covers: FR46, FR47, FR48, FR50 (Storage & Downloads)

**Epic 5: Social Sharing & Viral Features**
- Covers: FR56, FR57, FR58, FR59 (Social Sharing)

**Epic 6: Premium Features**
- Covers: FR35, FR36, FR37, FR38, FR39 (Canvas Generation)
- Covers: FR40, FR41, FR42, FR43, FR44, FR45 (Mastering Service)
- Covers: FR49 (Extended Storage)

**Epic 7: User Experience & Help**
- Covers: FR52, FR53, FR54, FR55 (Help & Guidance)

**Epic 8: System Resilience & Operations**
- Covers: FR60, FR61, FR62, FR63, FR64, FR65 (System Admin)
- Covers: FR66, FR67, FR68, FR69, FR70 (Error Handling)

**Coverage Validation:** ✅ ALL 70 FRs mapped to epics

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the technical foundation for Musikkfabrikken, enabling all subsequent feature development.

**User Value:** While this epic doesn't deliver end-user features, it creates the infrastructure foundation necessary for the entire application to function.

**FRs Covered:** Infrastructure for all FRs (greenfield project setup)

---

### Story 1.1: Initialize Next.js Project with Core Dependencies

As a **developer**,
I want the project initialized with Next.js 14+, TypeScript, and Tailwind CSS,
So that I have a type-safe, performant foundation for building the mobile-first web application.

**Acceptance Criteria:**

**Given** I have Node.js 18+ installed
**When** I run the project initialization command
**Then** A new Next.js 14+ project is created with App Router, TypeScript, Tailwind CSS, ESLint, and src directory structure
**And** The project builds successfully with `npm run build`
**And** Development server starts with `npm run dev` on localhost:3000
**And** All starter template defaults are in place (Turbopack, import aliases @/*)

**Prerequisites:** None (first story)

**Technical Notes:**
- Execute: `npx create-next-app@latest musikkfabrikken --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"`
- Architecture reference: `/docs/architecture.md` section "Project Initialization"
- File structure per architecture: src/app/, src/components/, src/lib/, src/types/
- Verify package.json includes: next@14.2+, react@18+, typescript@5.3+, tailwindcss@3.4+

---

### Story 1.2: Configure Tailwind with Playful Nordic Theme

As a **developer**,
I want Tailwind CSS configured with the Playful Nordic color palette from UX design,
So that all components use consistent Norwegian-inspired colors throughout the application.

**Acceptance Criteria:**

**Given** Next.js project with Tailwind CSS installed
**When** I configure tailwind.config.ts with custom theme colors
**Then** Primary color (#E94560 coral-red) is available as `bg-primary`, `text-primary`, etc.
**And** Secondary color (#0F3460 navy) is available as `bg-secondary`
**And** Accent color (#FFC93C yellow) is available as `bg-accent`
**And** Semantic colors (success green #06D6A0, error #EF476F) are configured
**And** Custom spacing scale (4px base unit) is configured
**And** Mobile-first breakpoints match UX spec (<640px, 640-1024px, >1024px)

**Prerequisites:** Story 1.1

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "3.1 Color System"
- Update `tailwind.config.ts` with custom theme extending defaults
- Configure font family: Inter or system default
- Set up 12px border-radius as default (friendly, modern)
- Test color contrast ratios meet WCAG 2.1 AA (4.5:1 for text)

---

### Story 1.3: Set Up Supabase Project and Environment Variables

As a **developer**,
I want Supabase configured for database, authentication, and storage,
So that I have a managed backend for user data, Google OAuth, and audio file storage.

**Acceptance Criteria:**

**Given** A Supabase account exists
**When** I create a new Supabase project
**Then** PostgreSQL 17 database is provisioned
**And** Google OAuth provider is enabled in Supabase Auth settings
**And** Storage buckets `songs` and `canvases` are created
**And** Environment variables are configured in `.env.local`:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (server-side only)
**And** `.env.local` is added to `.gitignore`
**And** Supabase client initialization code works in both client and server contexts

**Prerequisites:** Story 1.1

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "ADR-002: Use Supabase"
- Install: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
- Create `/src/lib/supabase/client.ts` for browser client
- Create `/src/lib/supabase/server.ts` for server client
- Storage buckets: public access OFF, require authentication
- Note Supabase project region (EU or US closest to target users)

---

### Story 1.4: Install shadcn/ui and Core Components

As a **developer**,
I want shadcn/ui installed with base components,
So that I have accessible, customizable UI primitives matching the UX design system.

**Acceptance Criteria:**

**Given** Next.js project with Tailwind configured
**When** I initialize shadcn/ui with the CLI
**Then** shadcn/ui configuration file (`components.json`) is created
**And** Base components are installed: Button, Card, Input, Dialog, Toast, Progress, Badge, Select, Switch, Tabs
**And** All components are copied to `/src/components/ui/` (not npm dependencies)
**And** Components use Playful Nordic color palette from Tailwind config
**And** All components meet WCAG 2.1 AA accessibility standards (verified with test)

**Prerequisites:** Story 1.2

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Component Strategy"
- Execute: `npx shadcn-ui@latest init` (select Tailwind CSS, src/ directory)
- Install components: `npx shadcn-ui@latest add button card input dialog toast progress badge select switch tabs`
- Components based on Radix UI primitives for accessibility
- Customize components to match UX color theme (primary red, secondary navy)

---

### Story 1.5: Configure Deployment on Vercel

As a **developer**,
I want the application deployed to Vercel with automatic CI/CD,
So that changes pushed to main branch deploy automatically to production.

**Acceptance Criteria:**

**Given** Next.js project in Git repository
**When** I connect the repository to Vercel
**Then** Vercel project is created with automatic deployments
**And** Environment variables from `.env.local` are configured in Vercel dashboard
**And** Production URL is accessible (e.g., musikkfabrikken.vercel.app)
**And** Preview deployments are enabled for pull requests
**And** Build command succeeds: `npm run build`
**And** Serverless API routes deploy as Vercel Edge Functions

**Prerequisites:** Story 1.1, Story 1.3 (env vars)

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "Deployment Architecture"
- Domain: Plan for custom domain `musikkfabrikken.no` (configure after MVP validation)
- Vercel regions: Automatic (Edge Functions) + US/EU for serverless
- Add all Supabase env vars to Vercel project settings
- Enable preview deployments for testing before production

---

### Story 1.6: Set Up Database Schema with Supabase Migrations

As a **developer**,
I want the core database schema created with Row Level Security enabled,
So that user data is properly isolated and tables support all application features.

**Acceptance Criteria:**

**Given** Supabase project is created
**When** I run database migrations
**Then** Tables are created: `user_profile`, `song`, `credit_transaction`, `genre`, `mastering_request`
**And** All tables have appropriate indexes (user_id, created_at, status)
**And** Row Level Security (RLS) is enabled on all user-facing tables
**And** RLS policies ensure users can only access their own data
**And** Stored procedure `deduct_credits()` is created for atomic credit operations
**And** TypeScript types are generated from database schema

**Prerequisites:** Story 1.3

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "Data Architecture"
- Copy SQL schema from architecture doc (complete schema provided)
- Key tables: user_profile (credits), song (audio files), credit_transaction (audit log)
- RLS policies: users can SELECT/INSERT/UPDATE/DELETE only where auth.uid() = user_id
- Generate types: `npx supabase gen types typescript --project-id <id> > src/types/supabase.ts`
- Test RLS with different user contexts

---

## Epic 2: User Authentication & Credit System

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

## Epic 3: Norwegian Song Creation (CORE)

**Goal:** Enable users to create authentic Norwegian songs with AI-powered lyric generation, pronunciation optimization, and high-quality music generation via Suno.

**User Value:** Users can create genuinely Norwegian-sounding songs in under 5 minutes - THE CORE VALUE PROPOSITION!

**FRs Covered:** FR5-FR8 (Lyrics Input), FR9-FR13 (Pronunciation Optimization), FR14-FR20 (Song Generation), FR21-FR23 (Basic Playback), FR51 (Genre Templates)

---

### Story 3.1: Create Genre Carousel Component

As a **user**,
I want to swipe through genre options in a horizontal carousel,
So that I can quickly select the music style for my Norwegian song.

**Acceptance Criteria:**

**Given** I am on the "Create Song" page
**When** I see the genre carousel at the top
**Then** I see 8+ genre cards in a horizontal scrollable carousel
**And** Each card shows: Genre emoji/icon, Genre name (e.g., "Country Rock", "Norwegian Pop"), Gradient background
**And** I can swipe left/right to scroll through genres (touch on mobile, mouse drag on desktop)
**And** Selected genre has a 3px primary red border (#E94560)
**And** Unselected genres are slightly dimmed (80% opacity)
**And** Tapping a card selects that genre
**And** Keyboard arrows navigate carousel (accessibility)

**Prerequisites:** Story 1.4 (shadcn/ui)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Genre Carousel"
- Create `/src/components/genre-carousel.tsx` as custom component
- Genre data from `genre` table in database (name, emoji, gradient colors)
- Use CSS `scroll-snap-type: x mandatory` for smooth snapping
- Card size: 120x80px on mobile, 140x90px on desktop
- Implement horizontal scroll with snap points
- Touch-friendly: Use pan gesture handler

---

### Story 3.2: Implement AI Lyric Generation with Song Concept Input

As a **user**,
I want to describe my song concept and have AI generate Norwegian lyrics,
So that I don't need to write lyrics myself.

**Acceptance Criteria:**

**Given** I have selected a genre from the carousel
**When** I enter a song concept in the textarea (e.g., "Funny birthday song for my friend Lars who loves fishing")
**Then** Character count appears below textarea (1-500 characters)
**And** When I click "Generate Lyrics with AI" button
**Then** OpenAI GPT-4 generates Norwegian lyrics based on concept + genre
**And** Generated lyrics appear in editable textarea (4-8 verse lines typical)
**And** Lyrics match the genre style (e.g., Country Rock = twangy, upbeat)
**And** Norwegian cultural context is preserved (references Norwegian life, humor)
**And** Generation takes <10 seconds
**And** I can edit generated lyrics manually before proceeding

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `/src/app/api/lyrics/generate/route.ts` for AI lyric generation
- Use OpenAI GPT-4 API: temperature 0.7 for creativity
- Prompt engineering: "Generate Norwegian Bokmål lyrics for a {genre} song about {concept}. Make it authentic, funny, and culturally Norwegian. 4-8 lines."
- Environment variable: OPENAI_API_KEY
- Cost: ~$0.03 per request (acceptable)
- Return lyrics as plain text, display in textarea for editing

---

### Story 3.3: Build Norwegian Pronunciation Optimizer with GPT-4

As a **user**,
I want automatic Norwegian pronunciation optimization applied to my lyrics,
So that Suno generates authentic Norwegian vocals instead of "American-sounding" results.

**Acceptance Criteria:**

**Given** I have Norwegian lyrics entered or generated
**When** "Uttalelse Bokmål" toggle is ON (default)
**Then** System analyzes lyrics for pronunciation issues (silent letters, vowel sounds, stress patterns)
**And** GPT-4 suggests phonetic spellings for Norwegian-specific sounds
**And** Original lyrics are preserved, optimized version created
**And** Phonetic rules applied: Rolled R's, Norwegian vowel patterns, consonant clusters
**And** Optimization completes in <5 seconds
**And** User can preview before/after comparison
**And** User can toggle OFF to use original lyrics

**Prerequisites:** Story 3.2

**Technical Notes:**
- Create `/src/lib/phonetic/optimizer.ts` for core pronunciation logic
- Use OpenAI GPT-4 for intelligent phonetic suggestions
- Prompt: "Analyze these Norwegian lyrics for Suno AI music generation. Suggest phonetic spellings to improve Norwegian pronunciation. Return JSON: [{original, optimized, reason}]"
- Store both `original_lyrics` and `optimized_lyrics` in database
- Cache phonetic rules for common Norwegian words to reduce API calls

---

### Story 3.4: Create Phonetic Diff Viewer Component

As a **user**,
I want to see a side-by-side comparison of original and optimized lyrics,
So that I understand what pronunciation changes are being made.

**Acceptance Criteria:**

**Given** Pronunciation optimization has been applied
**When** I click "Preview Phonetic Changes" button
**Then** A modal opens showing split-screen view: Original (left) | Optimized (right)
**And** Changed words are highlighted in green background (#06D6A0)
**And** Unchanged words are displayed in gray
**And** Each line is numbered (1, 2, 3...)
**And** I can toggle optimization ON/OFF for individual lines (per-line checkbox)
**And** I can close modal and accept changes or revert to original
**And** Mobile view: Stacked layout (Original above, Optimized below)

**Prerequisites:** Story 3.3

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Phonetic Diff Viewer"
- Create `/src/components/phonetic-diff-viewer.tsx`
- Use monospace font for aligned comparison
- Implement diff algorithm: highlight changed words only
- Per-line override: Store overrides in component state, merge before generation
- Accessibility: ARIA labels, keyboard navigation

---

### Story 3.5: Implement Song Generation API with Suno Integration

As a **user**,
I want to generate a full Norwegian song from my lyrics and genre,
So that I can hear my concept brought to life with authentic vocals.

**Acceptance Criteria:**

**Given** I have lyrics ready (original or optimized) and genre selected
**When** I click "Generate Song with AI" button
**Then** System checks credit balance (requires 10 credits for full song)
**And** If sufficient credits, 10 credits are deducted atomically
**And** API calls Suno via sunoapi.org with: lyrics, genre prompt template, model version
**And** A `song` record is created in database with status='generating'
**And** User sees progress modal: "🎵 Generating your Norwegian song... ~2 minutes"
**And** Progress modal shows steps: "Writing lyrics" → "Optimizing pronunciation" → "Generating music"
**And** User can cancel generation (credits refunded)
**And** Suno webhook notifies when complete OR polling fallback after 5 seconds

**Prerequisites:** Story 2.6 (Credit deduction), Story 3.3 (Pronunciation)

**Technical Notes:**
- Architecture reference: `/docs/architecture.md` section "ADR-007: Async Song Generation"
- Create `/src/app/api/songs/generate/route.ts` for song generation endpoint
- Create `/src/lib/api/suno.ts` for Suno API wrapper
- Environment variable: SUNO_API_KEY (sunoapi.org)
- Cost: $0.06 per song (12 credits × $0.005)
- Async pattern: Return 202 Accepted with songId, client polls /api/songs/[id]
- Store Suno song ID for tracking

---

### Story 3.6: Create AI Generation Progress Modal Component

As a **user**,
I want to see real-time progress while my song is generating,
So that I know the system is working and approximately how long it will take.

**Acceptance Criteria:**

**Given** Song generation has been initiated
**When** The progress modal is displayed
**Then** I see a full-screen modal overlay with center card (white, rounded)
**And** Animated progress circle shows 0-100% completion
**And** Status text updates through stages:
  - 0-30%: "🎵 AI writing Norwegian lyrics..."
  - 30-50%: "🎤 Optimizing pronunciation..."
  - 50-100%: "🎸 Generating music with Suno..."
**And** Estimated time remaining displayed: "~2 minutes left"
**And** "Cancel Generation" button at bottom (refunds credits)
**And** On success: Transition to celebration animation (confetti)
**And** On error: Display error message with "Retry" button

**Prerequisites:** Story 3.5

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: AI Generation Progress Modal"
- Create `/src/components/generation-progress-modal.tsx`
- Poll `/api/songs/[id]` every 5 seconds for status update
- Progress percentage estimated: 0-30% (lyrics), 30-50% (phonetic), 50-100% (Suno time)
- Confetti animation on success: Use `canvas-confetti` library
- Non-dismissible during generation (except cancel button)

---

### Story 3.7: Implement Webhook Handler for Suno Completion

As a **developer**,
I want to receive Suno completion webhooks and download audio files immediately,
So that songs are available to users as soon as Suno finishes generation.

**Acceptance Criteria:**

**Given** Suno has completed song generation
**When** Suno webhook calls `/api/webhooks/suno`
**Then** Webhook verifies request signature (security)
**And** Audio file is downloaded from Suno URL immediately (before 3-day auto-deletion)
**And** Audio file is uploaded to Supabase Storage bucket `songs`
**And** Song record is updated: status='completed', audio_url={signed URL}, duration_seconds
**And** User receives notification if they're still online
**And** If webhook fails, polling fallback detects completion within 10 seconds

**Prerequisites:** Story 3.5, Story 1.3 (Supabase Storage)

**Technical Notes:**
- Create `/src/app/api/webhooks/suno/route.ts`
- Verify webhook signature to prevent spoofing
- Download audio with `axios` or `fetch`, stream to Supabase Storage
- Generate signed URL (24-hour expiration) for secure download
- Update song record atomically: status='completed', audio_url, duration
- Handle idempotency: If webhook fires multiple times, don't re-download

---

### Story 3.8: Build Song Player Card Component

As a **user**,
I want to play my generated song directly in the browser with waveform visualization,
So that I can immediately hear the result without downloading.

**Acceptance Criteria:**

**Given** My song generation is complete
**When** I see the song player card
**Then** I see: Song title, Genre badge, Date created, 60x60px artwork (gradient with emoji)
**And** Large play/pause button (48x48px) is displayed
**And** Waveform visualization shows audio amplitude (SVG)
**And** Progress bar allows scrubbing (drag to seek)
**And** When I tap play, audio plays instantly (<500ms)
**And** Waveform animates during playback
**And** Current time / Total duration displayed (e.g., "1:23 / 2:45")
**And** Volume control slider (mobile: hidden, desktop: visible)

**Prerequisites:** Story 3.7

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Song Player Card"
- Create `/src/components/song-player-card.tsx`
- Use Howler.js for audio playback: `npm install howler`
- Use wavesurfer.js for waveform: `npm install wavesurfer.js`
- Audio source: Signed URL from Supabase Storage
- Keyboard controls: Space=play/pause, arrows=scrub
- Accessibility: ARIA labels, screen reader announcements

---

### Story 3.9: Implement Free 30-Second Preview Generation

As a **user**,
I want to generate a 30-second watermarked preview for free,
So that I can test the pronunciation quality before purchasing credits.

**Acceptance Criteria:**

**Given** I am a new user with 0 credits
**When** I complete lyrics and genre selection
**Then** I see TWO buttons: "Generate Free Preview (30s)" and "Generate Full Song (10 credits)"
**And** When I click "Generate Free Preview"
**Then** No credits are deducted
**And** Suno generates 30-second clip with watermark: "Created with Musikkfabrikken"
**And** Preview follows same pronunciation optimization process
**And** I can listen to preview in song player
**And** After preview, I see upgrade prompt: "Love it? Generate full song for 10 credits"
**And** Preview is saved to my track list (marked as "Preview")

**Prerequisites:** Story 3.8

**Technical Notes:**
- Modify `/src/app/api/songs/generate/route.ts` to accept `previewMode: boolean`
- Suno API parameter: `make_instrumental=false, duration=30`
- No credit deduction for preview mode
- Watermark added by Suno or post-processing
- Limit: 1 free preview per user per day (prevent spam)

---

### Story 3.10: Add Genre Prompt Templates to Database

As a **developer**,
I want genre prompt templates seeded in the database,
So that each genre has optimized Suno prompts for authentic Norwegian music styles.

**Acceptance Criteria:**

**Given** Database schema includes `genre` table
**When** I run seed script
**Then** 8-10 genres are inserted with Norwegian-optimized prompt templates:
  - Country Rock: "Country, rock, anthem, twangy guitar, catchy fiddle, drum, bass, Norwegian vocals"
  - Norwegian Pop: "Pop, Norwegian, catchy melody, electronic, upbeat, modern production"
  - Folk Ballad: "Folk, acoustic, Norwegian traditional, heartfelt, storytelling"
  - Party Anthem: "Dance, party, energetic, sing-along, festive, Norwegian celebration"
  - Rap/Hip-Hop: "Hip-hop, rap, Norwegian flow, urban, rhythmic, modern beats"
  - Rock Ballad: "Rock, ballad, emotional, guitar solo, powerful vocals, Norwegian"
**And** Each genre has: name, display_name, emoji, gradient colors, suno_prompt_template
**And** Genres are marked `is_active=true` and ordered by `sort_order`

**Prerequisites:** Story 1.6 (Database schema)

**Technical Notes:**
- Create `/supabase/seed.sql` with genre INSERT statements
- Prompt templates validated by founder's 80k listener expertise
- Test each genre with actual Suno generation
- Emoji examples: Country Rock=🎸, Folk=🪕, Party=🎉, Rap=🎤
- Gradients match Playful Nordic theme (red-to-yellow, blue-to-red, etc.)

---

## Epic 4: Song Library & Management

**Goal:** Enable users to manage their created songs effectively with playback, downloads, organization, and storage management.

**User Value:** Users can organize, replay, and download their Norwegian song library.

**FRs Covered:** FR24-FR27 (Track Management), FR46-FR48, FR50 (Storage & Downloads)

---

### Story 4.1: Create "My Songs" Page with Track List

As a **user**,
I want to view all my generated songs in a dedicated library page,
So that I can access and replay any song I've created.

**Acceptance Criteria:**

**Given** I have generated multiple songs
**When** I tap "My Songs" in the bottom navigation
**Then** I see a list of all my songs sorted by creation date (newest first)
**And** Each song card displays: Artwork thumbnail (60x60px gradient), Song title, Genre badge, Creation date (relative: "2 hours ago"), Duration
**And** I see a small play icon on each card
**And** Tapping a card opens the full song player modal
**And** List supports infinite scroll (load 20 songs at a time)
**And** Empty state displays if no songs: "No songs yet! Let's create your first masterpiece 🎵" with "Create Song" button

**Prerequisites:** Story 3.8 (Song Player)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "5.1 User Journey - Journey 3"
- Create `/src/app/songs/page.tsx` for song library
- Query `song` table WHERE user_id = current_user AND deleted_at IS NULL
- Sort by created_at DESC
- Use shadcn/ui Card component for song cards
- Implement pagination with offset/limit or cursor-based
- Cache song list in React Query or SWR

---

### Story 4.2: Implement Song Detail Modal with Full Player

As a **user**,
I want to open a full-screen player modal when I tap a song,
So that I can focus on listening without distractions.

**Acceptance Criteria:**

**Given** I am viewing my song library
**When** I tap on a song card
**Then** A full-screen modal opens with large artwork (200x200px on mobile)
**And** Song metadata displayed: Title (editable inline), Genre, Creation date, Duration
**And** Large play/pause button (60x60px) in center
**And** Animated waveform visualization below
**And** Scrubable progress bar with time markers
**And** Action buttons at bottom: Share, Download, Delete, Edit (rename)
**And** Modal is dismissible: Tap outside, swipe down (mobile), or close button (X)

**Prerequisites:** Story 4.1

**Technical Notes:**
- Create `/src/app/songs/[id]/page.tsx` OR use modal component
- Use same Song Player Card component from Story 3.8 but full-screen variant
- Deep linking: `/songs/{songId}` for shareable URLs
- Preserve playback state when modal closes
- Preload adjacent songs for fast navigation

---

### Story 4.3: Implement Song Download Functionality

As a **user**,
I want to download my generated songs to my device,
So that I can keep them permanently and share them offline.

**Acceptance Criteria:**

**Given** I am viewing a song in the player modal
**When** I tap "Download" button
**Then** Browser download dialog appears with filename: "{song-title}-musikkfabrikken.mp3"
**And** Audio file downloads from Supabase Storage via signed URL
**And** Download completes successfully within 10 seconds (typical)
**And** I see success toast: "✓ Song downloaded!"
**And** Downloaded file is playable on all standard audio players
**And** File metadata includes: Artist="Musikkfabrikken", Album="Norwegian AI Songs"

**Prerequisites:** Story 4.2, Story 3.7 (Supabase Storage)

**Technical Notes:**
- Generate signed download URL from Supabase Storage
- Use browser `download` attribute on anchor tag
- Filename format: `{sanitized-title}-musikkfabrikken.mp3`
- Audio format: MP3 ~128kbps (good quality, reasonable size)
- Set ID3 tags on file upload: artist, album, title
- Handle large files (3-5 MB typical) with progress indicator if needed

---

### Story 4.4: Implement Song Deletion with Confirmation

As a **user**,
I want to delete songs I no longer need,
So that my library stays organized and I can free up storage space.

**Acceptance Criteria:**

**Given** I am viewing a song in the player modal
**When** I tap "Delete" button
**Then** A confirmation modal appears: "Delete '{song-title}'? This can't be undone."
**And** Two options: "Cancel" (secondary button) and "Delete Forever" (destructive red button)
**And** When I confirm deletion
**Then** Song record is soft-deleted: `deleted_at = NOW()`
**And** Song disappears from my library immediately
**And** I see toast: "Song deleted. Undo?" (10-second window)
**And** If I tap "Undo", soft delete is reversed: `deleted_at = NULL`
**And** After 10 seconds or navigating away, undo option expires

**Prerequisites:** Story 4.2

**Technical Notes:**
- Soft delete: Set `deleted_at` timestamp instead of hard DELETE
- Update query to filter: `WHERE deleted_at IS NULL`
- Undo mechanism: Store deleted song ID in component state
- After 14 days, background job permanently deletes soft-deleted songs
- Deletion also removes audio file from Supabase Storage after 14 days

---

### Story 4.5: Implement Song Rename Functionality

As a **user**,
I want to rename my songs with meaningful titles,
So that I can easily identify them in my library.

**Acceptance Criteria:**

**Given** I am viewing a song in the player modal
**When** I tap the song title (which shows an edit icon on hover)
**Then** Title becomes an editable input field
**And** I can type a new title (1-100 characters)
**And** When I press Enter or tap outside
**Then** Title is saved to database
**And** Updated title appears everywhere: player, library list, shared links
**And** I see success toast: "✓ Song renamed!"
**And** If I leave title empty, it reverts to original AI-generated title

**Prerequisites:** Story 4.2

**Technical Notes:**
- Inline editing: Click title → input field with current value
- Validation: 1-100 characters, no special characters that break filenames
- API endpoint: PATCH `/api/songs/[id]` with `{ title: string }`
- Optimistic update: Show new title immediately, rollback on error
- Sanitize title for safe database storage and filenames

---

### Story 4.6: Implement 14-Day Deletion Warning System

As a **user**,
I want to be notified before my songs are automatically deleted,
So that I can download songs I want to keep permanently.

**Acceptance Criteria:**

**Given** I have songs approaching the 14-day deletion deadline
**When** A song is 12 days old (2 days before deletion)
**Then** I see a warning banner: "💡 Your song '{title}' will be deleted in 2 days. Download to keep forever!"
**And** Banner appears on "My Songs" page and in song player modal
**And** "Download" button is prominently displayed next to warning
**When** A song reaches 14 days old
**Then** Song is soft-deleted automatically: `deleted_at = NOW()`
**And** I receive an email notification listing deleted songs (if opted in)
**And** Songs remain soft-deleted for 7 more days (grace period) before permanent deletion

**Prerequisites:** Story 4.3 (Download), Story 4.4 (Soft delete)

**Technical Notes:**
- Create background job (Vercel Cron or Supabase Function) that runs daily
- Query songs WHERE `created_at < NOW() - INTERVAL '14 days'` AND `deleted_at IS NULL`
- Set `deleted_at` for expired songs
- Display warning in UI for songs WHERE `created_at > NOW() - INTERVAL '12 days'`
- Email notifications: Use Supabase Auth email or Resend API
- Permanent deletion: After 21 days total (14 + 7 grace), hard delete record + audio file

---

### Story 4.7: Implement Batch Download Functionality

As a **user**,
I want to download multiple songs at once,
So that I can archive my entire library efficiently.

**Acceptance Criteria:**

**Given** I am viewing my song library with multiple songs
**When** I tap "Select Multiple" button in the header
**Then** Checkboxes appear on each song card
**And** I can select/deselect individual songs by tapping
**And** A floating action bar appears at bottom: "{n} songs selected" | "Download All" | "Cancel"
**When** I tap "Download All"
**Then** All selected songs are downloaded as a ZIP file: "musikkfabrikken-songs-{date}.zip"
**And** ZIP includes all audio files with readable filenames
**And** Download completes within 30 seconds (for 10 songs)
**And** I see success toast: "✓ {n} songs downloaded!"

**Prerequisites:** Story 4.3 (Download)

**Technical Notes:**
- Create API route: POST `/api/songs/batch-download` with `songIds[]`
- Server-side: Generate ZIP archive using JSZip or similar
- Stream ZIP to client (don't buffer entire file in memory)
- Limit: Max 50 songs per batch to prevent timeout
- Alternative: Generate individual downloads in browser using async queue

---

---

## Epic 5: Social Sharing & Viral Features

**Goal:** Enable users to share their Norwegian songs on social media platforms to drive organic growth.

**User Value:** Users can effortlessly share songs with friends and at events, growing the platform virally.

**FRs Covered:** FR56-FR59 (Social Sharing)

---

### Story 5.1: Create Social Share Sheet Component

As a **user**,
I want a one-tap social sharing menu,
So that I can quickly share my Norwegian song to TikTok, Facebook, or Instagram.

**Acceptance Criteria:**

**Given** I am viewing a completed song
**When** I tap the "Share" button
**Then** A bottom sheet slides up from the bottom of the screen
**And** I see large platform icons (48x48px): TikTok, Facebook, Instagram, WhatsApp, Copy Link
**And** Each icon is touch-friendly and clearly labeled
**And** Song preview card is displayed at top of sheet: Artwork, Title, "Created with Musikkfabrikken"
**And** Tapping a platform icon triggers native share intent
**And** Sheet is dismissible: Swipe down or tap outside

**Prerequisites:** Story 3.8 (Song Player)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "6.1 Custom Component: Social Share Sheet"
- Create `/src/components/social-share-sheet.tsx`
- Use shadcn/ui Sheet or Dialog component as base
- Bottom sheet animation: Slide up from bottom (mobile native pattern)
- Platform icons: Use brand colors (TikTok=black, Facebook=blue, Instagram=gradient)
- Native Web Share API: `navigator.share()` for mobile
- Fallback for desktop: Custom share URLs

---

### Story 5.2: Implement TikTok and Facebook Share Functionality

As a **user**,
I want to share my song directly to TikTok or Facebook,
So that my friends can hear my Norwegian creation and discover Musikkfabrikken.

**Acceptance Criteria:**

**Given** I have tapped "Share" and selected TikTok or Facebook
**When** The native share intent opens
**Then** Pre-filled caption appears: "Check out my Norwegian AI song! 🎵 Created with Musikkfabrikken"
**And** Song audio file is attached (or link if direct upload not supported)
**And** Musikkfabrikken branding is visible: Logo watermark on preview image
**And** After sharing, I return to Musikkfabrikken and see confirmation: "✓ Shared to {Platform}!"
**And** Share count increments in database for analytics

**Prerequisites:** Story 5.1

**Technical Notes:**
- TikTok: Use TikTok Share SDK or deep link: `tiktok://share`
- Facebook: Use Facebook Share Dialog or deep link: `fb://share`
- Caption template: Customizable, includes attribution
- Audio attachment: Direct file upload if API supports, otherwise shareable link
- Track shares: Increment `shared_count` in `song` table
- Test with actual mobile devices (emulators may not support native intents)

---

### Story 5.3: Generate Shareable Song Links

As a **user**,
I want to generate a shareable link for my song,
So that I can share it via any platform (SMS, email, WhatsApp, etc.).

**Acceptance Criteria:**

**Given** I am in the social share sheet
**When** I tap "Copy Link"
**Then** A shareable URL is copied to clipboard: `musikkfabrikken.no/songs/{songId}`
**And** I see success toast: "✓ Link copied to clipboard!"
**And** When someone visits the link
**Then** They see a public song player page with: Artwork, Title, Genre, Play button
**And** Non-logged-in visitors can listen to the song (read-only access)
**And** Page includes Musikkfabrikken branding and "Create your own" CTA
**And** Page has Open Graph meta tags for rich previews (thumbnail, title, description)

**Prerequisites:** Story 5.1

**Technical Notes:**
- Generate shareable UUID or short code for songs
- Create public route: `/src/app/songs/[id]/page.tsx` (no auth required)
- Use RLS policy: Allow SELECT on `song` table for shared songs only
- Add `is_public` boolean column to `song` table (default false, true when shared)
- Open Graph tags: `<meta property="og:title">`, `og:image`, `og:audio`
- Test link sharing on WhatsApp, SMS, email (preview rendering)

---

### Story 5.4: Add Musikkfabrikken Watermark to Free Previews

As a **developer**,
I want free preview clips to include visible Musikkfabrikken branding,
So that shared previews drive awareness and user acquisition.

**Acceptance Criteria:**

**Given** A user generates a free 30-second preview
**When** The preview audio is generated by Suno
**Then** A watermark announcement is added: Voice-over at end saying "Created with Musikkfabrikken"
**OR** Watermark is added as metadata in audio file
**AND** When preview is shared, visual preview image includes Musikkfabrikken logo
**And** Full songs (paid) do NOT include watermark
**And** Watermark is subtle but noticeable (not intrusive)

**Prerequisites:** Story 3.9 (Free Preview), Story 5.1 (Sharing)

**Technical Notes:**
- Option 1: Suno watermark parameter (if supported)
- Option 2: Post-processing audio with ffmpeg: Add voice-over at end
- Option 3: Embed metadata in MP3 ID3 tags: Copyright="Musikkfabrikken.no"
- Visual watermark: Generate share preview image with logo overlay
- Store watermark status in database: `is_watermarked` boolean
- Watermark removal: Only for paid full songs

---

### Story 5.5: Track Share Analytics and Attribution

As a **founder**,
I want to track which users share songs and where,
So that I can measure viral growth and identify top sharers.

**Acceptance Criteria:**

**Given** Users are sharing songs on social platforms
**When** A song is shared via any platform
**Then** A record is created in `song_share` table with: song_id, user_id, platform, shared_at timestamp
**And** Song's `shared_count` is incremented
**And** When a new user signs up via shared link (query param: `?ref={songId}`)
**Then** Referral is tracked: Attribute new user to referring song/user
**And** Founder can view analytics dashboard: Total shares, shares by platform, top shared songs, viral coefficient
**And** Future: Reward top sharers with bonus credits

**Prerequisites:** Story 5.3 (Shareable links)

**Technical Notes:**
- Create `song_share` table: id, song_id, user_id, platform, shared_at
- Increment `song.shared_count` atomically on share
- Add `?ref={songId}` query param to shareable links
- Track referral source in user_profile: `referred_by_song_id`
- Analytics query: Count shares grouped by platform, song, date range
- Future: Implement referral rewards (bonus credits for successful referrals)

---

---

## Epic 6: Premium Features

**Goal:** Provide premium enhancements (canvas generation, mastering service, extended storage) that create additional revenue streams.

**User Value:** Users can enhance their songs with professional visuals and mastering, differentiate from basic offerings.

**FRs Covered:** FR35-FR39 (Canvas), FR40-FR45 (Mastering), FR49 (Extended Storage)

---

### Story 6.1: Implement Canvas Generation with Google Video API

As a **user**,
I want to generate AI-powered visual canvas/album art for my song,
So that I have professional-looking artwork for social sharing.

**Acceptance Criteria:**

**Given** I have a completed song
**When** I tap "Generate Canvas" button (in song player modal)
**Then** I see canvas generation options:
  - Auto-generate: AI creates canvas based on song metadata (genre, title, mood)
  - Custom prompt: I can enter my own description (e.g., "Fishing boat on Norwegian fjord at sunset")
**And** Canvas generation costs 5 credits (displayed before generation)
**When** I confirm canvas generation
**Then** 5 credits are deducted atomically
**And** Google Video API generates canvas image (1024x1024px)
**And** Canvas appears in song player within 30 seconds
**And** I can download canvas as PNG
**And** Canvas is automatically used as song artwork in library

**Prerequisites:** Story 3.8 (Song Player), Story 2.6 (Credit system)

**Technical Notes:**
- Create API route: POST `/api/canvas/generate` with `songId`, `prompt` (optional)
- Use Google Gemini to generate creative visual prompt from song metadata
- Call Google Video API (or Imagen) to generate image
- Store canvas in Supabase Storage bucket `canvases`
- Update song record: `canvas_url = {signed URL}`
- Cost: ~$0.50 per generation (5 credits = acceptable markup)
- Environment variable: GOOGLE_AI_API_KEY

---

### Story 6.2: Implement Canvas Preview and Download

As a **user**,
I want to preview and download my generated canvas,
So that I can use it as album art or social media imagery.

**Acceptance Criteria:**

**Given** I have generated a canvas for my song
**When** I view the song in the player modal
**Then** Canvas image is displayed as song artwork (replaces default gradient)
**And** I can tap canvas to view full-size preview
**And** Preview modal shows canvas in high resolution (1024x1024px)
**And** I see "Download Canvas" button
**When** I download canvas
**Then** PNG file downloads: "{song-title}-canvas.png"
**And** I can regenerate canvas if I don't like the result (costs 5 more credits)

**Prerequisites:** Story 6.1

**Technical Notes:**
- Display canvas in song player card: Replace gradient with canvas_url
- Full-size preview: Modal with 1024x1024px image
- Download: Signed URL from Supabase Storage
- Regeneration: Same API endpoint, creates new canvas, replaces old one
- Old canvas: Keep for 14 days, then delete (same retention policy as songs)

---

### Story 6.3: Create Mastering Service Booking Flow

As a **user**,
I want to book manual mastering service for my song,
So that I can get professional-quality audio in 24 hours.

**Acceptance Criteria:**

**Given** I have a completed song
**When** I tap "Book Mastering" button (in song player modal)
**Then** I see mastering service details:
  - Price: 20 credits ($10 equivalent)
  - SLA: 24-hour turnaround
  - Description: "Professional mastering by founder (80k monthly listeners)"
  - Guarantee: "Free if we miss the 24h deadline"
**And** When I confirm booking
**Then** 20 credits are deducted (binding pre-payment)
**And** Mastering request is created in `mastering_request` table with status='pending'
**And** Founder receives email notification with song details and audio file link
**And** I see confirmation: "✓ Mastering booked! You'll receive notification when ready."

**Prerequisites:** Story 2.6 (Credit system), Story 3.8 (Song Player)

**Technical Notes:**
- Create API route: POST `/api/mastering/book` with `songId`
- Deduct 20 credits atomically before creating request
- Insert `mastering_request`: user_id, song_id, status='pending', requested_at
- Send email to founder: Include song metadata, audio download link, deadline (24h)
- Email service: Use Resend or Supabase Auth email
- Handle edge case: If founder declines, refund credits

---

### Story 6.4: Implement Mastering Completion and Delivery

As a **founder**,
I want to upload mastered audio and notify the user,
So that users receive their professionally mastered songs.

**Acceptance Criteria:**

**Given** I (founder) have completed mastering for a song
**When** I access the admin mastering dashboard
**Then** I see list of pending mastering requests with: User, Song, Requested date, Time remaining
**And** I can upload mastered audio file (MP3/WAV) for each request
**And** When I mark request as 'completed'
**Then** Mastered audio is stored in Supabase Storage
**And** User is notified via email: "Your mastered song is ready!"
**And** User sees "Mastered Version Available" badge in song player
**And** User can download both original and mastered versions

**Prerequisites:** Story 6.3

**Technical Notes:**
- Create admin dashboard: `/src/app/admin/mastering/page.tsx` (protected route)
- Upload mastered file: Store in Supabase Storage, separate from original
- Update `mastering_request`: status='completed', mastered_audio_url, completed_at
- Send user email notification with download link
- Display mastered badge in song player UI
- Track SLA: If completed_at > requested_at + 24h, mark as "SLA Missed" and auto-refund

---

### Story 6.5: Implement SLA Miss Auto-Refund

As a **user**,
I want automatic refund if mastering SLA is missed,
So that I'm not charged for late delivery.

**Acceptance Criteria:**

**Given** I have booked mastering service
**When** 24 hours pass without completion
**Then** Mastering request is automatically marked as "SLA Missed"
**And** My 20 credits are refunded automatically
**And** I receive email notification: "Sorry we missed the deadline! Credits refunded. Your song is still being mastered for free."
**And** When mastering is completed (late), I still receive mastered version
**And** Founder receives alert about SLA miss

**Prerequisites:** Story 6.4

**Technical Notes:**
- Background job (Vercel Cron): Run every hour
- Query `mastering_request` WHERE status='pending' AND requested_at < NOW() - INTERVAL '24 hours'
- For each late request: Refund 20 credits, update status='sla_missed'
- Create credit transaction: type='refund', description='Mastering SLA missed'
- Send user email: Apology + refund confirmation
- Send founder alert: Email or Slack notification of SLA miss

---

### Story 6.6: Implement Extended Storage for Premium Users

As a **user with Premium tier credits**,
I want access to 30-day storage instead of 14 days,
So that my songs are available longer before auto-deletion.

**Acceptance Criteria:**

**Given** I have purchased the Premium credit package ($99)
**When** My account is flagged as Premium tier
**Then** My songs are retained for 30 days instead of 14 days
**And** I see "Premium: 30-day storage" badge on Settings page
**And** My songs show deletion warning at 28 days (2 days before expiration)
**And** Premium status persists until I run out of credits
**And** When I purchase Premium again, status is restored

**Prerequisites:** Story 4.6 (14-day deletion), Story 2.3 (Credit purchase)

**Technical Notes:**
- Add `tier` column to `user_profile`: 'free', 'starter', 'pro', 'premium'
- Set tier based on most recent credit package purchased
- Modify deletion logic: If tier='premium', delete at 30 days, else 14 days
- Update warning logic: Show warning at 28 days for premium, 12 days for others
- Tier expires when credit balance reaches 0 (or after 6 months of inactivity)

---

---

## Epic 7: User Experience & Help

**Goal:** Polish the user experience with helpful guidance, tooltips, examples, and documentation.

**User Value:** App is intuitive, helpful, and delightful for non-technical users.

**FRs Covered:** FR52-FR55 (Help & Guidance)

---

### Story 7.1: Add Contextual Tooltips Throughout App

As a **user**,
I want helpful tooltips when I hover/tap on unfamiliar features,
So that I understand what each feature does without leaving the page.

**Acceptance Criteria:**

**Given** I am using the app as a first-time user
**When** I hover over (desktop) or tap (mobile) an info icon (ⓘ) next to a feature
**Then** A tooltip appears explaining the feature in simple Norwegian or English
**And** Tooltips are clear, concise (1-2 sentences), and jargon-free
**And** Key tooltips:
  - "Uttalelse Bokmål": "Automatically improves Norwegian pronunciation for Suno AI"
  - "Credits": "1 credit ≈ $0.05. Songs cost 10 credits each."
  - "Canvas": "AI-generated album art for your song (5 credits)"
  - "Mastering": "Professional audio enhancement by our founder (20 credits, 24h)"
**And** Tooltips dismiss when I tap outside or hover away

**Prerequisites:** Story 1.4 (shadcn/ui)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "7.1 Consistency Rules - Feedback Patterns"
- Use shadcn/ui Tooltip component
- Info icons: Use Lucide icon `Info` (ⓘ) next to labels
- Tooltip styling: White card, drop shadow, max-width 250px
- Accessibility: ARIA role="tooltip", keyboard accessible (focus to show)
- Content: Store tooltip text in constants file for easy editing

---

### Story 7.2: Create Onboarding Flow for First-Time Users

As a **new user**,
I want guided onboarding when I first use Musikkfabrikken,
So that I understand how to create my first Norwegian song.

**Acceptance Criteria:**

**Given** I have just signed up and logged in for the first time
**When** I land on the "Create Song" page
**Then** A welcome modal appears: "Welcome to Musikkfabrikken! Let's create your first Norwegian song in under 5 minutes."
**And** Onboarding consists of 3 screens:
  1. "Pick your favorite genres" - Multi-select 3 genres
  2. "What's your song about?" - Enter concept (pre-filled example: "Birthday song for a friend")
  3. "Generate your first song!" - Explanation of credits + button to get free preview
**And** After onboarding, I'm guided to create first song with tooltips highlighting key features
**And** Onboarding can be skipped with "Skip" button
**And** Onboarding doesn't show again after first completion

**Prerequisites:** Story 3.1 (Genre Carousel), Story 3.9 (Free Preview)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "5.1 User Journey - Journey 4"
- Store onboarding completion in user_profile: `onboarding_completed` boolean
- Use shadcn/ui Dialog for onboarding modal
- Onboarding state: Track current step (1/3, 2/3, 3/3)
- Skip button: Set onboarding_completed=true, never show again
- After onboarding: Highlight genre carousel with spotlight effect

---

### Story 7.3: Create FAQ and Help Documentation Page

As a **user**,
I want access to comprehensive help documentation,
So that I can find answers to common questions without contacting support.

**Acceptance Criteria:**

**Given** I need help understanding features
**When** I tap "Help" link in Settings page footer
**Then** I navigate to `/help` page with searchable FAQ
**And** FAQ is organized by category:
  - Getting Started: "How do I create my first song?", "What are credits?"
  - Norwegian Pronunciation: "What is Uttalelse Bokmål?", "Can I override phonetic changes?"
  - Credits & Payments: "How do credit packages work?", "What payment methods do you accept?"
  - Premium Features: "What is canvas generation?", "How does mastering work?"
  - Troubleshooting: "My song generation failed, why?", "How do I download songs?"
**And** Each FAQ entry is expandable (accordion) with detailed answer
**And** Search bar filters FAQs by keyword
**And** "Still need help? Contact us" link at bottom

**Prerequisites:** None (standalone page)

**Technical Notes:**
- Create `/src/app/help/page.tsx` for help documentation
- FAQ content: Markdown format, stored in `/content/faq.md`
- Use shadcn/ui Accordion component for expandable entries
- Search: Client-side filter by keywords in FAQ text
- Contact link: Email mailto:support@musikkfabrikken.no or contact form
- Consider: Add video tutorials for key flows (song creation, pronunciation)

---

### Story 7.4: Add Example Songs Showcase Page

As a **user**,
I want to hear example songs created with Musikkfabrikken,
So that I can understand the quality and possibilities before creating my own.

**Acceptance Criteria:**

**Given** I want to hear examples before committing
**When** I navigate to `/examples` page (linked from home and help pages)
**Then** I see a curated gallery of 6-10 example songs
**And** Each example shows: Artwork, Title, Genre, Short description ("Norwegian birthday song with country rock style")
**And** I can play each example directly on the page (no login required)
**And** Examples demonstrate variety: Different genres, pronunciations, song types
**And** Each example has "Create Your Own" CTA button
**And** Examples are marked with "Example" badge to distinguish from user songs

**Prerequisites:** Story 3.8 (Song Player)

**Technical Notes:**
- Create `/src/app/examples/page.tsx` for example showcase
- Example songs: Create manually by founder, mark as `is_example=true` in database
- Public access: No authentication required (RLS policy allows SELECT for is_example=true)
- Curated selection: Choose best examples that showcase Norwegian pronunciation quality
- Consider: Add founder's 80k listener songs as examples for credibility
- Update examples periodically to keep content fresh

---

### Story 7.5: Implement Friendly Error Messages with Recovery Actions

As a **user**,
I want clear, actionable error messages when something goes wrong,
So that I know what happened and how to fix it.

**Acceptance Criteria:**

**Given** An error occurs during any operation
**When** The error is displayed to me
**Then** I see a friendly, jargon-free message explaining what happened
**And** Message includes specific recovery action (not just "Error occurred")
**And** Error examples:
  - Suno API failure: "Oops! Couldn't reach Suno. Check your connection?" + "Retry" button
  - Insufficient credits: "You need 10 credits to generate a song. Purchase a package?" + "Buy Credits" button
  - Song generation timeout: "Generation took longer than expected. We'll notify you when it's ready!" + "OK" button
  - Network error: "Looks like you're offline. Check your connection and try again." + "Retry" button
**And** Errors are logged server-side for debugging (user doesn't see technical details)
**And** Error toast/modal uses appropriate severity color (red for critical, yellow for warnings)

**Prerequisites:** All stories (cross-cutting concern)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "7.1 Consistency Rules - Feedback Patterns"
- Create error message dictionary: `/src/lib/utils/error-messages.ts`
- Map technical errors to user-friendly messages
- Always include actionable next step (retry, contact support, check settings)
- Log full error details to console + monitoring service (Sentry)
- Test error handling: Intentionally trigger errors to verify messages

---

---

## Epic 8: System Resilience & Operations

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

## Epic and Story Summary

### Story Count by Epic

| Epic | # Stories | Story IDs | Complexity |
|------|-----------|-----------|------------|
| **Epic 1:** Foundation & Infrastructure | 6 | 1.1-1.6 | Medium |
| **Epic 2:** User Authentication & Credit System | 6 | 2.1-2.6 | High |
| **Epic 3:** Norwegian Song Creation (CORE) | 10 | 3.1-3.10 | Very High |
| **Epic 4:** Song Library & Management | 7 | 4.1-4.7 | Medium |
| **Epic 5:** Social Sharing & Viral Features | 5 | 5.1-5.5 | Medium |
| **Epic 6:** Premium Features | 6 | 6.1-6.6 | High |
| **Epic 7:** User Experience & Help | 5 | 7.1-7.5 | Low |
| **Epic 8:** System Resilience & Operations | 8 | 8.1-8.8 | High |
| **TOTAL** | **53 Stories** | - | - |

### Story Dependencies Visualization

**Critical Path (Must implement in order):**
1. Epic 1 (Foundation) → Epic 2 (Auth & Credits) → Epic 3 (Core Song Creation) ✅
2. Epic 3 enables all other epics (Epic 4-7 can proceed in parallel)
3. Epic 8 (Resilience) builds throughout, can be implemented incrementally

**Parallelizable Work (After Epic 3 complete):**
- Epic 4 (Song Management) + Epic 5 (Social Sharing) + Epic 7 (UX Polish) can be done concurrently
- Epic 6 (Premium Features) depends on Epic 3 but independent of Epic 4/5/7

---

## FR to Story Traceability Matrix

This matrix ensures EVERY functional requirement is implemented by at least one story.

| FR ID | FR Description | Implemented By | Epic |
|-------|----------------|----------------|------|
| **FR1** | Google OAuth authentication | Story 2.1 | Epic 2 |
| **FR2** | Secure login and sessions | Story 2.1 | Epic 2 |
| **FR3** | View account profile with credit balance | Story 2.2 | Epic 2 |
| **FR4** | Log out from any device | Story 2.2 | Epic 2 |
| **FR5** | Input Norwegian lyrics | Story 3.2 | Epic 3 |
| **FR6** | Select genre/style from templates | Story 3.1, 3.10 | Epic 3 |
| **FR7** | Customize song metadata (title) | Story 4.5 | Epic 4 |
| **FR8** | Preview lyrics before generation | Story 3.2 | Epic 3 |
| **FR9** | Toggle pronunciation optimization on/off | Story 3.3 | Epic 3 |
| **FR10** | Preview phonetic transformations with diff | Story 3.4 | Epic 3 |
| **FR11** | Override phonetic suggestions per-line | Story 3.4 | Epic 3 |
| **FR12** | Automatically apply Norwegian pronunciation rules | Story 3.3 | Epic 3 |
| **FR13** | View pronunciation optimization disclaimers | Story 3.3, 7.1 | Epic 3, 7 |
| **FR14** | Generate 30-second preview clips (free) | Story 3.9 | Epic 3 |
| **FR15** | Generate full-length songs using credits | Story 3.5 | Epic 3 |
| **FR16** | View real-time generation status and progress | Story 3.6 | Epic 3 |
| **FR17** | Cancel pending song generation | Story 3.6 | Epic 3 |
| **FR18** | Automatically deduct credits on success | Story 2.6, 3.5 | Epic 2, 3 |
| **FR19** | Automatically rollback credits on failure | Story 2.6 | Epic 2 |
| **FR20** | Receive notifications when complete | Story 3.6, 3.7 | Epic 3 |
| **FR21** | View all songs in persistent track list | Story 4.1 | Epic 4 |
| **FR22** | Play songs directly in browser | Story 3.8, 4.2 | Epic 3, 4 |
| **FR23** | Download songs in common formats | Story 4.3 | Epic 4 |
| **FR24** | Delete songs from track list | Story 4.4 | Epic 4 |
| **FR25** | Rename/re-title generated songs | Story 4.5 | Epic 4 |
| **FR26** | Persist track list across sessions | Story 4.1 | Epic 4 |
| **FR27** | Automatically delete songs after 14 days | Story 4.6 | Epic 4 |
| **FR28** | View current credit balance at all times | Story 2.2 | Epic 2 |
| **FR29** | Purchase credit packages via Stripe | Story 2.3 | Epic 2 |
| **FR30** | Receive low-balance warnings | Story 2.5 | Epic 2 |
| **FR31** | View credit transaction history | Story 2.4 | Epic 2 |
| **FR32** | Display credit cost before action | Story 2.5, 3.5 | Epic 2, 3 |
| **FR33** | Prevent actions if insufficient credits | Story 2.5 | Epic 2 |
| **FR34** | Request refunds for failed generations | Story 2.6 | Epic 2 |
| **FR35** | Optionally generate visual canvas/album art | Story 6.1 | Epic 6 |
| **FR36** | Provide custom prompts for canvas | Story 6.1 | Epic 6 |
| **FR37** | Auto-generate canvas prompts from metadata | Story 6.1 | Epic 6 |
| **FR38** | Preview and download canvas images | Story 6.2 | Epic 6 |
| **FR39** | Deduct canvas credits separately | Story 6.1 | Epic 6 |
| **FR40** | Book manual mastering service | Story 6.3 | Epic 6 |
| **FR41** | View mastering SLA (24-hour) | Story 6.3 | Epic 6 |
| **FR42** | Binding pre-payment for mastering | Story 6.3 | Epic 6 |
| **FR43** | Receive notifications when mastered ready | Story 6.4 | Epic 6 |
| **FR44** | Download mastered + original versions | Story 6.4 | Epic 6 |
| **FR45** | Free mastering if SLA missed | Story 6.5 | Epic 6 |
| **FR46** | Automatically download and store songs from Suno | Story 3.7 | Epic 3 |
| **FR47** | Provide signed URLs for secure downloads | Story 4.3 | Epic 4 |
| **FR48** | Notify users before 14-day deletion | Story 4.6 | Epic 4 |
| **FR49** | Premium tier: Extended 30-day storage | Story 6.6 | Epic 6 |
| **FR50** | Export/download multiple songs in batch | Story 4.7 | Epic 4 |
| **FR51** | Access genre templates with selection | Story 3.1 | Epic 3 |
| **FR52** | Display helpful tooltips and guidance | Story 7.1 | Epic 7 |
| **FR53** | View examples of phonetic optimization | Story 7.4 | Epic 7 |
| **FR54** | Access FAQ and help documentation | Story 7.3 | Epic 7 |
| **FR55** | Display clear error messages with guidance | Story 7.5 | Epic 7 |
| **FR56** | Share songs to social media platforms | Story 5.2 | Epic 5 |
| **FR57** | Free previews include watermark/branding | Story 5.4 | Epic 5 |
| **FR58** | Generate shareable links for songs | Story 5.3 | Epic 5 |
| **FR59** | Shared songs display attribution | Story 5.3, 5.4 | Epic 5 |
| **FR60** | Log all credit transactions for auditing | Story 8.1 | Epic 8 |
| **FR61** | Monitor Suno API health and response times | Story 8.2 | Epic 8 |
| **FR62** | Alert founder when API costs exceed thresholds | Story 8.3 | Epic 8 |
| **FR63** | Track pronunciation quality feedback | Story 8.8 | Epic 8 |
| **FR64** | Founder can manually process mastering | Story 6.4 | Epic 6 |
| **FR65** | Monitor test team feedback for quality | Story 8.8 | Epic 8 |
| **FR66** | Gracefully handle Suno API failures | Story 8.4, 8.5 | Epic 8 |
| **FR67** | Implement automatic retry logic | Story 8.4 | Epic 8 |
| **FR68** | Maintain session state during API downtime | Story 8.5 | Epic 8 |
| **FR69** | Fallback mechanisms for webhook failures | Story 8.6 | Epic 8 |
| **FR70** | Prevent double-charging on concurrent requests | Story 8.7 | Epic 8 |

**Coverage Validation:** ✅ ALL 70 FRs implemented across 53 stories

---

## Implementation Recommendations

### MVP Phase 1 (Month 1-2): Core Value Delivery
**Goal:** Users can create authentic Norwegian songs

**Epics to implement:**
- ✅ Epic 1: Foundation & Infrastructure (6 stories)
- ✅ Epic 2: User Authentication & Credit System (6 stories)
- ✅ Epic 3: Norwegian Song Creation - CORE (10 stories)

**Result:** Users can sign up, purchase credits, and create genuinely Norwegian-sounding songs with pronunciation optimization. **THIS IS THE MAIN VALUE!**

**Estimated effort:** 4-6 weeks (22 stories, Very High complexity)

---

### MVP Phase 2 (Month 3): User Retention & Growth
**Goal:** Users can manage songs and share virally

**Epics to implement:**
- ✅ Epic 4: Song Library & Management (7 stories)
- ✅ Epic 5: Social Sharing & Viral Features (5 stories)
- ✅ Epic 7: User Experience & Help (5 stories)

**Result:** Users have full song library management, can share on TikTok/Facebook, and receive helpful onboarding/tooltips.

**Estimated effort:** 3-4 weeks (17 stories, Medium complexity)

---

### MVP Phase 3 (Month 4-5): Premium Revenue & Reliability
**Goal:** Additional revenue streams and operational excellence

**Epics to implement:**
- ✅ Epic 6: Premium Features (6 stories)
- ✅ Epic 8: System Resilience & Operations (8 stories)

**Result:** Canvas generation, mastering service, extended storage unlock premium revenue. Robust error handling, monitoring, and founder dashboard ensure reliability.

**Estimated effort:** 3-4 weeks (14 stories, High complexity)

---

### Post-MVP: Iteration & Scale (Month 6+)
**Future enhancements** (not in initial 70 FRs):
- Mobile native apps (iOS, Android) for better mobile experience
- Vipps payment integration (Norwegian payment method)
- Collaborative song creation (multiple users)
- Advanced analytics dashboard for users
- API for third-party integrations
- Automated quality feedback loop with pronunciation model fine-tuning

---

## Success Metrics

**After MVP Phase 1 (Core Value):**
- ✅ 100 users signed up
- ✅ 50 songs generated (with pronunciation optimization)
- ✅ 80%+ pronunciation satisfaction (founder validation)
- ✅ $500 in credit sales

**After MVP Phase 2 (Retention & Growth):**
- ✅ 500 users signed up
- ✅ 200 paying customers (40% conversion)
- ✅ 50+ songs shared on social media
- ✅ 20% week-over-week growth from viral sharing

**After MVP Phase 3 (Premium & Reliability):**
- ✅ 1,000 users signed up
- ✅ 200 paying customers maintained
- ✅ 10+ mastering service bookings
- ✅ 25+ canvas generations
- ✅ 99%+ uptime
- ✅ <1% API cost overruns

**6-Month Target (PRD Goal):**
- ✅ 1,000 users, 200 paying customers
- ✅ $5,000-$10,000 MRR (Monthly Recurring Revenue)
- ✅ Product-market fit validated
- ✅ Ready for scale (marketing, partnerships)

---

## Notes for Implementation Teams

### For Product Manager (You, BIP!)
- **Priority 1:** Epic 3 (Norwegian Song Creation) - THE CORE VALUE. Don't compromise pronunciation quality!
- **Validate early:** Get 10-20 test users generating songs in Phase 1, gather feedback on pronunciation before Phase 2
- **Watch costs:** API costs can spike. Monitor Story 8.3 (Cost Monitoring) closely from Day 1
- **Founder's expertise:** Your 80k listener experience is the moat. Manual mastering (Story 6.3) is high-value differentiation

### For Developers
- **Architecture is complete:** Reference `/docs/architecture.md` for all technical decisions
- **Follow patterns:** Naming conventions, error handling, API response format ALL documented
- **No shortcuts:** Atomic credit deduction (Story 2.6), Row Level Security (Story 1.6) are CRITICAL for trust
- **Test pronunciation:** Each genre prompt template (Story 3.10) must be validated with real Suno generations

### For UX Designer
- **Mobile-first:** 80% of users will be on mobile at parties/events
- **TikTok-inspired:** Horizontal genre carousel (Story 3.1) should feel native to TikTok users
- **Progressive disclosure:** Simple by default, advanced (per-line override) optional
- **Color system:** Playful Nordic theme (#E94560 red, #0F3460 navy, #FFC93C yellow) - Story 1.2

### For QA/Test Team
- **Pronunciation quality:** #1 priority. Test each genre, multiple lyrics variations
- **Credit flows:** Every credit deduction/refund scenario must be tested (Stories 2.3-2.6)
- **Error handling:** Intentionally break APIs (Suno, OpenAI, Stripe) to test resilience (Epic 8)
- **Cross-browser/device:** Test on iOS Safari, Android Chrome, desktop (Safari, Chrome, Firefox)

---

## Epic Breakdown Completion

**Document Status:** ✅ COMPLETE

**Created:** 2025-11-19
**Author:** BIP (Product Manager persona via BMAD Method)
**Project:** Musikkfabrikken - Norwegian AI Song Creation Platform

**Summary:**
- ✅ 8 Epics delivering incremental user value
- ✅ 53 Stories with detailed acceptance criteria, prerequisites, and technical notes
- ✅ ALL 70 functional requirements from PRD mapped to stories
- ✅ Implementation plan: 3 phased MVP releases over 6 months
- ✅ Success metrics defined for each phase

**Next Steps:**
1. **Review epic breakdown** with founder/stakeholders for approval
2. **Prioritize stories** within each epic (already ordered by dependency)
3. **Create first story** in `/docs/stories/` folder: `story-1.1-initialize-nextjs-project.md`
4. **Begin implementation** with Epic 1, Story 1.1

**Ready to build Musikkfabrikken!** 🎵🇳🇴

---

_End of Epic Breakdown Document_


