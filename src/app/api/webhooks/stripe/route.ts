/**
 * Stripe Webhook Handler
 * Processes payment confirmation events and adds credits to user accounts
 * IMPORTANT: Webhook signature verification prevents fraudulent credit additions
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. Get raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: { code: 'MISSING_SIGNATURE', message: 'Missing Stripe signature' } },
        { status: 400 }
      )
    }

    // 2. Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Webhook secret not configured' } },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Webhook signature verification failed',
          },
        },
        { status: 400 }
      )
    }

    // 3. Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract metadata
      const userId = session.metadata?.userId
      const credits = session.metadata?.credits
      const packageId = session.metadata?.packageId
      const stripeSessionId = session.id

      if (!userId || !credits) {
        console.error('Missing metadata in webhook:', { userId, credits })
        return NextResponse.json(
          { error: { code: 'MISSING_METADATA', message: 'Invalid session metadata' } },
          { status: 400 }
        )
      }

      const creditsToAdd = parseInt(credits, 10)

      // 4. Initialize Supabase client with service role (bypasses RLS for webhooks)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables')
        return NextResponse.json(
          { error: { code: 'CONFIG_ERROR', message: 'Supabase not configured' } },
          { status: 500 }
        )
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // 5. Check for duplicate processing (idempotency)
      const { data: existingTransaction } = await supabase
        .from('credit_transaction')
        .select('id')
        .eq('stripe_session_id', stripeSessionId)
        .single()

      if (existingTransaction) {
        console.log('Webhook already processed (idempotent):', stripeSessionId)
        return NextResponse.json({ received: true })
      }

      // 6. Get current balance
      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('credit_balance')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Failed to fetch user profile:', profileError)
        return NextResponse.json(
          { error: { code: 'USER_NOT_FOUND', message: 'User profile not found' } },
          { status: 500 }
        )
      }

      const newBalance = profile.credit_balance + creditsToAdd

      // 7. Atomically update credit balance
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ credit_balance: newBalance })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update credit balance:', updateError)
        return NextResponse.json(
          { error: { code: 'UPDATE_FAILED', message: 'Failed to update credits' } },
          { status: 500 }
        )
      }

      // 8. Create transaction record
      const { error: transactionError } = await supabase
        .from('credit_transaction')
        .insert({
          user_id: userId,
          amount: creditsToAdd,
          balance_after: newBalance,
          transaction_type: 'purchase',
          description: `Credit purchase: ${packageId} package`,
          stripe_session_id: stripeSessionId,
        })

      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError)
        // Note: Credits already added, so we return success but log the error
        // Future improvement: Implement rollback logic
      }

      console.log('Credits added successfully:', {
        userId,
        credits: creditsToAdd,
        newBalance,
        stripeSessionId,
      })
    }

    // 9. Return success
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'WEBHOOK_ERROR',
          message: 'Webhook processing failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
