# Future Enhancements

Post-MVP features deferred to focus on core value proposition (Norwegian pronunciation optimization).

---

## Deferred Stories

### Story 4.2: Song Detail Modal with Full Player (from Epic 4)

**Why Deferred:** Current basic modal with SongPlayerCard already provides functional playback. This story adds UX polish, not core functionality.

**Current State:** Basic Dialog modal works - users can play songs, see waveform, seek, control volume.

**What This Would Add:**
- Full-screen modal layout (100vh mobile, 80vh desktop)
- Large artwork display (200x200px) with genre gradient
- Inline title editing (tap to edit)
- Deep linking support (/songs/{songId})
- Swipe-down gesture to close (mobile)
- Playback state preservation across modal open/close
- Action buttons row (Share, Download, Delete, Edit)

**Implement When:**
- After MVP launch and user feedback
- When improving retention/engagement becomes priority
- Before social sharing features (Epic 5)

**Dependencies:** None - can be implemented independently

**Estimated Effort:** Medium (1-2 days)

---

### Story 4.5: Song Rename Functionality (from Epic 4)

**Why Deferred:** Users can set title during creation. Renaming is a nice-to-have polish feature, not core functionality for MVP.

**Current State:** Songs have titles set during generation. No inline editing capability.

**What This Would Add:**
- Inline title editing in song player modal (tap title to edit)
- PATCH API endpoint for title updates
- Optimistic UI updates with rollback on error
- Title validation (1-100 characters)
- Norwegian UI: "Navnet ble oppdatert", "Sangtittel kan ikke være tom"

**Implement When:**
- After MVP launch and user feedback indicates need
- When users request ability to organize/rename library
- Pairs well with Story 4.2 (full player modal)

**Dependencies:** Story 4.1 (My Songs page) - already done

**Estimated Effort:** Small (0.5-1 day)

---

## Future Feature Ideas

### UX Polish
- [ ] Animated transitions between screens
- [ ] Haptic feedback on mobile interactions
- [ ] Skeleton loading states
- [ ] Pull-to-refresh on song library

### Player Enhancements
- [ ] Mini-player bar at bottom (plays while browsing)
- [ ] Crossfade between songs
- [ ] Playback speed control
- [ ] Repeat/loop toggle

### Download Enhancements
- [ ] WAV format download option (lossless, ~30-50MB)
  - API: `POST https://api.sunoapi.org/api/v1/wav/generate`
  - Async conversion with webhook callback
  - Consider as premium feature (extra credits)
- [ ] Batch download (multiple songs as ZIP)
- [ ] Download progress indicator for large files

### Epic 5: Social Sharing & Viral Features (Full Epic - Post-MVP)

**Why Deferred:** Social/viral features are growth optimization. The MVP must first validate the core value proposition (Norwegian pronunciation) before optimizing for sharing. Build something worth sharing first.

**Stories Deferred:**

#### Story 5.1: Social Share Sheet Component
- Bottom sheet with platform icons (TikTok, Facebook, Instagram, WhatsApp, Copy Link)
- Song preview card with artwork and "Created with Musikkfabrikken"
- Native Web Share API for mobile, fallback URLs for desktop
- **Effort:** Small-Medium

#### Story 5.2: TikTok and Facebook Share Functionality
- Native share intents with pre-filled captions
- Platform SDK integration (TikTok Share SDK, Facebook Share Dialog)
- Share count tracking in database
- **Effort:** Medium (SDK integration complexity)

#### Story 5.3: Generate Shareable Song Links
- Public route `/songs/[id]` for shared songs (no auth required)
- Open Graph meta tags for rich previews
- `is_public` flag on songs table
- "Create your own" CTA for viral acquisition
- **Effort:** Small-Medium

#### Story 5.4: Musikkfabrikken Watermark on Free Previews
- Audio watermark on 30-second free previews
- Visual watermark on share preview images
- Full songs (paid) have no watermark
- **Effort:** Medium (audio processing)

#### Story 5.5: Share Analytics and Attribution
- `song_share` tracking table
- Referral tracking via `?ref={songId}` query param
- Analytics dashboard for founder
- Future: Referral rewards system
- **Effort:** Medium

**Implement When:**
- After MVP launch validates core value proposition
- When organic growth becomes a priority
- User feedback indicates desire to share songs

**Total Estimated Effort:** 1-2 weeks

### Epic 6: Premium Features (Full Epic - Post-MVP)

**Why Deferred:** Secondary revenue streams. MVP should validate core value proposition (credits → Norwegian songs) before adding complexity. Mastering service requires manual fulfillment overhead. Extended storage adds unnecessary tier logic.

**Stories Deferred:**

#### Story 6.1-6.2: Canvas/Album Art Generation
- AI-generated visual canvas using Google Video API / Imagen
- Custom prompts or auto-generate from song metadata
- 1024x1024px PNG download
- Cost: 5 credits per generation
- **Effort:** Medium
- **Revisit when:** Users request visual assets for social sharing

#### Story 6.3-6.5: Mastering Service
- Manual mastering by founder (20 credits / $10)
- 24-hour SLA with auto-refund on miss
- Admin dashboard for founder to upload mastered files
- Email notifications for booking/completion
- **Effort:** Large (manual fulfillment, admin UI, cron jobs)
- **Revisit when:** Revenue justifies manual service overhead

#### Story 6.6: Extended Storage (30 days)
- Premium tier gets 30-day retention vs 14-day standard
- Tier based on credit package purchased
- **Effort:** Small
- **Revisit when:** Users complain about 14-day limit (validate demand first)

**Implement When:**
- Canvas: After social sharing features (Epic 5) if users want visuals
- Mastering: Only if founder capacity and revenue justify it
- Extended storage: Only if user feedback indicates demand

**Total Estimated Effort:** 2-3 weeks

---

_Document created: 2025-11-26_
_Review after MVP launch to prioritize based on user feedback_
