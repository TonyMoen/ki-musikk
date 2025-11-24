# Suno Webhook Setup Guide

**Status:** ⏸️ Pending Vercel Deployment
**Story:** 3.7 - Implement Webhook Handler for Suno Completion
**Created:** 2025-11-24

---

## ✅ What's Already Done

- [x] Webhook endpoint created: `/src/app/api/webhooks/suno/route.ts`
- [x] HMAC-SHA256 signature verification implemented
- [x] Idempotency handling (duplicate webhook prevention)
- [x] Audio download from Suno with 30-second timeout
- [x] Supabase Storage upload with service role key
- [x] Database updates (status='completed', audio_url, duration)
- [x] Comprehensive error handling with Norwegian messages
- [x] Structured logging for monitoring
- [x] Webhook URL automatically passed in song generation (line 263 in `/src/app/api/songs/generate/route.ts`)
- [x] Debug mode for testing without signature verification

---

## ⏳ What's Needed After Vercel Deployment

### 1. Environment Variables (Vercel Dashboard)

Navigate to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```bash
# Production App URL (automatically set by Vercel, but verify)
NEXT_PUBLIC_APP_URL=https://musikkfabrikken.no

# Suno Webhook Secret (get from Suno dashboard)
SUNO_WEBHOOK_SECRET=<get-from-suno-dashboard>

# Optional: Enable debug mode for initial testing (remove after testing)
# SKIP_WEBHOOK_SIGNATURE=true
```

**Important:** After adding variables, **redeploy** the application for changes to take effect.

---

### 2. Get Webhook Secret from Suno

**Steps:**

1. Log in to https://sunoapi.org/dashboard (or your Suno API provider)
2. Navigate to:
   - "Webhooks" section, OR
   - "API Keys" section, OR
   - "Settings" → "Webhook Configuration"
3. Look for:
   - "Webhook Secret"
   - "Signing Secret"
   - "HMAC Secret"
4. Copy the secret value
5. Add to Vercel environment variables as `SUNO_WEBHOOK_SECRET`

**If Suno doesn't provide webhook secrets:**
- Keep `SKIP_WEBHOOK_SIGNATURE=true` in environment variables
- The code handles this gracefully (logs a warning but processes webhooks)

---

### 3. Register Webhook URL with Suno

**Option A: Automatic (Recommended) ✅**

Already implemented! The webhook URL is automatically sent with each song generation request:

```typescript
// This is already in your code (line 263)
callBackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/suno`
```

When deployed, Suno receives: `https://musikkfabrikken.no/api/webhooks/suno`

**Option B: Manual Registration (If Suno Requires)**

If Suno has a dashboard setting for webhooks:

1. Go to Suno dashboard
2. Find "Webhook URL" or "Callback URL" setting
3. Enter: `https://musikkfabrikken.no/api/webhooks/suno`
4. Select events to receive (usually "Song Generation Completed")
5. Save settings

---

### 4. Initial Testing (After Deployment)

#### Step 1: Test Song Generation

1. Deploy to Vercel
2. Log in to your app at `https://musikkfabrikken.no`
3. Generate a test song through the UI
4. Note the song ID from the response

#### Step 2: Monitor Vercel Logs

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# View logs in real-time
vercel logs --follow
```

Or use Vercel Dashboard: **Your Project → Deployments → [Latest] → Logs**

#### Step 3: Look for Webhook Logs

Within 1-3 minutes, you should see:

```
✅ Good signs:
- "Webhook received" with full headers and payload
- "✅ Signature verified successfully" (if signature is enabled)
- "Audio download complete" with file size and timing
- "Storage upload complete" with signed URL
- "Webhook processing complete" with total time (<10 seconds is good)

❌ Errors to watch for:
- "SUNO_WEBHOOK_SECRET not configured"
- "Webhook signature verification failed"
- "Audio download failed"
- "Storage upload failed"
- "Song not found by task ID"
```

#### Step 4: Verify Song Completion

Check in your app:
- Song status should change to "completed"
- Audio should be playable
- Duration should be set correctly

---

### 5. Signature Verification Adjustment (If Needed)

If you see in logs:

```json
{
  "allHeaders": {
    "suno-webhook-signature": "sha256=abc123",  ← Different header name!
    ...
  }
}
```

**Update the code:**

```typescript
// File: src/app/api/webhooks/suno/route.ts
// Line ~188

// Change from:
const signature = headersList.get('x-suno-signature')

// To whatever Suno uses (check logs):
const signature = headersList.get('suno-webhook-signature')
```

Then commit and redeploy.

---

### 6. Payload Format Adjustment (If Needed)

If webhook processing fails with "Invalid payload", check logs for `bodyPreview`.

**Expected format:**

```typescript
interface SunoWebhookPayload {
  taskId: string
  status: 'SUCCESS' | 'GENERATE_AUDIO_FAILED'
  response?: {
    sunoData?: Array<{
      id: string
      audioUrl: string
      duration: number
      title: string
      tags: string
    }>
  }
  errorMessage?: string
}
```

**If Suno uses different field names:**

Update the interface in `/src/app/api/webhooks/suno/route.ts` (lines 16-28) to match.

Example adjustments:

```typescript
// If Suno uses "url" instead of "audioUrl":
const { url: audioUrl, duration } = sunoData

// If Suno uses "length" instead of "duration":
const { audioUrl, length: duration } = sunoData
```

---

### 7. Production Hardening (After Testing)

Once webhooks work correctly:

#### Remove Debug Mode

```bash
# In Vercel Environment Variables, DELETE:
SKIP_WEBHOOK_SIGNATURE

# Or set to false:
SKIP_WEBHOOK_SIGNATURE=false
```

#### Remove Debug Logging (Optional)

In `/src/app/api/webhooks/suno/route.ts`, remove or comment out:

```typescript
// Lines ~190-194 (debug logging)
// const allHeaders: Record<string, string> = {}
// headersList.forEach((value, key) => {
//   allHeaders[key] = value
// })

// Lines ~196-201 (debug in logInfo)
// allHeaders,
// bodyPreview: body.substring(0, 200),
```

This reduces log verbosity in production.

#### Monitor Performance

Check Vercel logs for:
- Average processing time (should be <10 seconds)
- Any error patterns
- Signature verification success rate

---

## 🔍 Troubleshooting Guide

### Problem: Webhook Never Arrives

**Possible Causes:**
1. Vercel deployment not complete
2. `NEXT_PUBLIC_APP_URL` incorrect
3. Suno webhook not registered
4. Firewall blocking Suno's IPs

**Diagnosis:**
- Check Vercel logs: `vercel logs`
- Check Suno dashboard for webhook delivery logs
- Verify `NEXT_PUBLIC_APP_URL` is set correctly

**Fallback:**
- Polling mechanism (Story 3.6) will handle this
- Song will complete within 1-3 minutes via polling

---

### Problem: 401 Unauthorized (Signature Failed)

**Possible Causes:**
1. Wrong `SUNO_WEBHOOK_SECRET`
2. Different signature header name
3. Signature algorithm mismatch

**Diagnosis:**
- Check logs for `allHeaders` to see signature header name
- Verify secret in Vercel matches Suno dashboard
- Enable debug mode temporarily: `SKIP_WEBHOOK_SIGNATURE=true`

**Solution:**
1. Get correct secret from Suno
2. Update header name in code if needed
3. Redeploy

---

### Problem: Song Marked as 'failed'

**Possible Causes:**
1. Audio download failed (Suno URL expired or invalid)
2. Supabase Storage upload failed (bucket doesn't exist)
3. Database update failed (song not found)

**Diagnosis:**
Check logs for specific error:
- "Audio download failed" → Suno issue
- "Storage upload failed" → Supabase issue
- "Song not found by task ID" → Database sync issue

**Solution:**
- Verify Supabase Storage bucket `songs` exists
- Check Supabase service role key is correct
- Verify song was created with correct `suno_song_id`

---

### Problem: Download Timeout (>30 seconds)

**Possible Causes:**
1. Large file size (>5MB)
2. Slow Suno servers
3. Network issues

**Solution:**
Increase timeout in code:

```typescript
// src/app/api/webhooks/suno/route.ts
// Line ~91
const timeoutId = setTimeout(() => controller.abort(), 30000)
// Change to:
const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 seconds
```

---

## 📊 Monitoring Dashboard (Recommended)

### Key Metrics to Track

1. **Webhook Success Rate**
   - Target: >95% success
   - Formula: Successful webhooks / Total webhooks

2. **Processing Time**
   - Target: <10 seconds average
   - Components: Download time + Upload time + DB update

3. **Signature Verification**
   - Track failures (potential security issues)
   - Alert if >5% failure rate

4. **Idempotency Triggers**
   - Count duplicate webhook deliveries
   - Normal: <10% of webhooks

### Setup Monitoring (Optional)

**Option 1: Vercel Analytics**
- Already included with Vercel Pro
- View in Vercel Dashboard → Analytics

**Option 2: Custom Logging**
- Export logs to external service (Datadog, Logtail, etc.)
- Set up alerts for high error rates

**Option 3: Supabase Edge Functions**
- Create dashboard in Supabase
- Query logs from `credit_transaction` and `song` tables

---

## 🎯 Success Checklist

Before considering webhook setup complete:

- [ ] Vercel deployment successful
- [ ] Environment variables set (`NEXT_PUBLIC_APP_URL`, `SUNO_WEBHOOK_SECRET`)
- [ ] Test song generated successfully
- [ ] Webhook received within 3 minutes
- [ ] Signature verification passes (or debug mode enabled)
- [ ] Audio downloaded from Suno successfully
- [ ] Audio uploaded to Supabase Storage
- [ ] Signed URL generated (24-hour expiration)
- [ ] Song record updated: status='completed', audio_url, duration
- [ ] Song playable in UI
- [ ] Processing time <10 seconds
- [ ] No errors in Vercel logs
- [ ] Idempotency works (test duplicate webhook)
- [ ] Debug mode disabled (production only)
- [ ] Monitoring in place

---

## 📚 Related Documentation

- **Implementation:** `/src/app/api/webhooks/suno/route.ts`
- **Song Generation:** `/src/app/api/songs/generate/route.ts` (line 263)
- **Story Details:** `/docs/sprint-artifacts/3-7-implement-webhook-handler-for-suno-completion.md`
- **Architecture:** `/docs/architecture.md` - ADR-007 (Async Song Generation)
- **Suno API Docs:** https://sunoapi.org/docs (check for webhook specifics)

---

## 🔄 Future Improvements (Post-MVP)

1. **Webhook Retry Logic**
   - If webhook fails, retry 3 times with exponential backoff
   - Current: Relies on polling fallback

2. **Webhook Queue**
   - Process webhooks asynchronously via queue (Bull, BullMQ)
   - Current: Processes synchronously (blocking)

3. **Multiple Audio Versions**
   - Suno may return multiple versions per generation
   - Current: Only processes first version

4. **Enhanced Monitoring**
   - Real-time dashboard for webhook health
   - Slack/Discord alerts for failures

5. **Webhook Replay**
   - Admin UI to replay failed webhooks
   - Current: Manual intervention required

---

## ✅ Next Steps (When Ready)

1. Complete Vercel deployment (Story 1.5 or later epic)
2. Return to this guide
3. Follow steps 1-7 above
4. Test thoroughly
5. Monitor for 24-48 hours
6. Disable debug mode if stable

---

**Last Updated:** 2025-11-24
**Status:** Ready for deployment testing
**Contact:** Refer to Story 3.7 completion notes for implementation details
