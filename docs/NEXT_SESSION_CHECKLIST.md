# Next Session Checklist

## When Vipps Application is Approved

### Quick Setup (5 steps)

1. **Get credentials** from [Vipps Portal](https://portal.vipps.no)
   - ePayment: Client ID, Secret, Subscription Key, MSN
   - Login: Client ID, Secret

2. **Add env vars** in Vercel Dashboard → Settings → Environment Variables

3. **Run migration** in Supabase SQL Editor (see `VIPPS_INTEGRATION_GUIDE.md`)

4. **Configure Vipps Portal:**
   - Webhook URL: `https://www.kimusikk.no/api/webhooks/vipps`
   - Login redirect: `https://www.kimusikk.no/api/auth/vipps/callback`

5. **Redeploy:** `vercel --prod`

---

## Environment Variables Needed

```env
VIPPS_CLIENT_ID=
VIPPS_CLIENT_SECRET=
VIPPS_SUBSCRIPTION_KEY=
VIPPS_MSN=
VIPPS_WEBHOOK_SECRET=
VIPPS_API_URL=https://api.vipps.no
VIPPS_LOGIN_CLIENT_ID=
VIPPS_LOGIN_CLIENT_SECRET=
```

---

## Test Checklist

- [ ] Payment: Buy credits with Vipps
- [ ] Payment: Cancel and verify no charge
- [ ] Login: New user with Vipps
- [ ] Login: Existing user with Vipps
- [ ] Google login still works
- [ ] Song generation works

---

## Future Enhancements to Consider

- [ ] Vipps recurring payments (subscriptions)
- [ ] Email receipts after purchase
- [ ] Admin dashboard for payments
- [ ] Analytics tracking
- [ ] Promotional codes / discounts
- [ ] Gift cards / gift credits
