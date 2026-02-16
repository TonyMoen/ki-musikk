'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WizardContainer } from '@/components/wizard/wizard-container'
import { HomepageSongs } from '@/components/homepage-songs'
import { DemoSongs } from '@/components/demo-songs'
import { Music, Mic, CreditCard, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center">
      <WizardContainer />

      {/* Why KiMusikk + Demo Songs — visitors only */}
      {!isLoggedIn && (
        <>
          <div className="w-full max-w-[640px] mx-auto px-5 mt-16 pt-10 border-t border-[rgba(90,140,255,0.1)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
                  <Music className="h-5 w-5 text-[#F26522]" />
                </div>
                <p className="text-sm font-medium text-white">Nyeste KI-teknologi</p>
                <p className="text-xs text-[rgba(180,200,240,0.45)]">
                  Drevet av den nyeste Suno-modellen for profesjonell musikkproduksjon
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
                  <Mic className="h-5 w-5 text-[#F26522]" />
                </div>
                <p className="text-sm font-medium text-white">Optimalisert for norsk</p>
                <p className="text-xs text-[rgba(180,200,240,0.45)]">
                  Smartere prompt-teknikk og norsk fonetikk gir bedre resultat enn generiske tjenester
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
                  <CreditCard className="h-5 w-5 text-[#F26522]" />
                </div>
                <p className="text-sm font-medium text-white">Betal med Vipps</p>
                <p className="text-xs text-[rgba(180,200,240,0.45)]">
                  Engangsbetaling — ingen månedlig abonnement. Betal kun for det du bruker.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[640px] mx-auto px-5 mt-12 pt-8 border-t border-[rgba(90,140,255,0.1)]">
            <h2 className="text-xl font-semibold text-center text-white mb-6">
              Hør hva andre har laget
            </h2>
            <DemoSongs />
          </div>
        </>
      )}

      {/* My Songs Section */}
      <div className="w-full max-w-[640px] mx-auto px-5 mt-12 pt-8 border-t border-[rgba(90,140,255,0.1)]">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Mine sanger
        </h2>
        {isLoggedIn ? (
          <HomepageSongs />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F26522]/10 flex items-center justify-center mb-4">
              <Music className="h-8 w-8 text-[#F26522]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Lagre sangene dine
            </h3>
            <p className="text-[rgba(180,200,240,0.5)] text-sm mb-6 max-w-xs">
              Logg inn for å lage, lagre og laste ned sanger. Du får 2 gratis sanger ved registrering!
            </p>
            <Link
              href="/auth/logg-inn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F26522] hover:bg-[#E54D1C] text-white font-medium transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Logg inn / Registrer deg
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
