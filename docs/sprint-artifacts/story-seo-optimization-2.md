# Story 1.2: Rich Results & Social Sharing

**Status:** Review

---

## User Story

As a potential user finding KI MUSIKK via Google search or social media,
I want rich search results with FAQ snippets, product pricing, and attractive link previews,
So that I can understand the product value and trust the brand before clicking through.

---

## Acceptance Criteria

**AC #1:** Given the root layout HTML is rendered, when I inspect the page source, then a `<script type="application/ld+json">` tag contains valid Organization schema with `name: "KI MUSIKK"`, `url: "https://kimusikk.no"`, `logo`, and `contactPoint.email: "hei@kimusikk.no"`.

**AC #2:** Given I visit `/hjelp` and inspect the page source, then a `<script type="application/ld+json">` tag contains valid FAQPage schema with all 15 FAQ items from `faq-data.ts`, each having `@type: "Question"` with `name` and `acceptedAnswer.text`.

**AC #3:** Given I visit `/priser` and inspect the page source, then a `<script type="application/ld+json">` tag contains valid Product schema with Offer items matching the credit packages from `constants.ts`, with `priceCurrency: "NOK"` and correct prices.

**AC #4:** Given I visit `/kontakt` and inspect the page source, then a `<script type="application/ld+json">` tag contains valid LocalBusiness schema with `name: "Moen Studio"`, `taxID: "931659685"`, address (Heddalsvegen 11, 3674 Notodden, NO), and `email: "hei@kimusikk.no"`.

**AC #5:** Given I submit any JSON-LD page to Google Rich Results Test, when the test runs, then all schemas pass validation with no errors.

**AC #6:** Given the homepage is rendered, when I inspect the HTML, then there is exactly one visible `<h1>` tag containing the text "Lag norske sanger med KI" (or similar primary keyword), styled consistently with the existing design.

**AC #7:** Given I visit `/hjelp`, when I inspect the page metadata, then the page has a unique `<title>` ("Hjelp og FAQ - KI MUSIKK") and `<meta name="description">` in Norwegian.

**AC #8:** Given I visit `/priser`, when I inspect the page metadata, then the page has a unique `<title>` ("Priser - KI MUSIKK") and `<meta name="description">` in Norwegian.

---

## Implementation Details

### Tasks / Subtasks

- [x] Add JSON-LD helper functions to `src/lib/seo.ts`: `getOrganizationJsonLd()`, `getFaqJsonLd()`, `getProductJsonLd()`, `getLocalBusinessJsonLd()` (AC: #1, #2, #3, #4)
- [x] Add Organization JSON-LD `<script>` tag to `src/app/layout.tsx` body (AC: #1)
- [x] Create `src/app/hjelp/layout.tsx` as server component with: `export const metadata` (unique title/description) and FAQ JSON-LD script tag importing from `faq-data.ts` (AC: #2, #7)
- [x] Create `src/app/priser/layout.tsx` as server component with: `export const metadata` (unique title/description) and Product JSON-LD script tag importing from `constants.ts` (AC: #3, #8)
- [x] Add LocalBusiness JSON-LD `<script>` tag to `src/app/kontakt/page.tsx` (already a server component) (AC: #4)
- [x] Add H1 tag to `src/app/page.tsx` above `<WizardContainer />` — visible, styled (`text-2xl font-bold text-white text-center`), containing primary keyword (AC: #6)
- [ ] Validate all JSON-LD schemas using Google Rich Results Test (AC: #5)
- [x] Run `npm run build` and verify no errors

### Technical Summary

This story adds structured data and social sharing capabilities:
- **JSON-LD helpers** in `seo.ts` generate schema objects; injected as `<script type="application/ld+json">` in page/layout components
- **Client component workaround:** `/hjelp` and `/priser` are `'use client'` pages, so JSON-LD and metadata are placed in new `layout.tsx` server component wrappers in their directories
- **Server component pages** (`/kontakt`) get JSON-LD injected directly
- **Homepage H1** added as visible heading above the WizardContainer, styled to match existing design
- **Organization schema** added sitewide in root layout
- FAQ data imported from existing `faq-data.ts` (single source of truth)
- Credit packages imported from existing `constants.ts` (single source of truth)

### Project Structure Notes

- **Files to create:** `src/app/hjelp/layout.tsx`, `src/app/priser/layout.tsx`
- **Files to modify:** `src/lib/seo.ts` (add JSON-LD helpers), `src/app/layout.tsx` (add Org JSON-LD), `src/app/kontakt/page.tsx` (add LocalBusiness JSON-LD), `src/app/page.tsx` (add H1)
- **Expected test locations:** Manual — View Source, Google Rich Results Test
- **Estimated effort:** 3 story points
- **Prerequisites:** Story 1.1 (needs `seo.ts` with BASE_URL constant and `metadataBase` in root layout)

### Key Code References

- `src/lib/seo.ts` — Created in Story 1.1, extend with JSON-LD helpers
- `src/lib/faq-data.ts:18-144` — FAQ data to transform into FAQPage JSON-LD (15 items, 5 categories)
- `src/lib/constants.ts` — CREDIT_PACKAGES array for Product JSON-LD
- `src/app/kontakt/page.tsx:54-76` — Company info (Moen Studio, org.nr, address) for LocalBusiness JSON-LD
- `src/app/page.tsx:22-98` — Homepage structure where H1 needs to be added
- `src/app/layout.tsx` — Root layout for Organization JSON-LD injection

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:

- Complete JSON-LD schema examples (Organization, FAQPage, Product, LocalBusiness)
- Homepage H1 design guidance (text, position, styling)
- Client component metadata workaround strategy (layout.tsx wrappers)
- All data source references for JSON-LD content

**Architecture:** N/A — Quick-flow project, all decisions in tech-spec

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Added 4 JSON-LD helper functions to seo.ts (Organization, FAQ, Product, LocalBusiness)
- Added Organization JSON-LD script tag to root layout body
- Created hjelp/layout.tsx server wrapper with FAQ JSON-LD (15 items from faq-data.ts) + page metadata
- Created priser/layout.tsx server wrapper with Product JSON-LD (3 packages from constants.ts) + page metadata
- Added LocalBusiness JSON-LD to kontakt/page.tsx (Moen Studio, org.nr 931659685)
- Added visible H1 "Lag norske sanger med KI" to homepage above WizardContainer

### Completion Notes

- All code tasks complete. 1 manual task remains (Google Rich Results Test validation).
- JSON-LD helpers import from existing data sources (faq-data.ts, constants.ts) — single source of truth.
- Client component pages (hjelp, priser) use layout.tsx wrappers for metadata + JSON-LD.
- Homepage H1 is visible, styled with text-2xl/3xl, responsive sizing.

### Files Modified

**New Files:**
- `src/app/hjelp/layout.tsx` — FAQ JSON-LD + page metadata
- `src/app/priser/layout.tsx` — Product JSON-LD + page metadata

**Modified Files:**
- `src/lib/seo.ts` — Added JSON-LD helper functions
- `src/app/layout.tsx` — Added Organization JSON-LD script tag
- `src/app/kontakt/page.tsx` — Added LocalBusiness JSON-LD script tag
- `src/app/page.tsx` — Added visible H1 tag

### Test Results

- `npm run build`: Compiled successfully, 20 static pages
- `npm run lint`: Passed (1 unrelated warning)
- Manual JSON-LD validation: Pending (Google Rich Results Test)

---

## Review Notes

<!-- Will be populated during code review -->
