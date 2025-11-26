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

### Social Features (Epic 5 - Post-MVP)
- [ ] Social share sheet (TikTok, Facebook, Instagram)
- [ ] Shareable song links with preview
- [ ] Musikkfabrikken watermark on free previews
- [ ] Share analytics

### Premium Features (Epic 6 - Post-MVP)
- [ ] Canvas/album art generation
- [ ] Mastering service booking
- [ ] Extended storage (30 days)

---

_Document created: 2025-11-26_
_Review after MVP launch to prioritize based on user feedback_
