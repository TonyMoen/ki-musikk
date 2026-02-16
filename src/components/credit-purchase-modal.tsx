'use client'

/**
 * Credit Purchase Modal Component
 * Displays credit package options and initiates Vipps payment
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
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/constants'
import { useErrorToast } from '@/hooks/use-error-toast'

interface CreditPurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditPurchaseModal({ open, onOpenChange }: CreditPurchaseModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { showError } = useErrorToast()

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

      // Redirect to Vipps
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      showError(error, {
        context: 'credit-purchase',
        onRetry: () => handlePurchase(pkg),
        onContactSupport: () => {
          window.location.href = 'mailto:hei@kimusikk.no'
        }
      })
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-white">
            Kjøp kreditter
          </DialogTitle>
          <DialogDescription className="text-[rgba(180,200,240,0.5)]">
            Velg en kredittpakke for å lage norske sanger
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-2 sm:mt-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${
                pkg.badge ? 'border-[#FF5B24] border-2' : ''
              }`}
            >
              {pkg.badge && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FF5B24] text-white text-xs">
                  {pkg.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-2 sm:pb-3 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg text-white">{pkg.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl sm:text-3xl font-bold text-[#FF5B24]">
                    {pkg.priceNOK} kr
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-1 sm:space-y-2 py-2 sm:py-4">
                <div className="text-xl sm:text-2xl font-semibold text-white">
                  {pkg.credits.toLocaleString()} kreditter
                </div>
                <div className="text-xs sm:text-sm text-[rgba(130,170,240,0.45)]">{pkg.description}</div>
              </CardContent>

              <CardFooter className="pb-3 sm:pb-6">
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading !== null}
                  className="w-full bg-[#FF5B24] hover:bg-[#E54D1C] text-white h-9 sm:h-10"
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kobler til Vipps...
                    </>
                  ) : (
                    'Betal med Vipps'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[rgba(130,170,240,0.45)] mt-2 sm:mt-4">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="#FF5B24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Sikker betaling med Vipps
        </div>
      </DialogContent>
    </Dialog>
  )
}
