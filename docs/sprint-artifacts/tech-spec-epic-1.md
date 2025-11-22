# Epic Technical Specification: Foundation & Infrastructure

Date: 2025-11-19
Author: BIP
Epic ID: 1
Status: Draft

---

## Overview

Epic 1: Foundation & Infrastructure establishes the complete technical foundation for Musikkfabrikken, a mobile-first AI-powered Norwegian song creation platform. This epic creates the greenfield project structure, development environment, deployment pipeline, and core database schema necessary for all subsequent feature development. While delivering no direct end-user features, it enables the entire application's technical capability through Next.js 14+ with App Router, Supabase backend services, shadcn/ui design system implementation, and automated Vercel deployment.

The foundation aligns with Musikkfabrikken's core mission: enabling amateur Norwegian song creators to produce authentic-sounding Norwegian music through AI-powered lyric generation and Suno music production, differentiated by Norwegian pronunciation optimization. This infrastructure must support mobile-first responsive design, pre-paid credit system monetization, and integration with multiple AI services (OpenAI GPT-4, Suno API, Google Gemini/Video).

## Objectives and Scope

**In-Scope for Epic 1:**

- **Project Initialization**: Create Next.js 14+ project with TypeScript, Tailwind CSS, ESLint, and App Router using official create-next-app starter template
- **Design System Configuration**: Implement Playful Nordic color theme (#E94560 primary, #0F3460 secondary, #FFC93C accent) with custom Tailwind configuration and WCAG 2.1 AA compliant color contrast
- **Backend Infrastructure**: Set up Supabase project with PostgreSQL 17 database, Google OAuth authentication, and Storage buckets for audio files and canvas images
- **UI Component Library**: Install shadcn/ui with base accessible components (Button, Card, Input, Dialog, Toast, Progress, Badge, Select, Switch, Tabs) customized to match design system
- **Deployment Pipeline**: Configure Vercel deployment with automatic CI/CD from main branch, preview deployments for PRs, and environment variable management
- **Database Schema**: Create complete schema (user_profile, song, credit_transaction, genre, mastering_request tables) with Row Level Security policies, indexes, and atomic credit deduction stored procedure
- **Development Environment**: Establish local development workflow with proper environment variable management, TypeScript type generation from database schema, and build verification

**Out-of-Scope for Epic 1:**

- Any user-facing features or UI screens (handled in subsequent epics)
- Authentication flows and user registration (Epic 2)
- Song generation and AI integrations (Epic 3)
- Credit system logic and payment processing (Epic 2)
- Custom React components beyond shadcn/ui base components (Epic 2+)
- API routes and backend business logic (Epic 2+)
- Testing infrastructure and test suites (incremental in story epics)

**Success Criteria:**

- Development environment fully functional: `npm run dev` starts local server successfully
- Production deployment operational on Vercel with public URL
- Supabase database accessible with all tables and RLS policies active
- shadcn/ui components render correctly with Playful Nordic theme colors
- Project builds without TypeScript errors: `npm run build` completes successfully
- All 6 stories (1.1-1.6) pass acceptance criteria verification

## System Architecture Alignment

Epic 1 implements the foundational architectural decisions documented in `/docs/architecture.md`:

**Core Technology Stack (ADR-001, ADR-002, ADR-003, ADR-004):**
- **Next.js 14.2+ with App Router**: Leverages React Server Components, serverless API routes, automatic code splitting, and Turbopack for fast development (chosen for Vercel optimization and modern React patterns)
- **TypeScript 5.3+**: Provides type safety critical for multi-agent AI-assisted development consistency
- **Tailwind CSS 3.4+**: Utility-first styling matching UX specification with JIT mode for optimal bundle size
- **Supabase Backend**: All-in-one PostgreSQL 17 database + Google OAuth + Storage, eliminating need for custom backend infrastructure
- **shadcn/ui + Radix UI**: Copy-paste accessible component library with full customization control, WCAG 2.1 AA compliant by default
- **Vercel Deployment**: Seamless Next.js integration with automatic deployments, Edge Functions, and global CDN

**Project Structure Alignment:**
The established directory structure follows architecture specification precisely:
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/ui/` - shadcn/ui components (copy-paste, not npm dependency)
- `/src/lib/` - Utility libraries, Supabase clients, external API wrappers
- `/src/types/` - TypeScript definitions including auto-generated Supabase types
- `/supabase/migrations/` - Database schema migrations

**Database Architecture:**
Implements complete schema from architecture document with:
- Row Level Security (RLS) enforcing multi-tenant data isolation (users access only their own data)
- Optimized indexes on user_id, created_at, status columns for query performance
- Atomic credit deduction stored procedure preventing race conditions in credit system
- Soft deletes (deleted_at timestamp) for 14-day retention policy
- TIMESTAMPTZ columns for proper timezone handling

**Integration Points Prepared:**
- Supabase Auth Helpers for Next.js (client/server SDK split)
- Environment variable structure supporting future API keys (OpenAI, Suno, Stripe, Google AI)
- Storage buckets configured for future audio file and canvas image uploads

**Design System Foundation:**
Implements Playful Nordic color theme from UX specification with:
- Norwegian flag-inspired colors (#E94560 coral-red, #0F3460 navy)
- WCAG 2.1 AA contrast ratios verified (4.5:1+ for text)
- Mobile-first breakpoints (<640px mobile, 640-1024px tablet, >1024px desktop)
- Inter typography system with 4px base spacing scale
- 48px+ touch targets for mobile accessibility

## Detailed Design

### Services and Modules

Epic 1 establishes the foundational modules and services that support all future development:

| Module | Responsibility | Inputs | Outputs | Owner/Location |
|--------|---------------|--------|---------|----------------|
| **Next.js App Router** | Application routing, page rendering, server components | HTTP requests, route paths | Rendered pages, API responses | `/src/app/` |
| **Supabase Client (Browser)** | Client-side database queries, auth state management | User actions, component queries | Data from Supabase, auth session | `/src/lib/supabase/client.ts` |
| **Supabase Client (Server)** | Server-side database queries, admin operations | API route requests, server component queries | Database results with RLS enforcement | `/src/lib/supabase/server.ts` |
| **Tailwind CSS Engine** | Style generation, theme application | Component classes, custom config | Optimized CSS bundle | `tailwind.config.ts` |
| **shadcn/ui Components** | Accessible UI primitives | Props from consuming components | Rendered accessible UI elements | `/src/components/ui/` |
| **Database Schema** | Data persistence, integrity, isolation | SQL queries via Supabase SDK | User data, songs, transactions | Supabase PostgreSQL 17 |
| **Vercel Deployment** | Build, deploy, serve application | Git push to main/staging | Live application on CDN | Vercel platform |
| **Environment Config** | Secure secrets management | .env.local file (dev), Vercel env vars (prod) | API keys, database URLs | Environment variables |

**Module Interactions:**
- Next.js App Router → Supabase Client (Server) for Server Components data fetching
- React Client Components → Supabase Client (Browser) for interactive features
- All components → shadcn/ui → Tailwind CSS for styling
- Supabase Clients → Database Schema via PostgreSQL connection
- Vercel → Next.js build output → Global CDN delivery

### Data Models and Contracts

**Core Database Entities (from architecture.md schema):**

**1. user_profile**
```typescript
interface UserProfile {
  id: UUID;                    // References auth.users(id) from Supabase Auth
  display_name: string | null;
  credit_balance: number;      // Default 0, CHECK >= 0
  preferences: JSONB;          // Default {}
  created_at: TIMESTAMPTZ;
  updated_at: TIMESTAMPTZ;
}
```
**Relationships:**
- 1:N with song (user owns multiple songs)
- 1:N with credit_transaction (user has transaction history)

**2. song**
```typescript
interface Song {
  id: UUID;                    // Primary key
  user_id: UUID;               // Foreign key to user_profile
  title: string;
  genre: string;
  concept: string | null;      // User's original prompt
  original_lyrics: string | null;
  optimized_lyrics: string | null;
  phonetic_enabled: boolean;   // Default true
  suno_song_id: string | null; // Suno API reference
  audio_url: string | null;    // Supabase Storage signed URL
  duration_seconds: number | null;
  status: 'generating' | 'completed' | 'failed';
  error_message: string | null;
  canvas_url: string | null;
  shared_count: number;        // Default 0
  created_at: TIMESTAMPTZ;
  updated_at: TIMESTAMPTZ;
  deleted_at: TIMESTAMPTZ | null; // Soft delete (14-day policy)
}
```
**Indexes:** user_id, status, created_at DESC

**3. credit_transaction**
```typescript
interface CreditTransaction {
  id: UUID;
  user_id: UUID;
  amount: number;              // Positive (purchase), negative (deduction)
  balance_after: number;
  transaction_type: 'purchase' | 'deduction' | 'refund';
  description: string;
  stripe_session_id: string | null;
  song_id: UUID | null;        // Links to song for refunds
  created_at: TIMESTAMPTZ;
}
```
**Indexes:** user_id, created_at DESC

**4. genre**
```typescript
interface Genre {
  id: UUID;
  name: string;                // Unique slug (e.g., "country-rock")
  display_name: string;        // UI-friendly name
  description: string | null;
  emoji: string | null;        // For genre cards
  suno_prompt_template: string; // e.g., "Country, rock, anthem, twangy guitar"
  sort_order: number;          // Display ordering
  is_active: boolean;
}
```

**5. mastering_request**
```typescript
interface MasteringRequest {
  id: UUID;
  user_id: UUID;
  song_id: UUID;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  mastered_audio_url: string | null;
  notes: string | null;
  requested_at: TIMESTAMPTZ;
  completed_at: TIMESTAMPTZ | null;
}
```

**Row Level Security (RLS) Contracts:**
All user-facing tables enforce: `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE operations, ensuring complete data isolation between users.

### APIs and Interfaces

**Epic 1 API Surface (Infrastructure Only):**

While Epic 1 doesn't implement business logic API routes, it establishes the API structure and patterns:

**API Route Structure:**
```
/src/app/api/
├── songs/
│   ├── generate/route.ts        (Epic 3 - song generation)
│   ├── [id]/route.ts            (Epic 3 - song retrieval)
│   └── webhook/route.ts         (Epic 3 - Suno callbacks)
├── credits/
│   ├── purchase/route.ts        (Epic 2 - Stripe checkout)
│   └── balance/route.ts         (Epic 2 - credit queries)
├── auth/
│   └── callback/route.ts        (Epic 2 - OAuth callback)
└── webhooks/
    ├── stripe/route.ts          (Epic 2 - payment webhooks)
    └── suno/route.ts            (Epic 3 - generation webhooks)
```

**Supabase SDK Interface (Established in Epic 1):**

**Client-side interface:**
```typescript
// /src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export const createClient = () =>
  createClientComponentClient<Database>();
```

**Server-side interface:**
```typescript
// /src/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
```

**Database Stored Procedure Interface:**
```sql
-- Atomic credit deduction
FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_song_id UUID DEFAULT NULL
) RETURNS credit_transaction

-- Throws exception if insufficient credits
-- Returns transaction record on success
```

**Environment Variable Interface:**
```bash
# Required for Epic 1
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-key>

# Prepared for future epics (Epic 2+)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-pk>
STRIPE_SECRET_KEY=<stripe-sk>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
OPENAI_API_KEY=<openai-key>
SUNO_API_KEY=<suno-key>
GOOGLE_AI_API_KEY=<google-key>
```

### Workflows and Sequencing

**Epic 1 Implementation Sequence (Story Order):**

```
1. Story 1.1: Initialize Next.js Project
   ↓ (creates base project structure)

2. Story 1.2: Configure Tailwind with Playful Nordic Theme
   ↓ (establishes design system foundation)

3. Story 1.3: Set Up Supabase Project
   ↓ (provisions backend services)

4. Story 1.4: Install shadcn/ui Components
   ↓ (requires Tailwind config from 1.2)

5. Story 1.5: Configure Vercel Deployment
   ↓ (requires Supabase env vars from 1.3)

6. Story 1.6: Set Up Database Schema
   ↓ (requires Supabase project from 1.3)

EPIC 1 COMPLETE ✓
```

**Critical Path:** Stories 1.1 → 1.2 → 1.3 → {1.4, 1.5, 1.6} can partially parallelize after 1.3

**Developer Workflow (Post-Epic 1):**

```
[Local Development]
1. git clone repository
2. cp .env.example .env.local
3. Add Supabase credentials to .env.local
4. npm install
5. npm run dev → http://localhost:3000
6. Make changes to /src
7. TypeScript/ESLint validates on save
8. Test locally

[Deployment]
9. git commit -m "feature: description"
10. git push origin feature-branch
11. Vercel creates preview deployment automatically
12. Review preview URL
13. Create PR → merge to main
14. Vercel deploys to production automatically

[Database Changes]
15. Create migration file in /supabase/migrations
16. Test locally with Supabase CLI (optional)
17. Deploy migration via Supabase dashboard
18. Regenerate TypeScript types: npx supabase gen types
```

**Data Flow (Established but not active in Epic 1):**

```
User Browser
  ↓ (HTTPS)
Vercel CDN
  ↓
Next.js Server Component
  ↓
Supabase Client (Server)
  ↓ (PostgreSQL connection with RLS)
Supabase Database
  ↓
Row Level Security Check (auth.uid() = user_id)
  ↓
Return authorized data only
```

## Non-Functional Requirements

### Performance

**Build Performance:**
- **Target**: `npm run build` completes in <2 minutes for initial build
- **Rationale**: Fast builds enable rapid iteration during development and quick deployment cycles
- **Measurement**: Time from build start to completion logged by Vercel
- **Source**: General development best practices for Next.js projects

**Development Server Startup:**
- **Target**: `npm run dev` starts local server in <10 seconds
- **Rationale**: Quick feedback loop critical for developer productivity
- **Measurement**: Time from command execution to "Ready on http://localhost:3000"
- **Source**: Next.js Turbopack optimization capabilities

**Page Load Time (Foundation):**
- **Target**: Initial page load <2 seconds on 4G connection (PRD requirement)
- **Rationale**: User activation requires fast initial experience, especially on mobile
- **Measurement**: Lighthouse Performance score >90, First Contentful Paint <1.5s
- **Epic 1 Baseline**: Establishes measurement capability via Vercel Analytics
- **Source**: PRD section "Non-Functional Requirements - Performance"

**Database Query Performance:**
- **Target**: Database queries <500ms for reads, <1s for writes
- **Rationale**: Responsive UI requires fast data access
- **Epic 1 Implementation**: Indexes on user_id, created_at, status ensure efficient queries
- **Measurement**: Supabase dashboard query performance monitoring
- **Source**: PRD NFR section, Architecture patterns

**Static Asset Delivery:**
- **Target**: CSS/JS bundles served via CDN with <100ms response time globally
- **Epic 1 Implementation**: Vercel automatic CDN, automatic code splitting
- **Measurement**: Vercel Analytics edge request metrics
- **Source**: Architecture deployment strategy

### Security

**API Key Protection:**
- **Requirement**: All sensitive API keys (Supabase service role, future Stripe/OpenAI keys) never exposed to client
- **Epic 1 Implementation**:
  - Environment variables in `.env.local` (gitignored)
  - NEXT_PUBLIC_ prefix only for safe public keys (Supabase anon key, Stripe publishable)
  - Server-only keys accessed only in API routes and Server Components
- **Verification**: Code review ensures no server keys in client-side code
- **Source**: PRD NFR Security, Architecture security patterns

**Row Level Security (RLS):**
- **Requirement**: Users can only access their own data (multi-tenant isolation)
- **Epic 1 Implementation**:
  - RLS enabled on all user-facing tables
  - Policies: `auth.uid() = user_id` for all operations
  - Service role bypasses RLS for admin operations
- **Verification**: Test queries with different user contexts, attempt unauthorized access
- **Source**: Architecture database security, ADR-002 Supabase rationale

**HTTPS Everywhere:**
- **Requirement**: All connections encrypted with TLS
- **Epic 1 Implementation**:
  - Vercel enforces HTTPS automatically on all deployments
  - Supabase connections over TLS
  - No HTTP fallback
- **Verification**: All deployed URLs use https:// protocol
- **Source**: PRD NFR Security section

**Authentication Foundation:**
- **Requirement**: Secure authentication infrastructure (implementation in Epic 2)
- **Epic 1 Implementation**:
  - Supabase Auth configured with Google OAuth provider
  - JWT tokens stored in HTTP-only cookies (Supabase default)
  - Session management via Supabase Auth Helpers
- **Verification**: Google OAuth enabled in Supabase dashboard
- **Source**: PRD NFR Security, Architecture ADR-002

**Input Sanitization (Prepared):**
- **Requirement**: All user inputs sanitized to prevent injection attacks
- **Epic 1 Implementation**: Infrastructure ready (PostgreSQL parameterized queries via Supabase SDK)
- **Note**: Actual input handling in Epic 2+ when forms are built
- **Source**: PRD NFR Security, general security best practices

**Secrets Management:**
- **Requirement**: No secrets committed to Git repository
- **Epic 1 Implementation**:
  - `.env.local` in `.gitignore`
  - `.env.example` with placeholder values for documentation
  - Vercel environment variables for production secrets
- **Verification**: Git history scan shows no secrets committed
- **Source**: Architecture security section

### Reliability/Availability

**Deployment Reliability:**
- **Target**: 99.9% successful deployments (Vercel SLA)
- **Epic 1 Implementation**:
  - Automatic rollback on build failures
  - Preview deployments for testing before production
  - Health check via build success
- **Measurement**: Vercel deployment success rate
- **Source**: Architecture deployment strategy

**Database Availability:**
- **Target**: 99.9% uptime (Supabase SLA for paid tier)
- **Epic 1 Implementation**:
  - Supabase managed PostgreSQL with automatic backups
  - Connection pooling via Supabase (handles concurrent connections)
- **Note**: Free tier has lower SLA, production should use paid tier
- **Measurement**: Supabase dashboard uptime metrics
- **Source**: ADR-002 Supabase selection

**Build Failure Recovery:**
- **Requirement**: Build failures don't take down production
- **Epic 1 Implementation**:
  - Vercel keeps previous successful deployment live if new build fails
  - TypeScript/ESLint errors block deployment
  - Build logs available for debugging
- **Verification**: Intentionally break build, verify production stays up
- **Source**: Vercel deployment patterns

**Data Integrity:**
- **Requirement**: No data loss, consistent state
- **Epic 1 Implementation**:
  - PostgreSQL ACID transactions
  - Foreign key constraints enforce referential integrity
  - CHECK constraints (e.g., credit_balance >= 0)
  - Atomic credit deduction stored procedure
- **Verification**: Database constraint tests
- **Source**: Architecture database design

**Graceful Degradation (Foundation):**
- **Requirement**: System handles API failures gracefully (full implementation Epic 3+)
- **Epic 1 Implementation**: Error handling patterns established (try-catch in API routes)
- **Note**: Specific error handling for Suno/OpenAI in future epics
- **Source**: PRD NFR Resilience section

### Observability

**Build and Deployment Logging:**
- **Requirement**: All builds and deployments logged for debugging
- **Epic 1 Implementation**:
  - Vercel automatically logs all builds with timestamps
  - Build output (stdout/stderr) captured
  - Deployment status (success/failure) tracked
- **Access**: Vercel dashboard → Deployments tab
- **Source**: Standard DevOps practices

**Application Logging (Foundation):**
- **Requirement**: Log errors, important events, debugging info (implementation Epic 2+)
- **Epic 1 Implementation**:
  - Console logs captured by Vercel
  - Log format pattern established in architecture
  - Error boundary patterns ready for implementation
- **Epic 2+ Enhancement**: Structured logging with user context, error tracking (Sentry optional)
- **Source**: Architecture logging strategy

**Database Monitoring:**
- **Requirement**: Monitor database performance, query patterns, connection usage
- **Epic 1 Implementation**:
  - Supabase dashboard provides query performance metrics
  - Connection pool usage visible
  - Slow query detection
- **Access**: Supabase dashboard → Database → Performance
- **Source**: Supabase built-in monitoring

**Analytics Foundation:**
- **Requirement**: Track user behavior, page views, errors (implementation Epic 2+)
- **Epic 1 Implementation**:
  - Vercel Analytics enabled (automatic with deployment)
  - Page load performance tracked
  - Core Web Vitals monitored
- **Epic 2+ Enhancement**: Custom event tracking for song generation, sharing
- **Source**: PRD success metrics tracking needs

**Health Checks:**
- **Requirement**: Verify system operational status
- **Epic 1 Implementation**:
  - Vercel deployment success = application healthy
  - Supabase connection test available via SDK
- **Epic 2+ Enhancement**: Dedicated /api/health endpoint checking all dependencies
- **Source**: Standard production monitoring practices

**Error Tracking:**
- **Requirement**: Capture and report application errors
- **Epic 1 Implementation**:
  - Console errors logged to Vercel
  - React error boundaries ready for implementation
- **Epic 2+ Enhancement**: Sentry or similar error tracking (optional)
- **Source**: Architecture error handling patterns

## Dependencies and Integrations

### NPM Dependencies

**Core Framework Dependencies (Story 1.1):**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**Supabase Integration (Story 1.3):**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0"
  }
}
```

**UI Component Dependencies (Story 1.4):**
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.316.0"
  }
}
```

**Version Constraints:**
- Next.js: ^14.2.0 (App Router required, Turbopack support)
- React: ^18.2.0 (Server Components support)
- TypeScript: ^5.3.0 (Latest stable)
- Tailwind: ^3.4.0 (JIT mode, modern features)
- Supabase: ^2.39.0 (Latest Auth Helpers compatibility)

**Dependency Risks:**
- Next.js 15.x breaking changes: Pin to 14.x until Epic 2+ when migration can be evaluated
- Supabase Auth Helpers deprecation warnings: Monitor for v1.0 stable release
- Radix UI updates: shadcn/ui components may require manual updates (not auto-updated)

### External Service Dependencies

**Supabase (Story 1.3, 1.6):**
- **Service**: Managed PostgreSQL database, authentication, storage
- **Version**: PostgreSQL 17
- **Configuration**:
  - Project region: EU or US (closest to target users)
  - Database size: Free tier sufficient for MVP (500MB)
  - Auth providers: Google OAuth enabled
  - Storage buckets: `songs`, `canvases` (private, authenticated access only)
- **Credentials Required**:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (safe for client)
  - SUPABASE_SERVICE_ROLE_KEY (server-only, admin operations)
- **API Rate Limits**: Free tier limits apply (consider paid tier for production)
- **Availability**: 99.9% SLA (paid tier), lower for free tier
- **Cost**: Free tier for development, $25/month Pro tier recommended for production

**Vercel (Story 1.5):**
- **Service**: Hosting, CDN, serverless functions, automatic deployments
- **Configuration**:
  - Framework Preset: Next.js
  - Build Command: `npm run build` (default)
  - Output Directory: `.next` (default)
  - Node.js Version: 18.x or 20.x
  - Environment Variables: All env vars from .env.local
- **Regions**: Automatic (Edge Functions globally), serverless in US/EU
- **API Rate Limits**: Generous on free tier, unlimited on paid
- **Availability**: 99.99% SLA
- **Cost**: Free tier for development/MVP, $20/month Pro tier for custom domain + enhanced features

**Google OAuth (via Supabase, Story 1.3):**
- **Service**: Authentication provider
- **Configuration**:
  - Google Cloud Console project required
  - OAuth consent screen configured
  - Authorized redirect URIs: Supabase callback URL
- **Credentials**: Configured in Supabase dashboard (not directly in app)
- **Availability**: 99.95+ SLA (Google)
- **Cost**: Free

### Integration Patterns

**Supabase Integration Pattern:**
```typescript
// Client-side (React components)
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
const { data, error } = await supabase.from('songs').select('*');

// Server-side (Server Components, API routes)
import { createServerClient } from '@/lib/supabase/server';
const supabase = createServerClient();
const { data, error } = await supabase.from('songs').select('*');
// Automatically applies RLS based on auth.uid()
```

**Environment Variable Access Pattern:**
```typescript
// Public vars (safe for client)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Server-only vars (API routes, Server Components only)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Never accessed in client components!
```

**Vercel Deployment Integration:**
- Git push to main → Automatic build → Automatic deployment
- Git push to feature branch → Preview deployment (shareable URL)
- Build failure → Previous deployment stays live, no downtime
- Environment variables synced from Vercel dashboard

### Future Integration Points (Prepared in Epic 1)

**Stripe (Epic 2):**
- Payment processing for credit purchases
- Webhooks for payment confirmation
- Environment vars prepared: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**OpenAI GPT-4 (Epic 3):**
- Norwegian lyric generation and phonetic optimization
- Environment var prepared: OPENAI_API_KEY

**Suno API (Epic 3):**
- Music generation via sunoapi.org wrapper
- Webhook callback for async completion
- Environment var prepared: SUNO_API_KEY

**Google AI (Epic 3, Epic 6):**
- Gemini for canvas prompt generation
- Google Video API for canvas image generation
- Environment var prepared: GOOGLE_AI_API_KEY

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance Criteria:**

**AC1: Development Environment Operational**
- **Given** a developer with Node.js 18+ installed
- **When** they clone the repository and run `npm install && npm run dev`
- **Then** the development server starts successfully on http://localhost:3000
- **And** no TypeScript compilation errors occur
- **And** the default Next.js page renders correctly
- **Source**: Story 1.1 acceptance criteria

**AC2: Tailwind Theme Configured**
- **Given** the project with Tailwind installed
- **When** a developer uses `bg-primary`, `text-secondary`, or `bg-accent` classes
- **Then** the Playful Nordic colors (#E94560, #0F3460, #FFC93C) are applied correctly
- **And** color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for text)
- **And** mobile-first breakpoints (<640px, 640-1024px, >1024px) work as expected
- **Verification**: Manual test with sample component, Lighthouse accessibility check
- **Source**: Story 1.2 acceptance criteria

**AC3: Supabase Backend Connected**
- **Given** Supabase project credentials in .env.local
- **When** the application makes a test query to Supabase
- **Then** the connection succeeds and returns data
- **And** Google OAuth provider is enabled in Supabase Auth settings
- **And** Storage buckets `songs` and `canvases` exist with private access
- **Verification**: Test Supabase client initialization, check dashboard configuration
- **Source**: Story 1.3 acceptance criteria

**AC4: shadcn/ui Components Installed**
- **Given** shadcn/ui initialized in the project
- **When** a developer imports Button, Card, Dialog, or other base components
- **Then** components render correctly with Playful Nordic theme colors
- **And** all components are keyboard accessible (Tab navigation works)
- **And** components are located in /src/components/ui/ directory
- **Verification**: Render each component in test page, keyboard navigation test
- **Source**: Story 1.4 acceptance criteria

**AC5: Vercel Deployment Active**
- **Given** the repository connected to Vercel
- **When** a commit is pushed to the main branch
- **Then** Vercel automatically builds and deploys the application
- **And** the production URL is accessible via HTTPS
- **And** Environment variables from Vercel dashboard are available at runtime
- **And** Build completes successfully with `npm run build`
- **Verification**: Push test commit, verify deployment success in Vercel dashboard
- **Source**: Story 1.5 acceptance criteria

**AC6: Database Schema Created**
- **Given** Supabase project with migrations applied
- **When** querying the database schema
- **Then** all tables exist: user_profile, song, credit_transaction, genre, mastering_request
- **And** Row Level Security is enabled on all user-facing tables
- **And** RLS policies enforce `auth.uid() = user_id` access control
- **And** Indexes exist on user_id, created_at, status columns
- **And** Stored procedure `deduct_credits()` exists and functions correctly
- **Verification**: Query pg_tables, test RLS with different user contexts, verify indexes
- **Source**: Story 1.6 acceptance criteria

**AC7: TypeScript Types Generated**
- **Given** database schema is finalized
- **When** TypeScript types are generated from Supabase schema
- **Then** /src/types/supabase.ts file contains all table types
- **And** Supabase client queries are type-safe (TypeScript autocomplete works)
- **Verification**: Import types, verify autocomplete in IDE
- **Source**: Story 1.6 technical notes

**AC8: Build Succeeds Without Errors**
- **Given** all stories 1.1-1.6 completed
- **When** running `npm run build` in CI or locally
- **Then** build completes successfully with exit code 0
- **And** no TypeScript errors reported
- **And** no ESLint errors reported (warnings acceptable)
- **Verification**: CI build log, local build test
- **Source**: Epic-level success criteria

## Traceability Mapping

| Acceptance Criteria | Spec Section(s) | Component(s)/Module(s) | Test Approach |
|---------------------|----------------|------------------------|---------------|
| **AC1: Dev Environment Operational** | Overview, Detailed Design (Services) | Next.js App Router, npm scripts | Manual: Run `npm run dev`, verify localhost:3000 loads. Automated: CI build check. |
| **AC2: Tailwind Theme Configured** | System Architecture Alignment (Design System), NFR Performance | tailwind.config.ts, /src/app/globals.css | Manual: Create test page with theme classes, verify colors. Automated: Lighthouse accessibility check (contrast). |
| **AC3: Supabase Backend Connected** | Detailed Design (Services, Data Models), NFR Security (RLS) | /src/lib/supabase/client.ts, /src/lib/supabase/server.ts, Supabase project | Manual: Test query in dev tools, inspect Supabase dashboard. Automated: Integration test (query test table). |
| **AC4: shadcn/ui Components Installed** | System Architecture Alignment (Design System), Detailed Design (Services) | /src/components/ui/* (Button, Card, Dialog, etc.) | Manual: Render components in test page, Tab navigation. Automated: Axe accessibility tests. |
| **AC5: Vercel Deployment Active** | NFR Reliability (Deployment), Detailed Design (Workflows) | Vercel platform, .vercel config, environment variables | Manual: Push commit, verify deployment URL loads. Automated: Vercel health check API. |
| **AC6: Database Schema Created** | Detailed Design (Data Models), NFR Security (RLS) | Supabase PostgreSQL: user_profile, song, credit_transaction, genre, mastering_request tables | Manual: Query pg_tables, test RLS policies. Automated: Migration test script, constraint violation tests. |
| **AC7: TypeScript Types Generated** | Detailed Design (APIs and Interfaces) | /src/types/supabase.ts, Supabase SDK | Manual: Import types, verify IDE autocomplete. Automated: TypeScript compilation check. |
| **AC8: Build Succeeds** | Overview (Success Criteria), NFR Performance | Entire project, Next.js build pipeline | Automated: CI build job, `npm run build` exit code check. |

**Traceability to PRD Functional Requirements:**

Epic 1 is **infrastructure-only** and does not directly implement end-user functional requirements (FR1-FR70). However, it establishes the foundation for all FRs:

- **FR1-FR4 (User Account & Authentication)**: Database schema (user_profile table), Supabase Auth infrastructure
- **FR5-FR70 (All Feature Requirements)**: Project structure, UI component library, deployment pipeline enable all future feature development

**Traceability to Architecture Decisions:**

| ADR | Epic 1 Implementation | Verification |
|-----|----------------------|--------------|
| ADR-001: create-next-app starter | Story 1.1 | Verify Next.js 14+, TypeScript, Tailwind installed |
| ADR-002: Supabase backend | Story 1.3, 1.6 | Verify database accessible, RLS active |
| ADR-003: Zustand state management | Not in Epic 1 (Epic 2+) | N/A |
| ADR-004: shadcn/ui components | Story 1.4 | Verify components in /src/components/ui/ |
| ADR-005: Pre-paid credit system | Database schema (credit_transaction, deduct_credits function) | Verify table + stored procedure exist |
| ADR-006: GPT-4 pronunciation | Not in Epic 1 (Epic 3) | N/A |
| ADR-007: Async song generation | Database schema (song.status field) | Verify song table has status enum |
| ADR-008: Stripe Checkout | Not in Epic 1 (Epic 2) | N/A |

**Traceability to UX Design:**

| UX Specification | Epic 1 Implementation | Verification |
|------------------|----------------------|--------------|
| Playful Nordic Color Theme | Story 1.2 (Tailwind config) | Verify #E94560, #0F3460, #FFC93C colors |
| shadcn/ui Design System | Story 1.4 | Verify base components installed |
| Mobile-first breakpoints | Story 1.2 (Tailwind config) | Verify <640px, 640-1024px, >1024px breakpoints |
| WCAG 2.1 AA compliance | Story 1.2 (color contrast), Story 1.4 (accessible components) | Lighthouse accessibility score >90 |
| Inter typography | Story 1.2 (Tailwind config) | Verify font family configured |

## Risks, Assumptions, Open Questions

### Risks

**RISK-1: Dependency Version Conflicts**
- **Description**: NPM dependencies (Next.js 14, React 18, Supabase SDK, Radix UI) may have conflicting peer dependencies causing installation failures
- **Likelihood**: Medium (common in modern npm ecosystems)
- **Impact**: High (blocks development start)
- **Mitigation**:
  - Use exact versions from architecture document initially
  - Test `npm install` on clean environment before considering Epic 1 complete
  - Document working dependency tree in package-lock.json
  - Use Node.js 18.x or 20.x LTS (avoid bleeding edge)
- **Contingency**: If conflicts arise, use npm `--legacy-peer-deps` flag temporarily, investigate root cause, file issues with library maintainers
- **Owner**: Dev team
- **Status**: Open (will be resolved during Story 1.1-1.4)

**RISK-2: Supabase Free Tier Limitations**
- **Description**: Supabase free tier has limits (500MB database, paused after 1 week inactivity, lower SLA) that may impact MVP testing
- **Likelihood**: High (free tier limits are real)
- **Impact**: Medium (development slowdown, not total blocker)
- **Mitigation**:
  - Use free tier for initial development (acceptable for Epic 1)
  - Plan to upgrade to Pro tier ($25/month) before public MVP launch
  - Monitor database size and connection usage in Supabase dashboard
  - Keep projects active (query database weekly to prevent pause)
- **Contingency**: If free tier limits hit during Epic 1, upgrade to Pro immediately (cost acceptable for bootstrap model)
- **Owner**: Project lead (BIP)
- **Status**: Accepted risk (monitored)

**RISK-3: Vercel Free Tier Build Time Limits**
- **Description**: Vercel free tier limits build minutes (6,000 minutes/month), excessive rebuilds could exhaust quota
- **Likelihood**: Low (quota generous for small team)
- **Impact**: Medium (deployment blocked until next month)
- **Mitigation**:
  - Use preview deployments sparingly (not for every commit, only for PRs)
  - Encourage local testing before pushing
  - Monitor build minute usage in Vercel dashboard
- **Contingency**: Upgrade to Pro tier ($20/month) if quota exhausted
- **Owner**: Dev team
- **Status**: Accepted risk (monitored)

**RISK-4: Google OAuth Configuration Errors**
- **Description**: Google Cloud Console OAuth setup is complex, misconfiguration could prevent authentication testing in Epic 2
- **Likelihood**: Medium (common first-time setup issue)
- **Impact**: Medium (blocks Epic 2 auth testing, but doesn't block Epic 1)
- **Mitigation**:
  - Follow Supabase Google OAuth setup guide precisely
  - Verify authorized redirect URIs match Supabase callback URL exactly
  - Test OAuth flow immediately after setup (create test user)
- **Contingency**: If OAuth fails, use Supabase Magic Link (email) as temporary auth method for Epic 2 testing
- **Owner**: Dev implementing Story 1.3
- **Status**: Open (will be addressed in Story 1.3)

**RISK-5: Database Migration Errors**
- **Description**: SQL schema from architecture.md may have syntax errors or missing dependencies causing migration failure
- **Likelihood**: Medium (schema is comprehensive, typos possible)
- **Impact**: High (blocks database-dependent testing)
- **Mitigation**:
  - Test schema in Supabase SQL Editor before creating migration
  - Apply schema incrementally (create tables first, then RLS policies, then functions)
  - Verify foreign key references exist before applying constraints
- **Contingency**: If migration fails, roll back, fix SQL, reapply migration
- **Owner**: Dev implementing Story 1.6
- **Status**: Open (will be addressed in Story 1.6)

### Assumptions

**ASSUMPTION-1: Node.js 18+ Available**
- **Assumption**: Developers have Node.js 18.x or 20.x LTS installed locally
- **Validation**: Document required Node version in README, verify in CI
- **Risk if Invalid**: Build failures, dependency issues
- **Source**: Next.js 14 requirements

**ASSUMPTION-2: Git Repository Initialized**
- **Assumption**: Project will be in a Git repository from the start (for Vercel integration)
- **Validation**: `git init` as first step before Story 1.1
- **Risk if Invalid**: Can't deploy to Vercel (Git required)
- **Source**: Vercel deployment requirements

**ASSUMPTION-3: Supabase Project Creation Manual**
- **Assumption**: Supabase project creation will be done manually via Supabase dashboard (not automated via CLI)
- **Validation**: Story 1.3 includes manual steps
- **Risk if Invalid**: None, automation can be added later
- **Source**: Simplest approach for single project

**ASSUMPTION-4: No Custom Domain Yet**
- **Assumption**: Epic 1 uses default Vercel subdomain (*.vercel.app), custom domain (musikkfabrikken.no) configured post-MVP
- **Validation**: Custom domain is out-of-scope for Epic 1
- **Risk if Invalid**: None, domain can be added anytime
- **Source**: Bootstrap MVP approach

**ASSUMPTION-5: Single Developer Initially**
- **Assumption**: Epic 1 implemented by one developer (no concurrent work, no merge conflicts)
- **Validation**: Story sequence (1.1 → 1.2 → 1.3 → {1.4, 1.5, 1.6}) is linear
- **Risk if Invalid**: If multiple devs work in parallel, may need branch coordination
- **Source**: Typical solo founder bootstrap

**ASSUMPTION-6: English Comments and Code**
- **Assumption**: All code comments, variable names, and technical documentation in English (Norwegian UI is Epic 7 post-MVP)
- **Validation**: PRD specifies English acceptable for MVP
- **Risk if Invalid**: None, Norwegian audience is bilingual
- **Source**: PRD localization scope

### Open Questions

**QUESTION-1: Supabase Region Selection**
- **Question**: Should Supabase project be in EU region (closer to Norway) or US region (potentially lower latency to Vercel)?
- **Impact**: Latency for database queries, GDPR compliance
- **Recommendation**: **EU region** for GDPR compliance (Norway is European market)
- **Decision Needed By**: Story 1.3 (Supabase project creation)
- **Decision Maker**: BIP (project lead)

**QUESTION-2: Vercel Project Name**
- **Question**: What should the Vercel project be named (affects default URL: <name>.vercel.app)?
- **Impact**: Public-facing URL until custom domain configured
- **Recommendation**: `musikkfabrikken` (matches brand)
- **Decision Needed By**: Story 1.5 (Vercel deployment setup)
- **Decision Maker**: BIP (project lead)

**QUESTION-3: Should Database Migrations Be Versioned?**
- **Question**: Should database schema changes be tracked as versioned migration files (best practice) or applied directly via Supabase SQL Editor?
- **Impact**: Reproducibility, rollback capability, team collaboration
- **Recommendation**: **Versioned migrations** (create /supabase/migrations/ directory, use Supabase CLI)
- **Decision Needed By**: Story 1.6 (database schema setup)
- **Decision Maker**: Dev implementing 1.6

**QUESTION-4: Install Supabase CLI Locally?**
- **Question**: Should developers install Supabase CLI for local database development (optional but recommended)?
- **Impact**: Local testing capability, type generation convenience
- **Recommendation**: **Yes, optional** - Install globally (`npm install -g supabase`), document in README
- **Decision Needed By**: Story 1.6
- **Decision Maker**: Dev implementing 1.6

**QUESTION-5: Setup CI/CD Beyond Vercel?**
- **Question**: Should Epic 1 include GitHub Actions or other CI/CD (e.g., automated tests, linting) beyond Vercel automatic deployment?
- **Impact**: Code quality enforcement, automated testing
- **Recommendation**: **Defer to Epic 2** - Vercel automatic deployment sufficient for Epic 1, add CI/CD when tests are written
- **Decision Needed By**: End of Epic 1
- **Decision Maker**: BIP (project lead)

## Test Strategy Summary

### Testing Approach for Epic 1

Epic 1 is **infrastructure-focused**, not feature-focused. Testing validates that the development environment, deployment pipeline, and database foundation work correctly.

**Testing Pyramid for Epic 1:**
- **Manual Verification**: 70% (infrastructure setup inherently manual)
- **Integration Tests**: 20% (database queries, Supabase connection)
- **Automated Checks**: 10% (build success, TypeScript compilation)

### Test Types and Coverage

**1. Manual Verification Tests (Primary for Epic 1)**

**Story 1.1: Project Initialization**
- **Test**: Run `npm install && npm run dev`, verify localhost:3000 loads
- **Expected**: Default Next.js page displays, no console errors
- **Verifier**: Developer implementing story

**Story 1.2: Tailwind Theme**
- **Test**: Create `/src/app/test-theme/page.tsx` with all theme colors, verify rendering
- **Expected**: Colors match Playful Nordic spec (#E94560, #0F3460, #FFC93C)
- **Tool**: Chrome DevTools color picker, manual visual inspection
- **Verifier**: Developer implementing story

**Story 1.3: Supabase Connection**
- **Test**: Create test query in page component: `supabase.from('users').select('*')`
- **Expected**: Connection succeeds (or returns empty array if no data), no auth errors
- **Tool**: Browser DevTools console
- **Verifier**: Developer implementing story

**Story 1.4: shadcn/ui Components**
- **Test**: Create `/src/app/test-components/page.tsx`, render Button, Card, Dialog, etc.
- **Expected**: All components render without errors, theme colors applied
- **Tool**: Browser visual inspection, DevTools
- **Verifier**: Developer implementing story

**Story 1.5: Vercel Deployment**
- **Test**: Push commit to main, wait for Vercel deployment, visit production URL
- **Expected**: Live site loads, HTTPS active, environment variables accessible
- **Tool**: Vercel dashboard, browser
- **Verifier**: Developer implementing story

**Story 1.6: Database Schema**
- **Test**: Run SQL queries in Supabase SQL Editor:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  SELECT * FROM user_profile LIMIT 1;
  SELECT deduct_credits FROM pg_proc; -- verify function exists
  ```
- **Expected**: All tables exist, RLS policies active (query returns auth error if not authenticated)
- **Tool**: Supabase SQL Editor
- **Verifier**: Developer implementing story

**2. Automated Checks**

**Build Success Check (All Stories):**
```bash
npm run build
# Expected: Exit code 0, no TypeScript errors
```
- **Run By**: CI (Vercel automatic), local pre-commit
- **Frequency**: Every commit

**TypeScript Type Check:**
```bash
npx tsc --noEmit
# Expected: No errors reported
```
- **Run By**: Local pre-commit hook (optional), CI
- **Frequency**: Every commit

**ESLint Check:**
```bash
npm run lint
# Expected: No errors (warnings acceptable)
```
- **Run By**: Local pre-commit hook (optional), Vercel build
- **Frequency**: Every commit

**3. Integration Tests (Limited in Epic 1)**

**Supabase Connection Test:**
```typescript
// /src/__tests__/integration/supabase.test.ts
import { createServerClient } from '@/lib/supabase/server';

test('Supabase client initializes successfully', async () => {
  const supabase = createServerClient();
  expect(supabase).toBeDefined();
});

test('Can query public schema', async () => {
  const supabase = createServerClient();
  const { error } = await supabase.from('genre').select('id').limit(1);
  expect(error).toBeNull();
});
```
- **Run By**: Developer manually (no CI in Epic 1)
- **Frequency**: After Story 1.3, 1.6
- **Tool**: Jest or Vitest (install if desired, optional for Epic 1)

**4. Accessibility Testing**

**WCAG Color Contrast Check:**
- **Tool**: Lighthouse (Chrome DevTools), axe DevTools browser extension
- **Test**: Run Lighthouse on test page with theme colors
- **Expected**: Accessibility score >90, no contrast violations
- **Verifier**: Developer implementing Story 1.2

**Keyboard Navigation Check (shadcn/ui):**
- **Test**: Tab through all components on test page
- **Expected**: All interactive elements (buttons, inputs, dialogs) focusable, visible focus indicators
- **Tool**: Manual keyboard testing
- **Verifier**: Developer implementing Story 1.4

### Test Execution Plan

**During Story Implementation:**
1. Developer implements story
2. Developer runs manual verification test for that story
3. Developer verifies `npm run build` succeeds
4. Developer commits (triggers Vercel build)

**Epic 1 Completion Checklist:**
- [ ] All 6 stories (1.1-1.6) manual tests passed
- [ ] `npm run build` succeeds with exit code 0
- [ ] Vercel deployment accessible via HTTPS
- [ ] Supabase database accessible, all tables exist
- [ ] shadcn/ui components render correctly with theme colors
- [ ] Lighthouse accessibility score >90 on test page
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`

**Test Artifacts:**
- Manual test results: Documented in PR descriptions or Story completion notes
- Build logs: Vercel dashboard (automatic)
- Lighthouse report: Screenshot saved to `/docs/test-results/epic-1-lighthouse.png` (optional)

### Future Testing Enhancements (Epic 2+)

**Unit Tests:**
- Test utility functions (e.g., phonetic optimizer, credit calculator) - Epic 3
- Test React component logic with React Testing Library - Epic 2+

**Integration Tests:**
- Test API routes (song generation, credit deduction) - Epic 3
- Test database queries with test data - Epic 2+

**End-to-End Tests:**
- Playwright or Cypress tests for critical user flows - Epic 3+
- Song creation flow, payment flow, sharing flow

**CI/CD Enhancements:**
- GitHub Actions for automated test runs
- Pre-commit hooks for linting and type checks
- Automated accessibility checks on every PR

### Definition of Done (Epic 1)

Epic 1 is considered **DONE** when:

1. ✅ All 8 acceptance criteria (AC1-AC8) verified and passed
2. ✅ All manual verification tests passed for stories 1.1-1.6
3. ✅ Production deployment accessible on Vercel with HTTPS
4. ✅ Database schema applied, all tables queryable
5. ✅ Build succeeds without TypeScript or ESLint errors
6. ✅ Lighthouse accessibility score >90 on test page
7. ✅ Documentation updated: README with setup instructions, .env.example created
8. ✅ Epic status updated to "contexted" in sprint-status.yaml (automated by this workflow)
