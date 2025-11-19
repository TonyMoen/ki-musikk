# Functional Requirements Inventory

**User Account & Authentication (FR1-FR4)**
- FR1: Users can create accounts using Google OAuth authentication
- FR2: Users can log in securely and maintain sessions across devices
- FR3: Users can view their account profile with credit balance and usage history
- FR4: Users can log out from any device

**Song Creation & Lyrics Input (FR5-FR8)**
- FR5: Users can input Norwegian lyrics for song generation (text entry)
- FR6: Users can select genre/style from pre-configured prompt templates
- FR7: Users can customize song metadata (title, artist name, description)
- FR8: Users can preview their lyrics before submitting for generation

**Norwegian Pronunciation Optimization (FR9-FR13) - CORE VALUE**
- FR9: Users can toggle "Uttalelse Bokmål" pronunciation optimization on/off
- FR10: Users can preview phonetic transformations with visual diff (before/after lyrics comparison)
- FR11: Users can override phonetic suggestions on a per-line basis for edge cases
- FR12: System automatically applies Norwegian pronunciation rules when phonetic toggle is enabled
- FR13: Users can view explanations/disclaimers about pronunciation optimization limitations

**Song Generation & Processing (FR14-FR20)**
- FR14: Users can generate 30-second preview clips for free (watermarked)
- FR15: Users can generate full-length songs using credits
- FR16: Users can view real-time generation status and progress
- FR17: Users can cancel pending song generation requests
- FR18: System automatically deducts credits upon successful generation
- FR19: System automatically rolls back credits if generation fails
- FR20: Users receive notifications when song generation completes

**Track List & Session Management (FR21-FR27)**
- FR21: Users can view all their generated songs in a persistent track list
- FR22: Users can play generated songs directly in the browser
- FR23: Users can download generated songs in common audio formats (MP3, WAV)
- FR24: Users can delete songs from their track list
- FR25: Users can rename/re-title generated songs
- FR26: System persists track list across sessions (survives browser refresh and API failures)
- FR27: System automatically deletes songs after 14 days (with prior user notification)

**Credit System & Payments (FR28-FR34)**
- FR28: Users can view their current credit balance at all times
- FR29: Users can purchase credit packages via Stripe (Starter/Pro/Premium tiers)
- FR30: Users receive low-balance warnings before credits run out
- FR31: Users can view credit transaction history (purchases, deductions, refunds)
- FR32: System displays credit cost for each action before execution
- FR33: System prevents actions if insufficient credits available
- FR34: Users can request refunds for failed generations within policy timeframe

**Premium Features - Canvas Generation (FR35-FR39)**
- FR35: Users can optionally generate visual canvas/album art for their songs
- FR36: Users can provide custom prompts for canvas generation
- FR37: System automatically generates AI-powered canvas prompts based on song metadata
- FR38: Users can preview and download generated canvas images
- FR39: System deducts canvas generation credits separately from song credits

**Premium Features - Mastering Service (FR40-FR45)**
- FR40: Users can book manual mastering service for generated songs
- FR41: Users can view mastering service availability and SLA (24-hour turnaround)
- FR42: System requires binding pre-payment for mastering service bookings
- FR43: Users receive notifications when mastered tracks are ready
- FR44: Users can download mastered versions alongside original versions
- FR45: Users receive free mastering if SLA is missed (service guarantee)

**Storage & File Management (FR46-FR50)**
- FR46: System automatically downloads and stores generated songs from Suno API (immediate transfer to prevent 3-day auto-deletion)
- FR47: System provides signed URLs for secure file downloads (no public file access)
- FR48: System notifies users before 14-day auto-deletion deadline
- FR49: Premium tier users can access extended 30-day storage
- FR50: Users can export/download multiple songs in batch

**User Experience & Help (FR51-FR55)**
- FR51: Users can access genre/style prompt templates with drag-and-drop or selection
- FR52: System displays helpful tooltips and guidance for non-technical users
- FR53: Users can view examples of phonetic optimization in action
- FR54: Users can access FAQ and help documentation
- FR55: System displays clear error messages with actionable guidance when issues occur

**Social Sharing & Viral Features (FR56-FR59)**
- FR56: Users can share generated songs directly to social media platforms (TikTok, Facebook)
- FR57: Free preview clips include Musikkfabrikken watermark/branding
- FR58: Users can generate shareable links for their songs
- FR59: Shared songs display Musikkfabrikken attribution to drive organic discovery

**System Administration (FR60-FR65)**
- FR60: System logs all credit transactions for auditing and support
- FR61: System monitors Suno API health and response times
- FR62: System alerts founder when API costs exceed thresholds
- FR63: System tracks pronunciation quality feedback from users
- FR64: Founder can manually process mastering service requests
- FR65: Founder can monitor test team feedback for quality degradation

**Error Handling & Resilience (FR66-FR70)**
- FR66: System gracefully handles Suno API failures with user-friendly error messages
- FR67: System implements automatic retry logic for transient API failures
- FR68: System maintains session state during API downtime
- FR69: System provides fallback mechanisms for webhook failures (polling)
- FR70: System prevents double-charging on concurrent generation requests

**Total:** 70 functional requirements

---
