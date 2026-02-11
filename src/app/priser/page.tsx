'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/constants'
import { useErrorToast } from '@/hooks/use-error-toast'
import { Loader2, Check, Globe, Download } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<boolean | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('pro') // Default to most popular
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
    // If not logged in, redirect to login
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

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Enkel prising
          </h1>
          <p className="text-lg text-gray-400">
            Kjøp kreditter og lag norske sanger med KI
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selectedPlan === pkg.id
            return (
              <Card
                key={pkg.id}
                onClick={() => setSelectedPlan(pkg.id)}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected ? 'border-[#FF5B24] border-2 scale-105' : 'hover:border-gray-500'
                }`}
              >
                {pkg.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5B24] text-white px-3 py-1">
                    {pkg.badge}
                  </Badge>
                )}

                <CardHeader className="text-center pb-2 pt-6">
                  <CardTitle className="text-xl text-white">{pkg.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="text-3xl font-bold text-[#FF5B24]">
                      {pkg.priceNOK} kr
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center py-6">
                  <div className="text-2xl font-semibold text-white mb-1">
                    {pkg.credits.toLocaleString()} kreditter
                  </div>
                  <p className="text-lg text-gray-400 mb-6">{pkg.description}</p>

                  <ul className="text-sm text-gray-300 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      10 kreditter = 1 sang
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Kreditter utløper aldri
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Gratis forhåndsvisning
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="pb-6">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePurchase(pkg)
                    }}
                    disabled={loading !== null}
                    className="w-full bg-[#FF5B24] hover:bg-[#E54D1C] text-white h-11"
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
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-white mb-6">Inkludert i alle pakker</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-400">
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
        </div>

        {/* Payment Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-12">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#FF5B24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Sikker betaling med Vipps
        </div>
      </div>
    </main>
  )
}
