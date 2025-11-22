/**
 * Credit Purchase API Route
 * Creates a Stripe Checkout session for credit package purchases
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { CREDIT_PACKAGES } from '@/lib/constants'

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

    // 5. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPackage.name} Credit Package`,
              description: `${selectedPackage.credits} credits for Musikkfabrikken (${selectedPackage.description})`,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/settings?payment=success`,
      cancel_url: `${appUrl}/settings?payment=cancelled`,
      metadata: {
        userId: user.id,
        packageId: selectedPackage.id,
        credits: selectedPackage.credits.toString(),
      },
    })

    // 6. Return Checkout URL
    return NextResponse.json({
      data: {
        checkoutUrl: session.url,
      },
    })
  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'PURCHASE_FAILED',
          message: 'Failed to create checkout session',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
