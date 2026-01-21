/**
 * Vipps Webhook Handler
 * Processes payment events from Vipps
 *
 * Events handled:
 * - AUTHORIZED: Payment authorized, ready to capture
 * - CAPTURED: Payment captured successfully
 * - CANCELLED: Payment cancelled
 * - ABORTED: User aborted payment
 * - EXPIRED: Payment expired
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookSignature, extractSignature } from '@/lib/vipps/webhook'
import { capturePayment } from '@/lib/vipps/client'
import type { VippsWebhookEvent } from '@/lib/vipps/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // 1. Get raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const authHeader = headersList.get('Authorization')

    // 2. Verify webhook signature
    const signature = extractSignature(authHeader)

    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json(
        { error: { code: 'MISSING_SIGNATURE', message: 'Missing authorization header' } },
        { status: 400 }
      )
    }

    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } },
        { status: 400 }
      )
    }

    // 3. Parse webhook event
    const event: VippsWebhookEvent = JSON.parse(body)

    console.log('Vipps webhook received:', {
      name: event.name,
      reference: event.reference,
      success: event.success,
    })

    // 4. Initialize Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Database not configured' } },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 5. Get payment record
    const { data: paymentRecord, error: fetchError } = await supabase
      .from('vipps_payment')
      .select('*')
      .eq('reference', event.reference)
      .single()

    if (fetchError || !paymentRecord) {
      console.error('Payment record not found:', event.reference)
      // Return 200 to prevent Vipps from retrying
      return NextResponse.json({ received: true })
    }

    // 6. Handle different event types
    switch (event.name) {
      case 'AUTHORIZED':
        // Payment authorized - capture it automatically
        if (paymentRecord.status === 'pending') {
          try {
            await capturePayment(event.reference, {
              modificationAmount: {
                currency: 'NOK',
                value: paymentRecord.amount_ore,
              },
            })
            console.log('Payment captured via webhook:', event.reference)
          } catch (captureError) {
            console.error('Failed to capture payment:', captureError)
          }
        }
        break

      case 'CAPTURED':
        // Payment captured - add credits if not already done
        if (paymentRecord.status !== 'completed') {
          // Check for duplicate processing (idempotency)
          const { data: existingTransaction } = await supabase
            .from('credit_transaction')
            .select('id')
            .eq('stripe_session_id', `vipps-${event.reference}`)
            .single()

          if (existingTransaction) {
            console.log('Webhook already processed (idempotent):', event.reference)
            break
          }

          // Add credits
          const { error: addCreditsError } = await supabase.rpc('add_credits', {
            p_user_id: paymentRecord.user_id,
            p_amount: paymentRecord.credits,
            p_description: `Vipps kjøp: ${paymentRecord.package_id} pakke`,
            p_stripe_session_id: `vipps-${event.reference}`,
          })

          if (addCreditsError) {
            console.error('Failed to add credits:', addCreditsError)
            break
          }

          // Update payment status
          await supabase
            .from('vipps_payment')
            .update({ status: 'completed' })
            .eq('reference', event.reference)

          console.log('Credits added via webhook:', {
            reference: event.reference,
            userId: paymentRecord.user_id,
            credits: paymentRecord.credits,
          })
        }
        break

      case 'CANCELLED':
      case 'ABORTED':
        // User cancelled payment
        if (paymentRecord.status === 'pending') {
          await supabase
            .from('vipps_payment')
            .update({ status: 'cancelled' })
            .eq('reference', event.reference)
          console.log('Payment cancelled:', event.reference)
        }
        break

      case 'EXPIRED':
        // Payment expired
        if (paymentRecord.status === 'pending') {
          await supabase
            .from('vipps_payment')
            .update({ status: 'failed' })
            .eq('reference', event.reference)
          console.log('Payment expired:', event.reference)
        }
        break

      default:
        console.log('Unhandled webhook event:', event.name)
    }

    // 7. Return success
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
