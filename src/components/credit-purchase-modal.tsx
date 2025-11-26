'use client'

/**
 * Credit Purchase Modal Component
 * Displays credit package options and initiates Stripe Checkout
 */

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/info-tooltip'
import { CREDIT_PACKAGES, TOOLTIPS, type CreditPackage } from '@/lib/constants'

interface CreditPurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditPurchaseModal({ open, onOpenChange }: CreditPurchaseModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (pkg: CreditPackage) => {
    setLoading(pkg.id)

    try {
      // Call purchase API
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Purchase failed')
      }

      // Redirect to Stripe Checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Kjøp kreditter
            <InfoTooltip content={TOOLTIPS.credits} side="bottom" />
          </DialogTitle>
          <DialogDescription>
            Velg en kredittpakke for å lage norske sanger
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${
                pkg.badge ? 'border-[#D4A017] border-2' : ''
              }`}
            >
              {pkg.badge && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#D4A017] text-white">
                  {pkg.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-[#E63946]">
                    ${(pkg.price / 100).toFixed(0)}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-2">
                <div className="text-2xl font-semibold text-gray-900">
                  {pkg.credits.toLocaleString()} credits
                </div>
                <div className="text-sm text-gray-600">{pkg.description}</div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading !== null}
                  className="w-full bg-[#E63946] hover:bg-[#D62839] text-white"
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Select'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Stripe • All prices in USD
        </div>
      </DialogContent>
    </Dialog>
  )
}
