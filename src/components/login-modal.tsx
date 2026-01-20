'use client'

/**
 * Login Modal Component
 *
 * Displays a modal prompting users to log in before performing actions
 * that require authentication (e.g., generating songs).
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface PendingSongData {
  genre: { id: string; name: string } | null
  concept: string
  lyrics: string
  isCustomTextMode: boolean
  vocalGender: 'm' | 'f' | null
}

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
  pendingSongData?: PendingSongData
}

const PENDING_SONG_KEY = 'kimusikk_pending_song'

export function LoginModal({
  open,
  onOpenChange,
  message = 'Logg inn for å lage 2 sanger gratis',
  pendingSongData
}: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    // Save pending song data to localStorage before redirect
    if (pendingSongData) {
      try {
        localStorage.setItem(PENDING_SONG_KEY, JSON.stringify(pendingSongData))
      } catch (e) {
        console.warn('Could not save pending song data:', e)
      }
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('OAuth error:', error)
        setError(error.message || 'Kunne ikke logge inn med Google')
        setIsLoading(false)
      }

      // If successful, user will be redirected to Google OAuth consent screen
    } catch (err) {
      console.error('Unexpected error during sign in:', err)
      setError('En uventet feil oppstod. Prøv igjen.')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Logg inn
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-[#E94560] hover:bg-[#D62839]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Kobler til Google...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Logg inn med Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Ved å logge inn godtar du våre vilkår og personvernregler
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
