/**
 * Vipps Payment Callback Handler
 * Handles user redirect after Vipps payment flow
 *
 * Flow:
 * 1. User completes payment in Vipps app
 * 2. Vipps redirects user to this URL with reference
 * 3. We check payment status and redirect user to settings page with result
 */

import { NextResponse } from 'next/server'
import { getPayment, capturePayment } from '@/lib/vipps/client'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      console.error('Missing reference in callback')
      return NextResponse.redirect(
        new URL('/settings?payment=error', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      )
    }

    // Get app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Initialize Supabase service client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.redirect(new URL('/settings?payment=error', appUrl))
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get payment record from database
    const { data: paymentRecord, error: fetchError } = await supabase
      .from('vipps_payment')
      .select('*')
      .eq('reference', reference)
      .single()

    if (fetchError || !paymentRecord) {
      console.error('Payment record not found:', reference, fetchError)
      return NextResponse.redirect(new URL('/settings?payment=error', appUrl))
    }

    // If already completed, just redirect to success
    if (paymentRecord.status === 'completed') {
      return NextResponse.redirect(new URL('/settings?payment=success', appUrl))
    }

    // Check payment status with Vipps
    const vippsPayment = await getPayment(reference)

    console.log('Vipps payment status:', {
      reference,
      state: vippsPayment.state,
      aggregate: vippsPayment.aggregate,
    })

    // Handle different states
    if (vippsPayment.state === 'AUTHORIZED') {
      // Payment is authorized - capture it
      try {
        await capturePayment(reference, {
          modificationAmount: {
            currency: 'NOK',
            value: paymentRecord.amount_ore,
          },
        })

        // Update payment status to completed
        await supabase
          .from('vipps_payment')
          .update({ status: 'completed' })
          .eq('reference', reference)

        // Add credits to user account
        const { error: addCreditsError } = await supabase.rpc('add_credits', {
          p_user_id: paymentRecord.user_id,
          p_amount: paymentRecord.credits,
          p_description: `Vipps kjøp: ${paymentRecord.package_id} pakke`,
          p_stripe_session_id: `vipps-${reference}`, // Reuse field for Vipps reference
        })

        if (addCreditsError) {
          console.error('Failed to add credits:', addCreditsError)
          // Payment captured but credits not added - needs manual reconciliation
          return NextResponse.redirect(new URL('/settings?payment=pending', appUrl))
        }

        console.log('Payment completed and credits added:', {
          reference,
          userId: paymentRecord.user_id,
          credits: paymentRecord.credits,
        })

        return NextResponse.redirect(new URL('/settings?payment=success', appUrl))
      } catch (captureError) {
        console.error('Failed to capture payment:', captureError)
        return NextResponse.redirect(new URL('/settings?payment=error', appUrl))
      }
    } else if (vippsPayment.state === 'ABORTED' || vippsPayment.state === 'TERMINATED') {
      // User cancelled or payment was terminated
      await supabase
        .from('vipps_payment')
        .update({ status: 'cancelled' })
        .eq('reference', reference)

      return NextResponse.redirect(new URL('/settings?payment=cancelled', appUrl))
    } else if (vippsPayment.state === 'EXPIRED') {
      // Payment expired
      await supabase
        .from('vipps_payment')
        .update({ status: 'failed' })
        .eq('reference', reference)

      return NextResponse.redirect(new URL('/settings?payment=expired', appUrl))
    } else {
      // Payment still pending (CREATED state) - user may have navigated away
      return NextResponse.redirect(new URL('/settings?payment=pending', appUrl))
    }
  } catch (error) {
    console.error('Vipps callback error:', error)
    return NextResponse.redirect(
      new URL('/settings?payment=error', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }
}
