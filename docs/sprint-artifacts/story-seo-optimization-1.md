# Story 1.1: Crawlability & Indexing Foundation

**Status:** Review

---

## User Story

As a search engine crawler,
I want a sitemap, robots.txt, canonical URLs, and correct cache headers,
So that I can efficiently discover, crawl, and index all public pages on KI MUSIKK.

---

## Acceptance Criteria

**AC #1:** Given I request `/sitemap.xml`, when the server responds, then I receive valid XML containing exactly 7 public route URLs (`/`, `/priser`, `/om-oss`, `/hjelp`, `/kontakt`, `/personvern`, `/vilkaar`) with `changeFrequency` and `priority` values.

**AC #2:** Given I request `/robots.txt`, when the server responds, then I receive valid directives that allow `/` and disallow `/api/`, `/auth/`, `/sanger/`, `/innstillinger/`, `/test-player/`, and include a `Sitemap:` reference to `https://kimusikk.no/sitemap.xml`.

**AC #3:** Given any public page is rendered, when I view the HTML source, then the `<head>` contains a canonical URL derived from `metadataBase` (`https://kimusikk.no`).

**AC #4:** Given I view the root layout metadata, when I inspect OpenGraph tags, then `og:site_name` is "KI MUSIKK", `og:image` points to `/ki-musikk.png`, and `og:locale` is `nb_NO`.

**AC #5:** Given I view the root layout metadata, when I inspect Twitter tags, then `twitter:card` is `summary`, `twitter:title` and `twitter:description` are present.

**AC #6:** Given I request a public page (`/`, `/priser`, `/om-oss`, etc.), when I inspect the response headers, then `Cache-Control` is `public, max-age=3600, stale-while-revalidate=86400` (or `max-age=1800` for homepage).

**AC #7:** Given I request a private route (`/api/*`, `/auth/*`, `/sanger/*`), when I inspect the response headers, then `Cache-Control` is `no-store, must-revalidate`.

**AC #8:** Given I run `npm run build`, when the build completes, then there are no errors.

---

## Implementation Details

### Tasks / Subtasks

- [x] Create `src/lib/seo.ts` with shared SEO constants: `BASE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE` (AC: #1, #2, #4)
- [x] Create `src/app/sitemap.ts` exporting `MetadataRoute.Sitemap` with 7 public routes, `changeFrequency`, and `priority` values (AC: #1)
- [x] Create `src/app/robots.ts` exporting `MetadataRoute.Robots` with allow/disallow rules and sitemap reference (AC: #2)
- [x] Modify `src/app/layout.tsx` — add `metadataBase: new URL('https://kimusikk.no')` to metadata export (AC: #3)
- [x] Modify `src/app/layout.tsx` — add `twitter` config (`card: 'summary'`, `title`, `description`) to metadata (AC: #5)
- [x] Modify `src/app/layout.tsx` — add `openGraph.siteName`, `openGraph.images`, and `openGraph.url` to metadata (AC: #4)
- [x] Modify `next.config.js` — restructure `headers()` to return separate rules for public pages (cacheable), homepage (shorter cache), and private routes (no-store) (AC: #6, #7)
- [x] Run `npm run build` and verify no errors (AC: #8)
- [ ] Verify `/sitemap.xml` in browser dev server (AC: #1)
- [ ] Verify `/robots.txt` in browser dev server (AC: #2)
- [ ] Verify cache headers via DevTools Network tab on public and private routes (AC: #6, #7)

### Technical Summary

This story creates the foundational SEO infrastructure using exclusively Next.js built-in features:
- `sitemap.ts` and `robots.ts` use Next.js Metadata Route Handlers (auto-generated at build time)
- `metadataBase` enables automatic canonical URL generation across all pages
- Root layout metadata extended (not replaced) with Twitter cards, OG images, and site name
- Cache headers restructured in `next.config.js` to differentiate public (cacheable) from private (no-store) routes
- Shared `seo.ts` constants module created for reuse in Stories 1.2 and 1.3

### Project Structure Notes

- **Files to create:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts`
- **Files to modify:** `src/app/layout.tsx`, `next.config.js`
- **Expected test locations:** Manual — browser, DevTools Network tab, `npm run build`
- **Estimated effort:** 2 story points
- **Prerequisites:** None

### Key Code References

- `src/app/layout.tsx:16-31` — Current root metadata to extend
- `src/app/sanger/page.tsx:15-18` — Example of page-specific metadata pattern
- `next.config.js:24-40` — Current cache headers to restructure

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:

- Brownfield codebase analysis (existing metadata patterns, page structure)
- Framework and library details with versions (Next.js 14.2.3)
- Existing patterns to follow (`export const metadata: Metadata`)
- Complete sitemap routes, robots rules, and cache header strategy
- JSON-LD schema examples (for Story 1.2)

**Architecture:** N/A — Quick-flow project, all decisions in tech-spec

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Created seo.ts with BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE constants
- Created sitemap.ts with 7 public routes using Next.js MetadataRoute.Sitemap
- Created robots.ts with allow/disallow rules using Next.js MetadataRoute.Robots
- Extended layout.tsx metadata with metadataBase, twitter cards, OG siteName/images/url
- Restructured next.config.js cache headers: public pages (3600s), homepage (1800s), private routes (no-store)
- Build verified: 20 static pages generated including /sitemap.xml and /robots.txt

### Completion Notes

- All code tasks complete. 3 manual verification tasks remain (sitemap/robots in browser, cache headers in DevTools).
- Build output confirms `/sitemap.xml` and `/robots.txt` are generated as static content.
- No new dependencies added — all features use Next.js built-in Metadata API.
- `seo.ts` exports shared constants for reuse in Stories 1.2 and 1.3.

### Files Modified

**New Files:**
- `src/lib/seo.ts` — Shared SEO constants (BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE)
- `src/app/sitemap.ts` — Sitemap generation with 7 public routes
- `src/app/robots.ts` — Robots.txt with allow/disallow rules

**Modified Files:**
- `src/app/layout.tsx` — Added metadataBase, twitter card config, OG siteName/images/url
- `next.config.js` — Restructured cache headers (public/homepage/private route separation)

### Test Results

- `npm run build`: Compiled successfully, 20 static pages (including sitemap.xml, robots.txt)
- `npm run lint`: Passed (1 unrelated warning in audio-player-context.tsx)
- Manual verification: Pending (browser sitemap/robots, DevTools cache headers)

---

## Review Notes

<!-- Will be populated during code review -->
