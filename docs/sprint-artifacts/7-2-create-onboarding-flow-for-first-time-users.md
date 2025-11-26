# Story 7.2: Create Onboarding Flow for First-Time Users

Status: ready-for-dev

## Story

As a **new user**,
I want guided onboarding when I first use Musikkfabrikken,
so that I understand how to create my first Norwegian song.

## Acceptance Criteria

1. **Welcome Modal Trigger**: A welcome modal appears when a user lands on "Create Song" page for the first time (onboarding_completed = false)
2. **Welcome Message**: Modal displays: "Velkommen til Musikkfabrikken! La oss lage din første norske sang på under 5 minutter."
3. **3-Screen Wizard**:
   - Screen 1: "Velg dine favorittsjangre" - Multi-select up to 3 genres from carousel
   - Screen 2: "Hva handler sangen din om?" - Concept input with pre-filled example: "Bursdagssang til en venn"
   - Screen 3: "Lag din første sang!" - Explanation of credits + button to generate free preview
4. **Navigation**: Progress indicators (1/3, 2/3, 3/3), Next/Back buttons
5. **Skip Option**: "Hopp over" button available on all screens, sets onboarding_completed=true
6. **Completion Persistence**: After completing onboarding, `onboarding_completed` boolean stored in user_profile
7. **No Repeat**: Onboarding never shows again after completion or skip
8. **Post-Onboarding Highlight**: After completion, genre carousel briefly highlighted with spotlight/pulse effect
9. **Build Verification**: Production build succeeds with no TypeScript or ESLint errors

## Tasks / Subtasks

- [ ] Task 1: Add onboarding_completed Column to user_profile (AC: #6, #7)
  - [ ] Create migration: `supabase/migrations/XXXXXX_add_onboarding_completed.sql`
  - [ ] Add column: `onboarding_completed BOOLEAN DEFAULT false`
  - [ ] Update TypeScript types if using generated types

- [ ] Task 2: Create Onboarding Hook (AC: #1, #6, #7)
  - [ ] Create `/src/hooks/use-onboarding.ts`
  - [ ] Fetch `onboarding_completed` from user_profile on mount
  - [ ] Provide `completeOnboarding()` function to update database
  - [ ] Return `{ showOnboarding, completeOnboarding, isLoading }`

- [ ] Task 3: Create OnboardingModal Component (AC: #1, #2, #3, #4, #5)
  - [ ] Create `/src/components/onboarding-modal.tsx`
  - [ ] Use shadcn/ui Dialog component
  - [ ] Implement 3-screen wizard with useState for currentStep
  - [ ] Add progress indicator (step dots or "1/3" text)
  - [ ] Add Next/Back/Skip buttons
  - [ ] All text in Norwegian (Bokmål)

- [ ] Task 4: Implement Screen 1 - Genre Selection (AC: #3)
  - [ ] Display header: "Velg dine favorittsjangre"
  - [ ] Show genre carousel/grid (reuse GenreCarousel or genre data)
  - [ ] Multi-select up to 3 genres
  - [ ] Store selected genres in component state
  - [ ] Show selected count: "3 av 3 valgt"

- [ ] Task 5: Implement Screen 2 - Song Concept Input (AC: #3)
  - [ ] Display header: "Hva handler sangen din om?"
  - [ ] Textarea with placeholder: "Bursdagssang til en venn som elsker å fiske..."
  - [ ] Store concept in component state
  - [ ] Optional: Character count hint

- [ ] Task 6: Implement Screen 3 - Generate First Song (AC: #3)
  - [ ] Display header: "Lag din første sang!"
  - [ ] Explain credits briefly: "Gratis forhåndsvisning tilgjengelig"
  - [ ] CTA button: "Lag forhåndsvisning" or "Start"
  - [ ] On complete, call `completeOnboarding()` and close modal

- [ ] Task 7: Implement Skip Functionality (AC: #5, #7)
  - [ ] Add "Hopp over" ghost button on all screens
  - [ ] On skip, call `completeOnboarding()` and close modal
  - [ ] Confirmation optional (or just skip immediately)

- [ ] Task 8: Add Spotlight Effect for Post-Onboarding (AC: #8)
  - [ ] After modal closes, trigger brief highlight on genre carousel
  - [ ] Options: pulse animation, ring highlight, or subtle glow
  - [ ] Duration: 2-3 seconds, then fade out
  - [ ] Use CSS animation or framer-motion

- [ ] Task 9: Integrate OnboardingModal into Create Page (AC: #1, #7)
  - [ ] Update `/src/app/page.tsx` or create page component
  - [ ] Use `useOnboarding()` hook
  - [ ] Conditionally render `<OnboardingModal>` when `showOnboarding === true`
  - [ ] Pass `onComplete` callback to handle post-onboarding effects

- [ ] Task 10: Build Verification (AC: #9)
  - [ ] Run `npm run build` - success
  - [ ] Run `npm run lint` - no errors
  - [ ] No TypeScript errors

## Dev Notes

### Architecture Alignment

**From `/docs/ux-design-specification.md` - Journey 4 (First-Time Onboarding):**

> **Flow:**
> 1. Entry: First app open → Google Auth login
> 2. Welcome Screen: "Welcome to Musikkfabrikken!" + value prop
> 3. Quick Create Wizard (3 screens):
>    - Screen 1: "Pick 3 favorite genres" → Multi-select genre cards
>    - Screen 2: "Let's create your first song!" → Simple concept input
>    - Screen 3: "Generating..." → Progress animation
> 4. Success: First song plays automatically + celebration
> 5. Prompt: "Share with friends?" or "Create another!"

**UX Pattern from spec (Section 7.1 - Modal Patterns):**
- Size: Large (80% width) or full-screen on mobile
- Focus management: Focus trap within modal
- Dismiss: Can't dismiss by clicking outside during onboarding (intentional)

**Norwegian Language (ui_content_language: Norwegian):**
All user-facing text must be in Norwegian (Bokmål):
- "Velkommen til Musikkfabrikken!"
- "La oss lage din første norske sang på under 5 minutter."
- "Velg dine favorittsjangre"
- "Hva handler sangen din om?"
- "Lag din første sang!"
- "Hopp over"
- "Neste" / "Tilbake"

### Project Structure Notes

**Files to Create:**
- `/src/hooks/use-onboarding.ts` - Onboarding state hook
- `/src/components/onboarding-modal.tsx` - Main onboarding wizard component
- `/supabase/migrations/XXXXXX_add_onboarding_completed.sql` - Database migration

**Files to Modify:**
- `/src/app/page.tsx` - Integrate onboarding modal on create page

**Existing Components to Reuse:**
- `/src/components/ui/dialog.tsx` - shadcn/ui Dialog (already installed)
- `/src/components/ui/button.tsx` - Button variants
- `/src/components/genre-carousel.tsx` - For genre selection display
- `/src/lib/constants.ts` - GENRES data

### Learnings from Previous Story

**From Story 7.1 (Contextual Tooltips) - Status: review**

- **InfoTooltip Component Created**: Available at `/src/components/info-tooltip.tsx` - can be used for explaining credits on screen 3
- **TooltipProvider in Layout**: Already added to `/src/app/layout.tsx` with 400ms delay
- **TOOLTIPS Constants**: Available in `/src/lib/constants.ts` - can add onboarding-specific tooltips
- **Norwegian Translations Pattern**: Follow same pattern - Norwegian UI text, English code/variables
- **Files Modified in 7.1**:
  - src/lib/constants.ts (TOOLTIPS constant)
  - src/app/layout.tsx (TooltipProvider)
  - src/components/pronunciation-toggle.tsx
  - src/components/credit-purchase-modal.tsx
  - src/components/song-player-card.tsx

[Source: docs/sprint-artifacts/7-1-add-contextual-tooltips-throughout-app.md#Dev-Agent-Record]

### Technical Implementation Notes

**Database Migration:**
```sql
-- Add onboarding_completed column to user_profile
ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
```

**useOnboarding Hook Pattern:**
```typescript
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user profile, check onboarding_completed
    // Set showOnboarding = !onboarding_completed
  }, [])

  const completeOnboarding = async () => {
    // Update user_profile.onboarding_completed = true
    setShowOnboarding(false)
  }

  return { showOnboarding, completeOnboarding, isLoading }
}
```

**Wizard Step State:**
```typescript
const [currentStep, setCurrentStep] = useState(1)
const [selectedGenres, setSelectedGenres] = useState<string[]>([])
const [songConcept, setSongConcept] = useState('')

const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3))
const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))
```

**Spotlight Effect CSS:**
```css
@keyframes spotlight-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(233, 69, 96, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(233, 69, 96, 0); }
}
.spotlight-active {
  animation: spotlight-pulse 1s ease-in-out 2;
}
```

### References

- [Epic 7 - User Experience & Help](../epics/epic-7-user-experience-help.md)
- [UX Design Specification - Journey 4](../ux-design-specification.md#51-critical-user-paths)
- [Architecture Document - State Management](../architecture.md)
- [Previous Story 7.1 - Contextual Tooltips](./7-1-add-contextual-tooltips-throughout-app.md)
- [shadcn/ui Dialog Documentation](https://ui.shadcn.com/docs/components/dialog)

## Change Log

**2025-11-26 - Story Created (drafted status)**
- Story drafted by SM agent using create-story workflow
- Extracted from Epic 7: User Experience & Help
- Source: docs/epics/epic-7-user-experience-help.md
- Prerequisites: Story 3.1 (Genre Carousel - review), Story 3.9 (Free Preview - review)
- Learnings incorporated from Story 7.1 (InfoTooltip pattern, Norwegian translations)
- All text translated to Norwegian (Bokmål)
- Next step: Run story-context workflow or proceed to development

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/stories/7-2-create-onboarding-flow-for-first-time-users.context.xml](stories/7-2-create-onboarding-flow-for-first-time-users.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
