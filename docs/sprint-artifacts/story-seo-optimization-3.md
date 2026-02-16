# Story 1.3: Page-Level Metadata Optimization

**Status:** Review

---

## User Story

As a search engine indexing KI MUSIKK,
I want each public page to have unique, descriptive metadata in Norwegian,
So that each page can rank independently for relevant search queries like "om KI MUSIKK", "kontakt KI MUSIKK", "personvern", etc.

---

## Acceptance Criteria

**AC #1:** Given I visit `/om-oss` and view source, then `<title>` is "Om oss - KI MUSIKK" and `<meta name="description">` contains a unique Norwegian description about the company and product (different from root layout description).

**AC #2:** Given I visit `/kontakt` and view source, then `<title>` is "Kontakt oss - KI MUSIKK" and `<meta name="description">` contains a unique Norwegian description about contacting the company.

**AC #3:** Given I visit `/personvern` and view source, then `<title>` is "Personvernerklaering - KI MUSIKK" and `<meta name="description">` contains a unique Norwegian description about the privacy policy.

**AC #4:** Given I visit `/vilkaar` and view source, then `<title>` is "Vilkar og betingelser - KI MUSIKK" and `<meta name="description">` contains a unique Norwegian description about terms and conditions.

**AC #5:** Given I check all 7 public pages, when I compare their `<title>` tags, then no two pages share the same title.

**AC #6:** Given I check all 7 public pages, when I compare their `<meta name="description">` tags, then no two pages share the same description.

**AC #7:** Given I run Lighthouse SEO audit on the homepage, when the audit completes, then the SEO score is >= 90.

**AC #8:** Given I run `npm run build`, when the build completes, then there are no errors.

---

## Implementation Details

### Tasks / Subtasks

- [x] Add `export const metadata: Metadata` to `src/app/om-oss/page.tsx` with unique Norwegian title and description (AC: #1, #5, #6)
- [x] Add `export const metadata: Metadata` to `src/app/kontakt/page.tsx` with unique Norwegian title and description (AC: #2, #5, #6)
- [x] Add `export const metadata: Metadata` to `src/app/personvern/page.tsx` with unique Norwegian title and description (AC: #3, #5, #6)
- [x] Add `export const metadata: Metadata` to `src/app/vilkaar/page.tsx` with unique Norwegian title and description (AC: #4, #5, #6)
- [x] Verify that hjelp and priser pages already have metadata from Story 1.2 layouts (AC: #5, #6)
- [x] Verify homepage metadata from root layout (AC: #5, #6)
- [x] View source on all 7 public pages and confirm unique titles and descriptions (AC: #5, #6)
- [ ] Run Lighthouse SEO audit on homepage (AC: #7)
- [x] Run `npm run build` and verify no errors (AC: #8)

### Technical Summary

This is the simplest story — adding `export const metadata` objects to 4 server component pages. Next.js automatically merges page-level metadata with root layout metadata, so only `title` and `description` need to be specified per page. The `metadataBase` from Story 1.1 handles canonical URLs automatically.

**Metadata content guidance:**
- Titles follow pattern: `"[Page Name] - KI MUSIKK"` (Norwegian)
- Descriptions are 1-2 sentences, Norwegian, containing relevant keywords
- Each page targets different search intent:
  - `/om-oss`: brand discovery ("om KI MUSIKK", "norsk KI musikk")
  - `/kontakt`: support seeking ("kontakt KI MUSIKK", "hjelp")
  - `/personvern`: compliance/trust ("personvern KI MUSIKK")
  - `/vilkaar`: compliance/trust ("vilkar KI MUSIKK", "salgsbetingelser")

### Project Structure Notes

- **Files to modify:** `src/app/om-oss/page.tsx`, `src/app/kontakt/page.tsx`, `src/app/personvern/page.tsx`, `src/app/vilkaar/page.tsx`
- **Expected test locations:** Manual — View Source per page, Lighthouse
- **Estimated effort:** 1 story point
- **Prerequisites:** Story 1.1 (metadataBase must be set in root layout for canonical URLs)

### Key Code References

- `src/app/sanger/page.tsx:15-18` — Existing pattern for page-specific metadata export
- `src/app/layout.tsx:16-31` — Root metadata that page metadata merges with
- `src/app/om-oss/page.tsx` — Server component, can export metadata directly
- `src/app/kontakt/page.tsx` — Server component, can export metadata directly
- `src/app/personvern/page.tsx` — Server component, can export metadata directly
- `src/app/vilkaar/page.tsx` — Server component, can export metadata directly

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:

- Metadata strategy (metadataBase auto-resolves canonical URLs)
- Existing metadata pattern to follow
- All public pages listed with current SEO state

**Architecture:** N/A — Quick-flow project, all decisions in tech-spec

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Added metadata exports to om-oss, kontakt, personvern, vilkaar pages
- Verified hjelp and priser already have metadata from Story 1.2 layout wrappers
- Verified all 7 public pages have unique titles and descriptions
- All titles follow pattern "[Page Name] - KI MUSIKK"

### Completion Notes

- All code tasks complete. 1 manual task remains (Lighthouse SEO audit).
- All 7 public pages have unique Norwegian titles and descriptions.
- No content changes — only metadata additions to server component pages.

### Files Modified

**Modified Files:**
- `src/app/om-oss/page.tsx` — Added metadata export (title + description)
- `src/app/kontakt/page.tsx` — Added metadata export (title + description)
- `src/app/personvern/page.tsx` — Added metadata export (title + description)
- `src/app/vilkaar/page.tsx` — Added metadata export (title + description)

### Test Results

- `npm run build`: Compiled successfully, 20 static pages
- `npm run lint`: Passed (1 unrelated warning)
- Title uniqueness: Verified — all 7 pages have distinct titles
- Manual Lighthouse audit: Pending

---

## Review Notes

<!-- Will be populated during code review -->
