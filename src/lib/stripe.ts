/**
 * Stripe Server-Side Client
 * IMPORTANT: This module must ONLY be imported in server-side code (API routes, Server Components)
 * Never import this in client components as it exposes the secret key
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. Please add it to .env.local'
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})
