/**
 * Credit Purchase API Route
 * Creates a Vipps ePayment session for credit package purchases
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createPayment, generatePaymentReference } from '@/lib/vipps/client'
import { CREDIT_PACKAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const purchaseSchema = z.object({
  packageId: z.enum(['starter', 'pro', 'premium']),
})

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // 2. Validate request body
    const body = await request.json()
    const validation = purchaseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Invalid package ID. Must be starter, pro, or premium.',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { packageId } = validation.data

    // 3. Look up selected package
    const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)

    if (!selectedPackage) {
      return NextResponse.json(
        {
          error: {
            code: 'PACKAGE_NOT_FOUND',
            message: 'Credit package not found',
          },
        },
        { status: 400 }
      )
    }

    // 4. Get app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // 5. Generate unique payment reference
    const reference = generatePaymentReference()

    // 6. Create pending payment record in database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Database not configured' } },
        { status: 500 }
      )
    }

    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey)

    const { error: insertError } = await serviceClient
      .from('vipps_payment')
      .insert({
        reference,
        user_id: user.id,
        package_id: selectedPackage.id,
        credits: selectedPackage.credits,
        amount_ore: selectedPackage.priceOre,
        status: 'pending',
      })

    if (insertError) {
      console.error('Failed to create payment record:', insertError)
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create payment record',
          },
        },
        { status: 500 }
      )
    }

    // 7. Create Vipps payment
    const vippsPayment = await createPayment({
      amount: {
        currency: 'NOK',
        value: selectedPackage.priceOre,
      },
      paymentMethod: {
        type: 'WALLET',
      },
      reference,
      userFlow: 'WEB_REDIRECT',
      returnUrl: `${appUrl}/api/vipps/callback?reference=${reference}`,
      paymentDescription: `${selectedPackage.name} - ${selectedPackage.credits} kreditter`,
    })

    // 8. Return Vipps redirect URL
    return NextResponse.json({
      data: {
        checkoutUrl: vippsPayment.redirectUrl,
        reference,
      },
    })
  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'PURCHASE_FAILED',
          message: 'Failed to create payment',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
