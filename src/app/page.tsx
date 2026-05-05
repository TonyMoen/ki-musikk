'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WizardContainer } from '@/components/wizard/wizard-container'
import { WizardHeader } from '@/components/wizard/wizard-header'
import { ModeSwitcher, type WizardMode } from '@/components/mode-switcher'
import { SmartMode } from '@/components/smart/smart-mode'
import { BackgroundDecoration } from '@/components/background-decoration'
import { HomepageSongs } from '@/components/homepage-songs'
import { DemoSongs } from '@/components/demo-songs'
import { Music, Mic, CreditCard, LogIn } from 'lucide-react'
import Link from 'next/link'

const PENDING_SONG_KEY = 'kimusikk_pending_song'

const MODE_DESCRIPTIONS: Record<WizardMode, string> = {
  smart:
    'Vi gjør jobben — fortell oss hva sangen handler om, så finner AI sjanger og skriver tekst. Du får 2 versjoner per generering.',
  tilpass:
    'Velg sjanger, stemning og lengde — du har full kontroll. Hver generering gir 2 versjoner.',
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mode, setMode] = useState<WizardMode>('smart')
  const [modeReady, setModeReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  // Default to Tilpass on mount if the wizard has pending in-flight data,
  // so returning users don't lose work behind the Smart UI.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PENDING_SONG_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        const TTL_MS = 30 * 60 * 1000
        if (data.savedAt && Date.now() - data.savedAt <= TTL_MS) {
          setMode('tilpass')
        }
      }
    } catch {
      // ignore localStorage errors — default Smart stands
    }
    setModeReady(true)
  }, [])

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center pb-16 sm:pb-24">
      <BackgroundDecoration />

      {/* Hero — trust badge + headline + subtitle */}
      <section className="w-full max-w-[720px] mx-auto px-5 pt-10 sm:pt-14 text-center space-y-4">
        <WizardHeader />
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-[var(--ink)]">
          Lag <em className="font-serif italic text-[#F26522]">norske</em>
          <br className="hidden sm:block" />{' '}
          sanger med AI
        </h1>
        <p className="text-sm sm:text-base text-[var(--ink-2)]">
          Skriv teksten, velg stil — to ferdige versjoner på minutter.
        </p>
      </section>

      {/* Creation card */}
      <div className="w-full max-w-[720px] mx-auto px-5 pt-10">
        <div className="studio-card p-7 sm:p-10 space-y-7">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <p
            className="text-sm sm:text-base text-center text-[var(--ink-2)] max-w-md mx-auto"
            aria-live="polite"
          >
            {MODE_DESCRIPTIONS[mode]}
          </p>
          {modeReady && mode === 'smart' && (
            <SmartMode onHandoffToTilpass={() => setMode('tilpass')} />
          )}
          {modeReady && mode === 'tilpass' && <WizardContainer />}
        </div>
      </div>

      {/* Why KiMusikk + Demo Songs — visitors only */}
      {!isLoggedIn && (
        <>
          <div className="w-full max-w-[640px] mx-auto px-5 mt-16 pt-10 border-t border-[var(--border-soft)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
                  <Music className="h-5 w-5 text-[#F26522]" />
                </div>
                <p className="text-sm font-medium text-[var(--ink)]">Nyeste AI-teknologi</p>
                <p className="text-xs text-[var(--ink-3)]">
                  Drevet av den nyeste Suno-modellen for profesjonell musikkproduksjon
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
                  <Mic className="h-5 w-5 text-[#F26522]" />
                </div>
                <p className="text-sm font-medium text-[var(--ink)]">Optimalisert for norsk</p>
                <p className="text-xs text-[var(--ink-3)]">
                  Smartere prompt-teknikk og norsk fonetikk gir bedre resultat enn generiske tjenester
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
                  <CreditCard className="h-5 w-5 text-[#F26522]" />
                </div>
                <p className="text-sm font-medium text-[var(--ink)]">Betal med Vipps</p>
                <p className="text-xs text-[var(--ink-3)]">
                  Engangsbetaling — ingen månedlig abonnement. Betal kun for det du bruker.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[640px] mx-auto px-5 mt-12 pt-8 border-t border-[var(--border-soft)]">
            <h2 className="text-xl font-semibold text-center text-[var(--ink)] mb-6">
              Hør hva andre har laget
            </h2>
            <DemoSongs />
          </div>
        </>
      )}

      {/* My Songs Section */}
      <section className="w-full max-w-[720px] mx-auto px-5 mt-16 sm:mt-20">
        <div className="space-y-3 mb-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
            Mine <em className="font-serif italic text-[#F26522]">sanger</em>
          </h2>
          <div className="h-px bg-[var(--border-soft)]" />
        </div>
        {isLoggedIn ? (
          <HomepageSongs />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F26522]/10 flex items-center justify-center mb-4">
              <Music className="h-8 w-8 text-[#F26522]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">
              Lagre sangene dine
            </h3>
            <p className="text-[var(--ink-2)] text-sm mb-6 max-w-xs">
              Logg inn for å lage, lagre og laste ned sanger. Du får 2 gratis sanger ved registrering!
            </p>
            <Link
              href="/auth/logg-inn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F26522] hover:bg-[#E54D1C] text-[var(--ink)] font-medium transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Logg inn / Registrer deg
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
