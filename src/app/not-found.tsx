'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="text-8xl sm:text-9xl font-bold text-[#E94560] mb-4">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Siden finnes ikke
        </h1>
        <p className="text-[rgba(180,200,240,0.5)] mb-8">
          Beklager, vi kunne ikke finne siden du leter etter.
          Den kan ha blitt flyttet eller slettet.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="bg-[#E94560] hover:bg-[#D62839]">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Til forsiden
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sanger">
              <AppLogo size={16} className="mr-2" />
              Mine sanger
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="text-sm text-[rgba(180,200,240,0.5)] hover:text-white inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Gå tilbake
          </button>
        </div>
      </div>
    </main>
  )
}
