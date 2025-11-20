# Story 1.4: Install shadcn/ui and Core Components

Status: ready-for-dev

## Story

As a developer,
I want shadcn/ui design system installed with base accessible components customized to the Playful Nordic theme,
so that all future UI development uses consistent, accessible, and theme-aligned components throughout the application.

## Acceptance Criteria

1. **shadcn/ui Initialized**: shadcn/ui CLI initialized with proper Tailwind and TypeScript configuration
2. **Base Components Installed**: Core components installed in `/src/components/ui/` directory: Button, Card, Input, Dialog (Modal), Toast, Progress, Badge, Select, Switch, Tabs
3. **Theme Integration Verified**: All components render with Playful Nordic colors (primary #E94560, secondary #0F3460, accent #FFC93C)
4. **Accessibility Verified**: All components are keyboard accessible (Tab navigation works, focus indicators visible)
5. **Component Imports Work**: Components can be imported with `@/components/ui/*` path alias
6. **Norwegian Test Page**: Test page created demonstrating all components with Norwegian labels and content
7. **WCAG Compliance Maintained**: Lighthouse accessibility score >90 on test page
8. **Build Verification**: Production build succeeds with all components, no TypeScript or ESLint errors

## Tasks / Subtasks

- [ ] Task 1: Initialize shadcn/ui (AC: #1)
  - [ ] Run `npx shadcn-ui@latest init` in project root
  - [ ] Select configuration options:
    - TypeScript: Yes
    - Style: Default
    - Base color: Slate (will be overridden by Playful Nordic theme)
    - CSS variables: Yes (for easier theme customization)
    - Tailwind config: tailwind.config.ts (already exists)
    - Components location: src/components/ui
    - Utils location: src/lib/utils.ts
    - React Server Components: Yes
    - Import alias: @/components, @/lib
  - [ ] Verify initialization creates necessary files

- [ ] Task 2: Install Button Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add button`
  - [ ] Verify component created at `/src/components/ui/button.tsx`
  - [ ] Review component code for theme integration

- [ ] Task 3: Install Card Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add card`
  - [ ] Verify component created at `/src/components/ui/card.tsx`

- [ ] Task 4: Install Input Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add input`
  - [ ] Verify component created at `/src/components/ui/input.tsx`

- [ ] Task 5: Install Dialog (Modal) Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add dialog`
  - [ ] Verify component created at `/src/components/ui/dialog.tsx`
  - [ ] Note: Dialog depends on @radix-ui/react-dialog (auto-installed)

- [ ] Task 6: Install Toast Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add toast`
  - [ ] Verify component created at `/src/components/ui/toast.tsx`
  - [ ] Verify Toaster provider component created
  - [ ] Note: Toast depends on @radix-ui/react-toast (auto-installed)

- [ ] Task 7: Install Progress Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add progress`
  - [ ] Verify component created at `/src/components/ui/progress.tsx`

- [ ] Task 8: Install Badge Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add badge`
  - [ ] Verify component created at `/src/components/ui/badge.tsx`

- [ ] Task 9: Install Select Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add select`
  - [ ] Verify component created at `/src/components/ui/select.tsx`

- [ ] Task 10: Install Switch Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add switch`
  - [ ] Verify component created at `/src/components/ui/switch.tsx`

- [ ] Task 11: Install Tabs Component (AC: #2)
  - [ ] Run `npx shadcn-ui@latest add tabs`
  - [ ] Verify component created at `/src/components/ui/tabs.tsx`

- [ ] Task 12: Create Norwegian Test Page (AC: #6)
  - [ ] Create test page at `src/app/test-komponenter/page.tsx` (Norwegian: "components")
  - [ ] Set HTML lang="nb" and Norwegian metadata
  - [ ] Import all installed components
  - [ ] Create sections demonstrating each component:
    - Buttons: Primary, Secondary, Outline variants with Norwegian labels ("Klikk her", "Avbryt", "Lagre")
    - Cards: Content cards with Norwegian text
    - Inputs: Text input with Norwegian placeholder ("Skriv inn tekst...")
    - Dialog: Modal with Norwegian heading and content
    - Toast: Toast notification with Norwegian message
    - Progress: Progress bar with Norwegian label
    - Badges: Status badges with Norwegian text ("Ny", "Aktiv", "Fullført")
    - Select: Dropdown with Norwegian options
    - Switch: Toggle with Norwegian label ("Aktiver lydeffekter")
    - Tabs: Tabs with Norwegian labels ("Oversikt", "Innstillinger", "Hjelp")

- [ ] Task 13: Verify Theme Integration (AC: #3)
  - [ ] Open test page in browser
  - [ ] Verify buttons use primary color (#E94560) for primary variant
  - [ ] Verify secondary actions use secondary color (#0F3460)
  - [ ] Verify accent color (#FFC93C) appears in highlights/badges
  - [ ] Use browser DevTools color picker to verify exact hex values
  - [ ] Check success/error/info semantic colors in appropriate contexts

- [ ] Task 14: Test Keyboard Accessibility (AC: #4)
  - [ ] Press Tab to navigate through all interactive components
  - [ ] Verify all buttons, inputs, selects, switches are focusable
  - [ ] Verify focus indicators are clearly visible (outline or ring)
  - [ ] Test Dialog: Open with button, close with Escape key
  - [ ] Test Select: Open with Enter/Space, navigate with arrows
  - [ ] Verify Tab order is logical (top to bottom, left to right)

- [ ] Task 15: Run Lighthouse Accessibility Check (AC: #7)
  - [ ] Open Chrome DevTools on test page
  - [ ] Run Lighthouse audit (Accessibility category)
  - [ ] Verify score >90
  - [ ] Review any accessibility warnings or errors
  - [ ] Fix any critical issues found

- [ ] Task 16: Verify Component Imports (AC: #5)
  - [ ] Check that test page imports work: `import { Button } from '@/components/ui/button'`
  - [ ] Verify TypeScript autocomplete works for component props
  - [ ] Confirm no import errors in console or build

- [ ] Task 17: Build Verification and Cleanup (AC: #8)
  - [ ] Run `npm run build` and verify success (exit code 0)
  - [ ] Check for TypeScript errors (should be none)
  - [ ] Check for ESLint errors (warnings acceptable)
  - [ ] Delete test page: `src/app/test-komponenter/page.tsx`
  - [ ] Run `npm run build` again to verify clean build after deletion
  - [ ] Commit all new components and configuration files

## Dev Notes

### Architecture Alignment

**From `/docs/architecture.md` - shadcn/ui (ADR-004):**

**Decision: shadcn/ui + Radix UI for UI Components**
- Copy-paste approach (NOT npm dependency) - full customization control
- Built on Radix UI primitives (accessible by default)
- Tailwind styling matches tech stack
- WCAG 2.1 AA compliant out of the box
- UX designer specified this in UX spec

**Integration Pattern:**
- Components copied to `/src/components/ui/` directory
- Each component is a standalone file (button.tsx, card.tsx, etc.)
- No version dependency conflicts - manual updates when needed
- Full control over styling and behavior

**Styling Approach:**
- Uses class-variance-authority (CVA) for component variants
- Uses clsx and tailwind-merge for class merging
- Tailwind utility classes for all styling
- CSS variables for theme colors (optional, can use direct Tailwind theme)

**Accessibility (WCAG 2.1 AA):**
- Radix UI handles keyboard navigation, focus management, ARIA attributes
- All components support keyboard interaction (Tab, Enter, Escape, Arrows)
- Screen reader support built-in
- Focus indicators visible by default

**From `/docs/ux-design-specification.md` - Component Library:**

**shadcn/ui Selected as Design System:**
- Accessible Radix UI primitives
- Customizable with Tailwind (matches Playful Nordic theme)
- Copy-paste components for full control
- Battle-tested components with excellent DX

**Mobile-First Design:**
- All components must work well on mobile (touch targets 48px+)
- Responsive breakpoints: <640px (mobile), 640-1024px (tablet), >1024px (desktop)
- Touch-friendly interactions for dialogs, selects, switches

**Component Usage in Musikkfabrikken:**
- Button: CTAs, form submissions, navigation
- Card: Song cards, credit packages, user profile
- Input: Text input for lyrics, song titles, user settings
- Dialog: Song generation progress, confirmation modals, settings
- Toast: Success/error notifications (song generated, credit purchased, errors)
- Progress: Song generation progress indicator, audio player timeline
- Badge: Genre tags, status indicators (generating, completed, failed)
- Select: Genre selector, credit package picker, settings dropdowns
- Switch: Phonetic toggle ("Uttalelse Bokmål"), audio settings
- Tabs: Settings categories, song library filters

### Project Structure Notes

**Files to Create:**
- `/src/components/ui/button.tsx` - Button component with variants (default, secondary, outline, ghost)
- `/src/components/ui/card.tsx` - Card component with header, content, footer
- `/src/components/ui/input.tsx` - Text input with label support
- `/src/components/ui/dialog.tsx` - Modal dialog with overlay
- `/src/components/ui/toast.tsx` - Toast notification component
- `/src/components/ui/progress.tsx` - Progress bar component
- `/src/components/ui/badge.tsx` - Badge component with variants
- `/src/components/ui/select.tsx` - Dropdown select component
- `/src/components/ui/switch.tsx` - Toggle switch component
- `/src/components/ui/tabs.tsx` - Tabs component with panels
- `/src/lib/utils.ts` - Utility functions (cn() for class merging)

**Files to Modify:**
- `tailwind.config.ts` - May be updated by shadcn/ui init (verify no conflicts with Playful Nordic theme)
- `src/app/globals.css` - May be updated with shadcn/ui base styles and CSS variables

**Temporary Files:**
- `src/app/test-komponenter/page.tsx` - Norwegian test page (created for testing, deleted before completion)

**Dependencies Auto-Installed:**
- `@radix-ui/react-*` - Various Radix UI primitives (dialog, toast, select, switch, tabs, progress)
- `class-variance-authority` - CVA for component variants
- `clsx` - Class name utility
- `tailwind-merge` - Tailwind class merging
- `lucide-react` - Icon library (optional, often used with shadcn/ui)

### Learnings from Previous Story

**From Story 1-2-configure-tailwind-with-playful-nordic-theme (Status: done)**

- **Playful Nordic Theme Ready**:
  - Primary: #E94560 (coral-red) - Use for primary buttons, CTAs
  - Secondary: #0F3460 (navy) - Use for secondary actions, headers
  - Accent: #FFC93C (yellow) - Use for highlights, badges
  - Semantic colors configured: success (#06D6A0), error (#EF476F), info (#3B82F6)
  - Custom spacing scale: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px)
  - Border radius: 12px default (friendly, modern)

- **WCAG Compliance Verified**:
  - Primary (#E94560) on white: 4.52:1 ✓ AA
  - Secondary (#0F3460) on white: 12.63:1 ✓ AAA
  - Text-secondary (#6B7280) on white: 4.54:1 ✓ AA
  - All shadcn/ui components should automatically use these colors

- **Norwegian Language Requirement**:
  - Test page MUST use Norwegian (Bokmål)
  - HTML lang="nb", Norwegian content in all labels and text
  - See DEVELOPMENT_GUIDELINES.md for comprehensive requirements

- **Testing Pattern**:
  - Create test pages in `src/app/test-*/page.tsx`
  - Verify functionality visually and with keyboard
  - Delete test pages before marking story complete

- **Build Configuration**:
  - `npm run build` working successfully
  - TypeScript strict mode enabled
  - ESLint configured with Next.js rules

[Source: docs/sprint-artifacts/1-2-configure-tailwind-with-playful-nordic-theme.md#Dev-Agent-Record]

### Technical Context

**shadcn/ui Installation Process:**

1. **Initialization** creates:
   - `components.json` - shadcn/ui configuration
   - `src/lib/utils.ts` - Utility functions (cn() helper)
   - Updates to `tailwind.config.ts` (verify no conflicts with Playful Nordic theme)
   - Updates to `src/app/globals.css` (CSS variables for colors)

2. **Component Installation** creates:
   - Individual component files in `/src/components/ui/`
   - Auto-installs required Radix UI dependencies
   - Auto-installs utility dependencies (CVA, clsx, tailwind-merge)

**Potential Theme Conflicts:**

shadcn/ui init may suggest base colors (Slate, Zinc, etc.). We should:
- **Accept CSS variable setup** (useful for theming)
- **Keep Playful Nordic colors** in tailwind.config.ts as primary source
- **Override any conflicting colors** in globals.css if needed
- **Verify** buttons use #E94560 for primary variant after installation

**Component Variants to Test:**

- **Button**: default (primary), secondary, outline, ghost, link, destructive
- **Badge**: default, secondary, outline, destructive
- **Card**: with header, content, footer, description
- **Dialog**: with trigger, overlay, content, header, footer, close button
- **Select**: with trigger, content, items, scrollable items
- **Tabs**: with list, triggers, content panels

**CSS Variables (if shadcn/ui creates them):**

May create variables like `--primary`, `--secondary`, etc. in globals.css. We should:
- Map these to Playful Nordic colors
- Or ignore and use direct Tailwind classes (bg-primary, text-secondary)
- Verify components render with correct colors either way

### References

- [Architecture Document - ADR-004: shadcn/ui Components](../architecture.md#adr-004-use-shadcnui-for-ui-components)
- [UX Design Specification - Component Library](../ux-design-specification.md#4-component-library)
- [UX Design Specification - Color System](../ux-design-specification.md#31-color-system)
- [Epic 1 Tech Spec - UI Component Dependencies](tech-spec-epic-1.md#ui-component-dependencies-story-14)
- [shadcn/ui Documentation - Installation](https://ui.shadcn.com/docs/installation/next)
- [shadcn/ui Documentation - Components](https://ui.shadcn.com/docs/components)
- [Radix UI Documentation - Primitives](https://www.radix-ui.com/primitives)

## Change Log

**2025-11-20 - Story Created (drafted status)**
- Story drafted by SM agent (Bob) in YOLO mode
- Extracted from Epic 1: Foundation & Infrastructure
- Source: docs/sprint-artifacts/tech-spec-epic-1.md
- Prerequisites: Story 1.2 completed (done status) - Tailwind theme configured
- Story 1.3 (Supabase) can be done in parallel (no dependencies between 1.3 and 1.4)
- Includes learnings from Story 1.2 (Playful Nordic theme, Norwegian language, testing patterns)
- Next step: Run story-context workflow or proceed directly to development

## Dev Agent Record

### Context Reference

- [Story Context XML](./1-4-install-shadcn-ui-and-core-components.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
