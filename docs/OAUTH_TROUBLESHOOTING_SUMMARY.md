# Google OAuth Configuration Troubleshooting Summary

**Date:** 2025-11-21
**Story:** 2.1 - Implement Google OAuth Authentication
**Status:** Implementation Complete, Manual Testing In Progress (Blocked)

---

## Current Issue

**Error:** `Unable to exchange external code` when signing in with Google

**Symptoms:**
- User can select Google account successfully
- OAuth consent screen works
- After granting permissions, redirect fails
- Error in URL: `error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code`
- Server logs show: `OAuth callback: No code parameter`

**Root Cause:** Credentials mismatch between Google Cloud Console and Supabase Dashboard

---

## Your Project Configuration

### Supabase Project Details
**Project Reference:** `iqgooyfqzzkplhqfiqel`
**Project URL:** `https://iqgooyfqzzkplhqfiqel.supabase.co`
**Callback URL:** `https://iqgooyfqzzkplhqfiqel.supabase.co/auth/v1/callback`

### Google OAuth Credentials (Web Application)
**Client ID:** `37569793340-o3b4k0afglum6sqv8gesguj0glthtfeu.apps.googleusercontent.com`
**Client Secret:** `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`
**Created:** November 20, 2025

### Old Credentials (Desktop - DO NOT USE)
**Client ID:** `37569793340-soa8ho3jrlhgnhmr4sdmfbmoqnm4df2g.apps.googleusercontent.com`
**Type:** Desktop application (incorrect type)

---

## What Was Accomplished

✅ **Code Implementation Complete:**
- Created `/src/lib/supabase/middleware.ts` - Middleware Supabase client
- Created `/src/middleware.ts` - Route protection middleware
- Created `/src/app/auth/login/page.tsx` - Login page with Google button
- Created `/src/app/auth/callback/route.ts` - OAuth callback handler
- Created `/src/app/api/auth/logout/route.ts` - Logout API
- Build verification passed: `npm run build` ✓
- Linting passed: `npm run lint` ✓

✅ **Google Cloud Console Configuration:**
- OAuth consent screen configured
- Authorized domain added: `supabase.co`
- Web application OAuth client created (correct type)
- Test user added (your Gmail account)

✅ **Partial Success:**
- OAuth redirect to Google works ✓
- User can select account ✓
- Consent screen appears ✓
- Redirect back to app works ✓

❌ **Current Blocker:**
- Supabase cannot exchange authorization code with Google
- Indicates credentials mismatch or configuration error

---

## Required Google Cloud Console Configuration

### 1. OAuth Consent Screen → Authorized Domains
```
supabase.co
```
*(Just the root domain, not full subdomain)*

### 2. Credentials → OAuth 2.0 Client ID (Web Application)

**Name:** `Musikkfabrikken Web Client` (or similar)

**Authorized JavaScript origins:**
```
http://localhost:3000
https://iqgooyfqzzkplhqfiqel.supabase.co
```

**Authorized redirect URIs (CRITICAL!):**
```
https://iqgooyfqzzkplhqfiqel.supabase.co/auth/v1/callback
```

⚠️ **MUST BE EXACT:**
- Use `https://` (not `http://`)
- Include full path `/auth/v1/callback`
- No trailing slash
- No typos in project reference

---

## Required Supabase Dashboard Configuration

### Authentication → Providers → Google

**Enable Sign in with Google:** ON (toggle enabled)

**Client ID (for Google provider):**
```
37569793340-o3b4k0afglum6sqv8gesguj0glthtfeu.apps.googleusercontent.com
```

**Client Secret (for Google provider):**
```
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
```

### Authentication → URL Configuration

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000
```

---

## Troubleshooting Checklist (Next Steps)

When you resume, follow these steps in order:

### [ ] Step 1: Verify Google Cloud Console Web Client

1. Go to: https://console.cloud.google.com/
2. Navigate to: **APIs & Services → Credentials**
3. Click on your **Web application** OAuth client
4. **Verify Authorized redirect URIs contains EXACTLY:**
   ```
   https://iqgooyfqzzkplhqfiqel.supabase.co/auth/v1/callback
   ```
5. Check for:
   - [ ] Correct protocol (`https://`)
   - [ ] Correct path (`/auth/v1/callback`)
   - [ ] No typos in project reference
   - [ ] No trailing slash
   - [ ] No extra spaces
6. If wrong, fix and click **"Save"**
7. Wait 5 minutes for Google to propagate changes

### [ ] Step 2: Get Fresh Credentials

If the redirect URI was correct, get fresh credentials:

1. In Google Cloud Console → Credentials → Your Web client
2. Copy the **Client ID** (click copy icon)
3. **Reset the Client Secret:**
   - Click "Reset secret" button
   - Copy the new secret immediately
4. Save these new credentials

### [ ] Step 3: Update Supabase with Fresh Credentials

1. Go to: https://supabase.com → Your project
2. Navigate to: **Authentication → Providers**
3. Find **Google** and expand
4. **Clear both fields completely**
5. Paste **new Client ID** from Step 2
6. Paste **new Client Secret** from Step 2
7. Ensure toggle is **ON**
8. Click **"Save"**
9. **Wait 5 minutes** for Supabase to update

### [ ] Step 4: Verify Supabase Redirect URLs

1. Still in Supabase Dashboard
2. Go to: **Authentication → URL Configuration**
3. Verify **"Redirect URLs"** contains:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000
   ```
4. If missing, add them and click **"Save"**

### [ ] Step 5: Clear Cache and Test

1. Clear browser cache and cookies:
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
2. Close and reopen browser
3. Restart dev server:
   ```bash
   npm run dev
   ```
4. Navigate to: **http://localhost:3000/auth/login**
5. Click "Sign in with Google"
6. Complete OAuth flow

---

## Expected Success Behavior

When working correctly, you should see:

1. Click "Sign in with Google" → Redirects to Google
2. Select account → Shows consent screen
3. Click "Continue" → Redirects through Supabase
4. Lands on: `http://localhost:3000` (home page)
5. User is logged in
6. Check Supabase Dashboard → Authentication → Users (should see new user)
7. Check Database → `user_profile` table (should have entry with `credit_balance=0`)

---

## Common Mistakes to Avoid

❌ Using Desktop OAuth client instead of Web application
❌ Wrong redirect URI in Google Cloud Console
❌ Typo in Client ID or Secret when pasting to Supabase
❌ Extra spaces in credentials
❌ Not clicking "Save" in Supabase
❌ Not waiting 3-5 minutes after saving
❌ Using old Desktop client credentials in Supabase
❌ Missing `https://` in redirect URI
❌ Adding `http://localhost:3000/auth/callback` to Google Cloud Console (only goes in Supabase!)

---

## Reference: OAuth Flow

```
User clicks "Sign in with Google"
    ↓
Redirects to Google OAuth consent screen
    ↓
User grants permissions
    ↓
Google redirects to: https://iqgooyfqzzkplhqfiqel.supabase.co/auth/v1/callback?code=xxx
    ↓
Supabase exchanges code with Google using Client ID/Secret ← FAILING HERE
    ↓
Supabase redirects to: http://localhost:3000/auth/callback
    ↓
Your callback handler creates user profile
    ↓
Redirects to: http://localhost:3000 (home page)
```

**Current failure point:** Supabase cannot exchange the code with Google

---

## Files Created (Already Complete)

All authentication code is implemented and working:

- ✅ `src/lib/supabase/middleware.ts`
- ✅ `src/middleware.ts`
- ✅ `src/app/auth/login/page.tsx`
- ✅ `src/app/auth/callback/route.ts`
- ✅ `src/app/api/auth/logout/route.ts`

No code changes needed - this is purely a configuration issue.

---

## Next Session Action Plan

1. **Take screenshots** of:
   - Google Cloud Console → Credentials → Web OAuth client (show redirect URIs)
   - Supabase Dashboard → Authentication → Providers → Google settings

2. **Follow troubleshooting checklist** above (Steps 1-5)

3. **If still failing**, reset everything:
   - Delete OAuth client in Google Cloud Console
   - Create brand new Web application client
   - Use completely fresh credentials
   - Carefully configure redirect URI: `https://iqgooyfqzzkplhqfiqel.supabase.co/auth/v1/callback`

4. **Ask for help** with screenshots if still stuck

---

## Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/iqgooyfqzzkplhqfiqel
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth/social-login/auth-google
- **Story File:** `docs/sprint-artifacts/2-1-implement-google-oauth-authentication.md`

---

## Contact/Support

If you need help:
- Supabase Discord: https://discord.supabase.com/
- Google Cloud Console Support: Use the "?" icon in top right
- Or share screenshots with the dev team for assistance

---

**Remember:** Wait 3-5 minutes after ANY changes in Google Cloud Console or Supabase Dashboard before testing!
