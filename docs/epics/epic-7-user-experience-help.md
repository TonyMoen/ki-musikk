# Epic 7: User Experience & Help

**Goal:** Polish the user experience with helpful guidance, tooltips, examples, and documentation.

**User Value:** App is intuitive, helpful, and delightful for non-technical users.

**FRs Covered:** FR52-FR55 (Help & Guidance)

---

### Story 7.1: Add Contextual Tooltips Throughout App

As a **user**,
I want helpful tooltips when I hover/tap on unfamiliar features,
So that I understand what each feature does without leaving the page.

**Acceptance Criteria:**

**Given** I am using the app as a first-time user
**When** I hover over (desktop) or tap (mobile) an info icon (ⓘ) next to a feature
**Then** A tooltip appears explaining the feature in simple Norwegian or English
**And** Tooltips are clear, concise (1-2 sentences), and jargon-free
**And** Key tooltips:
  - "Uttalelse Bokmål": "Automatically improves Norwegian pronunciation for Suno AI"
  - "Credits": "1 credit ≈ $0.05. Songs cost 10 credits each."
  - "Canvas": "AI-generated album art for your song (5 credits)"
  - "Mastering": "Professional audio enhancement by our founder (20 credits, 24h)"
**And** Tooltips dismiss when I tap outside or hover away

**Prerequisites:** Story 1.4 (shadcn/ui)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "7.1 Consistency Rules - Feedback Patterns"
- Use shadcn/ui Tooltip component
- Info icons: Use Lucide icon `Info` (ⓘ) next to labels
- Tooltip styling: White card, drop shadow, max-width 250px
- Accessibility: ARIA role="tooltip", keyboard accessible (focus to show)
- Content: Store tooltip text in constants file for easy editing

---

### Story 7.2: Create Onboarding Flow for First-Time Users

As a **new user**,
I want guided onboarding when I first use Musikkfabrikken,
So that I understand how to create my first Norwegian song.

**Acceptance Criteria:**

**Given** I have just signed up and logged in for the first time
**When** I land on the "Create Song" page
**Then** A welcome modal appears: "Welcome to Musikkfabrikken! Let's create your first Norwegian song in under 5 minutes."
**And** Onboarding consists of 3 screens:
  1. "Pick your favorite genres" - Multi-select 3 genres
  2. "What's your song about?" - Enter concept (pre-filled example: "Birthday song for a friend")
  3. "Generate your first song!" - Explanation of credits + button to get free preview
**And** After onboarding, I'm guided to create first song with tooltips highlighting key features
**And** Onboarding can be skipped with "Skip" button
**And** Onboarding doesn't show again after first completion

**Prerequisites:** Story 3.1 (Genre Carousel), Story 3.9 (Free Preview)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "5.1 User Journey - Journey 4"
- Store onboarding completion in user_profile: `onboarding_completed` boolean
- Use shadcn/ui Dialog for onboarding modal
- Onboarding state: Track current step (1/3, 2/3, 3/3)
- Skip button: Set onboarding_completed=true, never show again
- After onboarding: Highlight genre carousel with spotlight effect

---

### Story 7.3: Create FAQ and Help Documentation Page

As a **user**,
I want access to comprehensive help documentation,
So that I can find answers to common questions without contacting support.

**Acceptance Criteria:**

**Given** I need help understanding features
**When** I tap "Help" link in Settings page footer
**Then** I navigate to `/help` page with searchable FAQ
**And** FAQ is organized by category:
  - Getting Started: "How do I create my first song?", "What are credits?"
  - Norwegian Pronunciation: "What is Uttalelse Bokmål?", "Can I override phonetic changes?"
  - Credits & Payments: "How do credit packages work?", "What payment methods do you accept?"
  - Premium Features: "What is canvas generation?", "How does mastering work?"
  - Troubleshooting: "My song generation failed, why?", "How do I download songs?"
**And** Each FAQ entry is expandable (accordion) with detailed answer
**And** Search bar filters FAQs by keyword
**And** "Still need help? Contact us" link at bottom

**Prerequisites:** None (standalone page)

**Technical Notes:**
- Create `/src/app/help/page.tsx` for help documentation
- FAQ content: Markdown format, stored in `/content/faq.md`
- Use shadcn/ui Accordion component for expandable entries
- Search: Client-side filter by keywords in FAQ text
- Contact link: Email mailto:support@musikkfabrikken.no or contact form
- Consider: Add video tutorials for key flows (song creation, pronunciation)

---

### Story 7.4: Add Example Songs Showcase Page

As a **user**,
I want to hear example songs created with Musikkfabrikken,
So that I can understand the quality and possibilities before creating my own.

**Acceptance Criteria:**

**Given** I want to hear examples before committing
**When** I navigate to `/examples` page (linked from home and help pages)
**Then** I see a curated gallery of 6-10 example songs
**And** Each example shows: Artwork, Title, Genre, Short description ("Norwegian birthday song with country rock style")
**And** I can play each example directly on the page (no login required)
**And** Examples demonstrate variety: Different genres, pronunciations, song types
**And** Each example has "Create Your Own" CTA button
**And** Examples are marked with "Example" badge to distinguish from user songs

**Prerequisites:** Story 3.8 (Song Player)

**Technical Notes:**
- Create `/src/app/examples/page.tsx` for example showcase
- Example songs: Create manually by founder, mark as `is_example=true` in database
- Public access: No authentication required (RLS policy allows SELECT for is_example=true)
- Curated selection: Choose best examples that showcase Norwegian pronunciation quality
- Consider: Add founder's 80k listener songs as examples for credibility
- Update examples periodically to keep content fresh

---

### Story 7.5: Implement Friendly Error Messages with Recovery Actions

As a **user**,
I want clear, actionable error messages when something goes wrong,
So that I know what happened and how to fix it.

**Acceptance Criteria:**

**Given** An error occurs during any operation
**When** The error is displayed to me
**Then** I see a friendly, jargon-free message explaining what happened
**And** Message includes specific recovery action (not just "Error occurred")
**And** Error examples:
  - Suno API failure: "Oops! Couldn't reach Suno. Check your connection?" + "Retry" button
  - Insufficient credits: "You need 10 credits to generate a song. Purchase a package?" + "Buy Credits" button
  - Song generation timeout: "Generation took longer than expected. We'll notify you when it's ready!" + "OK" button
  - Network error: "Looks like you're offline. Check your connection and try again." + "Retry" button
**And** Errors are logged server-side for debugging (user doesn't see technical details)
**And** Error toast/modal uses appropriate severity color (red for critical, yellow for warnings)

**Prerequisites:** All stories (cross-cutting concern)

**Technical Notes:**
- UX reference: `/docs/ux-design-specification.md` section "7.1 Consistency Rules - Feedback Patterns"
- Create error message dictionary: `/src/lib/utils/error-messages.ts`
- Map technical errors to user-friendly messages
- Always include actionable next step (retry, contact support, check settings)
- Log full error details to console + monitoring service (Sentry)
- Test error handling: Intentionally trigger errors to verify messages

---

---
