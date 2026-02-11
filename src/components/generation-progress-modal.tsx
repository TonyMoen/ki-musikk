'use client'

/**
 * Generation Progress Modal Component
 * Displays real-time progress during AI-powered Norwegian song generation
 *
 * Features:
 * - Full-screen modal overlay with centered card (non-dismissible)
 * - Animated progress circle (0-100%)
 * - Stage-based Norwegian status messages
 * - Time estimation countdown
 * - Success confetti animation
 * - Error handling UI with retry
 *
 * Note: Modal cannot be closed during generation. User must wait for completion or error.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, XCircle, CheckCircle, Play, Mic, Guitar, Headphones, PartyPopper } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FEATURES } from '@/lib/constants'

interface GenerationProgressModalProps {
  open: boolean
  songId: string | null
  onComplete: (audioUrl: string) => void
  onCancel: () => void
  onError: (error: string) => void
}

type SongStatus = 'generating' | 'partial' | 'completed' | 'failed' | 'cancelled'

interface SongResponse {
  data: {
    id: string
    title: string
    status: SongStatus
    progress?: number
    estimatedTimeRemaining?: number
    audioUrl?: string
    streamAudioUrl?: string  // Early preview URL
    errorMessage?: string
    createdAt: string
    updatedAt: string
  }
}

// Generation stages with Norwegian text
// Conditionally include phonetic optimization stage based on feature flag
const GENERATION_STAGES = FEATURES.ENABLE_PHONETIC_OPTIMIZATION
  ? [
      { min: 0, max: 30, Icon: ({ className }: { className?: string }) => <AppLogo size={20} className={className} />, text: 'AI skriver norske tekster...' },
      { min: 30, max: 50, Icon: Mic, text: 'Optimerer uttale...' },
      { min: 50, max: 100, Icon: Guitar, text: 'Genererer musikk med Suno...' },
    ]
  : [
      { min: 0, max: 50, Icon: ({ className }: { className?: string }) => <AppLogo size={20} className={className} />, text: 'AI skriver norske tekster...' },
      { min: 50, max: 100, Icon: Guitar, text: 'Genererer musikk med Suno...' },
    ]

const MAX_POLLING_ATTEMPTS = 100 // 100 × 3s = 5 minutes max
const POLLING_INTERVAL = 3000 // 3 seconds - faster detection

export function GenerationProgressModal({
  open,
  songId,
  onComplete,
  onCancel,
  onError,
}: GenerationProgressModalProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<SongStatus>('generating')
  const [estimatedTime, setEstimatedTime] = useState(120) // Default 120 seconds
  const [elapsedTime, setElapsedTime] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [streamAudioUrl, setStreamAudioUrl] = useState<string | null>(null)

  const pollingAttempts = useRef(0)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const elapsedInterval = useRef<NodeJS.Timeout | null>(null)
  const startTime = useRef(Date.now())

  // Get current stage based on progress
  const currentStage = GENERATION_STAGES.find(
    (stage) => progress >= stage.min && progress < stage.max
  ) || GENERATION_STAGES[GENERATION_STAGES.length - 1]

  // Format remaining time in Norwegian
  const formatRemainingTime = (seconds: number): string => {
    if (seconds <= 0 || elapsedTime > estimatedTime) {
      return 'Snart ferdig...'
    }

    if (seconds < 60) {
      return `~${Math.ceil(seconds)} sekunder igjen`
    }

    const minutes = Math.ceil(seconds / 60)
    return `~${minutes} ${minutes === 1 ? 'minutt' : 'minutter'} igjen`
  }

  const remainingSeconds = Math.max(0, estimatedTime - elapsedTime)

  // Cleanup intervals
  const cleanup = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
    if (elapsedInterval.current) {
      clearInterval(elapsedInterval.current)
      elapsedInterval.current = null
    }
  }, [])

  // Poll song status
  const pollSongStatus = useCallback(async () => {
    if (!songId || pollingAttempts.current >= MAX_POLLING_ATTEMPTS) {
      cleanup()
      onError('Tidsavbrudd: Genereringen tok for lang tid')
      return
    }

    try {
      const response = await fetch(`/api/songs/${songId}`)
      const data: SongResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.data?.errorMessage || 'Failed to fetch song status')
      }

      const song = data.data

      // Update progress based on elapsed time if still generating
      if (song.status === 'generating') {
        const calculatedProgress = Math.min(
          (elapsedTime / estimatedTime) * 100,
          95 // Cap at 95% until actual completion
        )
        setProgress(Math.round(calculatedProgress))
      }

      // Handle status changes
      if (song.status === 'completed') {
        setProgress(100)
        setStatus('completed')
        setShowConfetti(true)
        cleanup()

        // Trigger confetti and complete after short delay
        setTimeout(() => {
          if (song.audioUrl) {
            onComplete(song.audioUrl)
          }
        }, 3000)
      } else if (song.status === 'partial') {
        // Early preview available - show play button but keep polling
        console.log('[Preview] Song status is PARTIAL', {
          streamAudioUrl: song.streamAudioUrl,
          status: song.status,
          progress: song.progress
        })
        setProgress(85)
        setStatus('partial')
        if (song.streamAudioUrl) {
          console.log('[Preview] Setting stream audio URL:', song.streamAudioUrl)
          setStreamAudioUrl(song.streamAudioUrl)
        } else {
          console.warn('[Preview] No streamAudioUrl in response!')
        }
        // Keep polling for final audio (don't cleanup)
      } else if (song.status === 'failed') {
        setStatus('failed')
        setErrorMessage(song.errorMessage || 'Generering feilet. Prøv igjen.')
        cleanup()
      } else if (song.status === 'cancelled') {
        setStatus('cancelled')
        cleanup()
        onCancel()
      }

      pollingAttempts.current++
    } catch (error) {
      console.error('Polling error:', error)
      pollingAttempts.current++

      // After 3 consecutive failures, show error
      if (pollingAttempts.current >= 3) {
        cleanup()
        onError('Kunne ikke hente status. Sjekk nettverksforbindelsen.')
      }
    }
  }, [songId, elapsedTime, estimatedTime, cleanup, onComplete, onCancel, onError])

  // Start polling and elapsed time tracking when modal opens
  useEffect(() => {
    // Poll during both 'generating' and 'partial' status
    const shouldPoll = status === 'generating' || status === 'partial'

    if (open && songId && shouldPoll) {
      // Only reset start time on initial open (when generating)
      if (status === 'generating' && !startTime.current) {
        startTime.current = Date.now()
        pollingAttempts.current = 0
      }

      // Start polling if not already running
      if (!pollingInterval.current) {
        pollSongStatus()
        pollingInterval.current = setInterval(pollSongStatus, POLLING_INTERVAL)
      }

      // Start elapsed timer if not already running
      if (!elapsedInterval.current) {
        elapsedInterval.current = setInterval(() => {
          setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000))
        }, 1000)
      }
    }

    return cleanup
  }, [open, songId, status, pollSongStatus, cleanup])

  // Trigger confetti animation
  useEffect(() => {
    if (showConfetti && typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E94560', '#FFD93D'],
        })
      })
    }
  }, [showConfetti])

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent
        className="sm:max-w-[600px] w-[95%] p-8 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {status === 'generating' && 'Genererer din sang'}
          {status === 'partial' && 'Forhåndsvisning klar'}
          {status === 'completed' && 'Sangen din er klar'}
          {status === 'failed' && 'Generering feilet'}
        </DialogTitle>
        {status === 'generating' && (
          <>
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-center text-2xl">
                Genererer din sang
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-6 py-8">
              {/* Progress Circle */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-[rgba(90,140,255,0.1)] flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full border-8 border-[#E94560] transition-all duration-500"
                    style={{
                      clipPath: `inset(0 ${100 - progress}% 0 0)`,
                    }}
                  />
                  <span className="text-3xl font-bold text-white z-10">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 text-[#E94560] animate-spin opacity-20" />
              </div>

              {/* Stage Message */}
              <div className="text-center space-y-2">
                <currentStage.Icon className="w-16 h-16 mx-auto text-primary" />
                <p className="text-lg font-semibold text-white">
                  {currentStage.text}
                </p>
                <p className="text-sm text-[rgba(180,200,240,0.5)]">
                  {formatRemainingTime(remainingSeconds)}
                </p>
              </div>

              {/* Progress Bar (Alternative visual) */}
              <div className="w-full">
                <Progress value={progress} className="h-2" />
              </div>

              {/* Info message */}
              <p className="text-sm text-[rgba(180,200,240,0.5)] text-center mt-2">
                Dette tar vanligvis 2-3 minutter
              </p>
            </div>
          </>
        )}

        {status === 'partial' && (
          <div className="flex flex-col items-center space-y-6 py-8">
            {/* Progress indicator showing almost done */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-[rgba(90,140,255,0.1)] flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-8 border-[#06D6A0] transition-all duration-500"
                  style={{ clipPath: `inset(0 15% 0 0)` }}
                />
                <span className="text-3xl font-bold text-white z-10">85%</span>
              </div>
              <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 text-[#06D6A0] animate-spin opacity-20" />
            </div>

            <div className="text-center space-y-2">
              <Headphones className="w-16 h-16 mx-auto text-success" />
              <h2 className="text-xl font-bold text-white">Forhåndsvisning klar!</h2>
              <p className="text-[rgba(180,200,240,0.5)]">Lytt til sangen mens vi ferdigstiller den</p>
            </div>

            {streamAudioUrl ? (
              <audio
                controls
                autoPlay
                src={streamAudioUrl}
                className="w-full max-w-md"
                onLoadStart={() => console.log('[Audio] Load started:', streamAudioUrl)}
                onCanPlay={() => console.log('[Audio] Can play')}
                onPlay={() => console.log('[Audio] Playing')}
                onError={(e) => console.error('[Audio] Error:', e.currentTarget.error)}
              />
            ) : (
              <p className="text-amber-600 text-sm">Venter på lydstrøm...</p>
            )}

            <div className="w-full">
              <Progress value={85} className="h-2" />
            </div>

            <p className="text-sm text-[rgba(180,200,240,0.5)] text-center">
              Ferdigstiller høykvalitetsversjon...
            </p>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex flex-col items-center space-y-6 py-8">
            <CheckCircle className="h-24 w-24 text-[#06D6A0]" />
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                <PartyPopper className="w-8 h-8 text-primary" />
                Sangen din er klar!
              </h2>
              <p className="text-[rgba(180,200,240,0.5)]">Din norske sang er nå ferdig generert</p>
            </div>
            <Button
              onClick={() => onComplete('')}
              className="bg-[#E94560] hover:bg-[#D62839] text-white px-8"
            >
              Spill av nå
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center space-y-6 py-8">
            <XCircle className="h-24 w-24 text-[#EF476F]" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Generering feilet
              </h2>
              <p className="text-[rgba(180,200,240,0.5)]">
                {errorMessage || 'Kunne ikke generere sangen. Prøv igjen.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Lukk
              </Button>
              <Button
                onClick={() => {
                  setStatus('generating')
                  setProgress(0)
                  setElapsedTime(0)
                  setErrorMessage(null)
                  pollingAttempts.current = 0
                }}
                className="bg-[#E94560] hover:bg-[#D62839] text-white"
              >
                Prøv igjen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
