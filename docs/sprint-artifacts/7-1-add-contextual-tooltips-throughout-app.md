# Story 7.1: Add Contextual Tooltips Throughout App

Status: review

## Story

As a **user**,
I want helpful tooltips when I hover/tap on unfamiliar features,
so that I understand what each feature does without leaving the page.

## Acceptance Criteria

1. **Info Icons Added**: Info icons (ⓘ) appear next to key features that need explanation
2. **Tooltip on Hover/Tap**: Hovering (desktop) or tapping (mobile) info icon shows tooltip
3. **Norwegian Content**: All tooltip text is in Norwegian (Bokmål) as per ui_content_language config
4. **Key Tooltips Implemented**:
   - "Uttalelse Bokmål": "Forbedrer automatisk norsk uttale for Suno AI"
   - "Kreditter": "1 kreditt ≈ kr 5. Full sang koster 10 kreditter."
   - "Gratis forhåndsvisning": "30-sekunders forhåndsvisning for å høre sangen din før kjøp"
   - "Last ned": "Last ned hele sangen som MP3 (tilgjengelig i 14 dager)"
5. **Tooltip Styling**: White card with drop shadow, max-width 250px, rounded corners
6. **Dismiss Behavior**: Tooltips dismiss when tapping outside or hovering away
7. **Accessibility**: ARIA role="tooltip", keyboard accessible (focus to show)
8. **Build Verification**: Production build succeeds with no TypeScript or ESLint errors

## Tasks / Subtasks

- [x] Task 1: Create Tooltip Constants File (AC: #3, #4)
  - [x] Added TOOLTIPS constant to `/src/lib/constants.ts` (existing file)
  - [x] Define tooltip content object with Norwegian text:
    ```typescript
    export const TOOLTIPS = {
      pronunciation: 'Forbedrer automatisk norsk uttale for Suno AI',
      credits: '1 kreditt ≈ kr 5. Full sang koster 10 kreditter.',
      freePreview: '30-sekunders forhåndsvisning for å høre sangen din før kjøp',
      download: 'Last ned hele sangen som MP3 (tilgjengelig i 14 dager)',
    } as const;
    ```
  - [x] Export type for tooltip keys (TooltipKey)

- [x] Task 2: Create InfoTooltip Wrapper Component (AC: #1, #2, #5, #6, #7)
  - [x] Create `/src/components/info-tooltip.tsx`
  - [x] Use existing shadcn/ui Tooltip component from `/src/components/ui/tooltip.tsx`
  - [x] Add Info icon from lucide-react
  - [x] Style tooltip content: white background, drop shadow, max-w-[250px], rounded-md
  - [x] Ensure ARIA attributes for accessibility (via Radix UI)
  - [x] Props: `content: string`, `side?: 'top' | 'bottom' | 'left' | 'right'`

- [x] Task 3: Add TooltipProvider to Root Layout (AC: #2)
  - [x] Update `/src/app/layout.tsx`
  - [x] Wrap app with `<TooltipProvider>` from shadcn/ui
  - [x] Configure delayDuration for hover delay (400ms)

- [x] Task 4: Add Tooltip to Pronunciation Toggle (AC: #4)
  - [x] Update `/src/components/pronunciation-toggle.tsx`
  - [x] Add InfoTooltip next to "Uttalelse Bokmål" label
  - [x] Use TOOLTIPS.pronunciation content
  - [x] Position: right side of label

- [x] Task 5: Add Tooltip to Credit Display (AC: #4)
  - [x] Updated `/src/components/credit-purchase-modal.tsx`
  - [x] Add InfoTooltip next to "Kjøp kreditter" title
  - [x] Use TOOLTIPS.credits content
  - [x] Translated modal text to Norwegian

- [x] Task 6: Add Tooltip to Free Preview Feature (AC: #4)
  - [x] Updated `/src/components/song-player-card.tsx`
  - [x] Add InfoTooltip next to FORHÅNDSVISNING badge
  - [x] Use TOOLTIPS.freePreview content

- [x] Task 7: Add Tooltip to Download Button (AC: #4)
  - [x] Update `/src/components/song-player-card.tsx`
  - [x] Add InfoTooltip next to download button
  - [x] Use TOOLTIPS.download content
  - [x] Mentions 14-day availability in tooltip

- [x] Task 8: Style Tooltip Content (AC: #5)
  - [x] InfoTooltip component includes: bg-white, shadow-lg, text-secondary (navy), max-w-[250px]
  - [x] Text is readable with proper contrast
  - [x] Works on both mobile and desktop

- [x] Task 9: Test Keyboard Accessibility (AC: #7)
  - [x] Button is focusable with focus ring (focus:ring-2 focus:ring-ring)
  - [x] Radix UI handles Enter/Space to show tooltip
  - [x] Tab away dismisses tooltip
  - [x] ARIA attributes handled by Radix UI

- [x] Task 10: Test Touch Behavior (AC: #6)
  - [x] Touch target is 44x44px on mobile (min-w-[44px] min-h-[44px])
  - [x] Radix UI handles tap to show, tap outside to dismiss
  - [x] Desktop has normal smaller button size

- [x] Task 11: Build Verification (AC: #8)
  - [x] Run `npm run build` - success
  - [x] Run `npm run lint` - no errors
  - [x] No TypeScript errors

## Dev Notes

### Architecture Alignment

**From `/docs/ux-design-specification.md` - Feedback Patterns:**

- **Info Tooltip Pattern**: White card with drop shadow, auto-dismiss on tap outside
- **Usage**: Explaining features like "Uttalelse Bokmål" toggle
- **Info Blue**: `#3B82F6` for informational messages (optional for icon)
- **Contextual tooltips** for features that need explanation

**From `/docs/architecture.md` - UI Components:**

- shadcn/ui Tooltip component already installed (Story 1.4)
- Built on Radix UI for accessibility (ARIA, keyboard support)
- lucide-react for icons (Info icon: `<Info />`)

**Norwegian Language (ui_content_language: Norwegian):**

All user-facing text must be in Norwegian (Bokmål):
- Tooltip content in Norwegian
- Labels in Norwegian
- Keep code/variables in English

### Project Structure Notes

**Files to Create:**
- `/src/lib/constants/tooltips.ts` - Centralized tooltip content
- `/src/components/info-tooltip.tsx` - Reusable InfoTooltip wrapper

**Files to Modify:**
- `/src/app/layout.tsx` - Add TooltipProvider
- `/src/components/pronunciation-toggle.tsx` - Add tooltip to Uttalelse toggle
- `/src/components/song-player-card.tsx` - Add tooltip to download
- `/src/components/credit-purchase-modal.tsx` - Add tooltip to credits
- Other components as identified

**Existing Components to Use:**
- `/src/components/ui/tooltip.tsx` - shadcn/ui Tooltip (already installed)
- lucide-react `Info` icon

### Technical Context

**shadcn/ui Tooltip Usage:**
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="p-1">
        <Info className="h-4 w-4 text-muted-foreground" />
      </button>
    </TooltipTrigger>
    <TooltipContent className="bg-white text-secondary shadow-lg max-w-[250px]">
      <p>Tooltip content here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Accessibility Requirements:**
- Radix UI Tooltip handles ARIA attributes automatically
- Focus management built-in
- Keyboard: focusable trigger, Escape to dismiss
- Screen readers announce tooltip content

**Mobile Considerations:**
- Touch: tap to show, tap outside to dismiss
- Touch target: minimum 44x44px for info icon button
- Position: avoid viewport edges, use `side` prop for placement

### References

- [Epic 7 - User Experience & Help](../epics/epic-7-user-experience-help.md)
- [UX Design Specification - Feedback Patterns](../ux-design-specification.md)
- [Architecture Document - UI Components](../architecture.md)
- [shadcn/ui Tooltip Documentation](https://ui.shadcn.com/docs/components/tooltip)
- [Radix UI Tooltip Primitives](https://www.radix-ui.com/primitives/docs/components/tooltip)

## Change Log

**2025-11-26 - Story Created (drafted status)**
- Story drafted by SM agent
- Extracted from Epic 7: User Experience & Help
- Source: docs/epics/epic-7-user-experience-help.md
- Prerequisites: Story 1.4 (shadcn/ui) - completed
- Tooltip component already exists at `/src/components/ui/tooltip.tsx`
- Key files identified for tooltip additions
- Next step: Run story-context workflow or proceed to development

**2025-11-26 - Implementation Complete**
- All 11 tasks completed
- Created InfoTooltip reusable component
- Added TOOLTIPS constants in Norwegian
- Global TooltipProvider added to layout
- Tooltips added to: Pronunciation toggle, Credit purchase modal, Free preview badge, Download button
- Build and lint verification passed

## Dev Agent Record

### Context Reference

- No context file was generated for this story

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

Implementation plan:
1. Add TOOLTIPS to existing constants.ts (better than creating new file)
2. Create InfoTooltip wrapper using existing shadcn/ui Tooltip
3. Add TooltipProvider to root layout
4. Update pronunciation-toggle.tsx to use new InfoTooltip and centralized constants
5. Add tooltip to credit-purchase-modal.tsx header
6. Add tooltip to preview badge in song-player-card.tsx
7. Add tooltip to download button in song-player-card.tsx

### Completion Notes List

- Created reusable InfoTooltip component with accessibility features (44x44px touch target, focus ring, ARIA via Radix)
- Consolidated tooltip text in TOOLTIPS constant for easy maintenance
- Used global TooltipProvider with 400ms delay for better UX
- Refactored pronunciation-toggle.tsx to remove local TooltipProvider and use centralized constants
- Translated credit purchase modal title to Norwegian ("Kjøp kreditter")
- All acceptance criteria met and verified

### File List

**Created:**
- src/components/info-tooltip.tsx

**Modified:**
- src/lib/constants.ts (added TOOLTIPS constant and TooltipKey type)
- src/app/layout.tsx (added TooltipProvider wrapper)
- src/components/pronunciation-toggle.tsx (refactored to use InfoTooltip)
- src/components/credit-purchase-modal.tsx (added tooltip, Norwegian text)
- src/components/song-player-card.tsx (added tooltips to preview badge and download button)
