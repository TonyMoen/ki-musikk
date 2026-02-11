'use client'

import { WizardContainer } from '@/components/wizard/wizard-container'
import { HomepageSongs } from '@/components/homepage-songs'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <WizardContainer />

      {/* My Songs Section */}
      <div className="w-full max-w-[640px] mx-auto px-5 mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)]">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Mine sanger
        </h2>
        <HomepageSongs />
      </div>
    </main>
  )
}
