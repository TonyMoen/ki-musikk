# Technical Proposal: Musikkfabrikken
## AI-Powered Norwegian Music Creation Platform

**Date:** 2025-11-18
**Version:** 1.0
**Status:** Development Proposal
**Target Audience:** Development Team

---

## Executive Summary

**Musikkfabrikken** is an AI-powered song creation platform specifically optimized for Norwegian Bokmål, addressing a critical gap in authentic Norwegian music generation. This technical proposal outlines the architecture, technology stack, implementation requirements, and development roadmap for building an MVP that enables amateur creators and entry-level artists to produce genuine-sounding Norwegian songs.

**Technical Challenge:**
Existing AI music platforms like Suno produce Norwegian vocals with poor phonetic accuracy ("very American, bad, and fake"). The platform must intelligently orchestrate multiple AI services (Suno, GPT-4, Gemini) with Norwegian-specific phonetic optimization to transform output quality while maintaining economic viability.

**Core Technical Approach:**
- Full-stack Next.js 14+ application with App Router architecture
- Intelligent API orchestration layer for external AI services
- Pre-paid credit system with atomic transaction guarantees
- Supabase backend (PostgreSQL + Auth + Storage)
- Serverless deployment on Vercel

**Development Timeline:** 2-3 months for MVP
**Target Infrastructure Cost:** $200-500/month
**Target Scale:** 1,000+ users within 6 months

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Technical Architecture](#technical-architecture)
3. [Technology Stack](#technology-stack)
4. [System Design](#system-design)
5. [Core Features & Requirements](#core-features--requirements)
6. [API Integrations](#api-integrations)
7. [Database Schema](#database-schema)
8. [Security & Compliance](#security--compliance)
9. [Development Roadmap](#development-roadmap)
10. [Technical Risks & Mitigation](#technical-risks--mitigation)
11. [Performance Requirements](#performance-requirements)
12. [Deployment & Infrastructure](#deployment--infrastructure)
13. [Testing Strategy](#testing-strategy)
14. [Success Metrics](#success-metrics)
15. [Appendices](#appendices)

---

## Product Overview

### Problem Statement

Norwegian music creators face a phonetic barrier when using AI music generation tools:
- Suno AI and similar platforms are optimized for English
- Norwegian vocals sound "very American" due to incorrect pronunciation
- Manual workarounds require expert phonetic knowledge
- No Norwegian-specific competitors exist in the market

### Solution

Musikkfabrikken provides an intelligent orchestration layer that:
1. Applies proven phonetic optimization techniques to Norwegian lyrics
2. Transforms Suno's output from "American-sounding" to authentically Norwegian
3. Provides user-facing controls for phonetic edge cases
4. Delivers professional-quality results without requiring technical expertise

### Target Users

**Primary:** Party song creators (25-50 years) making personalized Norwegian songs for events
**Secondary:** Entry-level Spotify artists (18-35 years) building Norwegian music catalogs

### Business Model

Pre-paid credit system:
- **Starter:** $15 (150 credits) = 5 songs
- **Pro:** $45 (600 credits) = 20 songs + canvas
- **Premium:** $99 (1,500 credits) = 50 songs + extras
- **Free tier:** 1x 30-second watermarked preview

**Cost Structure:**
- Suno API (via sunoapi.org): $0.06/song
- GPT-4 lyrics processing: ~$0.03/request
- Canvas generation: ~$0.50-0.55
- **Contribution margin:** 95-97%

---

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  (Next.js Frontend - React 18+ / TypeScript / Tailwind CSS)    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Dashboard   │  │ Song Creator │  │  Track List  │        │
│  │    Page      │  │     Page     │  │    Page      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│         (Next.js API Routes - Serverless Functions)            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes (/app/api/*)                                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │ /songs/    │  │ /credits/  │  │ /webhooks/ │        │  │
│  │  │ generate   │  │            │  │            │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                     │  │
│  │  • Credit transaction management (atomic)                │  │
│  │  • Norwegian phonetic optimization                       │  │
│  │  • API orchestration & retry logic                       │  │
│  │  • File download & storage management                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│   SUPABASE   │    │  EXTERNAL    │      │   PAYMENT    │
│              │    │  AI SERVICES │      │  PROCESSING  │
│              │    │              │      │              │
│ PostgreSQL   │    │ sunoapi.org  │      │   Stripe     │
│ Auth (OAuth) │    │ OpenAI GPT-4 │      │              │
│ Storage      │    │ Google Gemini│      └──────────────┘
│              │    │ Google Video │
└──────────────┘    └──────────────┘
```

### Architecture Patterns

**1. API Orchestration Pattern**

Next.js API routes serve as an intelligent proxy between frontend and external APIs:

```typescript
// Example: /app/api/songs/generate/route.ts
export async function POST(request: Request) {
  // 1. Verify authentication
  const user = await getUser(request);

  // 2. Check credit balance
  const credits = await checkCredits(user.id);
  if (credits < SONG_COST) throw new InsufficientCreditsError();

  // 3. Apply Norwegian phonetic optimization
  const optimizedLyrics = await optimizeLyrics(request.body.lyrics);

  // 4. Call sunoapi.org (atomic transaction)
  const songTask = await sunoapi.generate({
    lyrics: optimizedLyrics,
    style: request.body.style
  });

  // 5. Deduct credits atomically
  await deductCredits(user.id, SONG_COST, songTask.id);

  // 6. Register webhook for completion
  await registerWebhook(songTask.id, user.id);

  return { taskId: songTask.id, status: 'processing' };
}
```

**Benefits:**
- API keys never exposed to browser
- Encapsulates business logic server-side
- Implements rate limiting and cost controls
- Handles retries and fallback logic
- Atomic credit transactions prevent double-charging

**2. Credit Transaction Pattern (Atomic)**

```typescript
// Atomic credit deduction with rollback on failure
async function deductCredits(userId: string, amount: number, taskId: string) {
  const { data, error } = await supabase.rpc('deduct_credits_atomic', {
    p_user_id: userId,
    p_amount: amount,
    p_task_id: taskId,
    p_reason: 'song_generation'
  });

  if (error) {
    // Rollback Suno task if credit deduction fails
    await sunoapi.cancel(taskId);
    throw new TransactionError('Credit deduction failed');
  }

  // Log transaction for audit trail
  await logTransaction(userId, amount, taskId, 'deducted');

  return data;
}
```

**Database function (PostgreSQL):**
```sql
CREATE OR REPLACE FUNCTION deduct_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_task_id TEXT,
  p_reason TEXT
)
RETURNS TABLE(new_balance INTEGER, transaction_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Lock user row for update
  SELECT credit_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct credits
  UPDATE users
  SET credit_balance = credit_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (user_id, amount, task_id, reason, type)
  VALUES (p_user_id, p_amount, p_task_id, p_reason, 'deduction')
  RETURNING id INTO v_transaction_id;

  -- Return new balance and transaction ID
  RETURN QUERY
  SELECT (v_current_balance - p_amount), v_transaction_id;
END;
$$;
```

**3. Session Persistence Pattern**

All generated songs saved to user's track list (survives browser refresh/API failures):

```typescript
// Track list persistence
interface Track {
  id: string;
  userId: string;
  taskId: string;
  status: 'processing' | 'completed' | 'failed';
  lyrics: string;
  optimizedLyrics?: string;
  style: string;
  audioUrl?: string;
  canvasUrl?: string;
  creditsUsed: number;
  createdAt: Date;
  expiresAt: Date; // 14-day auto-deletion
}

// Optimistic UI update with backend confirmation
async function createTrack(trackData: Partial<Track>) {
  // 1. Optimistically add to UI
  addTrackToUI(trackData);

  // 2. Persist to database
  const { data, error } = await supabase
    .from('tracks')
    .insert(trackData)
    .single();

  // 3. Handle failures gracefully
  if (error) {
    removeTrackFromUI(trackData.id);
    showErrorToast('Failed to save track');
  } else {
    updateTrackInUI(data);
  }
}
```

**4. File Storage Strategy**

**CRITICAL:** sunoapi.org auto-deletes files after 3 days - immediate download required!

```typescript
// Webhook handler for song completion
export async function POST(request: Request) {
  const webhook = await request.json();

  if (webhook.status === 'completed') {
    // IMMEDIATE download from sunoapi.org (3-day expiry!)
    const audioBlob = await fetch(webhook.audio_url).then(r => r.blob());

    // Upload to Supabase Storage (14-day retention)
    const { data, error } = await supabase.storage
      .from('songs')
      .upload(`${webhook.task_id}.mp3`, audioBlob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      });

    // Generate signed URL (expires in 14 days)
    const { data: { signedUrl } } = await supabase.storage
      .from('songs')
      .createSignedUrl(`${webhook.task_id}.mp3`, 60 * 60 * 24 * 14);

    // Update track record with Supabase URL
    await supabase
      .from('tracks')
      .update({
        audio_url: signedUrl,
        status: 'completed',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      })
      .eq('task_id', webhook.task_id);
  }
}
```

---

## Technology Stack

### Full-Stack Framework: Next.js 14+ (App Router)

**Why Next.js over separate React + Express?**

| Requirement | Next.js 14+ | React + Express |
|-------------|-------------|-----------------|
| Unified codebase | ✅ Frontend + API in one project | ❌ Two separate codebases |
| Deployment complexity | ✅ Single Vercel deployment | ❌ Two deployments (frontend + backend) |
| API routes | ✅ Built-in file-based routing | ❌ Requires Express/Fastify setup |
| SEO optimization | ✅ Server-side rendering | ❌ Client-side only (or complex SSR setup) |
| Image optimization | ✅ Built-in next/image | ❌ Manual implementation |
| TypeScript support | ✅ Native, zero-config | ⚠️ Requires setup |
| Development velocity | ✅ Fast for small-medium apps | ⚠️ More boilerplate |

**Verdict:** Next.js is the optimal choice for Musikkfabrikken's scope and team size.

### Frontend Stack

```typescript
// Core technologies
const frontendStack = {
  framework: 'Next.js 14.2+',
  language: 'TypeScript 5.3+',
  ui: {
    styling: 'Tailwind CSS 3.4+',
    components: 'shadcn/ui (Radix UI)',
    icons: 'Lucide React'
  },
  stateManagement: 'React Context API (Zustand if complexity grows)',
  audio: 'Howler.js',
  forms: 'React Hook Form + Zod validation',
  http: 'fetch API (native Next.js)',
};
```

**Rationale:**

- **TypeScript:** Type safety prevents bugs in credit/payment logic (critical for financial transactions)
- **Tailwind CSS:** Rapid UI development with consistent design system
- **shadcn/ui:** Accessible, customizable components (reduces custom dev time by 40-60%)
- **Howler.js:** Better audio control than native HTML5 (cross-browser compatibility, sprite support)
- **React Hook Form + Zod:** Performant form handling with runtime type validation

### Backend Stack (Next.js API Routes)

```typescript
// API Routes structure
app/
├── api/
│   ├── songs/
│   │   ├── generate/route.ts       // POST - Generate new song
│   │   ├── [id]/route.ts           // GET - Fetch song details
│   │   └── [id]/download/route.ts  // GET - Download audio file
│   ├── credits/
│   │   ├── balance/route.ts        // GET - Check credit balance
│   │   └── purchase/route.ts       // POST - Purchase credits (Stripe)
│   ├── webhooks/
│   │   ├── sunoapi/route.ts        // POST - Suno completion webhook
│   │   └── stripe/route.ts         // POST - Stripe payment webhook
│   └── phonetic/
│       └── optimize/route.ts       // POST - Norwegian phonetic optimization
```

**API Integration Layer:**

```typescript
// lib/sunoapi.ts - Wrapper for sunoapi.org
export class SunoAPIClient {
  private apiKey: string;
  private baseUrl = 'https://api.sunoapi.org';

  async generateSong(params: {
    lyrics: string;
    style: string;
    model?: 'v3.5' | 'v4' | 'v4.5' | 'v5';
  }): Promise<SunoTask> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: params.lyrics,
        tags: params.style,
        model: params.model || 'v4',
        make_instrumental: false,
        wait_audio: false // Use webhooks
      })
    });

    if (!response.ok) {
      throw new SunoAPIError(`Generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getTaskStatus(taskId: string): Promise<SunoTask> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    return response.json();
  }
}
```

### Database & Infrastructure

**Supabase (All-in-one platform):**

```yaml
services:
  database:
    type: PostgreSQL 15+
    features:
      - Row Level Security (RLS)
      - Real-time subscriptions
      - Full-text search
      - Foreign key constraints
      - Atomic transactions

  authentication:
    providers:
      - Google OAuth (primary)
      - Email/password (fallback)
    features:
      - JWT tokens
      - Session management
      - User metadata

  storage:
    buckets:
      - songs: Audio files (14-day retention)
      - canvas: Generated images (14-day retention)
    features:
      - Signed URLs (secure downloads)
      - Automatic image optimization
      - CDN integration
```

**Why Supabase vs. alternatives:**

| Feature | Supabase | PlanetScale + Vercel Blob | Firebase |
|---------|----------|--------------------------|----------|
| PostgreSQL | ✅ Native | ✅ MySQL (different SQL) | ❌ NoSQL |
| Auth built-in | ✅ | ❌ Separate service | ✅ |
| File storage | ✅ | ⚠️ Separate (Vercel Blob) | ✅ |
| Real-time | ✅ | ❌ | ✅ |
| Developer experience | ✅ Great | ⚠️ More services | ✅ Good |
| Pricing (MVP scale) | ✅ Free tier sufficient | ⚠️ More complex | ✅ Free tier |

**Verdict:** Supabase provides best all-in-one solution for MVP. Migrate only if hitting limits.

### External API Dependencies

```typescript
// External services configuration
const externalAPIs = {
  musicGeneration: {
    provider: 'sunoapi.org',
    cost: '$0.06/song (12 credits × $0.005)',
    models: ['v3.5', 'v4', 'v4.5', 'v4.5PLUS', 'v5'],
    sla: '99.9% uptime',
    webhook: true,
    fileRetention: '3 days (CRITICAL: immediate download required)',
    note: 'Third-party wrapper - not official Suno API'
  },

  lyricsProcessing: {
    provider: 'OpenAI GPT-4',
    cost: '~$0.03/request',
    usage: 'Norwegian phonetic optimization',
    models: ['gpt-4-turbo', 'gpt-4']
  },

  imageGeneration: {
    provider: 'Google Gemini + Video API',
    cost: '~$0.50-0.55/generation',
    usage: 'Canvas/album art generation'
  },

  payments: {
    provider: 'Stripe',
    features: ['Credit card', 'Payment intents', 'Webhooks'],
    compliance: ['PCI DSS', 'SCA']
  }
};
```

---

## System Design

### Data Flow: Song Generation

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                                    │
│    • Norwegian lyrics (raw text)                                │
│    • Genre/style preferences                                    │
│    • Phonetic toggle: ON/OFF                                    │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND VALIDATION                                           │
│    • Character limit check (max 3000 chars)                     │
│    • Credit balance verification                                │
│    • Sanitize input (remove special chars)                      │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. API ROUTE: /api/songs/generate                               │
│    a) Authenticate user (Supabase Auth)                         │
│    b) Check credit balance (SQL query)                          │
│    c) Apply Norwegian phonetic optimization (GPT-4)             │
│       • If toggle ON: Apply pronunciation rules                 │
│       • Generate before/after diff for user review              │
│    d) User confirms optimized lyrics                            │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. SUNO API CALL (via sunoapi.org)                              │
│    • POST /generate with optimized lyrics                       │
│    • Model: v4 (default) or user-selected                       │
│    • wait_audio: false (async via webhook)                      │
│    • Returns: taskId, estimated_wait_time                       │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. ATOMIC CREDIT DEDUCTION                                       │
│    • PostgreSQL stored procedure                                │
│    • Deduct credits with row-level lock                         │
│    • Insert transaction record                                  │
│    • ROLLBACK if Suno call failed                               │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. CREATE TRACK RECORD                                           │
│    • Insert into 'tracks' table                                 │
│    • Status: 'processing'                                       │
│    • Store taskId, user_id, lyrics, style                       │
│    • Set expires_at: NOW() + 14 days                            │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. RETURN TO USER                                                │
│    • taskId for status polling                                  │
│    • Estimated completion time                                  │
│    • UI shows "Processing..." state                             │
└──────────────────────────────────────────────────────────────────┘
                            │
                            │ (Async webhook path)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. WEBHOOK: /api/webhooks/sunoapi (1-3 minutes later)           │
│    • Receive completion notification                            │
│    • Verify webhook signature                                   │
│    • Download audio file from sunoapi.org (3-day expiry!)       │
│    • Upload to Supabase Storage                                 │
│    • Generate signed URL (14-day expiry)                        │
│    • Update track record: status='completed', audio_url         │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. USER NOTIFICATION                                             │
│    • Real-time update via Supabase subscriptions                │
│    • UI displays audio player                                   │
│    • Download button enabled                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Norwegian Phonetic Optimization Flow

```typescript
// lib/phonetic/optimizer.ts
export async function optimizeNorwegianLyrics(
  lyrics: string,
  options: { preserveLines?: string[]; model?: 'gpt-4' | 'gpt-4-turbo' }
): Promise<{ optimized: string; diff: DiffResult[] }> {

  const prompt = `
You are a Norwegian Bokmål phonetic expert. Optimize the following lyrics for AI music generation to ensure authentic Norwegian pronunciation.

RULES:
1. Apply Norwegian pronunciation rules (rolled R's, vowel patterns, consonant clusters)
2. Preserve the original meaning and flow
3. Mark changes with phonetic spellings (e.g., "sjø" → "shøø" for clarity)
4. Do NOT change proper nouns or intentional English words
5. Maintain line structure and rhyme scheme

LYRICS:
${lyrics}

Return JSON format:
{
  "optimized": "...",
  "changes": [
    { "line": 1, "original": "...", "optimized": "...", "reason": "..." }
  ]
}
  `;

  const response = await openai.chat.completions.create({
    model: options.model || 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0].message.content);

  // Apply user overrides (preserved lines)
  if (options.preserveLines) {
    result.optimized = applyLineOverrides(
      result.optimized,
      lyrics,
      options.preserveLines
    );
  }

  // Generate visual diff for UI
  const diff = generateDiff(lyrics, result.optimized);

  return {
    optimized: result.optimized,
    diff
  };
}
```

**UI Component: Phonetic Toggle with Diff Preview**

```typescript
// components/PhoneticToggle.tsx
export function PhoneticToggle({ lyrics, onAccept }: Props) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  async function handleOptimize() {
    setIsOptimizing(true);
    const optimization = await fetch('/api/phonetic/optimize', {
      method: 'POST',
      body: JSON.stringify({ lyrics })
    }).then(r => r.json());

    setResult(optimization);
    setIsOptimizing(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Uttalelse Bokmål (Norwegian Pronunciation)
        </label>
        <Switch onCheckedChange={(checked) => {
          if (checked) handleOptimize();
        }} />
      </div>

      {result && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Suggested Changes:</h4>
          <DiffViewer
            original={lyrics}
            optimized={result.optimized}
            changes={result.diff}
            onLineOverride={(lineNum) => {
              // User can override specific lines
              toggleLineOverride(lineNum);
            }}
          />
          <Button onClick={() => onAccept(result.optimized)}>
            Accept Optimization
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## Core Features & Requirements

### MVP Feature Set (Must Have)

#### 1. Norwegian Pronunciation Optimization (MISSION-CRITICAL)

**Requirements:**
- GPT-4 integration for phonetic rule application
- Prompt library for different Suno models (v3.5, v4, v4.5, v5)
- Continuous iteration based on user feedback
- Test team validation workflow

**Acceptance Criteria:**
- [ ] 70%+ users rate pronunciation as "noticeably better than Suno alone"
- [ ] Phonetic optimization completes in <5 seconds
- [ ] System maintains prompt versions for each Suno model
- [ ] Graceful fallback if GPT-4 unavailable (use cached patterns)

**Technical Implementation:**
```typescript
// Feature: Prompt library versioning
interface PromptTemplate {
  id: string;
  sunoModel: 'v3.5' | 'v4' | 'v4.5' | 'v5';
  version: string;
  template: string;
  testResults: {
    satisfactionScore: number;
    sampleSize: number;
    testDate: Date;
  };
  isActive: boolean;
}

// Store in database, A/B test new prompts
async function getActivePrompt(sunoModel: string): Promise<PromptTemplate> {
  return await supabase
    .from('prompt_templates')
    .select('*')
    .eq('suno_model', sunoModel)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single();
}
```

#### 2. "Uttalelse Bokmål" Phonetic Toggle

**Requirements:**
- Visual diff preview (before/after comparison)
- Per-line override capability
- Disable toggle for edge cases (proper nouns, English intentional)
- User-friendly disclaimer about imperfect results

**Acceptance Criteria:**
- [ ] 80%+ acceptance rate of phonetic suggestions
- [ ] Users can override individual lines without disabling entire feature
- [ ] Diff view highlights changes with color coding (green=addition, red=removal)
- [ ] Changes persist across browser sessions

**Technical Implementation:**
```typescript
// components/DiffViewer.tsx
interface DiffLine {
  lineNumber: number;
  type: 'unchanged' | 'modified' | 'added' | 'removed';
  original?: string;
  optimized?: string;
  reason?: string; // Why this change was made
  isOverridden: boolean;
}

export function DiffViewer({ changes, onLineOverride }: Props) {
  return (
    <div className="space-y-1">
      {changes.map((line) => (
        <div
          key={line.lineNumber}
          className={cn(
            "flex items-start gap-2 p-2 rounded",
            line.type === 'modified' && "bg-yellow-50",
            line.isOverridden && "opacity-50"
          )}
        >
          <span className="text-xs text-gray-500 w-8">{line.lineNumber}</span>
          <div className="flex-1">
            {line.type === 'modified' && (
              <>
                <div className="text-red-600 line-through">{line.original}</div>
                <div className="text-green-600">{line.optimized}</div>
                <div className="text-xs text-gray-500 mt-1">{line.reason}</div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLineOverride(line.lineNumber)}
          >
            {line.isOverridden ? 'Use Original' : 'Keep Original'}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

#### 3. Pre-Paid Credit System

**Requirements:**
- Stripe payment integration
- Atomic credit transactions (no race conditions)
- Rollback on API failure
- Credit balance display and low-balance warnings
- Audit trail for all transactions

**Acceptance Criteria:**
- [ ] Zero double-charging incidents (atomic transactions work)
- [ ] Users notified when balance <50 credits
- [ ] Failed song generations automatically refund credits
- [ ] Transaction history visible to users
- [ ] Admin dashboard for credit management

**Database Schema:**
```sql
-- Users table with credit balance
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  credit_balance INTEGER DEFAULT 0,
  total_credits_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions audit trail
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for purchase, negative for deduction
  balance_after INTEGER NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'deduction', 'refund', 'bonus')),
  reason TEXT,
  task_id TEXT, -- Reference to Suno task if applicable
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast balance lookups
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

**API Implementation:**
```typescript
// app/api/credits/purchase/route.ts
export async function POST(request: Request) {
  const { packageId } = await request.json();
  const user = await getUser(request);

  // Credit packages
  const packages = {
    starter: { credits: 150, price: 1500 }, // $15 in cents
    pro: { credits: 600, price: 4500 },
    premium: { credits: 1500, price: 9900 }
  };

  const pkg = packages[packageId];

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: pkg.price,
    currency: 'usd',
    metadata: {
      userId: user.id,
      credits: pkg.credits,
      package: packageId
    }
  });

  return { clientSecret: paymentIntent.client_secret };
}

// Webhook handler for payment confirmation
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    await request.text(),
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const { userId, credits } = event.data.object.metadata;

    // Add credits atomically
    await supabase.rpc('add_credits_atomic', {
      p_user_id: userId,
      p_amount: credits,
      p_stripe_payment_id: event.data.object.id
    });
  }

  return new Response('OK', { status: 200 });
}
```

#### 4. User Authentication (Google OAuth)

**Requirements:**
- Google OAuth integration via Supabase Auth
- User profile with credit balance and song history
- Session management (JWT tokens)
- Email/password fallback (optional for MVP)

**Acceptance Criteria:**
- [ ] Users can sign up/login with Google in <30 seconds
- [ ] Session persists across browser restarts
- [ ] Logout clears all client-side tokens
- [ ] User profile includes: email, name, avatar, join date

**Implementation:**
```typescript
// lib/supabase.ts - Auth configuration
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// app/auth/callback/route.ts - OAuth callback
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

#### 5. Session Persistence (Track List)

**Requirements:**
- Save all generated songs to user's track list
- Survives browser refresh and API failures
- Handles concurrent sessions cleanly
- 14-day auto-deletion with user notifications

**Acceptance Criteria:**
- [ ] <5% user complaints about lost songs
- [ ] Track list loads in <500ms
- [ ] Users notified 48 hours before song expiry
- [ ] Expired songs automatically removed from storage

**Database Schema:**
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT UNIQUE NOT NULL, -- sunoapi.org task ID
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',

  -- Song data
  original_lyrics TEXT NOT NULL,
  optimized_lyrics TEXT,
  style TEXT NOT NULL,
  suno_model TEXT DEFAULT 'v4',

  -- File URLs
  audio_url TEXT, -- Supabase signed URL
  canvas_url TEXT,

  -- Metadata
  credits_used INTEGER NOT NULL,
  generation_time_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),

  -- Indexes
  CONSTRAINT tracks_task_id_key UNIQUE (task_id)
);

CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_expires_at ON tracks(expires_at);
CREATE INDEX idx_tracks_status ON tracks(status);
```

**Auto-deletion cron job:**
```typescript
// app/api/cron/cleanup-expired-tracks/route.ts
export async function GET(request: Request) {
  // Verify cron secret (Vercel Cron Jobs)
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find expired tracks
  const { data: expiredTracks } = await supabase
    .from('tracks')
    .select('id, audio_url, canvas_url')
    .lt('expires_at', new Date().toISOString());

  // Delete files from storage
  for (const track of expiredTracks) {
    if (track.audio_url) {
      await supabase.storage.from('songs').remove([extractPath(track.audio_url)]);
    }
    if (track.canvas_url) {
      await supabase.storage.from('canvas').remove([extractPath(track.canvas_url)]);
    }
  }

  // Delete database records
  await supabase
    .from('tracks')
    .delete()
    .lt('expires_at', new Date().toISOString());

  return new Response(`Deleted ${expiredTracks.length} expired tracks`, { status: 200 });
}
```

#### 6. Free Tier (30-Second Preview)

**Requirements:**
- 1x free 30-second watermarked preview per user
- Demonstrates core Norwegian pronunciation value
- Clear upgrade path to full songs
- Prevents spam/abuse

**Acceptance Criteria:**
- [ ] Free tier users can generate exactly 1 preview (enforced server-side)
- [ ] Preview includes watermark: "Generated by Musikkfabrikken - Upgrade for full song"
- [ ] Conversion funnel tracks free → paid conversion rate
- [ ] Upsell modal appears after preview completes

**Implementation:**
```typescript
// app/api/songs/generate-preview/route.ts
export async function POST(request: Request) {
  const user = await getUser(request);

  // Check if user already used free preview
  const { count } = await supabase
    .from('tracks')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_free_preview', true);

  if (count > 0) {
    return new Response('Free preview already used', { status: 403 });
  }

  // Generate 30-second preview (different Suno endpoint)
  const task = await sunoapi.generatePreview({
    lyrics: request.body.lyrics.substring(0, 500), // Limit lyrics
    style: request.body.style,
    duration: 30,
    watermark: 'Generated by Musikkfabrikken'
  });

  // Create track record (no credit deduction)
  await supabase.from('tracks').insert({
    user_id: user.id,
    task_id: task.id,
    is_free_preview: true,
    credits_used: 0,
    ...
  });

  return { taskId: task.id };
}
```

#### 7. Full Song Generation

**Requirements:**
- Integration with sunoapi.org for complete songs
- User input: Norwegian lyrics, genre/style, model version
- Download in MP3 format (WAV optional for premium)
- Concurrent request handling

**Acceptance Criteria:**
- [ ] Song generation completes in 1-3 minutes (sunoapi.org dependent)
- [ ] Users can generate up to 3 songs concurrently
- [ ] Download includes metadata (title, artist, album art if canvas enabled)
- [ ] Audio quality: 128kbps minimum, 320kbps for premium

**API Implementation:**
```typescript
// app/api/songs/generate/route.ts
export async function POST(request: Request) {
  const { lyrics, style, model = 'v4' } = await request.json();
  const user = await getUser(request);

  // Rate limiting: max 3 concurrent generations
  const { count } = await supabase
    .from('tracks')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'processing');

  if (count >= 3) {
    return new Response('Maximum 3 concurrent songs', { status: 429 });
  }

  // Check credits (30 credits per song)
  const SONG_COST = 30;
  const { data: userBalance } = await supabase
    .from('users')
    .select('credit_balance')
    .eq('id', user.id)
    .single();

  if (userBalance.credit_balance < SONG_COST) {
    return new Response('Insufficient credits', { status: 402 });
  }

  // Apply Norwegian phonetic optimization
  const { optimized } = await optimizeNorwegianLyrics(lyrics);

  // Generate song via sunoapi.org
  const task = await sunoapi.generateSong({
    lyrics: optimized,
    style,
    model
  });

  // Atomic credit deduction + track creation
  await supabase.rpc('create_song_generation', {
    p_user_id: user.id,
    p_task_id: task.id,
    p_credits: SONG_COST,
    p_lyrics: lyrics,
    p_optimized_lyrics: optimized,
    p_style: style,
    p_model: model
  });

  return { taskId: task.id, estimatedWait: 120 }; // 2 minutes
}
```

#### 8. Canvas Generation (Optional Feature)

**Requirements:**
- Google Gemini + Video API integration
- AI-generated prompts based on song metadata
- Optional user toggle (not forced)
- 20 credits cost (separate from song generation)

**Acceptance Criteria:**
- [ ] Canvas generation completes in <30 seconds
- [ ] 20%+ adoption rate among paid users
- [ ] Generated images are 1:1 ratio (Instagram/Spotify canvas format)
- [ ] Users can regenerate canvas without re-generating song

**Implementation:**
```typescript
// app/api/canvas/generate/route.ts
export async function POST(request: Request) {
  const { trackId } = await request.json();
  const user = await getUser(request);

  const CANVAS_COST = 20;

  // Get track metadata
  const { data: track } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .eq('user_id', user.id)
    .single();

  if (!track) {
    return new Response('Track not found', { status: 404 });
  }

  // Generate image prompt with Gemini
  const imagePrompt = await gemini.generatePrompt({
    lyrics: track.optimized_lyrics,
    style: track.style,
    mood: extractMood(track.style)
  });

  // Generate image with Google Video API
  const image = await googleVideo.generateImage({
    prompt: imagePrompt,
    aspectRatio: '1:1',
    quality: 'high'
  });

  // Upload to Supabase Storage
  const { data: upload } = await supabase.storage
    .from('canvas')
    .upload(`${track.id}.png`, image, {
      contentType: 'image/png'
    });

  // Update track with canvas URL
  await supabase
    .from('tracks')
    .update({ canvas_url: upload.path })
    .eq('id', trackId);

  // Deduct credits
  await supabase.rpc('deduct_credits_atomic', {
    p_user_id: user.id,
    p_amount: CANVAS_COST,
    p_task_id: trackId,
    p_reason: 'canvas_generation'
  });

  return { canvasUrl: upload.path };
}
```

#### 9. Mastering Service Booking

**Requirements:**
- Manual 24-hour SLA mastering by founder
- Binding pre-payment (100 credits)
- Email notification to admin
- Free mastering if SLA missed
- Upload mastered file to user's track

**Acceptance Criteria:**
- [ ] Booking confirmation email sent to user and admin
- [ ] 95%+ SLA compliance (mastered within 24 hours)
- [ ] Users can download both original and mastered versions
- [ ] Admin dashboard shows pending mastering requests

**Implementation:**
```typescript
// app/api/mastering/book/route.ts
export async function POST(request: Request) {
  const { trackId } = await request.json();
  const user = await getUser(request);

  const MASTERING_COST = 100;

  // Deduct credits upfront (binding pre-payment)
  await supabase.rpc('deduct_credits_atomic', {
    p_user_id: user.id,
    p_amount: MASTERING_COST,
    p_task_id: trackId,
    p_reason: 'mastering_service'
  });

  // Create mastering request
  const { data: request } = await supabase
    .from('mastering_requests')
    .insert({
      track_id: trackId,
      user_id: user.id,
      status: 'pending',
      due_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
    .single();

  // Send email notifications
  await sendEmail({
    to: user.email,
    subject: 'Mastering Request Confirmed',
    body: `Your song will be mastered within 24 hours. Request ID: ${request.id}`
  });

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'New Mastering Request',
    body: `Track ID: ${trackId}, User: ${user.email}, Due: ${request.due_at}`
  });

  return { requestId: request.id, dueAt: request.due_at };
}

// Admin uploads mastered file
// app/api/mastering/[requestId]/upload/route.ts
export async function POST(request: Request, { params }) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Upload mastered audio
  const { data: upload } = await supabase.storage
    .from('songs')
    .upload(`mastered/${params.requestId}.mp3`, file);

  // Update mastering request
  await supabase
    .from('mastering_requests')
    .update({
      status: 'completed',
      mastered_url: upload.path,
      completed_at: new Date()
    })
    .eq('id', params.requestId);

  // Notify user
  const { data: req } = await supabase
    .from('mastering_requests')
    .select('*, users(email)')
    .eq('id', params.requestId)
    .single();

  await sendEmail({
    to: req.users.email,
    subject: 'Your Mastered Song is Ready!',
    body: `Download your professionally mastered track now.`
  });

  return { success: true };
}
```

#### 10. Core UX Flow

**Requirements:**
- Simple, intuitive interface for non-technical users
- Complete song creation in <30 minutes
- No technical jargon
- Mobile-responsive design

**User Journey:**
```
1. Landing Page
   ↓
2. Sign up with Google OAuth (30 seconds)
   ↓
3. Dashboard (credit balance, track list)
   ↓
4. Click "Create New Song"
   ↓
5. Enter lyrics (text area with character count)
   ↓
6. Select genre/style (dropdown or tags)
   ↓
7. Toggle "Uttalelse Bokmål" phonetic optimization
   ↓
8. Review before/after diff (if optimization enabled)
   ↓
9. Confirm and generate (deducts credits)
   ↓
10. Processing state (estimated 2-3 minutes)
    ↓
11. Song ready notification
    ↓
12. Listen, download, or generate canvas
    ↓
13. (Optional) Book mastering service
    ↓
14. Download final product
```

**Key UI Components:**

```typescript
// Page structure
app/
├── (marketing)/
│   ├── page.tsx                 // Landing page
│   ├── pricing/page.tsx         // Credit packages
│   └── about/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx       // User dashboard
│   ├── create/page.tsx          // Song creation flow
│   ├── tracks/page.tsx          // Track list
│   └── settings/page.tsx        // User settings
└── api/                         // API routes (backend)

// Component library
components/
├── ui/                          // shadcn/ui components
├── AudioPlayer.tsx              // Custom audio player with waveform
├── CreditBalance.tsx            // Credit display + purchase button
├── DiffViewer.tsx               // Phonetic diff preview
├── PhoneticToggle.tsx           // Norwegian optimization toggle
├── TrackCard.tsx                // Track list item
└── UpgradeModal.tsx             // Conversion modal for free users
```

---

## API Integrations

### 1. sunoapi.org (Music Generation)

**Provider:** Third-party Suno API wrapper (official API not publicly available)
**Documentation:** https://docs.sunoapi.org/
**Cost:** $0.06 per song (12 credits × $0.005/credit)

**Authentication:**
```typescript
// Environment variable
SUNOAPI_API_KEY=sk_xxx

// Header
Authorization: Bearer ${SUNOAPI_API_KEY}
```

**Key Endpoints:**

```typescript
// Generate song (async)
POST https://api.sunoapi.org/generate
{
  "prompt": "Norwegian lyrics here",
  "tags": "pop, upbeat, Norwegian",
  "model": "v4",
  "make_instrumental": false,
  "wait_audio": false // Use webhooks
}

Response:
{
  "task_id": "abc123",
  "status": "queued",
  "estimated_wait_time": 120 // seconds
}

// Get task status
GET https://api.sunoapi.org/tasks/{task_id}

Response:
{
  "task_id": "abc123",
  "status": "completed", // queued | processing | completed | failed
  "audio_url": "https://cdn.sunoapi.org/abc123.mp3", // Expires in 3 days!
  "duration": 180, // seconds
  "model_version": "v4"
}

// Webhook (configured in sunoapi.org dashboard)
POST https://musikkfabrikken.no/api/webhooks/sunoapi
{
  "task_id": "abc123",
  "status": "completed",
  "audio_url": "https://cdn.sunoapi.org/abc123.mp3"
}
```

**Critical Notes:**
- ⚠️ Files auto-delete after 3 days → immediate download required!
- ⚠️ Third-party service (not official Suno) → pricing/availability subject to change
- ⚠️ No early access to model updates → reactive quality management only
- ⚠️ Rate limits: 100 requests/minute per API key

**Error Handling:**
```typescript
try {
  const task = await sunoapi.generateSong(params);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Queue request for retry
    await enqueueRetry(params, { delay: 60000 });
  } else if (error.code === 'INSUFFICIENT_CREDITS') {
    // Notify admin, pause new requests
    await notifyAdmin('sunoapi.org credits depleted');
  } else {
    // Refund user credits
    await refundCredits(userId, SONG_COST);
    throw error;
  }
}
```

### 2. OpenAI GPT-4 (Lyrics Processing)

**Documentation:** https://platform.openai.com/docs/api-reference
**Cost:** ~$0.03 per phonetic optimization request

**Usage: Norwegian Phonetic Optimization**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function optimizeLyrics(lyrics: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a Norwegian Bokmål phonetic expert. Optimize lyrics for AI music generation to ensure authentic Norwegian pronunciation. Apply these rules:
1. Rolled R's: Emphasize with "rr" where needed
2. Vowel clarity: Mark long vowels (e.g., "aa" for å)
3. Consonant clusters: Simplify complex clusters
4. Preserve meaning and rhyme scheme
5. Do NOT change proper nouns or intentional English

Return JSON: { "optimized": "...", "changes": [...] }`
      },
      {
        role: 'user',
        content: lyrics
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3 // Lower temperature for consistency
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Cost Optimization:**
- Use GPT-4 Turbo (cheaper than GPT-4)
- Cache common phonetic patterns (reduce API calls)
- Set max_tokens limit to prevent runaway costs

### 3. Google Gemini + Video API (Canvas Generation)

**Documentation:** https://ai.google.dev/
**Cost:** ~$0.50-0.55 per image generation

**Usage: Generate Canvas Prompts**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generateCanvasPrompt(metadata: {
  lyrics: string;
  style: string;
  mood: string;
}) {
  const model = genai.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a visual image prompt for album art based on this Norwegian song:

Lyrics: ${metadata.lyrics}
Style: ${metadata.style}
Mood: ${metadata.mood}

Create a concise image generation prompt (max 100 words) that captures the essence of the song. Focus on visual elements, colors, and atmosphere.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Then use Google Video API for actual image generation
async function generateCanvas(imagePrompt: string) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-2.0:predict', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      instances: [{
        prompt: imagePrompt,
        parameters: {
          aspectRatio: '1:1',
          numberOfImages: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      }]
    })
  });

  const data = await response.json();
  return data.predictions[0].bytesBase64Encoded; // Base64 image
}
```

### 4. Stripe (Payment Processing)

**Documentation:** https://stripe.com/docs/api
**Integration:** Stripe Elements + Payment Intents

**Credit Purchase Flow:**

```typescript
// 1. Create payment intent (server-side)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const { packageId } = await request.json();

  const packages = {
    starter: { credits: 150, price: 1500 },
    pro: { credits: 600, price: 4500 },
    premium: { credits: 1500, price: 9900 }
  };

  const pkg = packages[packageId];

  const paymentIntent = await stripe.paymentIntents.create({
    amount: pkg.price,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: user.id,
      credits: pkg.credits,
      package: packageId
    }
  });

  return { clientSecret: paymentIntent.client_secret };
}

// 2. Frontend: Stripe Elements (client-side)
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function CheckoutForm({ clientSecret }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentElement />
      <button type="submit">Purchase Credits</button>
    </Elements>
  );
}

// 3. Webhook handler (server-side)
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const { userId, credits } = event.data.object.metadata;

    // Add credits to user account
    await supabase.rpc('add_credits_atomic', {
      p_user_id: userId,
      p_amount: parseInt(credits),
      p_stripe_payment_id: event.data.object.id,
      p_reason: 'purchase'
    });

    // Send confirmation email
    await sendEmail({
      to: event.data.object.receipt_email,
      subject: 'Credits Added to Your Account',
      body: `${credits} credits have been added to your Musikkfabrikken account!`
    });
  }

  return new Response('OK', { status: 200 });
}
```

**Webhook Configuration:**
- URL: `https://musikkfabrikken.no/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Database Schema

### Complete PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Credits
  credit_balance INTEGER DEFAULT 0 CHECK (credit_balance >= 0),
  total_credits_purchased INTEGER DEFAULT 0,
  total_credits_used INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Credit transactions audit trail
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction details
  amount INTEGER NOT NULL, -- Positive = add, Negative = deduct
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- Type and reason
  type TEXT CHECK (type IN ('purchase', 'deduction', 'refund', 'bonus', 'admin_adjustment')),
  reason TEXT,

  -- References
  task_id TEXT, -- Suno task ID if applicable
  stripe_payment_id TEXT,
  admin_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks (generated songs)
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT UNIQUE NOT NULL, -- sunoapi.org task ID

  -- Status
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  error_message TEXT,

  -- Song data
  original_lyrics TEXT NOT NULL,
  optimized_lyrics TEXT,
  style TEXT NOT NULL,
  suno_model TEXT DEFAULT 'v4',

  -- File URLs (Supabase signed URLs)
  audio_url TEXT,
  canvas_url TEXT,
  mastered_url TEXT,

  -- Metadata
  credits_used INTEGER NOT NULL,
  duration_seconds INTEGER,
  generation_time_seconds INTEGER,
  is_free_preview BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),

  CONSTRAINT tracks_task_id_key UNIQUE (task_id)
);

-- Mastering requests
CREATE TABLE mastering_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Status
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'sla_missed')) DEFAULT 'pending',

  -- File URL
  mastered_url TEXT,

  -- SLA tracking
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL, -- 24 hours from request
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Admin notes
  admin_notes TEXT,

  CONSTRAINT mastering_requests_track_id_key UNIQUE (track_id)
);

-- Prompt templates (for A/B testing phonetic optimization)
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suno_model TEXT CHECK (suno_model IN ('v3.5', 'v4', 'v4.5', 'v5')),
  version TEXT NOT NULL,
  template TEXT NOT NULL,

  -- Test results
  satisfaction_score DECIMAL(3, 2), -- 0.00 to 1.00
  sample_size INTEGER DEFAULT 0,
  test_date DATE,

  -- Status
  is_active BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT prompt_templates_model_version_key UNIQUE (suno_model, version)
);

-- User feedback
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale)
  pronunciation_quality INTEGER CHECK (pronunciation_quality BETWEEN 1 AND 5),
  overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5),

  -- Comments
  comments TEXT,
  would_recommend BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_expires_at ON tracks(expires_at);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX idx_mastering_requests_status ON mastering_requests(status);
CREATE INDEX idx_mastering_requests_due_at ON mastering_requests(due_at);
CREATE INDEX idx_user_feedback_track_id ON user_feedback(track_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastering_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY tracks_select_own ON tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY credit_transactions_select_own ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY mastering_requests_select_own ON mastering_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_feedback_insert_own ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stored procedures
CREATE OR REPLACE FUNCTION deduct_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_task_id TEXT,
  p_reason TEXT
)
RETURNS TABLE(new_balance INTEGER, transaction_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Lock user row
  SELECT credit_balance INTO v_balance_before
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check sufficient balance
  IF v_balance_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_balance_before, p_amount;
  END IF;

  -- Calculate new balance
  v_balance_after := v_balance_before - p_amount;

  -- Update user balance
  UPDATE users
  SET credit_balance = v_balance_after,
      total_credits_used = total_credits_used + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id, amount, balance_before, balance_after, type, reason, task_id
  )
  VALUES (
    p_user_id, -p_amount, v_balance_before, v_balance_after, 'deduction', p_reason, p_task_id
  )
  RETURNING id INTO v_transaction_id;

  -- Return results
  RETURN QUERY SELECT v_balance_after, v_transaction_id;
END;
$$;

CREATE OR REPLACE FUNCTION add_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_stripe_payment_id TEXT,
  p_reason TEXT
)
RETURNS TABLE(new_balance INTEGER, transaction_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Lock user row
  SELECT credit_balance INTO v_balance_before
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Calculate new balance
  v_balance_after := v_balance_before + p_amount;

  -- Update user balance
  UPDATE users
  SET credit_balance = v_balance_after,
      total_credits_purchased = total_credits_purchased + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id, amount, balance_before, balance_after, type, reason, stripe_payment_id
  )
  VALUES (
    p_user_id, p_amount, v_balance_before, v_balance_after, 'purchase', p_reason, p_stripe_payment_id
  )
  RETURNING id INTO v_transaction_id;

  -- Return results
  RETURN QUERY SELECT v_balance_after, v_transaction_id;
END;
$$;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER prompt_templates_updated_at
BEFORE UPDATE ON prompt_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)             │◄──────┐
│ email               │       │
│ credit_balance      │       │
│ total_credits_*     │       │
└─────────────────────┘       │
                              │
                              │
┌─────────────────────────────┼─────────────────────────┐
│                             │                         │
│                             │                         │
▼                             ▼                         ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  credit_transactions│  │      tracks         │  │ mastering_requests  │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ id (PK)             │  │ id (PK)             │  │ id (PK)             │
│ user_id (FK)        │  │ user_id (FK)        │  │ user_id (FK)        │
│ amount              │  │ task_id (UNIQUE)    │  │ track_id (FK)       │◄─┐
│ type                │  │ status              │  │ status              │  │
│ task_id             │  │ original_lyrics     │  │ due_at              │  │
│ stripe_payment_id   │  │ optimized_lyrics    │  │ mastered_url        │  │
└─────────────────────┘  │ audio_url           │  └─────────────────────┘  │
                         │ canvas_url          │                           │
                         │ credits_used        │                           │
                         │ expires_at          │───────────────────────────┘
                         └─────────────────────┘
                                  │
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │  user_feedback      │
                         ├─────────────────────┤
                         │ id (PK)             │
                         │ user_id (FK)        │
                         │ track_id (FK)       │
                         │ pronunciation_*     │
                         │ would_recommend     │
                         └─────────────────────┘
```

---

## Security & Compliance

### Authentication & Authorization

**1. Supabase Auth (JWT-based)**

```typescript
// Middleware: Verify authentication on API routes
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: Request) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  await supabase.auth.getSession();

  return res;
}

// Protected API route
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // User is authenticated, proceed...
  const user = session.user;
}
```

**2. Row Level Security (RLS)**

All database tables use RLS policies to ensure users can only access their own data:

```sql
-- Example: Users can only see their own tracks
CREATE POLICY tracks_select_own ON tracks
  FOR SELECT USING (auth.uid() = user_id);

-- Admin override (service role bypasses RLS)
-- Use service_role key for admin operations only
```

### API Security

**1. Rate Limiting**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true
});

export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error(`Rate limit exceeded. Reset at ${new Date(reset)}`);
  }

  return { limit, remaining, reset };
}

// Usage in API route
export async function POST(request: Request) {
  const user = await getUser(request);

  try {
    await rateLimit(`user:${user.id}`);
  } catch (error) {
    return new Response('Too many requests', { status: 429 });
  }

  // Proceed with request...
}
```

**2. Input Sanitization**

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeLyrics(input: string): string {
  // Remove dangerous characters
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: []
  });

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > 3000) {
    throw new Error('Lyrics exceed maximum length (3000 characters)');
  }

  return sanitized;
}

// Usage
export async function POST(request: Request) {
  const { lyrics } = await request.json();

  const cleanLyrics = sanitizeLyrics(lyrics);

  // Proceed with clean lyrics...
}
```

**3. Webhook Signature Verification**

```typescript
// Stripe webhook verification
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Verified webhook, process event...
}

// sunoapi.org webhook verification
export async function POST(request: Request) {
  const signature = headers().get('x-sunoapi-signature');
  const body = await request.text();

  const expectedSignature = crypto
    .createHmac('sha256', process.env.SUNOAPI_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Verified webhook, process...
}
```

### Data Protection (GDPR Compliance)

**1. User Data Rights**

```typescript
// app/api/gdpr/export/route.ts - Export user data
export async function GET(request: Request) {
  const user = await getUser(request);

  // Collect all user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user.id);

  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id);

  // Return as downloadable JSON
  return new Response(JSON.stringify({
    user: userData,
    tracks,
    transactions,
    exported_at: new Date().toISOString()
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="musikkfabrikken-data-${user.id}.json"`
    }
  });
}

// app/api/gdpr/delete/route.ts - Delete user account
export async function DELETE(request: Request) {
  const user = await getUser(request);

  // Delete files from storage
  const { data: tracks } = await supabase
    .from('tracks')
    .select('audio_url, canvas_url')
    .eq('user_id', user.id);

  for (const track of tracks) {
    if (track.audio_url) {
      await supabase.storage.from('songs').remove([extractPath(track.audio_url)]);
    }
    if (track.canvas_url) {
      await supabase.storage.from('canvas').remove([extractPath(track.canvas_url)]);
    }
  }

  // Delete database records (cascades via FK constraints)
  await supabase
    .from('users')
    .delete()
    .eq('id', user.id);

  return new Response('Account deleted', { status: 200 });
}
```

**2. Data Retention Policy**

- **Tracks:** 14-day auto-deletion
- **User accounts:** Deleted on request (GDPR right to be forgotten)
- **Transaction records:** Retained for 7 years (financial compliance)
- **Logs:** 90-day retention

### Secrets Management

```bash
# .env.local (never commit to git!)
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only!

# External APIs
SUNOAPI_API_KEY=sk_xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_AI_API_KEY=AIza...

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Webhooks
SUNOAPI_WEBHOOK_SECRET=xxx

# Cron jobs
CRON_SECRET=xxx # For Vercel Cron authentication

# Admin
ADMIN_EMAIL=admin@musikkfabrikken.no
```

**Secret Rotation Policy:**
- Rotate API keys every 90 days
- Rotate webhook secrets every 180 days
- Immediate rotation if compromise suspected

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Week 1: Project Setup & Infrastructure**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Supabase project (database, auth, storage)
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up Git repository and CI/CD pipeline
- [ ] Create database schema (run migrations)
- [ ] Configure environment variables
- [ ] Set up Vercel deployment (staging + production)

**Week 2: Authentication & User Management**
- [ ] Implement Google OAuth with Supabase Auth
- [ ] Create user dashboard page
- [ ] Build credit balance component
- [ ] Implement Row Level Security policies
- [ ] Create user profile page
- [ ] Test authentication flow end-to-end

**Week 3: Payment Integration**
- [ ] Integrate Stripe (payment intents)
- [ ] Build credit purchase flow UI
- [ ] Implement webhook handler for payments
- [ ] Create atomic credit transaction functions
- [ ] Test payment flow in sandbox mode
- [ ] Set up Stripe production account

**Deliverables:**
- Working authentication system
- Credit purchase functionality
- Database with RLS policies
- Deployed staging environment

---

### Phase 2: Core Features (Weeks 4-7)

**Week 4: Norwegian Phonetic Optimization**
- [ ] Integrate OpenAI GPT-4
- [ ] Develop phonetic optimization prompts
- [ ] Build diff viewer component
- [ ] Implement per-line override logic
- [ ] Create prompt template versioning system
- [ ] Test with Norwegian native speakers (5-10 samples)

**Week 5: Suno API Integration**
- [ ] Integrate sunoapi.org client
- [ ] Implement song generation API route
- [ ] Build webhook handler for completion
- [ ] Create file download & storage logic (3-day expiry handling)
- [ ] Implement atomic credit deduction
- [ ] Test end-to-end song generation flow

**Week 6: Track Management**
- [ ] Build track list UI
- [ ] Implement audio player component (Howler.js)
- [ ] Create download functionality
- [ ] Set up 14-day auto-deletion cron job
- [ ] Build session persistence logic
- [ ] Test concurrent song generation

**Week 7: Free Tier & Conversion**
- [ ] Implement 30-second preview generation
- [ ] Build free tier enforcement logic
- [ ] Create upgrade modal/upsell flow
- [ ] Implement conversion tracking
- [ ] Test free-to-paid conversion funnel
- [ ] A/B test upsell messaging

**Deliverables:**
- Complete song generation flow
- Norwegian phonetic optimization working
- Track list with playback
- Free tier with conversion path

---

### Phase 3: Polish & Launch (Weeks 8-10)

**Week 8: Premium Features**
- [ ] Implement canvas generation (Gemini + Google Video)
- [ ] Build mastering service booking flow
- [ ] Create admin dashboard for mastering requests
- [ ] Implement email notifications
- [ ] Test premium features end-to-end

**Week 9: Quality & Testing**
- [ ] User acceptance testing with 10-20 beta users
- [ ] Collect feedback on Norwegian pronunciation quality
- [ ] Fix critical bugs
- [ ] Optimize performance (page load times, API response times)
- [ ] Security audit (penetration testing)
- [ ] GDPR compliance review

**Week 10: Launch Preparation**
- [ ] Create marketing landing page
- [ ] Write documentation (user guide, FAQ)
- [ ] Set up analytics (Plausible/PostHog)
- [ ] Configure error tracking (Sentry)
- [ ] Set up monitoring alerts (API costs, uptime)
- [ ] Final production deployment
- [ ] Soft launch to founder's Spotify audience (80k listeners)

**Deliverables:**
- Production-ready MVP
- Beta-tested with real users
- Marketing materials prepared
- Monitoring and analytics active

---

### Post-MVP Roadmap (Months 2-6)

**Month 2:**
- Vipps payment integration (Norwegian preference)
- Enhanced storage notifications (expiry warnings)
- Quality monitoring dashboard (test team feedback)

**Month 3:**
- Nynorsk dialect support
- Advanced character encoding sanitization
- Backup mastering assistant hiring

**Months 4-6:**
- Swedish market expansion research
- Album/playlist creation features
- Referral program implementation
- A/B testing for phonetic optimization prompts

---

## Technical Risks & Mitigation

### High-Impact Risks

**1. sunoapi.org Dependency (Third-Party Wrapper)**

**Risk:** Provider could increase prices, shut down, or lose Suno access
**Impact:** CRITICAL - entire music generation capability lost
**Probability:** Medium (third-party service instability)

**Mitigation:**
- ✅ Pre-paid credit buffer provides 30-day financial cushion for recovery
- ✅ Monitor official Suno API availability weekly
- ✅ Maintain list of alternative Suno wrappers (fallback providers)
- ✅ Build provider abstraction layer (easy switching)
- ⚠️ Have migration plan ready if official API becomes available

**Code: Provider Abstraction**
```typescript
// lib/music-provider.ts
interface MusicProvider {
  generateSong(params: SongParams): Promise<SongTask>;
  getTaskStatus(taskId: string): Promise<SongTask>;
}

class SunoAPIProvider implements MusicProvider {
  async generateSong(params: SongParams) {
    // sunoapi.org implementation
  }
}

class AlternativeProvider implements MusicProvider {
  async generateSong(params: SongParams) {
    // Alternative wrapper implementation
  }
}

// Easy provider switching
const provider: MusicProvider = process.env.MUSIC_PROVIDER === 'alternative'
  ? new AlternativeProvider()
  : new SunoAPIProvider();
```

**2. Norwegian Pronunciation Quality Degradation**

**Risk:** Suno model updates worsen Norwegian pronunciation
**Impact:** HIGH - core value proposition fails
**Probability:** Medium (AI models change unpredictably)

**Mitigation:**
- ✅ Test team of Norwegian native speakers for rapid detection
- ✅ Maintain prompt libraries for multiple Suno model versions (v3.5, v4, v4.5, v5)
- ✅ Automated quality alerts when user satisfaction <70%
- ✅ Version rollback capability (use older Suno models if newer ones fail)
- ✅ Continuous prompt iteration based on user feedback

**Code: Quality Monitoring**
```typescript
// Automated quality alert system
async function checkQualityMetrics() {
  const recentFeedback = await supabase
    .from('user_feedback')
    .select('pronunciation_quality')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
    .avg('pronunciation_quality');

  const avgScore = recentFeedback.data[0].avg;

  if (avgScore < 3.5) { // <70% on 5-point scale
    await sendAlert({
      to: process.env.ADMIN_EMAIL,
      subject: '⚠️ Quality Alert: Pronunciation Score Drop',
      body: `Average pronunciation quality: ${avgScore}/5 (target: 3.5+)`
    });
  }
}
```

**3. API Cost Spikes**

**Risk:** Unexpected traffic surge causes API costs to spike
**Impact:** MEDIUM - negative cash flow
**Probability:** Low (pre-paid model limits exposure)

**Mitigation:**
- ✅ Pre-paid credit system prevents infinite API spending
- ✅ Rate limiting (max 3 concurrent generations per user)
- ✅ Daily cost monitoring with alerts ($200/day threshold)
- ✅ Circuit breaker pattern (pause new requests if costs exceed threshold)

**Code: Cost Circuit Breaker**
```typescript
// lib/circuit-breaker.ts
let dailyCost = 0;
const DAILY_LIMIT = 200; // $200/day

export async function checkCostLimit() {
  if (dailyCost > DAILY_LIMIT) {
    throw new Error('Daily API cost limit exceeded. New generations paused.');
  }
}

export function trackCost(amount: number) {
  dailyCost += amount;
}

// Reset daily at midnight (Vercel Cron)
export async function resetDailyCost() {
  dailyCost = 0;
}
```

### Medium-Impact Risks

**4. Concurrent Request Race Conditions**

**Risk:** Multiple simultaneous credit deductions cause double-charging
**Impact:** MEDIUM - user trust issues, refund headaches
**Probability:** Low (atomic transactions prevent this)

**Mitigation:**
- ✅ PostgreSQL row-level locking with `FOR UPDATE`
- ✅ Atomic stored procedures for credit transactions
- ✅ Transaction audit trail for debugging
- ✅ Automated refund if double-charge detected

**5. File Storage Costs**

**Risk:** Storage costs exceed budget as user base grows
**Impact:** MEDIUM - reduced profit margin
**Probability:** Medium (mitigated by 14-day deletion)

**Mitigation:**
- ✅ 14-day auto-deletion policy
- ✅ Immediate download from sunoapi.org (avoid duplicate storage)
- ✅ Compress audio files (MP3 vs WAV)
- ✅ Monitor storage costs weekly

**6. Viral Growth Overwhelms Infrastructure**

**Risk:** Unexpected viral growth (TikTok/Facebook) causes service degradation
**Impact:** MEDIUM - poor user experience, churn
**Probability:** Low (serverless scales automatically)

**Mitigation:**
- ✅ Vercel serverless functions auto-scale
- ✅ Supabase connection pooling
- ✅ CDN for static assets
- ⚠️ Manual intervention ready (disable new signups temporarily if needed)

### Low-Impact Risks

**7. GDPR Compliance Issues**

**Risk:** User data handling violates GDPR
**Impact:** LOW-MEDIUM - legal liability
**Probability:** Low (Supabase is GDPR-compliant)

**Mitigation:**
- ✅ Supabase RLS policies (data isolation)
- ✅ Data export/deletion endpoints
- ✅ Privacy policy + ToS
- ✅ Cookie consent (if analytics added)

**8. Stripe Payment Disputes**

**Risk:** Users dispute credit purchases
**Impact:** LOW - revenue loss + fees
**Probability:** Low (clear pricing, no subscriptions)

**Mitigation:**
- ✅ Clear credit package descriptions
- ✅ Email confirmations for purchases
- ✅ Transaction history visible to users
- ✅ Prompt customer support response

---

## Performance Requirements

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time (dashboard) | <2 seconds | Lighthouse score >90 |
| Song generation time | 1-3 minutes | sunoapi.org dependent |
| API response time (credit check) | <200ms | 95th percentile |
| Audio player load time | <1 second | Time to first play |
| Database query time | <100ms | 95th percentile |
| File upload time (canvas) | <5 seconds | 1MB image |

### Optimization Strategies

**1. Frontend Performance**

```typescript
// Next.js optimizations
export const metadata = {
  // Minimize initial bundle
  viewport: 'width=device-width, initial-scale=1',
};

// Code splitting (dynamic imports)
const AudioPlayer = dynamic(() => import('@/components/AudioPlayer'), {
  ssr: false, // Client-side only
  loading: () => <PlayerSkeleton />
});

// Image optimization
import Image from 'next/image';

<Image
  src={trackArtwork}
  alt="Track artwork"
  width={300}
  height={300}
  priority={false} // Lazy load
  placeholder="blur"
/>

// Font optimization (variable fonts)
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});
```

**2. Database Optimization**

```sql
-- Indexed queries
CREATE INDEX idx_tracks_user_id_created_at ON tracks(user_id, created_at DESC);

-- Efficient pagination
SELECT * FROM tracks
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Connection pooling (Supabase handles automatically)
-- Max connections: 15 on free tier, 50 on pro tier
```

**3. Caching Strategy**

```typescript
// Next.js caching
export const revalidate = 60; // Revalidate every 60 seconds

// API route caching (Vercel Edge Config)
import { get } from '@vercel/edge-config';

export async function GET() {
  const cachedPrompts = await get('active_prompts');

  if (cachedPrompts) {
    return Response.json(cachedPrompts);
  }

  // Fetch from database if not cached...
}

// Browser caching (audio files)
export async function GET(request: Request) {
  return new Response(audioFile, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600' // 1 hour
    }
  });
}
```

**4. Asset Optimization**

- **Images:** WebP format, lazy loading, responsive sizes
- **Audio:** MP3 compression (128kbps for free, 320kbps for premium)
- **CSS:** Tailwind purge unused styles (reduces bundle by 90%)
- **JS:** Tree shaking, minification, code splitting

---

## Deployment & Infrastructure

### Hosting Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend + API)                    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Next.js App                                           │    │
│  │  • Frontend pages (React)                              │    │
│  │  • API routes (Serverless Functions)                   │    │
│  │  • Static assets (Images, CSS, JS)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Auto-scaling: 0 → N instances based on traffic                │
│  Regions: Global CDN (Edge Network)                            │
│  Cost: $20/month (Pro plan) for MVP scale                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                           │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │  PostgreSQL   │  │  Auth (JWT)   │  │  Storage      │      │
│  │  Database     │  │  Google OAuth │  │  Songs/Canvas │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
│  Region: EU West (GDPR compliance)                             │
│  Cost: Free tier → $25/month (Pro) at scale                    │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Pipeline (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run type check
        run: npm run typecheck

      - name: Run linter
        run: npm run lint

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        run: vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Run database migrations
        run: npx supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Notify deployment success
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"🚀 Deployed to production successfully!"}'
```

### Environment Configuration

**Staging Environment:**
- URL: `https://staging.musikkfabrikken.no`
- Purpose: Pre-production testing, beta users
- Database: Separate Supabase project
- Stripe: Test mode

**Production Environment:**
- URL: `https://musikkfabrikken.no`
- Purpose: Live users
- Database: Production Supabase project
- Stripe: Live mode

### Monitoring & Observability

```typescript
// Sentry error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.data) {
      delete event.request.data.lyrics; // Don't send user lyrics to Sentry
    }
    return event;
  }
});

// Analytics (Plausible - privacy-friendly)
<Script
  defer
  data-domain="musikkfabrikken.no"
  src="https://plausible.io/js/script.js"
/>

// Custom event tracking
plausible('Song Generated', {
  props: {
    model: 'v4',
    duration: 180,
    phonetic_optimization: true
  }
});
```

**Key Metrics Tracked:**
- Page views, unique visitors
- Conversion funnel (signup → free preview → paid purchase)
- Song generation success rate
- API error rates
- Norwegian pronunciation satisfaction scores

---

## Testing Strategy

### Test Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │  (Playwright)│
                    └─────────────┘
                ┌───────────────────────┐
                │  Integration Tests    │  (30%)
                │  (API routes, DB)     │
                └───────────────────────┘
        ┌───────────────────────────────────────┐
        │         Unit Tests                    │  (60%)
        │  (Components, utils, business logic)  │
        └───────────────────────────────────────┘
```

### Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/lib/phonetic-optimizer.test.ts
import { optimizeNorwegianLyrics } from '@/lib/phonetic/optimizer';

describe('Norwegian Phonetic Optimizer', () => {
  it('should apply rolled R pronunciation', async () => {
    const input = 'Jeg reiser til Norge';
    const result = await optimizeNorwegianLyrics(input);

    expect(result.optimized).toContain('rreiser'); // Emphasized R
  });

  it('should preserve proper nouns', async () => {
    const input = 'Oslo er vakker';
    const result = await optimizeNorwegianLyrics(input, {
      preserveLines: [1] // Don't change line 1
    });

    expect(result.optimized).toContain('Oslo'); // Unchanged
  });

  it('should handle empty input gracefully', async () => {
    await expect(optimizeNorwegianLyrics('')).rejects.toThrow('Lyrics cannot be empty');
  });
});

// __tests__/components/DiffViewer.test.tsx
import { render, screen } from '@testing-library/react';
import { DiffViewer } from '@/components/DiffViewer';

describe('DiffViewer', () => {
  it('should render changes with color coding', () => {
    const changes = [
      { lineNumber: 1, type: 'modified', original: 'reiser', optimized: 'rreiser' }
    ];

    render(<DiffViewer changes={changes} onLineOverride={() => {}} />);

    expect(screen.getByText('reiser')).toHaveClass('line-through');
    expect(screen.getByText('rreiser')).toHaveClass('text-green-600');
  });
});
```

### Integration Tests (API Routes)

```typescript
// __tests__/api/songs/generate.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/songs/generate/route';

describe('/api/songs/generate', () => {
  it('should deduct credits and create song task', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        lyrics: 'Test Norwegian lyrics',
        style: 'pop'
      }
    });

    // Mock authenticated user
    jest.spyOn(auth, 'getUser').mockResolvedValue({ id: 'user-123' });

    // Mock Suno API
    jest.spyOn(sunoapi, 'generateSong').mockResolvedValue({
      task_id: 'task-abc',
      status: 'queued'
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.taskId).toBe('task-abc');

    // Verify credits deducted
    const { data: user } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', 'user-123')
      .single();

    expect(user.credit_balance).toBe(120); // Started with 150, used 30
  });

  it('should reject if insufficient credits', async () => {
    jest.spyOn(auth, 'getUser').mockResolvedValue({ id: 'user-456' });

    // User has only 10 credits
    await supabase
      .from('users')
      .update({ credit_balance: 10 })
      .eq('id', 'user-456');

    const { req } = createMocks({ method: 'POST', body: { lyrics: '...', style: 'pop' } });
    const response = await POST(req);

    expect(response.status).toBe(402); // Payment required
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/song-generation.spec.ts
import { test, expect } from '@playwright/test';

test('complete song generation flow', async ({ page }) => {
  // 1. Sign up
  await page.goto('https://staging.musikkfabrikken.no');
  await page.click('text=Sign up with Google');
  // ... OAuth flow (mock in staging)

  // 2. Purchase credits
  await page.click('text=Buy Credits');
  await page.click('text=Pro Package ($45)');
  // ... Stripe payment (use test card)

  await expect(page.locator('text=600 credits')).toBeVisible();

  // 3. Create song
  await page.click('text=Create New Song');
  await page.fill('textarea[name="lyrics"]', 'Jeg elsker Norge\nDet er så vakkert');
  await page.selectOption('select[name="style"]', 'pop');

  // 4. Enable phonetic optimization
  await page.click('text=Uttalelse Bokmål');
  await page.waitForSelector('text=rreiser'); // Wait for diff preview

  // 5. Generate
  await page.click('text=Generate Song');

  // 6. Wait for completion (timeout: 3 minutes)
  await expect(page.locator('text=Your song is ready!')).toBeVisible({ timeout: 180000 });

  // 7. Verify audio player appears
  await expect(page.locator('audio')).toBeVisible();

  // 8. Download
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=Download');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.mp3$/);
});
```

### Test Coverage Goals

- **Unit tests:** 80%+ coverage
- **Integration tests:** All critical API routes
- **E2E tests:** Happy path + critical failure scenarios

**Run tests:**
```bash
# Unit + integration tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## Success Metrics

### Technical Success Metrics

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| Uptime | 99.5%+ | Real-time (UptimeRobot) |
| API error rate | <1% | Daily |
| Song generation success rate | >95% | Daily |
| Average song generation time | <3 minutes | Daily |
| Database query time (p95) | <100ms | Hourly |
| Page load time (Lighthouse) | >90 score | Weekly |
| Security vulnerabilities | 0 critical | Weekly scan |

### User Success Metrics

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| Free tier activation | 80%+ complete 1 song | Weekly |
| Free-to-paid conversion | 10-15% | Weekly |
| Norwegian pronunciation satisfaction | 70%+ | Monthly survey |
| Day 7 retention | 60%+ | Weekly cohort |
| Songs per user (first month) | 3+ average | Monthly |
| Social sharing rate | 40%+ | Weekly |

### Business Metrics

| Metric | Target (Month 6) | Current |
|--------|-----------------|---------|
| Total users | 1,000+ | TBD |
| Paying customers | 200+ (20% conversion) | TBD |
| MRR | $7,000+ | TBD |
| Customer LTV/CAC ratio | >3:1 | TBD |
| Contribution margin | 95%+ | TBD |
| Song generations/month | 5,000+ | TBD |

### Quality Metrics (Norwegian Pronunciation)

Measured through user feedback surveys after each song:

**Question:** "How would you rate the Norwegian pronunciation quality compared to using Suno directly?"

- 5 stars: Much better (target: 30%)
- 4 stars: Noticeably better (target: 40%)
- 3 stars: Slightly better (target: 20%)
- 2 stars: About the same (max: 8%)
- 1 star: Worse (max: 2%)

**Success criteria:** 70%+ rate as "Noticeably better" or "Much better" (4-5 stars)

---

## Appendices

### A. Glossary

**Technical Terms:**

- **Atomic transaction:** Database operation that either completes fully or not at all (no partial states)
- **Edge function:** Serverless function that runs on CDN edge nodes (closer to users)
- **JWT:** JSON Web Token - authentication token format
- **Rate limiting:** Restricting number of API requests per time period
- **RLS:** Row Level Security - database-level access control
- **Serverless:** Cloud computing model where infrastructure scales automatically
- **Webhook:** HTTP callback that sends real-time notifications

**Domain-Specific:**

- **Bokmål:** One of two written Norwegian language standards (most common)
- **Canvas:** Visual album art for songs (Spotify/Instagram format)
- **Phonetic optimization:** Adjusting spelling to improve AI pronunciation
- **Suno:** AI music generation platform
- **sunoapi.org:** Third-party wrapper providing API access to Suno

### B. API Reference Summary

**Internal API Routes:**

```
POST   /api/songs/generate          - Generate new song
GET    /api/songs/[id]              - Get song details
GET    /api/songs/[id]/download     - Download audio file
POST   /api/credits/purchase        - Purchase credit package
GET    /api/credits/balance         - Check credit balance
POST   /api/phonetic/optimize       - Optimize Norwegian lyrics
POST   /api/canvas/generate         - Generate canvas art
POST   /api/mastering/book          - Book mastering service
POST   /api/webhooks/sunoapi        - Suno completion webhook
POST   /api/webhooks/stripe         - Stripe payment webhook
GET    /api/cron/cleanup-expired    - Delete expired tracks (Vercel Cron)
```

### C. Database Backup & Recovery

**Supabase Automatic Backups:**
- Daily backups (7-day retention on free tier, 30-day on pro)
- Point-in-time recovery (pro plan only)

**Manual Backup Strategy:**
```bash
# Export database schema + data
pg_dump $SUPABASE_DB_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $SUPABASE_DB_URL < backup-20251118.sql
```

**Recovery Time Objective (RTO):** <2 hours
**Recovery Point Objective (RPO):** <24 hours (daily backups)

### D. Cost Estimates (MVP Scale)

**Monthly Infrastructure Costs:**

| Service | Usage | Cost |
|---------|-------|------|
| Vercel (Pro plan) | Hosting + serverless functions | $20 |
| Supabase (Free → Pro) | Database + auth + storage | $0 → $25 |
| Domain (musikkfabrikken.no) | Annual renewal | ~$2/month |
| Sentry (error tracking) | Free tier (5k events/month) | $0 |
| Plausible (analytics) | Free tier (10k pageviews) | $0 |
| **Total (Free tier)** | | **$22/month** |
| **Total (Pro tier at scale)** | | **$47/month** |

**Variable Costs (per song):**
- sunoapi.org: $0.06
- GPT-4: $0.03
- Storage: ~$0.01
- **Total per song:** ~$0.10

**At 1,000 songs/month:**
- Variable costs: $100
- Total monthly cost: $122 (free tier) or $147 (pro tier)

**Revenue at 200 paying customers (MRR: $7,080):**
- Gross profit: $7,080 - $147 = **$6,933/month**
- Profit margin: **98%**

### E. Useful Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- sunoapi.org: https://docs.sunoapi.org
- OpenAI: https://platform.openai.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

**Development Tools:**
- VS Code: https://code.visualstudio.com
- Postman (API testing): https://www.postman.com
- Supabase CLI: https://supabase.com/docs/guides/cli

**Learning Resources:**
- Next.js App Router tutorial: https://nextjs.org/learn
- PostgreSQL best practices: https://wiki.postgresql.org/wiki/Don%27t_Do_This
- Stripe integration guide: https://stripe.com/docs/payments/accept-a-payment

---

## Conclusion

This technical proposal outlines a comprehensive plan for building **Musikkfabrikken** - an AI-powered Norwegian music creation platform optimized for developer implementation.

**Key Technical Highlights:**
- **Modern stack:** Next.js 14 + TypeScript + Supabase provides rapid development velocity
- **Scalable architecture:** Serverless design handles growth automatically
- **Economic resilience:** Pre-paid credit system + atomic transactions prevent cost exposure
- **Quality focus:** Norwegian phonetic optimization as core differentiator
- **Risk mitigation:** Provider abstraction, quality monitoring, cost controls

**Next Steps for Development Team:**
1. Review and approve technical approach
2. Set up development environment (Supabase project, API keys)
3. Begin Phase 1: Foundation (weeks 1-3)
4. Recruit Norwegian native speakers for testing (5-10 people)
5. Launch soft beta to founder's Spotify audience (80k listeners)

**Estimated Timeline:** 10 weeks to production-ready MVP
**Estimated Cost:** $22-47/month infrastructure + development time
**Target Market:** 1,000 users, 200 paying customers, $7k+ MRR by month 6

---

**Questions or clarifications?** Contact: [Your contact information]

**Document Version:** 1.0
**Last Updated:** 2025-11-18
**Status:** Ready for Development Team Review
