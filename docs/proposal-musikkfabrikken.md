# Technical Proposal: Musikkfabrikken

**Project:** Musikkfabrikken - Norwegian AI Music Platform
**Date:** 2025-11-19
**Author:** Tony
**Status:** Technical Proposal for Development Team
**Type:** Greenfield Web Application

---

## Executive Summary

**Musikkfabrikken** is a Norwegian-first AI music generation platform that solves a critical quality gap: existing AI music tools like Suno produce Norwegian vocals that sound "very American, bad, and fake" due to phonetic mispronunciations.

This technical proposal outlines the architecture, technology stack, and implementation approach for building an MVP that enables amateur creators and entry-level artists to generate authentic-sounding Norwegian music through intelligent orchestration of existing AI APIs with Norwegian-specific optimization layers.

**Core Technical Challenge:** Transform Suno AI's English-optimized output into authentically Norwegian-sounding music through prompt engineering and phonetic intelligence, delivered via a user-friendly web application with robust credit management and API orchestration.

**Target Delivery:** MVP launch within 2-3 months with core features: Norwegian pronunciation optimization, pre-paid credit system, song generation, and user authentication.

---

## Problem Statement

### Technical Problem

**Current State:**
- AI music generation platforms (Suno, Udio) are optimized for English phonetics
- Norwegian pronunciation requires expert-level phonetic spelling manipulation
- No programmatic solutions exist for Norwegian language optimization
- Manual workarounds are time-consuming and require linguistic expertise

**Technical Gaps:**
1. **Phonetic Layer Missing:** No abstraction layer exists between user input (standard Norwegian) and AI model input (phonetically optimized Norwegian)
2. **API Complexity:** Users must directly interface with complex AI music APIs (Suno) without guidance
3. **Economic Model:** Pay-per-use APIs create unpredictable costs for users
4. **Quality Inconsistency:** No systematic approach to improving/validating Norwegian pronunciation quality

### User Impact

**Primary Users:** Amateur party song creators (25-50 years old)
- Creating personalized Norwegian songs for weddings, birthdays, family events
- Need "good enough" quality quickly without technical expertise
- Budget-conscious for casual use cases

**Secondary Users:** Entry-level Spotify artists (18-35 years old)
- Building Norwegian music catalogs with sub-10k listener goals
- Need cost-effective, consistent quality for frequent releases

---

## Proposed Solution

### Solution Architecture

**High-Level Approach:**
Musikkfabrikken acts as an intelligent orchestration layer that:
1. Accepts standard Norwegian Bokmål lyrics from users
2. Applies proven phonetic optimization techniques (validated at 80k listener scale)
3. Orchestrates multiple AI APIs (Suno via sunoapi.org, GPT-4, Gemini) with Norwegian-specific parameters
4. Manages credit-based economics to abstract API costs from users
5. Delivers authentic-sounding Norwegian music via simple web interface

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│              (Next.js Frontend - React/TypeScript)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   API ORCHESTRATION LAYER                    │
│                  (Next.js API Routes - Server)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication & Authorization (Supabase Auth)      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Credit Management (PostgreSQL - Atomic Transactions)│  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Phonetic Intelligence Engine (Norwegian Rules)      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  External API Orchestration & Error Handling         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────┐
        ↓                  ↓                  ↓              ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ sunoapi.org  │  │   GPT-4      │  │    Gemini    │  │   Stripe     │
│ (Suno API    │  │  (Lyrics     │  │  (Canvas     │  │  (Payments)  │
│  Wrapper)    │  │ Processing)  │  │  Generation) │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────┐
│               STORAGE & PERSISTENCE LAYER                    │
│                    (Supabase Backend)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Users, Credits, Song Metadata) │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Object Storage (Audio Files - 14-day retention)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Phonetic Intelligence Engine
**Purpose:** Transform standard Norwegian text into phonetically optimized input for Suno AI

**Technical Approach:**
- Rule-based phonetic transformations for Norwegian Bokmål
- Pattern matching for common pronunciation pitfalls (rolled R's, vowel patterns, consonant clusters)
- Visual diff generation showing before/after transformations
- Per-line override capability for edge cases (proper nouns, intentional English phrases)

**Implementation:**
```typescript
interface PhoneticTransform {
  original: string;
  transformed: string;
  rules_applied: string[];
  confidence: number;
}

function applyNorwegianPhonetics(lyrics: string, options?: {
  enableToggle: boolean;
  overrides?: Map<number, string>;
}): PhoneticTransform[];
```

**Key Technical Decisions:**
- Client-side preview generation for instant feedback
- Server-side application for actual API calls (security)
- Deterministic transformations (same input = same output)

#### 2. Credit Management System
**Purpose:** Pre-paid credit model providing economic resilience and predictable costs

**Technical Requirements:**
- **Atomic Transactions:** Credit deduction must be atomic with song generation initiation
- **Rollback Logic:** Failed API calls must trigger credit refund
- **Audit Trail:** All credit transactions logged for debugging and support
- **Balance Checks:** Pre-flight validation before expensive API calls

**Database Schema (PostgreSQL):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  credit_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,  -- Negative for deductions, positive for purchases
  transaction_type VARCHAR(50), -- 'purchase', 'deduction', 'refund'
  related_song_id UUID,
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  original_lyrics TEXT,
  phonetic_lyrics TEXT,
  suno_task_id VARCHAR(255),
  suno_model_version VARCHAR(20),
  audio_url TEXT,
  credits_used INTEGER,
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP  -- 14-day auto-deletion
);
```

**Transaction Flow:**
```typescript
async function generateSongWithCredits(userId: string, lyrics: string) {
  const tx = await db.transaction();

  try {
    // 1. Check balance
    const user = await tx.users.findUnique({ where: { id: userId }});
    if (user.credit_balance < SONG_GENERATION_COST) {
      throw new InsufficientCreditsError();
    }

    // 2. Deduct credits atomically
    await tx.creditTransactions.create({
      user_id: userId,
      amount: -SONG_GENERATION_COST,
      transaction_type: 'deduction'
    });

    await tx.users.update({
      where: { id: userId },
      data: { credit_balance: { decrement: SONG_GENERATION_COST }}
    });

    // 3. Call Suno API
    const result = await sunoapi.generateSong(lyrics);

    // 4. Save song record
    const song = await tx.songs.create({
      user_id: userId,
      suno_task_id: result.task_id,
      credits_used: SONG_GENERATION_COST,
      status: 'processing'
    });

    await tx.commit();
    return song;

  } catch (error) {
    await tx.rollback();  // Credits restored on failure
    throw error;
  }
}
```

#### 3. API Orchestration Layer
**Purpose:** Reliable integration with third-party APIs with error handling and monitoring

**Critical Dependencies:**
- **sunoapi.org** (third-party Suno wrapper): $0.06/song, 99.9% uptime SLA
- **OpenAI GPT-4**: Lyrics processing and enhancement
- **Google Gemini + Video API**: Canvas generation (optional feature)
- **Stripe**: Payment processing

**Key Technical Challenges:**

**Challenge 1: Third-Party API Wrapper Dependency**
- **Risk:** sunoapi.org is intermediary, not official Suno API
- **Mitigation:**
  - Webhook-based completion tracking (async pattern)
  - Polling fallback if webhooks fail
  - Immediate file download (sunoapi.org deletes after 3 days)
  - Monitor for official Suno API availability

**Challenge 2: File Lifecycle Management**
- **Constraint:** sunoapi.org auto-deletes files after 3 days
- **Solution:** Immediate transfer to Supabase Storage upon completion
- **Implementation:**
```typescript
async function handleSunoWebhook(taskId: string, audioUrl: string) {
  // 1. Download from sunoapi.org immediately
  const audioBuffer = await fetch(audioUrl).then(r => r.arrayBuffer());

  // 2. Upload to Supabase Storage with 14-day retention
  const { data, error } = await supabase.storage
    .from('songs')
    .upload(`${userId}/${songId}.mp3`, audioBuffer, {
      cacheControl: '604800',  // 7 days
      upsert: false
    });

  // 3. Generate signed URL (expires in 14 days)
  const { data: signedUrl } = await supabase.storage
    .from('songs')
    .createSignedUrl(data.path, 1209600);  // 14 days in seconds

  // 4. Update song record
  await db.songs.update({
    where: { suno_task_id: taskId },
    data: {
      audio_url: signedUrl.signedUrl,
      status: 'completed',
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });
}
```

**Challenge 3: Cost Monitoring & Circuit Breaking**
```typescript
// Daily cost monitoring
interface CostAlert {
  daily_limit: number;  // e.g., $50/day
  current_spend: number;
  alert_threshold: number;  // e.g., 80% of daily limit
}

async function checkCostCircuitBreaker() {
  const today = new Date().toISOString().split('T')[0];
  const todaySpend = await calculateDailyAPISpend(today);

  if (todaySpend > DAILY_COST_LIMIT * 0.8) {
    await sendAlert('Approaching daily API cost limit');
  }

  if (todaySpend > DAILY_COST_LIMIT) {
    throw new CircuitBreakerError('Daily cost limit exceeded');
  }
}
```

#### 4. User Experience Flow

**Primary Flow: Song Generation**
```
1. User Authentication (Google OAuth via Supabase)
   ↓
2. Dashboard (Credit Balance + Song History)
   ↓
3. Song Creation Interface
   - Input: Norwegian lyrics (textarea)
   - Input: Genre/style preferences (dropdown)
   - Toggle: "Uttalelse Bokmål" phonetic optimization
   ↓
4. Phonetic Preview (if toggle enabled)
   - Side-by-side diff view
   - Per-line override controls
   - User approves/modifies
   ↓
5. Generation Initiation
   - Pre-flight credit check
   - Loading state with estimated time (1-3 minutes)
   - Atomic credit deduction
   ↓
6. Processing (Webhook-driven)
   - Real-time status updates via polling or WebSocket
   - Handle Suno API async completion
   - Automatic file download to Supabase
   ↓
7. Completion
   - Audio player with waveform visualization
   - Download options (MP3)
   - Share options (social media)
   - Optional: Canvas generation (+20 credits)
   - Optional: Mastering service booking (+100 credits)
```

**Free Tier Flow:**
- 1× 30-second watermarked preview clip
- Demonstrates pronunciation quality
- Clear upgrade CTA to full song generation

---

## Technology Stack

### Frontend Architecture

**Framework: Next.js 14+ (App Router)**
- **Rationale:**
  - Unified full-stack framework (frontend + backend in one codebase)
  - Server-side rendering for better SEO in Norwegian market
  - API routes eliminate need for separate backend (Express/Fastify)
  - Built-in optimizations (image optimization, code splitting)
  - Simple deployment (single Vercel deployment)

**Core Libraries:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "latest",  // shadcn UI components
    "howler": "^2.2.0",              // Audio playback
    "@supabase/supabase-js": "^2.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "zod": "^3.0.0"                  // Schema validation
  }
}
```

**UI Components:**
- **shadcn UI** (Radix UI primitives): Accessible, customizable components
- **Tailwind CSS**: Rapid styling with utility-first approach
- **Lucide Icons**: Consistent iconography

**State Management:**
- React Context for global state (auth, credits)
- React Query for server state management (songs, API calls)
- Local component state for UI interactions

### Backend Architecture

**Pattern: Next.js API Routes (Serverless Functions)**

**Why not separate Express/Fastify backend:**
- Eliminates deployment complexity (one app vs. two)
- No CORS configuration needed (same origin)
- Automatic TypeScript type sharing between frontend/backend
- Serverless auto-scaling (no manual infrastructure management)

**File Structure:**
```
app/
├── api/
│   ├── auth/
│   │   └── callback/route.ts          # Supabase OAuth callback
│   ├── songs/
│   │   ├── generate/route.ts          # POST /api/songs/generate
│   │   ├── [id]/route.ts              # GET /api/songs/:id
│   │   └── list/route.ts              # GET /api/songs/list
│   ├── credits/
│   │   ├── balance/route.ts           # GET /api/credits/balance
│   │   └── purchase/route.ts          # POST /api/credits/purchase
│   ├── phonetics/
│   │   └── preview/route.ts           # POST /api/phonetics/preview
│   └── webhooks/
│       ├── sunoapi/route.ts           # POST /api/webhooks/sunoapi
│       └── stripe/route.ts            # POST /api/webhooks/stripe
```

**Example API Route (Song Generation):**
```typescript
// app/api/songs/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse request body
  const { lyrics, genre, enablePhonetics } = await request.json();

  // 3. Apply phonetic transformation
  const optimizedLyrics = enablePhonetics
    ? applyNorwegianPhonetics(lyrics)
    : lyrics;

  // 4. Generate song with credit transaction
  try {
    const song = await generateSongWithCredits(user.id, optimizedLyrics, genre);
    return NextResponse.json({ song }, { status: 200 });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
```

### Database & Infrastructure

**Primary: Supabase (All-in-One Platform)**

**Services Used:**
1. **PostgreSQL Database**
   - User accounts, credit balances, song metadata
   - Transactional integrity for credit management
   - Row-level security (RLS) for data isolation

2. **Authentication**
   - Google OAuth integration
   - JWT-based session management
   - Automatic user creation on signup

3. **Object Storage**
   - Audio file storage (MP3 format)
   - 14-day automatic deletion via lifecycle policies
   - Signed URLs for secure download (no public access)

4. **Real-time (Future)**
   - WebSocket connections for live song generation status
   - Optional: collaborative features in Phase 2

**Storage Strategy:**
```typescript
// Supabase Storage Bucket Configuration
{
  "name": "songs",
  "public": false,  // No public access - signed URLs only
  "fileSizeLimit": 10485760,  // 10MB per file
  "allowedMimeTypes": ["audio/mpeg", "audio/wav"],
  "lifecycleRules": [{
    "action": "delete",
    "conditions": {
      "age": 14  // Auto-delete after 14 days
    }
  }]
}
```

**Alternative Consideration (if Supabase limits hit):**
- **Database:** PlanetScale or Neon (PostgreSQL)
- **Storage:** Vercel Blob Storage or AWS S3
- **Auth:** Auth0 or Clerk
- **Trade-off:** More control, potentially cheaper at scale, but more complexity

### Deployment Architecture

**Platform: Vercel (Primary Recommendation)**

**Why Vercel:**
- Zero-config Next.js deployment
- Automatic serverless function generation from API routes
- Global CDN for static assets
- Preview deployments for every Git branch
- Environment variable management
- Built-in monitoring and analytics

**Deployment Flow:**
```bash
# Development
npm run dev  # localhost:3000

# Preview (automatic on Git push to branch)
git push origin feature/phonetic-engine
# Vercel automatically deploys to preview URL

# Production
git push origin main
# Vercel automatically deploys to production (musikkfabrikken.no)
```

**Environment Variables (Vercel):**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only

# sunoapi.org
SUNOAPI_API_KEY=xxx
SUNOAPI_BASE_URL=https://api.sunoapi.org/v1

# OpenAI
OPENAI_API_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx

# Application
NEXT_PUBLIC_APP_URL=https://musikkfabrikken.no
```

**Alternative: Netlify**
- Similar features to Vercel
- Slightly different pricing model
- Good Next.js support

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals:** Project setup, authentication, basic UI

**Tasks:**
1. **Project Initialization**
   - Create Next.js 14 project with TypeScript
   - Configure Tailwind CSS and shadcn UI
   - Set up Git repository and Vercel deployment
   - Configure ESLint, Prettier, Husky (pre-commit hooks)

2. **Authentication System**
   - Supabase project setup
   - Google OAuth configuration
   - Protected route middleware
   - User profile page

3. **Database Schema**
   - Users table with credit balance
   - Credit transactions table
   - Songs table with metadata
   - Database migrations setup (Supabase CLI or Prisma)

4. **Core UI Components**
   - Layout (header, navigation, footer)
   - Dashboard skeleton
   - Song creation form (basic)
   - Audio player component

**Deliverable:** Authenticated app with empty dashboard

### Phase 2: Phonetic Engine (Weeks 2-3)

**Goals:** Norwegian pronunciation optimization core functionality

**Tasks:**
1. **Phonetic Rules Implementation**
   - Research and document Norwegian Bokmål phonetic patterns
   - Implement rule-based transformation engine
   - Unit tests for common pronunciation cases
   - Edge case handling (proper nouns, English phrases)

2. **UI Integration**
   - "Uttalelse Bokmål" toggle component
   - Side-by-side diff viewer (before/after)
   - Per-line override controls
   - Visual feedback on transformations applied

3. **API Endpoint**
   - `/api/phonetics/preview` - client-side preview generation
   - Server-side validation before Suno API calls

**Deliverable:** Working phonetic transformation with visual preview

### Phase 3: Credit System (Week 3)

**Goals:** Pre-paid credit purchase and management

**Tasks:**
1. **Stripe Integration**
   - Create Stripe products for credit packages (Starter/Pro/Premium)
   - Checkout session creation
   - Webhook handling for payment confirmation
   - Credit balance updates on successful payment

2. **Credit Management UI**
   - Credit balance display (header/dashboard)
   - Credit purchase modal with package selection
   - Transaction history page
   - Low balance warnings

3. **Credit Deduction Logic**
   - Pre-flight credit checks
   - Atomic transaction implementation
   - Rollback on API failure
   - Audit logging

**Deliverable:** Functional credit purchase and deduction system

### Phase 4: Suno Integration (Weeks 4-5)

**Goals:** Core music generation via sunoapi.org

**Tasks:**
1. **sunoapi.org SDK/Wrapper**
   - API client implementation
   - Authentication and request signing
   - Error handling and retries
   - Cost tracking per request

2. **Song Generation Endpoint**
   - `/api/songs/generate` - initiate generation
   - Credit deduction integrated
   - Phonetic optimization applied
   - Webhook registration with sunoapi.org

3. **Webhook Handler**
   - `/api/webhooks/sunoapi` - receive completion notifications
   - File download from sunoapi.org (3-day expiry)
   - Upload to Supabase Storage
   - Song record updates

4. **Status Polling (Fallback)**
   - Client-side polling if webhooks fail
   - Real-time status updates in UI

**Deliverable:** End-to-end song generation with file storage

### Phase 5: User Experience Polish (Week 5-6)

**Goals:** Complete user flows and UI refinement

**Tasks:**
1. **Dashboard**
   - Song history list with playback
   - Credit balance and usage chart
   - Quick actions (generate new song, buy credits)

2. **Song Management**
   - Audio player with controls (play/pause, seek, volume)
   - Download functionality
   - Social share buttons (TikTok, Facebook)
   - Delete song option

3. **Free Tier Implementation**
   - 30-second preview generation (watermarked)
   - Upgrade prompts after free usage
   - Conversion funnel optimization

4. **Error Handling & Edge Cases**
   - Network failure recovery
   - API timeout handling
   - User-friendly error messages
   - Support contact integration

**Deliverable:** Polished MVP ready for beta testing

### Phase 6: Testing & Launch Prep (Week 6-7)

**Goals:** Quality assurance, performance optimization, launch readiness

**Tasks:**
1. **Testing**
   - End-to-end testing (Playwright or Cypress)
   - Load testing (credit system, API orchestration)
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile responsiveness testing

2. **Performance Optimization**
   - Lighthouse audit (target: 90+ scores)
   - Image optimization
   - Code splitting and lazy loading
   - API response time optimization

3. **Security Audit**
   - Input sanitization review
   - Rate limiting implementation
   - API key security verification
   - GDPR compliance review

4. **Monitoring & Analytics Setup**
   - Sentry error tracking
   - Plausible or PostHog analytics
   - Vercel monitoring
   - API cost monitoring dashboard

5. **Documentation**
   - User guide/FAQ
   - API documentation (internal)
   - Deployment runbook
   - Incident response procedures

**Deliverable:** Production-ready MVP

### Phase 7: Beta Launch (Week 7-8)

**Goals:** Limited beta release with founder's audience

**Tasks:**
1. **Beta User Recruitment**
   - Invite 20-50 users from founder's 80k Spotify audience
   - Set expectations (beta, feedback requested)
   - Provide test credits

2. **Feedback Collection**
   - In-app feedback widget
   - User interviews (10-15 users)
   - Usage analytics monitoring
   - Quality satisfaction surveys

3. **Iteration**
   - Bug fixes based on beta feedback
   - UX improvements
   - Phonetic engine refinement
   - Performance tuning

**Deliverable:** Validated MVP with user feedback

### Post-MVP: Continuous Improvement

**Ongoing Tasks:**
- Monitor pronunciation quality across Suno model updates
- Iterate phonetic rules based on user feedback
- Add premium features (canvas generation, mastering service)
- Expand marketing and user acquisition
- Prepare for Nordic expansion (Swedish, Danish)

---

## Technical Requirements

### Functional Requirements

**FR-1: User Authentication**
- Users must be able to sign up and log in via Google OAuth
- Users must have persistent sessions across browser refreshes
- Users must be able to log out securely

**FR-2: Credit Management**
- Users must be able to purchase credit packages via Stripe
- Credit balance must be displayed prominently in UI
- Credit transactions must be atomic (no partial failures)
- Users must receive transaction receipts via email

**FR-3: Phonetic Optimization**
- System must offer "Uttalelse Bokmål" toggle for Norwegian pronunciation enhancement
- Users must see visual diff of phonetic transformations before generation
- Users must be able to override phonetic transformations per line
- Phonetic engine must produce deterministic results (same input = same output)

**FR-4: Song Generation**
- Users must be able to generate full songs (2-3 minutes) with sufficient credits
- Free tier users must be able to generate 1× 30-second preview
- Generation must show real-time status updates (pending, processing, completed)
- Failed generations must refund credits automatically

**FR-5: Song Management**
- Users must be able to view all generated songs in dashboard
- Users must be able to play songs directly in browser
- Users must be able to download songs (MP3 format)
- Songs must auto-delete after 14 days (with notification)

**FR-6: Payment Processing**
- System must integrate with Stripe for credit purchases
- Users must receive immediate credit balance update after successful payment
- Failed payments must not grant credits
- All payments must be logged for audit trail

### Non-Functional Requirements

**NFR-1: Performance**
- Page load time: <2 seconds on 4G connection
- Time to first byte (TTFB): <500ms
- Song generation time: 1-3 minutes (Suno API dependent)
- Audio playback: <1 second to start

**NFR-2: Reliability**
- System uptime: 99.5% target (excluding planned maintenance)
- Credit transaction success rate: 99.9%
- API failure rollback: 100% (no lost credits)
- Data loss prevention: zero tolerance (backup/replication)

**NFR-3: Scalability**
- Support 1,000 concurrent users (MVP target)
- Database query performance: <100ms for 95th percentile
- API rate limiting: 100 requests/minute per user
- Storage scaling: automatic (Supabase handles)

**NFR-4: Security**
- HTTPS everywhere (TLS 1.3)
- API keys never exposed to client
- Input sanitization on all user inputs
- Rate limiting on all API endpoints
- GDPR compliance for user data

**NFR-5: Usability**
- Mobile-responsive design (works on phones, tablets, desktops)
- WCAG 2.1 AA accessibility compliance target
- Norwegian-friendly UX (though English UI acceptable for MVP)
- Average user can generate first song in <30 minutes

**NFR-6: Maintainability**
- TypeScript for type safety (reduce bugs)
- Comprehensive error logging (Sentry)
- Modular code architecture (easy to extend)
- API versioning for future compatibility

---

## Risks & Mitigation Strategies

### High-Impact Risks

**Risk 1: sunoapi.org Third-Party Dependency**
- **Description:** Entire music generation depends on third-party API wrapper (not official Suno API)
- **Impact:** Service outage, price increases, or shutdown would halt music generation
- **Probability:** Medium
- **Mitigation:**
  - Pre-paid credit buffer provides financial cushion during outages
  - Monitor official Suno API availability for potential migration
  - Research alternative Suno API wrappers as backup
  - Maintain documentation for quick provider swap
  - Communicate dependency risk to users in ToS

**Risk 2: Pronunciation Quality Degradation**
- **Description:** Suno model updates could worsen Norwegian pronunciation without warning
- **Impact:** Core value proposition compromised
- **Probability:** Medium-High (no control over third-party model changes)
- **Mitigation:**
  - Test team of Norwegian native speakers for rapid quality detection
  - Maintain prompt libraries for multiple Suno model versions (V3.5, V4, V4.5, V5)
  - Continuous A/B testing of phonetic rules
  - User feedback loop for quality monitoring
  - Version pinning if possible (request from sunoapi.org)

**Risk 3: API Cost Increases**
- **Description:** sunoapi.org or OpenAI could increase pricing unilaterally
- **Impact:** Reduced contribution margin or forced user price increases
- **Probability:** Medium
- **Mitigation:**
  - Pre-paid model allows gradual price adjustments
  - Cost monitoring with daily alerts
  - Credit pricing includes 40-50% buffer for cost fluctuations
  - Evaluate alternative providers proactively

### Medium-Impact Risks

**Risk 4: File Download Failure (3-Day Expiry)**
- **Description:** sunoapi.org deletes files after 3 days; failure to download means data loss
- **Impact:** User loses generated song, credit not refunded
- **Probability:** Low-Medium
- **Mitigation:**
  - Immediate download on webhook receipt (no delay)
  - Polling fallback if webhook fails
  - Retry logic with exponential backoff
  - Alert on repeated failures
  - Graceful failure message + credit refund if download fails

**Risk 5: Scalability Bottlenecks**
- **Description:** Viral growth could exceed database/storage capacity
- **Impact:** Service degradation, failed requests
- **Probability:** Low (nice problem to have)
- **Mitigation:**
  - Serverless architecture auto-scales
  - Database connection pooling (Supabase handles)
  - Rate limiting per user (100 req/min)
  - Cost circuit breakers ($50/day alert threshold)
  - Migration path to dedicated infrastructure if needed

**Risk 6: Payment Fraud**
- **Description:** Malicious users could attempt credit theft or payment fraud
- **Impact:** Financial loss, Stripe account issues
- **Probability:** Low
- **Mitigation:**
  - Stripe webhook verification (signature validation)
  - Rate limiting on credit purchase attempts
  - Fraud detection via Stripe Radar
  - Credit usage anomaly detection
  - Quick account suspension mechanism

### Low-Impact Risks

**Risk 7: Browser Compatibility Issues**
- **Description:** Audio playback or UI issues on specific browsers
- **Impact:** Poor user experience for affected users
- **Probability:** Low
- **Mitigation:**
  - Test on last 2 versions of major browsers
  - Howler.js provides broad compatibility
  - Progressive enhancement approach
  - Clear browser requirement documentation

**Risk 8: GDPR Compliance Gaps**
- **Description:** Unintentional violation of EU data protection regulations
- **Impact:** Legal issues, fines
- **Probability:** Low
- **Mitigation:**
  - Minimize data collection (only essential)
  - Clear privacy policy and cookie consent
  - Data deletion on user request
  - Supabase provides GDPR-compliant infrastructure
  - Legal review before launch

---

## Success Metrics

### Technical Success Criteria

**Performance Metrics:**
- Page Load Time: <2s (95th percentile)
- API Response Time: <300ms for credit checks, <500ms for other endpoints
- Time to First Song: <30 minutes for average user
- Audio Playback Latency: <1s

**Reliability Metrics:**
- System Uptime: >99.5%
- Credit Transaction Success Rate: >99.9%
- API Error Rate: <1%
- Data Loss Events: 0

**Quality Metrics:**
- Norwegian Pronunciation Satisfaction: >70% ("noticeably better than Suno alone")
- Phonetic Toggle Acceptance Rate: >80% (users accept suggestions)
- Refund Rate: <10%

### User Success Metrics

**Activation:**
- 80% of registered users complete at least one full song within 7 days
- Average time to first song: <30 minutes

**Engagement:**
- Users create average of 3+ songs in first month
- 60%+ Day 7 retention rate
- 40% of users share songs on social media

**Monetization:**
- 10% free-to-paid conversion rate within 90 days
- Average 2-3 free songs before upgrade
- Repeat credit purchase rate: 50%+ within 60 days

### Business Validation Metrics

**User Growth:**
- 1,000 registered users within 6 months
- 200 paying customers (20% conversion)
- 20% of new users from social referrals (viral coefficient)

**Revenue:**
- $7,000+ MRR by month 6
- Positive contribution margin per paid user
- 95-97% gross margin maintained

---

## Open Technical Questions

### Critical Questions (Need Answers Before Development)

1. **sunoapi.org Technical Specs:**
   - What are the actual rate limits and concurrent request quotas?
   - How reliable are webhooks? (Need polling fallback?)
   - What's the average generation time across different Suno models?
   - Do they provide any SLA guarantees or incident response process?
   - Can we pin to specific Suno model versions?

2. **File Storage Strategy:**
   - Should we implement automatic file download (3-day limit) or rely solely on webhooks?
   - What's the backup strategy if Supabase Storage has outages?
   - How do we handle partial file uploads (network interruptions)?

3. **Real-time Updates:**
   - Should MVP include WebSocket connections for live status, or is polling sufficient?
   - What's the optimal polling interval? (every 5s, 10s, 30s?)

4. **Phonetic Engine:**
   - Should phonetic transformations be client-side (instant preview) or server-side (security)?
   - Both? (client preview, server validation?)

5. **Cost Monitoring:**
   - What's the acceptable daily API spend limit for MVP? ($50, $100, $200?)
   - Should we implement hard circuit breakers or just alerts?

### Nice-to-Know Questions (Can Defer)

6. **Audio Formats:**
   - Should MVP support WAV download in addition to MP3?
   - What quality settings for MP3 export? (128kbps, 256kbps, 320kbps?)

7. **Testing Strategy:**
   - Unit tests vs. integration tests vs. E2E tests - what's the priority?
   - Continuous integration setup (GitHub Actions)?

8. **Localization:**
   - Should UI text be internationalization-ready (i18n) or hardcoded English for MVP?

9. **Analytics:**
   - Which analytics platform? (Plausible, PostHog, Mixpanel, custom?)

10. **Monitoring:**
    - Sentry for error tracking - what tier/pricing?
    - Custom monitoring dashboard vs. Vercel built-in?

---

## Appendix

### A. API Endpoint Specifications

**Authentication Endpoints:**
```
GET  /api/auth/callback     # Supabase OAuth callback
POST /api/auth/logout       # User logout
GET  /api/auth/user         # Get current user profile
```

**Credit Management:**
```
GET  /api/credits/balance              # Get current credit balance
POST /api/credits/purchase             # Initiate Stripe checkout
GET  /api/credits/transactions         # List transaction history
```

**Song Generation:**
```
POST /api/songs/generate               # Generate new song
GET  /api/songs/list                   # List user's songs
GET  /api/songs/[id]                   # Get song details
DELETE /api/songs/[id]                 # Delete song
```

**Phonetic Optimization:**
```
POST /api/phonetics/preview            # Preview phonetic transformations
```

**Webhooks:**
```
POST /api/webhooks/sunoapi             # Receive Suno completion
POST /api/webhooks/stripe              # Receive Stripe payment confirmation
```

### B. Database Schema (Complete)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  credit_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,  -- 'purchase', 'deduction', 'refund'
  related_song_id UUID,
  stripe_payment_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Songs
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  original_lyrics TEXT NOT NULL,
  phonetic_lyrics TEXT,
  genre VARCHAR(100),
  suno_task_id VARCHAR(255) UNIQUE,
  suno_model_version VARCHAR(20),
  audio_url TEXT,
  audio_duration INTEGER,  -- seconds
  storage_path TEXT,
  credits_used INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  is_free_tier BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP  -- 14 days from completion
);

CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_expires_at ON songs(expires_at);

-- Premium Features (Canvas, Mastering)
CREATE TABLE premium_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,  -- 'canvas', 'mastering'
  status VARCHAR(50) DEFAULT 'pending',
  canvas_url TEXT,
  notes TEXT,
  credits_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### C. Environment Configuration Checklist

**Supabase Setup:**
- [ ] Create Supabase project
- [ ] Configure Google OAuth provider
- [ ] Set up database schema (run migrations)
- [ ] Create storage bucket with 14-day lifecycle policy
- [ ] Configure Row Level Security (RLS) policies
- [ ] Generate service role key (server-side)

**Stripe Setup:**
- [ ] Create Stripe account (or use existing)
- [ ] Create products for credit packages (Starter, Pro, Premium)
- [ ] Generate API keys (publishable + secret)
- [ ] Configure webhooks for payment confirmation
- [ ] Test webhook signing with Stripe CLI

**External APIs:**
- [ ] Sign up for sunoapi.org and obtain API key
- [ ] Create OpenAI account and generate API key
- [ ] Set up Google Cloud project for Gemini/Video API
- [ ] Test all API integrations in development

**Deployment:**
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Set up custom domain (musikkfabrikken.no)
- [ ] Configure DNS records
- [ ] Enable HTTPS (automatic with Vercel)

**Monitoring:**
- [ ] Create Sentry project for error tracking
- [ ] Set up analytics (Plausible or PostHog)
- [ ] Configure cost monitoring alerts
- [ ] Set up uptime monitoring (UptimeRobot or similar)

### D. Cost Breakdown (Per Song)

**Variable Costs:**
- sunoapi.org (music generation): **$0.06** (12 credits × $0.005)
- GPT-4 (lyrics processing): **~$0.03** (prompt-dependent)
- Storage (14-day retention): **~$0.001** (negligible)
- **Total per song: ~$0.10**

**Optional Features:**
- Canvas generation (Gemini + Google Video): **~$0.50-0.55**
- Mastering service (human, 24h SLA): **$10** (founder time)

**Fixed Costs (Monthly):**
- Supabase (Pro tier): **$25/month**
- Vercel (Pro tier if needed): **$20/month**
- Domain (musikkfabrikken.no): **~$15/year** ($1.25/month)
- Monitoring/Analytics: **$10-20/month**
- **Total: ~$60-70/month base infrastructure**

**Break-Even Calculation:**
- Revenue per song (Starter tier): **$3.00**
- Cost per song: **$0.10**
- Gross margin: **96.7%**
- Monthly infrastructure: **$65**
- **Break-even: ~22 songs/month or ~5 Starter-tier customers**

---

## Next Steps

### Immediate Actions

1. **Decision on Open Questions:**
   - Review "Open Technical Questions" section
   - Make decisions on critical items (rate limits, storage strategy, real-time updates)
   - Document decisions for team alignment

2. **Environment Setup:**
   - Create Supabase project
   - Set up Stripe account and products
   - Obtain API keys for all external services (sunoapi.org, OpenAI, Google)

3. **Project Initialization:**
   - Initialize Next.js 14 project with TypeScript
   - Set up Git repository
   - Configure Vercel deployment
   - Install core dependencies (Tailwind, shadcn UI, Supabase client)

4. **Team Alignment:**
   - Review this proposal with development team
   - Assign ownership of major components (frontend, backend, integrations)
   - Set up communication channels (Slack, Discord, etc.)
   - Establish sprint cadence (weekly check-ins?)

### Week 1 Priorities

- [ ] Complete environment setup (Supabase, Stripe, API keys)
- [ ] Initialize Next.js project and deploy to Vercel (hello world)
- [ ] Implement basic authentication with Google OAuth
- [ ] Set up database schema (users table)
- [ ] Create protected dashboard route (empty state)

### Questions for Stakeholders

1. **Timeline:** Is 2-3 month MVP timeline acceptable, or do we need to accelerate?
2. **Resources:** Solo founder development or hiring additional developers?
3. **Budget:** What's the approved budget for API testing and infrastructure?
4. **Beta Launch:** Target date for beta user recruitment?
5. **Priority:** Are there any features we should deprioritize to ship faster?

---

**This technical proposal is a living document. Updates will be made as decisions are finalized and implementation progresses.**

**For questions or clarifications, contact:** Tony
**Last Updated:** 2025-11-19
