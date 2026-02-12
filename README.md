# KI Musikk

Norwegian AI-powered song creation platform. Create authentic-sounding Norwegian songs — from lyrics to finished track — in minutes.

**[kimusikk.no](https://www.kimusikk.no)**

## The Problem

AI music tools produce Norwegian vocals that sound American and fake. Phonetic mispronunciations make the output unusable for anyone who cares about authenticity. Manual workarounds require expert-level knowledge that mainstream creators don't have.

## The Solution

KI Musikk is the only platform built specifically for Norwegian music creation. It applies intelligent pronunciation optimization to produce vocals that actually sound Norwegian — not retrofitted from English.

**Three steps:**
1. **Skriv tekst** — Write lyrics manually or generate them from a concept with AI
2. **Velg sjanger** — Pick a genre and style from a curated library
3. **Lag sang** — Generate a full, production-ready track

## Features

- AI-powered Norwegian lyric generation from simple concepts
- Norwegian pronunciation optimization for authentic-sounding vocals
- Curated genre library with custom genre support
- Built-in audio player with full playback controls
- Personal song library with download support
- Credit-based pricing in NOK via Vipps

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router, Turbopack) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | Zustand |
| **Audio** | Howler.js |
| **Database** | Supabase (PostgreSQL + Auth + Storage + RLS) |
| **Auth** | Vipps OAuth 2.0 + Google OAuth |
| **Payments** | Vipps ePayment |
| **Hosting** | Vercel (Edge + Serverless) |

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Home — song creation wizard
│   ├── auth/                         # Login flows (Vipps, Google)
│   ├── sanger/                       # Song library
│   ├── innstillinger/                # User settings + credits
│   ├── priser/                       # Pricing
│   ├── hjelp/                        # Help / FAQ
│   ├── om-oss/                       # About
│   ├── kontakt/                      # Contact
│   ├── personvern/                   # Privacy policy
│   ├── vilkaar/                      # Terms of service
│   └── api/
│       ├── auth/                     # OAuth flows + session management
│       ├── lyrics/                   # AI lyric generation + optimization
│       ├── songs/                    # Song CRUD + generation pipeline
│       ├── credits/                  # Balance + purchase endpoints
│       └── webhooks/                 # Async callbacks (payment, generation)
├── components/
│   ├── wizard/                       # 3-step song creation flow
│   ├── ui/                           # shadcn/ui primitives
│   └── ...                           # Player, library, layout components
├── lib/                              # API clients, utilities, constants
└── types/                            # TypeScript definitions
```

## Technical Highlights

- **Full-stack Next.js** — Server-side API routes handling OAuth, payment processing, and webhook ingestion alongside a React client
- **Atomic credit transactions** — Database-level transactional deductions with automatic rollback on generation failure
- **Dual OAuth integration** — Vipps (Norwegian national identity) and Google, unified through Supabase Auth
- **Async generation pipeline** — Song creation kicks off via API, completes via webhook callbacks with early-playback support for partial results
- **Row-Level Security** — All user data isolated at the database layer via Supabase RLS policies
- **Norwegian-first localization** — Full Bokmål UI with `lang="nb"` and `nb_NO` locale throughout

## Status

Live in production at [kimusikk.no](https://www.kimusikk.no).

---

Made in Norway. All rights reserved.
