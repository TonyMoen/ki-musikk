# Epic 1: Foundation & Infrastructure

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

