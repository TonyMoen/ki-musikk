# Musikkfabrikken - Product Requirements Document

**Author:** BIP
**Date:** 2025-11-19
**Version:** 1.0

---

## Executive Summary

**Musikkfabrikken** is an AI-powered song creation platform specifically optimized for Norwegian Bokmål, addressing the critical gap in authentic Norwegian music generation. The platform enables amateur creators and entry-level artists to produce genuine-sounding Norwegian songs without requiring phonetic expertise or professional production resources.

**The Problem:** Norwegian music creators face an insurmountable barrier with existing AI music tools like Suno, which produce Norwegian vocals that sound "very American, bad, and fake" due to phonetic mispronunciations. Manual workarounds require expert-level knowledge of phonetic spelling tricks that mainstream users don't have.

**The Solution:** Musikkfabrikken intelligently orchestrates proven prompt engineering techniques (validated at 80k monthly listener scale) with user-friendly phonetic controls to transform Suno's output from "American-sounding" to authentically Norwegian. The "Uttalelse Bokmål" phonetic toggle provides automatic pronunciation enhancement with visual diff preview and per-line override capability.

**The Opportunity:** Zero Norwegian-specific competitors, proven market validation (founder's 80k monthly Spotify listeners), and a clear 6-month first-mover advantage window. Target market includes party song creators (weddings, birthdays, family gatherings) and entry-level Spotify artists building Norwegian music catalogs.

### What Makes This Special

**Norwegian-First AI Music Generation** - Musikkfabrikken is the only platform specifically optimized for authentic Norwegian pronunciation in AI-generated music.

**Key Differentiators:**
1. **Productized Expertise**: Codifies founder's 80k-listener proven techniques into accessible software
2. **Norwegian-First Design**: Only platform optimized specifically for Norwegian pronunciation, not retrofitted from English
3. **Economic Resilience**: Pre-paid credit system creates financial buffer for API dependencies
4. **User Control**: Phonetic toggle prevents algorithmic lock-in, handles edge cases gracefully
5. **First-Mover Data Moat**: Norwegian phonetic preferences and user insights become increasingly valuable and difficult for competitors to replicate

---

## Project Classification

**Technical Type:** Web Application (SaaS Platform)
**Domain:** General Software (Music/Creative Tools)
**Complexity:** Low-Medium

**Project Context:**
- **Architecture**: Next.js 14+ full-stack web application with serverless API routes
- **Platform**: Web-based (responsive, mobile-friendly), deployed on Vercel
- **User Model**: Freemium with pre-paid credit system (B2C primary, some B2B potential)
- **Market**: Norwegian language market (5.5M population), with Nordic expansion potential
- **Stage**: Pre-launch MVP development (bootstrap/founder-funded)

**Technical Characteristics:**
- API orchestration platform (Suno via sunoapi.org, GPT-4, Google Gemini, Google Video)
- Intelligent prompt engineering layer for Norwegian phonetic optimization
- Real-time song generation with async completion webhooks
- Credit-based payment system with Stripe integration
- Database-backed (Supabase: PostgreSQL + Auth + Storage)

**Business Model:**
- Pre-paid credit packages (Starter $15, Pro $45, Premium $99)
- Optional premium services (canvas generation, 24-hour manual mastering)
- Target: 1,000 users with 20% conversion (200 paying customers) within 6 months
- Goal: $7,000+ MRR to achieve sustainability

---

## Success Criteria

**What Winning Looks Like for Musikkfabrikken:**

Success means Norwegian creators experience authentic-sounding AI music that they're proud to share at life's important moments - and the platform becomes their go-to tool for personalized Norwegian songs.

### User Success Indicators

**Quality Achievement:**
- 70% of users rate Norwegian pronunciation as "noticeably better than Suno alone"
- Users accept 80%+ of phonetic suggestions from "Uttalelse Bokmål" toggle (indicating accuracy)
- Less than 10% refund rate due to quality issues

**Activation Success:**
- 80% of registered users complete at least one full song generation within 7 days
- Average time to first song: under 30 minutes
- Users successfully understand and use the phonetic toggle without confusion

**Engagement Success:**
- Users create average of 3+ songs in their first month (indicating repeat value)
- 60% of users return to create additional songs after their first success
- 40% of users share created songs on social media (TikTok/Facebook) - validating viral potential

**Emotional Success:**
- Users feel proud enough to share their creations publicly
- Event attendees recognize and enjoy the personalized Norwegian content
- Users recommend Musikkfabrikken to friends creating party songs

### Business Metrics

**Growth Targets (6 months):**
- 1,000 registered users acquired
- 200 paying customers (20% conversion rate from free to paid)
- $7,000+ Monthly Recurring Revenue
- 20% of new users acquired through social media sharing (organic viral growth)

**Unit Economics:**
- Positive contribution margin per paid user (95-97% gross margin achieved)
- Average Revenue Per User (ARPU): $35+ for paying customers
- Customer Lifetime Value (LTV) / Customer Acquisition Cost (CAC) ratio: >3:1

**Retention & Monetization:**
- 60%+ Day 7 retention rate
- Less than 5% monthly churn for paid customers
- 50%+ repeat credit purchase rate within 60 days
- 20% of paid users try premium features (canvas generation, mastering) within 90 days

**Market Position:**
- Recognized as THE solution for Norwegian AI music before international competitors enter
- Founder's 80k listener credibility translates to early adopter trust
- Data accumulation creates defensible moat (Norwegian phonetic preferences)

### Success Validation

The platform succeeds when:
1. **Quality Bar Met**: "Sounds genuinely Norwegian, not American-accented" - the irreplaceable core value
2. **Viral Proof**: Social sharing drives 20%+ of user acquisition without paid marketing
3. **Economic Proof**: Revenue covers infrastructure costs and validates sustainable business model
4. **Market Proof**: 40% month-over-month growth in paid users for 3 consecutive months

**Critical Success Factor:** Norwegian pronunciation quality is the ONLY irreplaceable value proposition. Everything else is secondary. If this fails, the product fails.

---

## Product Scope

### MVP - Minimum Viable Product

**What Must Work for Musikkfabrikken to Be Useful:**

**Core Value Delivery:**
1. **Norwegian Pronunciation Optimization** (MISSION-CRITICAL)
   - Proven prompt engineering techniques for Suno API optimized for Norwegian Bokmål
   - Continuous iteration based on test team feedback
   - Proactive monitoring of Suno model changes and quality degradation

2. **"Uttalelse Bokmål" Phonetic Toggle**
   - Automatic application of Norwegian pronunciation rules
   - Visual diff preview showing before/after lyrics
   - Per-line override capability for edge cases (place names, proper nouns, intentional English)
   - User-friendly disclaimer: "We don't guarantee perfect results but drastically improve Norwegian pronunciation"

**Essential User Flow:**
3. **User Authentication** - Google Auth for simple signup/login
4. **Genre/Style Prompt Templates** - Pre-configured prompts users can select/drag for common Norwegian genres
   - User-facing: Simple genre names ("Country Rock", "Norwegian Pop", "Folk Ballad", "Party Anthem")
   - Background: Advanced prompt engineering (e.g., "Country Rock" → "Country, rock, anthem, twangy guitar, catchy fiddle, drum, bass")
   - Lowers barrier for non-technical users who don't know how to describe musical styles
   - Norwegian-optimized prompts for authentic genre representation
5. **Free Tier (30-Second Preview)** - Demonstrates core Norwegian pronunciation value, low enough to deter spam
6. **Full Song Generation** - Integration with Suno API (via sunoapi.org wrapper) for complete song creation
7. **Session Persistence (Track List)** - Save all generated songs, prevents data loss during API failures

**Monetization Foundation:**
8. **Pre-Paid Credit System**
   - Stripe payment integration
   - Credit packages (Starter $15/Pro $45/Premium $99)
   - Credit deduction logic with atomic transactions and rollback on failure
   - Credit balance display and low-balance warnings

**Premium Services:**
9. **Canvas Generation** (Optional) - Google Video API integration for visual content, AI-generated canvas prompts
10. **Mastering Service Booking** - Manual 24-hour SLA mastering by founder, binding pre-payment

**Technical Foundation:**
11. **Core UX Flow** - Simple, intuitive interface for non-technical amateurs, complete song creation in under 30 minutes

**MVP Success Criteria:**
- 80% activation rate (users complete at least one full song within 7 days)
- 70% rate Norwegian pronunciation as "noticeably better than Suno alone"
- 10% free-to-paid conversion within 90 days
- <5% complaints related to service reliability

### Growth Features (Post-MVP)

**Phase 2 Enhancements** (After Product-Market Fit Validation):

**Payment & Localization:**
- Vipps payment integration (Norwegian-preferred payment method)
- Norwegian language UI (English acceptable for MVP given bilingual market)

**Quality & Reliability:**
- Test team with reference dataset for proactive Suno quality monitoring
- Enhanced character encoding sanitization (smart quotes, em-dashes, hidden formatting)
- Automatic pronunciation quality scoring

**Storage & User Experience:**
- Enhanced storage management with user notifications before 14-day auto-deletion
- Batch download capability for archiving multiple songs
- Optional paid storage extension for premium users

**Operational Scaling:**
- Backup mastering assistant for 24h SLA coverage during founder unavailability
- Enhanced canvas generation with AI-powered prompt recommendations
- Gallery of user-created canvases for inspiration

**Language Expansion:**
- Nynorsk dialect support (extend phonetic optimization to second Norwegian dialect)
- Dialect detection and automatic rule application

### Vision (Future)

**Long-term Strategic Expansion** (1-2+ Years):

**Nordic Language Platform:**
- Expand proven Norwegian model to Swedish and Danish markets
- Position as THE Nordic AI music optimization platform
- Leverage accumulated phonetic data across languages

**AI Music Creation Suite:**
- Beyond pronunciation: full creative suite for Nordic artists
- Lyric generation assistance with Norwegian cultural context
- Genre-specific optimization (Norwegian folk, pop, rap)
- Integration with music distribution platforms (Spotify, TuneCore)

**B2B Opportunities:**
- Licensing to Norwegian media companies for content creation
- White-label solutions for Nordic music education platforms
- API access for developers building Norwegian music applications

**Data-Driven Moat:**
- Accumulate largest dataset of Norwegian AI music preferences
- Machine learning models for pronunciation quality scoring
- Predictive quality gates before Suno generation
- Become acquisition target for Spotify or Nordic media companies

**Creator Community:**
- Build community of Norwegian AI music creators
- Showcases, competitions, collaborative features
- User-generated content becomes marketing engine
- Platform network effects strengthen retention

**Geographic Expansion:**
- Icelandic and Faroese markets (smaller but high cultural value)
- Other underserved language markets with similar AI music pronunciation challenges

---

## Functional Requirements

**Complete capability inventory for Musikkfabrikken - organized by user-facing capability areas.**

### User Account & Authentication

**FR1:** Users can create accounts using Google OAuth authentication
**FR2:** Users can log in securely and maintain sessions across devices
**FR3:** Users can view their account profile with credit balance and usage history
**FR4:** Users can log out from any device

### Song Creation & Lyrics Input

**FR5:** Users can input Norwegian lyrics for song generation (text entry)
**FR6:** Users can select genre/style from pre-configured prompt templates
**FR7:** Users can customize song metadata (title, artist name, description)
**FR8:** Users can preview their lyrics before submitting for generation

### Norwegian Pronunciation Optimization (CORE VALUE)

**FR9:** Users can toggle "Uttalelse Bokmål" pronunciation optimization on/off
**FR10:** Users can preview phonetic transformations with visual diff (before/after lyrics comparison)
**FR11:** Users can override phonetic suggestions on a per-line basis for edge cases (place names, proper nouns, intentional English words)
**FR12:** System automatically applies Norwegian pronunciation rules when phonetic toggle is enabled
**FR13:** Users can view explanations/disclaimers about pronunciation optimization limitations

### Song Generation & Processing

**FR14:** Users can generate 30-second preview clips for free (watermarked)
**FR15:** Users can generate full-length songs using credits
**FR16:** Users can view real-time generation status and progress
**FR17:** Users can cancel pending song generation requests
**FR18:** System automatically deducts credits upon successful generation
**FR19:** System automatically rolls back credits if generation fails
**FR20:** Users receive notifications when song generation completes

### Track List & Session Management

**FR21:** Users can view all their generated songs in a persistent track list
**FR22:** Users can play generated songs directly in the browser
**FR23:** Users can download generated songs in common audio formats (MP3, WAV)
**FR24:** Users can delete songs from their track list
**FR25:** Users can rename/re-title generated songs
**FR26:** System persists track list across sessions (survives browser refresh and API failures)
**FR27:** System automatically deletes songs after 14 days (with prior user notification)

### Credit System & Payments

**FR28:** Users can view their current credit balance at all times
**FR29:** Users can purchase credit packages via Stripe (Starter/Pro/Premium tiers)
**FR30:** Users receive low-balance warnings before credits run out
**FR31:** Users can view credit transaction history (purchases, deductions, refunds)
**FR32:** System displays credit cost for each action before execution
**FR33:** System prevents actions if insufficient credits available
**FR34:** Users can request refunds for failed generations within policy timeframe

### Premium Features - Canvas Generation

**FR35:** Users can optionally generate visual canvas/album art for their songs
**FR36:** Users can provide custom prompts for canvas generation
**FR37:** System automatically generates AI-powered canvas prompts based on song metadata
**FR38:** Users can preview and download generated canvas images
**FR39:** System deducts canvas generation credits separately from song credits

### Premium Features - Mastering Service

**FR40:** Users can book manual mastering service for generated songs
**FR41:** Users can view mastering service availability and SLA (24-hour turnaround)
**FR42:** System requires binding pre-payment for mastering service bookings
**FR43:** Users receive notifications when mastered tracks are ready
**FR44:** Users can download mastered versions alongside original versions
**FR45:** Users receive free mastering if SLA is missed (service guarantee)

### Storage & File Management

**FR46:** System automatically downloads and stores generated songs from Suno API (immediate transfer to prevent 3-day auto-deletion)
**FR47:** System provides signed URLs for secure file downloads (no public file access)
**FR48:** System notifies users before 14-day auto-deletion deadline
**FR49:** Premium tier users can access extended 30-day storage
**FR50:** Users can export/download multiple songs in batch

### User Experience & Help

**FR51:** Users can access genre/style prompt templates with drag-and-drop or selection
**FR52:** System displays helpful tooltips and guidance for non-technical users
**FR53:** Users can view examples of phonetic optimization in action
**FR54:** Users can access FAQ and help documentation
**FR55:** System displays clear error messages with actionable guidance when issues occur

### Social Sharing & Viral Features

**FR56:** Users can share generated songs directly to social media platforms (TikTok, Facebook)
**FR57:** Free preview clips include Musikkfabrikken watermark/branding
**FR58:** Users can generate shareable links for their songs
**FR59:** Shared songs display Musikkfabrikken attribution to drive organic discovery

### System Administration (Internal/Founder)

**FR60:** System logs all credit transactions for auditing and support
**FR61:** System monitors Suno API health and response times
**FR62:** System alerts founder when API costs exceed thresholds
**FR63:** System tracks pronunciation quality feedback from users
**FR64:** Founder can manually process mastering service requests
**FR65:** Founder can monitor test team feedback for quality degradation

### Error Handling & Resilience

**FR66:** System gracefully handles Suno API failures with user-friendly error messages
**FR67:** System implements automatic retry logic for transient API failures
**FR68:** System maintains session state during API downtime
**FR69:** System provides fallback mechanisms for webhook failures (polling)
**FR70:** System prevents double-charging on concurrent generation requests

---

**Total Functional Requirements: 70 capabilities**

**Coverage Validation:**
- ✓ Core pronunciation optimization (FR9-FR13)
- ✓ Complete user flow from signup to song download (FR1-FR27)
- ✓ Monetization system (FR28-FR34)
- ✓ Premium features (FR35-FR45)
- ✓ Genre templates feature (FR51)
- ✓ Storage management (FR46-FR50)
- ✓ Social sharing/viral growth (FR56-FR59)
- ✓ System resilience (FR66-FR70)
- ✓ UX accessibility (FR51-FR55)

---

## Non-Functional Requirements

### Performance

**User-Facing Performance:**
- **Page Load Time**: <2 seconds on 4G connection for all core pages
- **Time to First Song**: Users complete first full song generation in <30 minutes from signup
- **Audio Playback**: Instant playback start (<500ms) for previously generated songs
- **UI Responsiveness**: All user interactions respond within 200ms (button clicks, form inputs, navigation)

**API & Backend Performance:**
- **Song Generation Time**: Dependent on Suno API (typical 1-3 minutes) - display progress to user
- **Credit Transaction Processing**: <1 second for credit deduction/rollback operations (atomic)
- **Webhook Response Time**: <5 seconds to process Suno completion webhooks
- **File Download from Suno**: Immediate transfer to Supabase Storage (within 3-day Suno retention window)

**Database Performance:**
- **Query Response Time**: <500ms for track list retrieval and credit balance checks
- **Session Persistence**: Real-time sync across devices within 2 seconds

**Why This Matters:**
Performance directly impacts user activation rate (80% target). Slow load times or confusing delays kill amateur user engagement.

### Security

**Authentication & Access Control:**
- **OAuth Security**: Google OAuth 2.0 for authentication (industry-standard)
- **Session Management**: Secure session tokens with automatic expiration and refresh
- **API Key Protection**: All third-party API keys stored in environment variables, never exposed to client
- **File Access**: Signed URLs with expiration for secure song downloads (no public file access)

**Payment Security:**
- **PCI Compliance**: Stripe handles all payment processing (PCI DSS compliant)
- **Credit Transaction Integrity**: Atomic transactions with rollback on failure prevent double-charging
- **Webhook Verification**: Stripe webhook signature verification prevents fraudulent credit additions

**Data Protection:**
- **HTTPS Everywhere**: TLS encryption for all connections (client-to-server, server-to-APIs)
- **Input Sanitization**: All user-provided lyrics sanitized to prevent injection attacks
- **GDPR Compliance**: User data handling complies with EU/Norwegian privacy regulations
- **Data Retention**: 14-day auto-deletion policy limits data exposure

**API Security:**
- **Rate Limiting**: API endpoints rate-limited to prevent abuse and cost spikes
- **Cost Circuit Breakers**: Automatic alerts if API costs exceed daily thresholds
- **Error Message Safety**: Error messages don't expose system internals or API keys

**Why This Matters:**
Handling payments and user-generated content requires strong security. GDPR compliance is mandatory for Norwegian market.

### Scalability

**Traffic Scalability:**
- **Serverless Architecture**: Vercel serverless functions automatically scale with traffic spikes
- **Database Scaling**: Supabase connection pooling handles concurrent users
- **CDN Delivery**: Static assets served via built-in Vercel CDN for global performance

**Cost Scalability:**
- **Pre-Paid Credit Model**: Revenue collected upfront creates financial buffer for API costs
- **14-Day Storage Policy**: Automatic file deletion prevents unbounded storage costs
- **Monitoring & Alerts**: Daily API cost monitoring prevents runaway expenses

**Operational Scalability:**
- **Manual Mastering**: Scales to ~10-20 requests/week (founder capacity limit)
- **Post-MVP**: Backup assistant added when mastering demand exceeds founder availability

**Growth Targets:**
- **MVP Scale**: 1,000 users, 200 paying customers (achievable with current architecture)
- **Phase 2 Scale**: 5,000 users, 1,000 paying customers (may require Supabase tier upgrade)
- **Long-Term Scale**: 10,000+ users (evaluate infrastructure costs and optimization)

**Why This Matters:**
Bootstrap model requires controlled growth. Viral spikes could create cost exposure if not managed carefully.

### Accessibility

**WCAG 2.1 AA Compliance (Target):**
- **Keyboard Navigation**: All core flows navigable without mouse
- **Screen Reader Compatibility**: Semantic HTML and ARIA labels for assistive technologies
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text readability
- **Focus Indicators**: Clear visual focus states for interactive elements

**Usability for Non-Technical Users:**
- **Simple Language**: No technical jargon in UI (Norwegian or English)
- **Helpful Tooltips**: Context-sensitive help for complex features (phonetic toggle, credit system)
- **Error Recovery**: Clear error messages with actionable next steps
- **Progressive Disclosure**: Advanced features hidden behind simple defaults

**Mobile Accessibility:**
- **Touch Targets**: Minimum 44×44px touch targets for mobile interactions
- **Responsive Design**: Optimized layouts for smartphones (primary sharing device)
- **Offline Resilience**: Graceful degradation when connectivity is poor

**Why This Matters:**
Target users are amateurs (not developers). If the UI is confusing, activation fails and the product fails.

### Integration Requirements

**Third-Party API Dependencies:**

**Suno API (via sunoapi.org wrapper):**
- **Availability**: 99.9% uptime guarantee from provider
- **Response Time**: Typical 1-3 minutes for full song generation
- **Rate Limits**: Monitor provider quotas and implement queueing if needed
- **Version Support**: Compatible with Suno models V3.5, V4, V4.5, V5
- **Webhook Support**: Async completion notifications (fallback to polling if webhooks fail)
- **File Retention**: 3-day auto-deletion by provider (immediate download required)
- **Cost**: $0.06 per song (12 credits × $0.005/credit) - subject to provider pricing changes

**OpenAI GPT-4:**
- **Purpose**: Lyrics processing, phonetic enhancement suggestions
- **Response Time**: <5 seconds for lyric transformations
- **Cost**: ~$0.03 per request
- **Fallback**: Graceful degradation if API unavailable (basic phonetic rules only)

**Google Gemini:**
- **Purpose**: Canvas generation prompt creation
- **Response Time**: <3 seconds for prompt generation
- **Cost**: Minimal (<$0.01 per request)

**Google Video API:**
- **Purpose**: Visual canvas/album art generation
- **Response Time**: 10-30 seconds for image generation
- **Cost**: ~$0.50-0.55 per generation
- **Failure Handling**: Optional feature - clear error message if unavailable

**Stripe:**
- **Purpose**: Payment processing for credit packages
- **Integration**: Stripe Checkout for payment flow
- **Webhooks**: Payment confirmation and refund processing
- **Security**: PCI DSS compliant (Stripe handles all card data)

**Supabase:**
- **Database**: PostgreSQL for user accounts, credits, song metadata
- **Authentication**: Google OAuth integration
- **Storage**: Audio files and canvas images (14-day retention)
- **Real-time** (optional): Live updates for concurrent sessions

**Integration Resilience:**
- **Retry Logic**: Automatic retries for transient failures (exponential backoff)
- **Circuit Breakers**: Disable features temporarily if APIs consistently fail
- **User Communication**: Clear status messages during API issues
- **Pre-Paid Buffer**: Credit system provides financial cushion during extended outages

**Why This Matters:**
Entire product depends on third-party APIs. Resilience and cost monitoring are critical for sustainability.

---

_This PRD captures the essence of **Musikkfabrikken**: Making authentic Norwegian AI music accessible to everyone through proven phonetic optimization, empowering Norwegian creators to share their stories through song._

**The Core Promise:** Transform "American-sounding" AI music into genuinely Norwegian vocals that creators are proud to share at life's important moments.

_Created through collaborative discovery between BIP and John (PM Agent)._
_Based on comprehensive product brief: `docs/product-brief-norskmusikk.md`_

---

**Document Status:** Complete
**Next Recommended Steps:**
1. UX Design workflow (`/bmad:bmm:workflows:create-ux-design`) - Design user experience and interactions
2. Architecture workflow (`/bmad:bmm:workflows:architecture`) - Define technical decisions and system design
3. Epic Breakdown workflow (`/bmad:bmm:workflows:create-epics-and-stories`) - Break down into implementable stories (best done after UX and Architecture)
