'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/constants'
import { useErrorToast } from '@/hooks/use-error-toast'
import { Loader2, Globe, Download } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<boolean | null>(null)
  const { showError } = useErrorToast()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(!!user)
    }
    checkAuth()
  }, [])

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user) {
      router.push('/auth/logg-inn')
      return
    }

    setLoading(pkg.id)

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Purchase failed')
      }

      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      showError(error, {
        context: 'credit-purchase',
        onRetry: () => handlePurchase(pkg),
      })
      setLoading(null)
    }
  }

  // Calculate per-song price
  const getPerSongPrice = (pkg: CreditPackage) => {
    const songs = pkg.credits / 10
    return (pkg.priceNOK / songs).toFixed(2).replace('.', ',')
  }

  const isPopular = (pkg: CreditPackage) => pkg.id === 'pro'
  const isBestValue = (pkg: CreditPackage) => pkg.id === 'premium'

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Enkel prising
          </h1>
          <p className="text-lg text-[rgba(180,200,240,0.5)]">
            Kjøp kreditter og lag norske sanger med KI
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {CREDIT_PACKAGES.map((pkg) => {
            const popular = isPopular(pkg)
            const bestValue = isBestValue(pkg)

            return (
              <div
                key={pkg.id}
                className={`
                  relative rounded-2xl transition-all duration-200
                  ${popular
                    ? 'md:scale-105 md:z-10 border-2 border-[#FF5B24] bg-[rgba(242,101,34,0.06)] shadow-[0_0_30px_rgba(242,101,34,0.12)]'
                    : 'border border-[rgba(90,140,255,0.1)] bg-[rgba(20,40,80,0.35)] hover:border-[rgba(90,140,255,0.2)]'
                  }
                `}
              >
                {pkg.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5B24] text-white px-4 py-1 text-xs font-semibold">
                    {pkg.badge}
                  </Badge>
                )}

                {bestValue && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 text-xs font-semibold">
                    BEST VERDI
                  </Badge>
                )}

                <div className="p-6 pt-8 text-center">
                  {/* Plan name */}
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-white">
                      {pkg.priceNOK}
                    </span>
                    <span className="text-lg text-[rgba(180,200,240,0.5)] ml-1">
                      kr
                    </span>
                  </div>

                  {/* Per-song price */}
                  <p className="text-sm text-[rgba(180,200,240,0.5)] mb-6">
                    {getPerSongPrice(pkg)} kr per sang
                  </p>

                  {/* Credits + songs */}
                  <div className="bg-[rgba(0,0,0,0.2)] rounded-xl py-4 px-3 mb-6">
                    <div className="text-2xl font-bold text-white">
                      {pkg.description}
                    </div>
                    <div className="text-xs text-[rgba(130,170,240,0.45)] mt-1">
                      {pkg.credits.toLocaleString()} kreditter
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loading !== null}
                    variant={popular ? 'default' : 'outline'}
                    className={`
                      w-full h-12 text-sm font-semibold transition-all
                      ${popular
                        ? 'bg-[#FF5B24] hover:bg-[#E54D1C] text-white'
                        : 'border-[rgba(90,140,255,0.2)] text-[rgba(180,200,240,0.7)] hover:bg-[rgba(40,80,160,0.15)] hover:text-white hover:border-[rgba(90,140,255,0.3)]'
                      }
                    `}
                  >
                    {loading === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {user ? 'Kobler til Vipps...' : 'Laster...'}
                      </>
                    ) : user ? (
                      'Betal med Vipps'
                    ) : (
                      'Logg inn for å kjøpe'
                    )}
                  </Button>

                  {/* Vipps secure badge inline */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[rgba(130,170,240,0.35)] mt-3">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Sikker betaling
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-white mb-8">Inkludert i alle pakker</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-[rgba(180,200,240,0.5)]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <AppLogo size={24} />
              </div>
              <p className="font-medium text-white">Full sang</p>
              <p>AI-generert melodi og tekst</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-white">Norsk uttale</p>
              <p>Optimalisert for autentisk norsk</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-white">MP3 nedlasting</p>
              <p>Last ned sangene dine</p>
            </div>
          </div>
          <p className="text-xs text-[rgba(130,170,240,0.35)] mt-6">
            Kreditter utløper aldri
          </p>
        </div>
      </div>
    </main>
  )
}
