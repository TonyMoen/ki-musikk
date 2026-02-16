# ibe160 - Technical Specification

**Author:** BIP
**Date:** 2026-02-16
**Project Level:** Quick-Flow (Brownfield)
**Change Type:** Enhancement — SEO Infrastructure & Optimization
**Development Context:** Brownfield — existing Next.js 14 production app

---

## Context

### Available Documents

- **Product Brief:** `docs/product-brief-norskmusikk.md` — Full product vision, target market (Norwegian party song creators 25-50, entry-level Spotify artists 18-35), business model (pre-paid credits via Vipps), and technical stack decisions.
- **Research:** None available
- **Brownfield Documentation:** None (project has existing epics/stories from initial build)

### Project Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.3 |
| UI Library | React | 18.2.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.1 |
| UI Components | shadcn/UI (Radix UI) | Latest |
| State Management | Zustand | 5.0.8 |
| Database/Auth/Storage | Supabase (SSR + JS) | 0.7.0 / 2.84.0 |
| Audio | Howler.js + WaveSurfer.js | 2.2.4 / 7.11.1 |
| Validation | Zod | 4.1.12 |
| Linting | ESLint + eslint-config-next | 8.x / 14.2.3 |
| Deployment | Vercel | N/A |
| Payment | Vipps (via API) | N/A |

**Build/Dev Scripts:**
- `npm run dev` — Next.js dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — ESLint

### Existing Codebase Structure

**Directory Organization:** Feature-based within Next.js App Router conventions
```
src/
├── app/                    # Pages and API routes (App Router)
│   ├── layout.tsx          # Root layout with global metadata
│   ├── page.tsx            # Homepage ('use client')
│   ├── not-found.tsx       # Custom 404
│   ├── priser/page.tsx     # Pricing ('use client')
│   ├── om-oss/page.tsx     # About (server component)
│   ├── hjelp/page.tsx      # Help/FAQ ('use client')
│   ├── kontakt/page.tsx    # Contact (server component)
│   ├── personvern/page.tsx # Privacy (server component)
│   ├── vilkaar/page.tsx    # Terms (server component)
│   ├── sanger/page.tsx     # My Songs ('use client')
│   ├── innstillinger/      # Settings
│   ├── auth/logg-inn/      # Login
│   ├── test-player/        # Test page (should not be indexed)
│   └── api/                # API routes
├── components/             # React components
│   ├── layout/             # Header, Footer, GlobalPlayer
│   ├── wizard/             # Song creation wizard
│   ├── ui/                 # shadcn/UI components
│   └── ...
├── lib/                    # Utilities and constants
│   ├── supabase/           # Supabase client
│   ├── faq-data.ts         # FAQ content (15 items, 5 categories)
│   ├── constants.ts        # Credit packages, etc.
│   └── ...
├── contexts/               # React contexts
└── hooks/                  # Custom hooks
```

**Code Conventions:**
- Server components by default; `'use client'` only when needed (interactive pages)
- `export const metadata: Metadata` for page-level metadata (Next.js pattern)
- Path aliases: `@/*` → `./src/*`
- No semicolons enforced, single quotes, Tailwind for all styling
- Norwegian UI content throughout
- `html lang="nb"`, OpenGraph locale `nb_NO`

**Current SEO State:**
- Root layout has basic metadata (title, description, keywords, partial OG)
- Only `/sanger` has page-specific metadata
- No sitemap.ts, no robots.ts, no JSON-LD, no canonical URLs
- No OG images, no Twitter card tags
- Homepage is `'use client'` with no H1 tag
- `Cache-Control: no-store` applied to all non-static routes in next.config.js
- Custom 404 page exists (Norwegian)

---

## The Change

### Problem Statement

KI MUSIKK is a Norwegian AI song generation platform targeting the Norwegian market. Despite having good content, clean Norwegian URLs, and proper `lang="nb"` setup, the app has critical SEO infrastructure gaps that prevent effective search engine discovery and social media sharing:

1. **Invisible to crawlers:** No sitemap.xml or robots.txt means Google has no efficient way to discover and index the 8+ public pages.
2. **No rich results:** Zero structured data (JSON-LD) means the app cannot appear in Google's FAQ rich snippets, product carousels, or organization knowledge panels — a competitive advantage being left on the table given zero Norwegian AI music competitors.
3. **Poor social sharing:** No OG images or Twitter cards means shared links appear as plain text on social media — killing viral potential for a product whose growth model depends on social sharing (target: 40% share rate).
4. **Missing page-level SEO:** Only 1 of 8 public pages has unique metadata. Google sees the same title/description for pricing, about, help, contact, privacy, and terms pages.
5. **Performance penalty:** `Cache-Control: no-store` on all routes forces browsers to re-fetch everything on every visit, hurting Core Web Vitals scores that directly impact Google ranking.
6. **Homepage has no H1:** The most important SEO signal on the most important page is absent.

**Business Impact:** The Norwegian market for "KI sanggenerator" has near-zero competition. These SEO gaps mean potential users searching for terms like "lag sanger med KI", "norsk sanggenerator", "personlige sanger" cannot find the app. Every day without these fixes is lost organic traffic in a market with first-mover advantage.

### Proposed Solution

Implement comprehensive SEO infrastructure across three focused areas:

1. **Crawlability & Indexing Foundation** — Add sitemap.ts, robots.ts, canonical URLs, and fix cache headers so search engines can efficiently discover, crawl, and index all public pages.

2. **Rich Results & Social Sharing** — Add JSON-LD structured data (Organization, FAQ, Product schemas), OG images, Twitter card metadata, and an H1 to the homepage to enable rich search results and attractive social media link previews.

3. **Page-Level Metadata Optimization** — Add unique, Norwegian-language metadata to every public page with targeted keywords for the Norwegian AI music market.

### Scope

**In Scope:**

- Create `src/app/sitemap.ts` with all public routes
- Create `src/app/robots.ts` with crawl directives
- Add canonical URLs via metadata on all pages
- Fix `Cache-Control` headers in `next.config.js` (allow caching for public pages)
- Add JSON-LD structured data: Organization (sitewide), FAQPage (help page), Product/Offer (pricing page), LocalBusiness (contact page)
- Add OG image metadata (using existing `/ki-musikk.png` or a new social card image)
- Add Twitter card metadata to root layout
- Add H1 tag to homepage
- Add unique `export const metadata` to all public pages: `/priser`, `/om-oss`, `/hjelp`, `/kontakt`, `/personvern`, `/vilkaar`
- Exclude `/test-player`, `/sanger`, `/innstillinger`, `/auth/*`, `/api/*` from sitemap

**Out of Scope:**

- Creating a custom OG image design (use existing logo or placeholder; design can be done later)
- i18n/hreflang tags (single-language site, not needed now)
- Blog or content marketing pages
- Google Search Console setup (manual task, not code)
- Performance optimization beyond cache headers (image optimization, bundle size, etc.)
- PWA manifest
- Analytics/tracking setup
- Page content rewrites for SEO (only metadata, not body content)

---

## Implementation Details

### Source Tree Changes

| File | Action | What Changes |
|------|--------|-------------|
| `src/app/sitemap.ts` | CREATE | Dynamic sitemap generation with all public routes |
| `src/app/robots.ts` | CREATE | Robots.txt with sitemap reference, disallow private routes |
| `src/lib/seo.ts` | CREATE | Shared SEO constants (site URL, site name, default OG image) and JSON-LD helper functions |
| `src/app/hjelp/layout.tsx` | CREATE | Server component wrapper for hjelp page to add FAQ JSON-LD and metadata |
| `src/app/priser/layout.tsx` | CREATE | Server component wrapper for priser page to add Product JSON-LD and metadata |
| `src/app/layout.tsx` | MODIFY | Add Twitter card metadata, OG image, metadataBase, site name, Organization JSON-LD script |
| `src/app/page.tsx` | MODIFY | Add H1 tag wrapping main headline above WizardContainer |
| `src/app/om-oss/page.tsx` | MODIFY | Add `export const metadata` with unique title/description |
| `src/app/kontakt/page.tsx` | MODIFY | Add `export const metadata` with unique title/description + LocalBusiness JSON-LD |
| `src/app/personvern/page.tsx` | MODIFY | Add `export const metadata` with unique title/description |
| `src/app/vilkaar/page.tsx` | MODIFY | Add `export const metadata` with unique title/description |
| `next.config.js` | MODIFY | Fix Cache-Control headers — allow caching for public pages, keep no-store for API/auth routes |

### Technical Approach

**1. Sitemap Generation (Next.js native)**
Use Next.js App Router's built-in sitemap support via `src/app/sitemap.ts` exporting a `MetadataRoute.Sitemap`. This auto-generates `/sitemap.xml` at build time. Include all 7 public routes with appropriate `changeFrequency` and `priority` values.

**2. Robots.txt (Next.js native)**
Use `src/app/robots.ts` exporting `MetadataRoute.Robots`. Disallow `/api/`, `/auth/`, `/innstillinger/`, `/sanger/`, `/test-player/`. Reference sitemap URL.

**3. Metadata Strategy**
- Root layout (`layout.tsx`): Set `metadataBase`, add `twitter` card config, add `openGraph.siteName`, `openGraph.images`, and `openGraph.url`
- Each public page: Export page-specific `metadata` object that overrides root title and description
- Next.js automatically merges page metadata with layout metadata — no manual canonical tags needed when `metadataBase` is set

**4. JSON-LD Structured Data**
Create helper functions in `src/lib/seo.ts`:
- `getOrganizationJsonLd()` — Returns Organization schema (name, url, logo, contactPoint)
- `getFaqJsonLd(items)` — Takes FAQ items from `faq-data.ts` and returns FAQPage schema
- `getProductJsonLd(packages)` — Takes credit packages and returns Product/Offer schema
- `getLocalBusinessJsonLd()` — Returns LocalBusiness schema from contact page data

Inject JSON-LD via `<script type="application/ld+json">` in the page component. For server components (om-oss, kontakt), inject directly. For 'use client' pages (hjelp, priser), use a layout.tsx wrapper that is a server component.

**Critical: Client component metadata approach:**
Since `/hjelp/page.tsx` and `/priser/page.tsx` are `'use client'`, create `layout.tsx` files in their directories as server components that:
- Export the page metadata (`export const metadata`)
- Render the JSON-LD `<script>` tag
- Wrap the children (the client page component)

**5. Cache Headers Fix**
Modify `next.config.js` to differentiate between public and private routes:
- Public pages (`/`, `/priser`, `/om-oss`, `/hjelp`, `/kontakt`, `/personvern`, `/vilkaar`): `public, max-age=3600, stale-while-revalidate=86400`
- Private/dynamic routes (`/api/`, `/auth/`, `/sanger/`, `/innstillinger/`): Keep `no-store, must-revalidate`

**6. Homepage H1**
Add an H1 tag above the WizardContainer that contains the primary keyword. Since homepage is `'use client'`, the H1 is still rendered in initial HTML via SSR. Example: `<h1>Lag norske sanger med KI</h1>` styled appropriately to match the existing design.

### Existing Patterns to Follow

- **Metadata pattern:** Follow existing `export const metadata: Metadata` pattern established in `layout.tsx` and `sanger/page.tsx`
- **File organization:** New files in standard Next.js locations (`src/app/` for routes, `src/lib/` for utilities)
- **TypeScript:** All new files in TypeScript
- **Imports:** Use `@/` path alias for imports
- **Component style:** Server components by default; `'use client'` only when interactivity needed
- **Norwegian content:** All user-facing metadata text in Norwegian (Bokmal)
- **Styling:** Tailwind CSS classes, following existing design tokens and color patterns

### Integration Points

- **Next.js Metadata API:** All metadata uses Next.js built-in `Metadata` type — no third-party SEO libraries needed
- **FAQ Data:** JSON-LD FAQ schema reads from existing `src/lib/faq-data.ts` — single source of truth
- **Credit Packages:** JSON-LD Product schema reads from existing `src/lib/constants.ts` (`CREDIT_PACKAGES`)
- **Contact Info:** JSON-LD LocalBusiness schema uses hardcoded data matching `kontakt/page.tsx` (Moen Studio, org.nr 931 659 685, Heddalsvegen 11, 3674 Notodden)
- **Vercel:** Sitemap and robots.txt auto-generated at build time on Vercel — no deployment config changes needed

---

## Development Context

### Relevant Existing Code

| Reference | Location | Purpose |
|-----------|----------|---------|
| Root metadata | `src/app/layout.tsx:16-31` | Extend with metadataBase, twitter, OG images |
| Page metadata example | `src/app/sanger/page.tsx:15-18` | Pattern to follow for page-specific metadata |
| FAQ content | `src/lib/faq-data.ts:18-144` | Transform into JSON-LD FAQPage schema |
| Credit packages | `src/lib/constants.ts` | Use for Product JSON-LD pricing |
| Company info | `src/app/kontakt/page.tsx:54-76` | Use for LocalBusiness JSON-LD |
| Homepage structure | `src/app/page.tsx:22-98` | Add H1 tag |
| Cache headers | `next.config.js:24-40` | Fix Cache-Control values |

### Dependencies

**Framework/Libraries:**

| Dependency | Version | Purpose |
|-----------|---------|---------|
| next | 14.2.3 | Metadata API, sitemap/robots generation, App Router |
| react | 18.2.0 | Component rendering |
| typescript | 5.x | Type safety |

No new dependencies required. All SEO features use Next.js built-in capabilities.

**Internal Modules:**

| Module | Usage |
|--------|-------|
| `@/lib/faq-data` | FAQ items for JSON-LD FAQPage schema |
| `@/lib/constants` | Credit packages for JSON-LD Product schema |

### Configuration Changes

| File | Change |
|------|--------|
| `next.config.js` | Modify `headers()` to differentiate public vs private route caching |

No `.env` changes required. No new packages to install.

### Existing Conventions (Brownfield)

| Convention | Pattern |
|------------|---------|
| Metadata | `export const metadata: Metadata` (static exports) |
| File naming | kebab-case for files, PascalCase for components |
| Quotes | Single quotes |
| Semicolons | Not enforced (inconsistent in codebase) |
| Imports | Named exports preferred, `@/` path alias |
| Layout files | `layout.tsx` for wrapping pages with shared elements |
| Norwegian content | All user-facing text in Norwegian (Bokmal) |

### Test Framework & Standards

No test framework detected in the project. Testing for this SEO work will be:

- **Manual verification** via browser dev tools and View Source
- **Google Rich Results Test** for JSON-LD validation
- **Lighthouse SEO audit** for overall score
- **`npm run build`** to verify no build errors from metadata changes

---

## Implementation Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 14.2.3 | Metadata API, sitemap.ts, robots.ts |
| Language | TypeScript | 5.x | Type safety for metadata objects |
| Deployment | Vercel | N/A | Auto-builds sitemap.xml and robots.txt |

Zero new dependencies. Everything uses Next.js built-in features.

---

## Technical Details

### Sitemap Structure
```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://kimusikk.no'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                    changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/priser`,        changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/om-oss`,        changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/hjelp`,         changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/kontakt`,       changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/personvern`,    changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/vilkaar`,       changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
```

### Robots.txt Structure
```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/sanger/', '/innstillinger/', '/test-player/'],
      },
    ],
    sitemap: 'https://kimusikk.no/sitemap.xml',
  }
}
```

### JSON-LD Schemas

**Organization (sitewide via root layout):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "KI MUSIKK",
  "url": "https://kimusikk.no",
  "logo": "https://kimusikk.no/ki-musikk.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hei@kimusikk.no",
    "contactType": "customer service"
  }
}
```

**FAQPage (hjelp page):**
Dynamically generated from `FAQ_DATA` in `faq-data.ts` — maps each item to:
```json
{
  "@type": "Question",
  "name": "Hvordan lager jeg min forste sang?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Velg en sjanger fra forsiden..."
  }
}
```

**Product (priser page):**
Maps `CREDIT_PACKAGES` to `Offer` items with Norwegian Krone pricing:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "KI MUSIKK - Kredittpakker",
  "description": "Lag norske sanger med KI",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "99",
      "priceCurrency": "NOK",
      "description": "10 sanger"
    }
  ]
}
```

**LocalBusiness (kontakt page):**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Moen Studio",
  "url": "https://kimusikk.no",
  "email": "hei@kimusikk.no",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Heddalsvegen 11",
    "postalCode": "3674",
    "addressLocality": "Notodden",
    "addressCountry": "NO"
  },
  "taxID": "931659685"
}
```

### Cache Header Strategy
```javascript
async headers() {
  return [
    // Public pages: allow caching
    {
      source: '/(priser|om-oss|hjelp|kontakt|personvern|vilkaar)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        { key: 'Vary', value: 'Accept, Accept-Encoding' },
      ],
    },
    // Homepage: shorter cache (has dynamic elements for logged-in users)
    {
      source: '/',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=1800, stale-while-revalidate=3600' },
        { key: 'Vary', value: 'Accept, Accept-Encoding' },
      ],
    },
    // Private/dynamic routes: no cache
    {
      source: '/(api|auth|sanger|innstillinger|test-player)(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        { key: 'Vary', value: 'Accept, Accept-Encoding' },
      ],
    },
  ]
},
```

### Edge Cases

- **OG Image:** Use `/ki-musikk.png` as OG image initially. While not ideal dimensions (OG images should be 1200x630), it's better than no image. Can be replaced with a proper social card design later.
- **Client component metadata:** Pages with `'use client'` (priser, hjelp) cannot export metadata directly. Solution: create `layout.tsx` wrappers in their directories as server components that export the metadata and render JSON-LD.
- **Homepage H1 visibility:** The H1 must be visible and styled, not hidden with `sr-only`. Search engines may penalize hidden H1s.
- **metadataBase:** Setting `metadataBase: new URL('https://kimusikk.no')` in root layout automatically resolves all relative OG URLs and generates canonical URLs.

---

## Development Setup

1. Clone repo (if not already)
2. `npm install` (all deps from package.json)
3. Copy `.env` or `.env.local` (configure Supabase, API keys)
4. `npm run dev` (starts dev server with Turbopack)
5. `npm run build` (verify sitemap.xml and robots.txt generation)
6. `npm run lint` (check for linting errors)

---

## Implementation Guide

### Setup Steps

1. Create feature branch: `git checkout -b feat/seo-infrastructure`
2. Verify dev environment running: `npm run dev`
3. Review existing metadata in `src/app/layout.tsx`
4. Confirm site URL is `https://kimusikk.no`

### Implementation Steps

**Story 1: Crawlability & Indexing**
1. Create `src/lib/seo.ts` with shared constants (BASE_URL, site name, default OG image path)
2. Create `src/app/sitemap.ts` with all 7 public routes
3. Create `src/app/robots.ts` with disallow rules and sitemap reference
4. Modify `src/app/layout.tsx` — add `metadataBase`, Twitter card config, OG image, site name
5. Modify `next.config.js` — restructure cache headers for public vs private routes
6. Verify: `npm run build`, check `/sitemap.xml` and `/robots.txt` in browser

**Story 2: Rich Results & Social**
1. Add JSON-LD helper functions to `src/lib/seo.ts` (Organization, FAQ, Product, LocalBusiness)
2. Add Organization JSON-LD script tag to `src/app/layout.tsx`
3. Create `src/app/hjelp/layout.tsx` with FAQ JSON-LD + page metadata
4. Create `src/app/priser/layout.tsx` with Product JSON-LD + page metadata
5. Add LocalBusiness JSON-LD to `src/app/kontakt/page.tsx` (already a server component)
6. Add H1 to homepage (`src/app/page.tsx`) — visible, styled, containing primary keyword
7. Verify: Google Rich Results Test for each JSON-LD type

**Story 3: Page-Level Metadata**
1. Add `export const metadata` to `src/app/om-oss/page.tsx`
2. Add `export const metadata` to `src/app/kontakt/page.tsx`
3. Add `export const metadata` to `src/app/personvern/page.tsx`
4. Add `export const metadata` to `src/app/vilkaar/page.tsx`
5. Verify metadata already added in Story 2 layouts for hjelp and priser
6. Verify: View source on each page — check `<title>` and `<meta>` tags are unique
7. Run Lighthouse SEO audit on all pages

### Testing Strategy

- **Build verification:** `npm run build` must succeed without errors
- **Sitemap check:** Visit `/sitemap.xml` — verify all 7 public routes present
- **Robots check:** Visit `/robots.txt` — verify disallow rules and sitemap reference
- **Metadata check:** View page source on each public page — verify unique `<title>`, `<meta name="description">`, OG tags, Twitter cards
- **JSON-LD validation:** Use Google Rich Results Test on `/hjelp`, `/priser`, `/kontakt`
- **Lighthouse audit:** Run Lighthouse on homepage — SEO score should be 90+
- **Social preview:** Use Facebook Sharing Debugger and Twitter Card Validator to test link previews
- **Cache headers:** Use browser dev tools Network tab to verify correct Cache-Control headers per route

### Acceptance Criteria

1. `/sitemap.xml` returns valid XML with 7 public routes and correct URLs
2. `/robots.txt` returns valid directives disallowing private routes, referencing sitemap
3. Every public page has unique `<title>` and `<meta name="description">` in Norwegian
4. Root layout includes Twitter card metadata (`twitter:card`, `twitter:title`, `twitter:description`)
5. Root layout includes OG image pointing to `/ki-musikk.png`
6. Homepage has a visible H1 tag containing primary keyword "Lag norske sanger med KI"
7. `/hjelp` page has valid FAQPage JSON-LD with all 15 FAQ items
8. `/priser` page has valid Product/Offer JSON-LD with correct NOK pricing
9. `/kontakt` page has valid LocalBusiness JSON-LD with correct company info (Moen Studio, org.nr 931 659 685)
10. Root layout has Organization JSON-LD with name, url, logo, contactPoint
11. Public pages return `Cache-Control: public, max-age=...` headers
12. Private routes (`/api/*`, `/auth/*`, `/sanger/*`) still return `no-store`
13. `npm run build` succeeds without errors
14. Lighthouse SEO score >= 90 on homepage

---

## Developer Resources

### File Paths Reference

**Files to CREATE:**
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/seo.ts`
- `src/app/hjelp/layout.tsx`
- `src/app/priser/layout.tsx`

**Files to MODIFY:**
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/om-oss/page.tsx`
- `src/app/kontakt/page.tsx`
- `src/app/personvern/page.tsx`
- `src/app/vilkaar/page.tsx`
- `next.config.js`

### Key Code Locations

| Code | Location |
|------|----------|
| Root metadata to extend | `src/app/layout.tsx:16-31` |
| Page metadata example | `src/app/sanger/page.tsx:15-18` |
| FAQ data for JSON-LD | `src/lib/faq-data.ts:18-144` |
| Credit packages for Product JSON-LD | `src/lib/constants.ts` |
| Company info for LocalBusiness | `src/app/kontakt/page.tsx:54-76` |
| Homepage (add H1) | `src/app/page.tsx:22-98` |
| Cache headers to fix | `next.config.js:24-40` |

### Testing Locations

No automated test framework. Manual testing via:
- Browser DevTools (View Source, Network tab)
- Google Rich Results Test (https://search.google.com/test/rich-results)
- Lighthouse SEO audit (Chrome DevTools)
- Facebook Sharing Debugger
- Twitter Card Validator

### Documentation to Update

None required — SEO is infrastructure, not user-facing feature documentation.

---

## UX/UI Considerations

**Minimal UI Impact:**
- Homepage gets a visible H1 heading — styled consistently with existing design (white text, centered, appropriate size)
- No other visual changes to any page
- JSON-LD scripts are invisible to users
- Metadata changes only affect browser tabs and search engine results

**H1 Design Guidance:**
- Text: "Lag norske sanger med KI" (matches existing meta title keyword)
- Position: Above the WizardContainer hero area
- Style: Match existing heading patterns (`text-2xl` or `text-3xl`, `font-bold`, `text-white`, `text-center`)
- Must be visible (not `sr-only` or `display:none`)

---

## Testing Approach

**No automated test framework in project.** Testing is manual:

| Test | Tool | Expected Result |
|------|------|----------------|
| Sitemap validity | Browser `/sitemap.xml` | Valid XML, 7 routes |
| Robots validity | Browser `/robots.txt` | Correct directives |
| Page metadata | View Source per page | Unique title/description |
| OG/Twitter tags | View Source | OG image, Twitter card present |
| FAQ JSON-LD | Google Rich Results Test | Valid FAQPage schema |
| Product JSON-LD | Google Rich Results Test | Valid Product/Offer schema |
| Organization JSON-LD | Google Rich Results Test | Valid Organization schema |
| LocalBusiness JSON-LD | Google Rich Results Test | Valid LocalBusiness schema |
| Cache headers | DevTools Network tab | Correct per-route headers |
| SEO score | Lighthouse | >= 90 |
| Social preview | Facebook Debugger | Image + title + description shown |
| Build success | `npm run build` | No errors |

---

## Deployment Strategy

### Deployment Steps

1. Merge feature branch to main
2. Vercel auto-deploys on push to main
3. Verify `/sitemap.xml` and `/robots.txt` on production URL
4. Submit sitemap to Google Search Console (manual, post-deploy)
5. Test social sharing previews with production URLs
6. Monitor Google Search Console for indexing progress over following weeks

### Rollback Plan

1. Revert the merge commit on main
2. Vercel auto-deploys the revert
3. All changes are additive (new files + metadata additions) — low risk of breaking existing functionality

### Monitoring

- Google Search Console: Monitor indexing status, crawl errors, and search appearance
- Lighthouse: Periodic SEO audits to maintain score
- Social media: Verify link previews when users share songs
