# Story 9.2: Footer Component with Essential Links

Status: review

## Story

As a **user**,
I want a footer with important links and information,
so that I can find legal information and contact details when needed.

## Acceptance Criteria

1. **Footer Content**
   - **Given** I am on any page
   - **When** I scroll to the bottom
   - **Then** I see a footer containing:
     - Secondary navigation links: "Om oss", "Kontakt", "Vilkår", "Personvern"
     - Copyright notice: "© 2025 Musikkfabrikken. Alle rettigheter reservert."

2. **Visual Design**
   - **Given** I view the footer
   - **Then** Footer has consistent styling with the rest of the app (Nordic theme)
   - **And** Uses muted colors to not distract from main content
   - **And** Links have proper hover states

3. **Accessibility**
   - **Given** I view the footer
   - **Then** Links are accessible with proper contrast
   - **And** Links are keyboard navigable
   - **And** Links have appropriate focus states

4. **Responsive Layout**
   - **Given** I am on a mobile device
   - **When** I view the footer
   - **Then** Footer links stack appropriately on smaller screens
   - **And** Footer remains readable and usable

5. **Link Functionality**
   - **Given** I click a footer link
   - **Then** I am navigated to the appropriate page:
     - "Om oss" → `/about`
     - "Kontakt" → `/contact`
     - "Vilkår" → `/terms`
     - "Personvern" → `/privacy`

6. **Build Verification**
   - Production build succeeds with no TypeScript or ESLint errors

## Tasks / Subtasks

- [x] Task 1: Create Footer Component (AC: #1, #2)
  - [x] Create `/src/components/layout/footer.tsx`
  - [x] Add container with max-width consistent with app layout
  - [x] Add copyright notice with current year
  - [x] Style with muted colors and border-top

- [x] Task 2: Add Navigation Links (AC: #1, #3, #5)
  - [x] Add "Om oss" link to `/about`
  - [x] Add "Kontakt" link to `/contact`
  - [x] Add "Vilkår" link to `/terms`
  - [x] Add "Personvern" link to `/privacy`
  - [x] Use Next.js Link component for client-side navigation
  - [x] Add proper hover and focus states

- [x] Task 3: Implement Responsive Layout (AC: #4)
  - [x] Mobile: Stack links vertically or in a grid
  - [x] Desktop: Links in a horizontal row
  - [x] Test on various screen sizes

- [x] Task 4: Add Footer to Root Layout (AC: #1)
  - [x] Update `/src/app/layout.tsx` to include Footer component
  - [x] Position Footer after main content area
  - [x] Ensure sticky footer pattern (footer stays at bottom on short pages)

- [x] Task 5: Create Placeholder Pages (AC: #5)
  - [x] Create `/src/app/about/page.tsx` - basic "Om oss" page
  - [x] Create `/src/app/contact/page.tsx` - basic "Kontakt" page
  - [x] Create `/src/app/terms/page.tsx` - basic "Vilkår" page
  - [x] Create `/src/app/privacy/page.tsx` - basic "Personvern" page
  - [x] Each page should have a heading and placeholder content

- [x] Task 6: Build Verification and Testing (AC: #6)
  - [x] Run `npm run build` - ensure success
  - [x] Run `npm run lint` - no errors
  - [x] Manual test: Footer visible on all pages
  - [x] Manual test: All links navigate correctly
  - [x] Manual test: Responsive behavior works

## Dev Notes

### Architecture Alignment

**From `/docs/architecture.md` - Project Structure:**
```
src/
├── components/
│   ├── layout/                 # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
```

**From `/docs/architecture.md` - Implementation Patterns:**
- **Language & Localization**: All UI text in Norwegian (Bokmål), code in English
- **Components**: PascalCase names, Props interfaces: `ComponentNameProps`
- **Files**: kebab-case for component files (e.g., `footer.tsx`)
- **Responsive**: Mobile-first CSS with Tailwind utilities

### Project Structure Notes

**Files to Create:**
- `/src/components/layout/footer.tsx` - Footer component
- `/src/app/about/page.tsx` - About page placeholder
- `/src/app/contact/page.tsx` - Contact page placeholder
- `/src/app/terms/page.tsx` - Terms page placeholder
- `/src/app/privacy/page.tsx` - Privacy page placeholder

**Files to Modify:**
- `/src/app/layout.tsx` - Add Footer to root layout

### Learnings from Previous Stories

**From Story 9.1 (Header)**:
- Layout is already structured with Header in layout.tsx
- Main content uses `flex-1` within a `min-h-screen flex flex-col` container
- Sticky header pattern already established
- Just need to add Footer after main content

### Technical Implementation Notes

**Footer Component Structure:**
```typescript
// /src/components/layout/footer.tsx
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { href: '/about', label: 'Om oss' },
    { href: '/contact', label: 'Kontakt' },
    { href: '/terms', label: 'Vilkår' },
    { href: '/privacy', label: 'Personvern' },
  ]

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <nav className="flex flex-wrap gap-4 md:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            © {currentYear} Musikkfabrikken. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

**Sticky Footer Pattern (in layout.tsx):**
```typescript
// Structure for sticky footer
<body className="min-h-screen flex flex-col">
  <Header />
  <main className="flex-1">
    {children}
  </main>
  <Footer />
</body>
```

### Norwegian UI Labels

| Element | Norwegian Text |
|---------|---------------|
| About | Om oss |
| Contact | Kontakt |
| Terms | Vilkår |
| Privacy | Personvern |
| Copyright | © 2025 Musikkfabrikken. Alle rettigheter reservert. |

### Placeholder Page Content

Each placeholder page should have:
- A heading with the page title
- A brief placeholder paragraph indicating content is coming
- Consistent styling with the rest of the app

Example placeholder:
```typescript
// /src/app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Om oss</h1>
      <p className="text-muted-foreground">
        Innhold kommer snart.
      </p>
    </div>
  )
}
```

### References

- [Epic 9 - Core Navigation & Layout](../epics/epic-9-core-navigation-layout.md)
- [Story 9.1 - Responsive Header](./9-1-responsive-header-with-navigation-and-auth-state.md)
- [Architecture Document - Project Structure](../architecture.md#project-structure)

## Dev Agent Record

### Context Reference
- `docs/sprint-artifacts/stories/9-2-footer-component-with-essential-links.context.xml`

### Debug Log
**2025-11-26 - Implementation Plan:**
- Create Footer component with 4 navigation links and copyright
- Follow header.tsx patterns for consistent structure
- Use muted colors per AC #2
- Add pb-20 md:pb-0 to avoid mobile bottom nav overlap
- Create 4 placeholder pages with Norwegian content

### Completion Notes
**2025-11-26 - All tasks completed:**
- Footer component created with proper styling (border-t, bg-muted/30)
- Links use proper hover/focus states with ring utilities for accessibility
- Responsive layout: flex-col on mobile, flex-row on desktop (sm breakpoint)
- Footer added to root layout after main, before BottomNavigation
- Added pb-20 on mobile to prevent overlap with bottom nav
- Four placeholder pages created with Norwegian content
- Build and lint both pass with zero errors

### File List
**New Files:**
- `src/components/layout/footer.tsx` - Footer component
- `src/app/about/page.tsx` - Om oss placeholder page
- `src/app/contact/page.tsx` - Kontakt placeholder page
- `src/app/terms/page.tsx` - Vilkår placeholder page
- `src/app/privacy/page.tsx` - Personvern placeholder page

**Modified Files:**
- `src/app/layout.tsx` - Added Footer import and component

## Change Log

**2025-11-26 - Implementation Complete (review status)**
- All 6 tasks completed successfully
- Footer component with 4 navigation links and copyright
- 4 placeholder pages created with Norwegian content
- Build and lint pass with zero errors
- Ready for code review

**2025-11-26 - Story Created (drafted status)**
- Story drafted following create-story workflow
- Extracted from Epic 9: Core Navigation & Layout Components (Story 9.2)
- Source: docs/epics/epic-9-core-navigation-layout.md
- Dependencies: None (but coordinates with Story 9.1 for layout)
- All UI text specified in Norwegian (Bokmål) per config
- Includes placeholder pages for footer links
- Next step: Run story-context workflow or proceed to development
