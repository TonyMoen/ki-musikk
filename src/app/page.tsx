'use client'

import { WizardContainer } from '@/components/wizard/wizard-container'
import { HomepageSongs } from '@/components/homepage-songs'
import { Music, Mic, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <WizardContainer />

      {/* Why KiMusikk Section */}
      <div className="w-full max-w-[640px] mx-auto px-5 mt-16 pt-10 border-t border-[rgba(90,140,255,0.1)]">
        <h2 className="text-xl font-semibold text-center text-white mb-8">
          Hvorfor KiMusikk?
        </h2>
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
            <p className="text-sm font-medium text-white">Ekte norsk uttale</p>
            <p className="text-xs text-[rgba(180,200,240,0.45)]">
              Spesialisert KI-tekstforfatter for norsk låtstruktur og fonetikk
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-5 w-5 text-[#F26522]" />
            </div>
            <p className="text-sm font-medium text-white">Smartere prompt-teknikk</p>
            <p className="text-xs text-[rgba(180,200,240,0.45)]">
              Norsk-optimaliserte musikkprompter gir bedre resultat enn generiske tjenester
            </p>
          </div>
        </div>
      </div>

      {/* My Songs Section */}
      <div className="w-full max-w-[640px] mx-auto px-5 mt-12 pt-8 border-t border-[rgba(90,140,255,0.1)]">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Mine sanger
        </h2>
        <HomepageSongs />
      </div>
    </main>
  )
}
