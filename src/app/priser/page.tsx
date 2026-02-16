'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/constants'
import { useErrorToast } from '@/hooks/use-error-toast'
import { Loader2, Globe, Download, Sparkles, Info } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

export default function PricingPage() {
  const router = useRouter()
  const [fromDownload, setFromDownload] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<boolean | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('pro')
  const { showError } = useErrorToast()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setFromDownload(params.get('from') === 'download')

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

  const isBestValue = (pkg: CreditPackage) => pkg.id === 'premium'

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Velg din pakke
          </h1>
          <p className="text-lg text-[rgba(180,200,240,0.5)]">
            Engangskjøp, ingen abonnement
          </p>
        </div>

        {/* Download context banner */}
        {fromDownload && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F26522]/20 bg-[#F26522]/5 mb-8 max-w-xl mx-auto">
            <Info className="h-5 w-5 text-[#F26522] flex-shrink-0" />
            <p className="text-sm text-[rgba(180,200,240,0.7)]">
              For å laste ned sanger må du kjøpe en kredittpakke. Etter første kjøp kan du laste ned alle sangene dine.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selectedPlan === pkg.id
            const bestValue = isBestValue(pkg)

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPlan(pkg.id)}
                className={`
                  relative rounded-2xl transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'md:scale-105 md:z-10 border-2 border-[#FF5B24] bg-[rgba(20,40,80,0.35)] shadow-[0_0_30px_rgba(242,101,34,0.12)]'
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
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5B24] text-white px-4 py-1 text-xs font-semibold">
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
                  <div className="py-4 px-3 mb-6">
                    <div className="text-2xl font-bold text-white">
                      {pkg.description}
                    </div>
                    <div className="text-xs text-[rgba(130,170,240,0.45)] mt-1">
                      {pkg.credits.toLocaleString()} kreditter
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePurchase(pkg)
                    }}
                    disabled={loading !== null}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`
                      w-full h-12 text-sm font-semibold transition-all
                      ${isSelected
                        ? 'bg-[#FF5B24] hover:bg-[#E54D1C] text-white'
                        : pkg.id === 'premium'
                          ? 'border-[#FF5B24]/40 text-[#FF5B24] hover:bg-[rgba(242,101,34,0.1)] hover:border-[#FF5B24]/60'
                          : pkg.id === 'starter'
                            ? 'border-[rgba(90,140,255,0.1)] bg-[rgba(40,80,160,0.1)] text-[rgba(180,200,240,0.5)] hover:bg-[rgba(40,80,160,0.15)] hover:text-[rgba(180,200,240,0.7)]'
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
                      '\uD83D\uDD12 Betal med Vipps'
                    ) : (
                      'Logg inn for å kjøpe'
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Secure payment note */}
        <p className="text-center text-xs text-[rgba(130,170,240,0.35)] mt-6">
          Sikker betaling med Vipps
        </p>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-white mb-8">Inkludert i alle pakker</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 text-sm text-[rgba(180,200,240,0.5)]">
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
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-white">Nyeste KI-modell</p>
              <p>Drevet av siste Suno-teknologi</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="font-medium text-white">Utløper aldri</p>
              <p>Ingen utløpsdato</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
