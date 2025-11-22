# Epic 6: Premium Features

**Goal:** Provide premium enhancements (canvas generation, mastering service, extended storage) that create additional revenue streams.

**User Value:** Users can enhance their songs with professional visuals and mastering, differentiate from basic offerings.

**FRs Covered:** FR35-FR39 (Canvas), FR40-FR45 (Mastering), FR49 (Extended Storage)

---

### Story 6.1: Implement Canvas Generation with Google Video API

As a **user**,
I want to generate AI-powered visual canvas/album art for my song,
So that I have professional-looking artwork for social sharing.

**Acceptance Criteria:**

**Given** I have a completed song
**When** I tap "Generate Canvas" button (in song player modal)
**Then** I see canvas generation options:
  - Auto-generate: AI creates canvas based on song metadata (genre, title, mood)
  - Custom prompt: I can enter my own description (e.g., "Fishing boat on Norwegian fjord at sunset")
**And** Canvas generation costs 5 credits (displayed before generation)
**When** I confirm canvas generation
**Then** 5 credits are deducted atomically
**And** Google Video API generates canvas image (1024x1024px)
**And** Canvas appears in song player within 30 seconds
**And** I can download canvas as PNG
**And** Canvas is automatically used as song artwork in library

**Prerequisites:** Story 3.8 (Song Player), Story 2.6 (Credit system)

**Technical Notes:**
- Create API route: POST `/api/canvas/generate` with `songId`, `prompt` (optional)
- Use Google Gemini to generate creative visual prompt from song metadata
- Call Google Video API (or Imagen) to generate image
- Store canvas in Supabase Storage bucket `canvases`
- Update song record: `canvas_url = {signed URL}`
- Cost: ~$0.50 per generation (5 credits = acceptable markup)
- Environment variable: GOOGLE_AI_API_KEY

---

### Story 6.2: Implement Canvas Preview and Download

As a **user**,
I want to preview and download my generated canvas,
So that I can use it as album art or social media imagery.

**Acceptance Criteria:**

**Given** I have generated a canvas for my song
**When** I view the song in the player modal
**Then** Canvas image is displayed as song artwork (replaces default gradient)
**And** I can tap canvas to view full-size preview
**And** Preview modal shows canvas in high resolution (1024x1024px)
**And** I see "Download Canvas" button
**When** I download canvas
**Then** PNG file downloads: "{song-title}-canvas.png"
**And** I can regenerate canvas if I don't like the result (costs 5 more credits)

**Prerequisites:** Story 6.1

**Technical Notes:**
- Display canvas in song player card: Replace gradient with canvas_url
- Full-size preview: Modal with 1024x1024px image
- Download: Signed URL from Supabase Storage
- Regeneration: Same API endpoint, creates new canvas, replaces old one
- Old canvas: Keep for 14 days, then delete (same retention policy as songs)

---

### Story 6.3: Create Mastering Service Booking Flow

As a **user**,
I want to book manual mastering service for my song,
So that I can get professional-quality audio in 24 hours.

**Acceptance Criteria:**

**Given** I have a completed song
**When** I tap "Book Mastering" button (in song player modal)
**Then** I see mastering service details:
  - Price: 20 credits ($10 equivalent)
  - SLA: 24-hour turnaround
  - Description: "Professional mastering by founder (80k monthly listeners)"
  - Guarantee: "Free if we miss the 24h deadline"
**And** When I confirm booking
**Then** 20 credits are deducted (binding pre-payment)
**And** Mastering request is created in `mastering_request` table with status='pending'
**And** Founder receives email notification with song details and audio file link
**And** I see confirmation: "✓ Mastering booked! You'll receive notification when ready."

**Prerequisites:** Story 2.6 (Credit system), Story 3.8 (Song Player)

**Technical Notes:**
- Create API route: POST `/api/mastering/book` with `songId`
- Deduct 20 credits atomically before creating request
- Insert `mastering_request`: user_id, song_id, status='pending', requested_at
- Send email to founder: Include song metadata, audio download link, deadline (24h)
- Email service: Use Resend or Supabase Auth email
- Handle edge case: If founder declines, refund credits

---

### Story 6.4: Implement Mastering Completion and Delivery

As a **founder**,
I want to upload mastered audio and notify the user,
So that users receive their professionally mastered songs.

**Acceptance Criteria:**

**Given** I (founder) have completed mastering for a song
**When** I access the admin mastering dashboard
**Then** I see list of pending mastering requests with: User, Song, Requested date, Time remaining
**And** I can upload mastered audio file (MP3/WAV) for each request
**And** When I mark request as 'completed'
**Then** Mastered audio is stored in Supabase Storage
**And** User is notified via email: "Your mastered song is ready!"
**And** User sees "Mastered Version Available" badge in song player
**And** User can download both original and mastered versions

**Prerequisites:** Story 6.3

**Technical Notes:**
- Create admin dashboard: `/src/app/admin/mastering/page.tsx` (protected route)
- Upload mastered file: Store in Supabase Storage, separate from original
- Update `mastering_request`: status='completed', mastered_audio_url, completed_at
- Send user email notification with download link
- Display mastered badge in song player UI
- Track SLA: If completed_at > requested_at + 24h, mark as "SLA Missed" and auto-refund

---

### Story 6.5: Implement SLA Miss Auto-Refund

As a **user**,
I want automatic refund if mastering SLA is missed,
So that I'm not charged for late delivery.

**Acceptance Criteria:**

**Given** I have booked mastering service
**When** 24 hours pass without completion
**Then** Mastering request is automatically marked as "SLA Missed"
**And** My 20 credits are refunded automatically
**And** I receive email notification: "Sorry we missed the deadline! Credits refunded. Your song is still being mastered for free."
**And** When mastering is completed (late), I still receive mastered version
**And** Founder receives alert about SLA miss

**Prerequisites:** Story 6.4

**Technical Notes:**
- Background job (Vercel Cron): Run every hour
- Query `mastering_request` WHERE status='pending' AND requested_at < NOW() - INTERVAL '24 hours'
- For each late request: Refund 20 credits, update status='sla_missed'
- Create credit transaction: type='refund', description='Mastering SLA missed'
- Send user email: Apology + refund confirmation
- Send founder alert: Email or Slack notification of SLA miss

---

### Story 6.6: Implement Extended Storage for Premium Users

As a **user with Premium tier credits**,
I want access to 30-day storage instead of 14 days,
So that my songs are available longer before auto-deletion.

**Acceptance Criteria:**

**Given** I have purchased the Premium credit package ($99)
**When** My account is flagged as Premium tier
**Then** My songs are retained for 30 days instead of 14 days
**And** I see "Premium: 30-day storage" badge on Settings page
**And** My songs show deletion warning at 28 days (2 days before expiration)
**And** Premium status persists until I run out of credits
**And** When I purchase Premium again, status is restored

**Prerequisites:** Story 4.6 (14-day deletion), Story 2.3 (Credit purchase)

**Technical Notes:**
- Add `tier` column to `user_profile`: 'free', 'starter', 'pro', 'premium'
- Set tier based on most recent credit package purchased
- Modify deletion logic: If tier='premium', delete at 30 days, else 14 days
- Update warning logic: Show warning at 28 days for premium, 12 days for others
- Tier expires when credit balance reaches 0 (or after 6 months of inactivity)

---

---
