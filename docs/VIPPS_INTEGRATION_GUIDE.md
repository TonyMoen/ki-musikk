# Vipps Integration Guide

## Current Status

**Date:** January 2026
**Status:** Vipps application pending approval

The codebase is fully prepared for Vipps integration. Once the application is approved, follow this guide to complete the setup.

---

## What's Been Implemented

### Payment (Vipps ePayment)
- ✅ Vipps API client with token management (`src/lib/vipps/client.ts`)
- ✅ TypeScript types for Vipps API (`src/lib/vipps/types.ts`)
- ✅ Webhook signature verification (`src/lib/vipps/webhook.ts`)
- ✅ Purchase API route (`src/app/api/credits/purchase/route.ts`)
- ✅ Payment callback handler (`src/app/api/vipps/callback/route.ts`)
- ✅ Webhook handler (`src/app/api/webhooks/vipps/route.ts`)
- ✅ Database migration for `vipps_payment` table
- ✅ Updated UI with NOK pricing and Vipps branding

### Login (Vipps Login)
- ✅ OAuth initiation route (`src/app/api/auth/vipps/route.ts`)
- ✅ OAuth callback handler (`src/app/api/auth/vipps/callback/route.ts`)
- ✅ Vipps logo component (`src/components/vipps-logo.tsx`)
- ✅ Login page with Vipps button (primary)
- ✅ Login modal with Vipps option

### Legal Compliance
- ✅ Terms page follows Forbrukertilsynet standard format
- ✅ Contact page has company info (Moen Studio, org.nr 931 659 685)
- ✅ Privacy policy updated for Vipps
- ✅ 14-day angrerett (right of withdrawal) documented
- ✅ Links to Forbrukertilsynet and EU ODR portal

---

## Setup After Approval

### Step 1: Get Credentials from Vipps Portal

Log in to [Vipps Portal](https://portal.vipps.no) and get:

**For ePayment:**
- Client ID
- Client Secret
- Subscription Key (Ocp-Apim-Subscription-Key)
- Merchant Serial Number (MSN)

**For Vipps Login:**
- Login Client ID
- Login Client Secret

**For Webhooks:**
- Generate a webhook secret (you create this yourself)

### Step 2: Add Environment Variables in Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables

Add these variables for **Production**:

```env
# Vipps ePayment API
VIPPS_CLIENT_ID=your_client_id
VIPPS_CLIENT_SECRET=your_client_secret
VIPPS_SUBSCRIPTION_KEY=your_subscription_key
VIPPS_MSN=your_merchant_serial_number
VIPPS_WEBHOOK_SECRET=your_webhook_secret
VIPPS_API_URL=https://api.vipps.no

# Vipps Login API
VIPPS_LOGIN_CLIENT_ID=your_login_client_id
VIPPS_LOGIN_CLIENT_SECRET=your_login_client_secret
```

For **testing**, use the test environment:
```env
VIPPS_API_URL=https://apitest.vipps.no
```

### Step 3: Run Database Migration

In Supabase SQL Editor, run:

```sql
-- File: supabase/migrations/20260121_create_vipps_payment_table.sql

CREATE TABLE IF NOT EXISTS vipps_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_ore INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vipps_payment_reference ON vipps_payment(reference);
CREATE INDEX IF NOT EXISTS idx_vipps_payment_user_id ON vipps_payment(user_id);

ALTER TABLE vipps_payment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON vipps_payment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON vipps_payment
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE OR REPLACE FUNCTION update_vipps_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vipps_payment_updated_at
  BEFORE UPDATE ON vipps_payment
  FOR EACH ROW
  EXECUTE FUNCTION update_vipps_payment_updated_at();
```

### Step 4: Configure Vipps Webhooks

In Vipps Portal, set up webhook URL:
```
https://www.kimusikk.no/api/webhooks/vipps
```

### Step 5: Configure Vipps Login Redirect URIs

In Vipps Portal, add authorized redirect URI:
```
https://www.kimusikk.no/api/auth/vipps/callback
```

### Step 6: Redeploy

After adding environment variables:
```bash
vercel --prod
```

---

## Testing Checklist

### Payment Flow
- [ ] Click "Kjøp kreditter" → Select package → Redirect to Vipps
- [ ] Complete payment in Vipps test app
- [ ] Verify redirect back to `/settings?payment=success`
- [ ] Check credits added to account
- [ ] Verify `vipps_payment` table has record with status='completed'
- [ ] Test cancelled payment flow
- [ ] Test expired payment flow

### Login Flow
- [ ] Click "Logg inn med Vipps" → Redirect to Vipps
- [ ] Approve login in Vipps
- [ ] Verify user created/logged in
- [ ] Check `user_profile` has welcome bonus (new users)
- [ ] Test existing user login (should link accounts)

### Existing Functionality
- [ ] Google login still works
- [ ] Song generation works
- [ ] Download restriction still enforces purchase requirement
- [ ] Credit deduction works correctly

---

## Pricing Summary

| Package | Price (NOK) | Credits | Songs |
|---------|-------------|---------|-------|
| Starter | 79 kr | 500 | ~50 |
| Pro | 149 kr | 1000 | ~100 |
| Refill | 199 kr | 1000 | ~100 |

---

## File Structure

```
src/
├── lib/
│   └── vipps/
│       ├── client.ts      # API client with auth
│       ├── types.ts       # TypeScript interfaces
│       └── webhook.ts     # Signature verification
├── app/
│   └── api/
│       ├── auth/
│       │   └── vipps/
│       │       ├── route.ts          # OAuth start
│       │       └── callback/route.ts # OAuth callback
│       ├── credits/
│       │   └── purchase/route.ts     # Create payment
│       ├── vipps/
│       │   └── callback/route.ts     # Payment callback
│       └── webhooks/
│           └── vipps/route.ts        # Payment webhooks
└── components/
    └── vipps-logo.tsx
```

---

## Troubleshooting

### "Missing Vipps environment variables"
- Check all env vars are set in Vercel
- Redeploy after adding variables

### Payment not completing
- Check webhook is receiving events (Vercel logs)
- Verify webhook secret matches
- Check `vipps_payment` table for status

### Login fails with "invalid_state"
- Cookie might have expired (10 min limit)
- Try again from the beginning

### Credits not added after payment
- Check `credit_transaction` table for duplicates
- Verify `add_credits` RPC function exists
- Check Supabase service role key is correct

---

## Contact

- **Company:** Moen Studio
- **Email:** groftefyllband@gmail.com
- **Org.nr:** 931 659 685

---

## Next Session Ideas

1. **Test with Vipps Test Environment** - Once approved, test full flows
2. **Add Vipps recurring payments** - For subscription model
3. **Analytics dashboard** - Track purchases and usage
4. **Email notifications** - Send receipt after purchase
5. **Admin panel** - View payments and user management
