'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { useTypewriter } from '@/hooks/use-typewriter'
import { WizardNavButtons } from './wizard-nav-buttons'

interface StepLyricsProps {
  isCustomTextMode: boolean
  onCustomTextModeChange: (isCustom: boolean) => void
  concept: string
  onConceptChange: (concept: string) => void
  lyrics: string
  onLyricsChange: (lyrics: string) => void
  onGenerateLyrics: () => Promise<void>
  isGenerating: boolean
  onNext: () => void
}

export function StepLyrics({
  isCustomTextMode,
  onCustomTextModeChange,
  concept,
  onConceptChange,
  lyrics,
  onLyricsChange,
  onGenerateLyrics,
  isGenerating,
  onNext,
}: StepLyricsProps) {
  const [animationTarget, setAnimationTarget] = useState('')
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [pendingAnimation, setPendingAnimation] = useState(false)

  const { displayText, isAnimating, skip } = useTypewriter({
    text: animationTarget,
    speed: 20,
    enabled: shouldAnimate,
  })

  const hasLyrics = lyrics.trim().length > 0
  const isConceptValid = concept.length >= 10 && concept.length <= 500
  const showGeneratedLyrics = !isCustomTextMode && hasLyrics

  // Only trigger typewriter when user explicitly clicks generate
  const handleGenerate = useCallback(async () => {
    setPendingAnimation(true)
    await onGenerateLyrics()
    // After generation, lyrics prop will update. We check in render below.
  }, [onGenerateLyrics])

  // If we have a pending animation and lyrics just appeared, start typewriter
  if (pendingAnimation && hasLyrics && !isGenerating) {
    setPendingAnimation(false)
    setAnimationTarget(lyrics)
    setShouldAnimate(true)
  }

  const handleResetDescription = () => {
    onLyricsChange('')
    setShouldAnimate(false)
    setAnimationTarget('')
  }

  const handleSkipAnimation = () => {
    skip()
  }

  // Show typewriter text during animation, otherwise actual lyrics
  const displayedLyrics = isAnimating ? displayText : lyrics

  return (
    <div className="space-y-5">
      {/* Pill toggle */}
      <div className="flex bg-[rgba(255,255,255,0.06)] rounded-full p-1 w-fit mx-auto">
        <button
          type="button"
          onClick={() => onCustomTextModeChange(false)}
          disabled={isGenerating}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
            !isCustomTextMode
              ? 'bg-[#F26522] text-white'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          KI genererer
        </button>
        <button
          type="button"
          onClick={() => onCustomTextModeChange(true)}
          disabled={isGenerating}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
            isCustomTextMode
              ? 'bg-[#F26522] text-white'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          Egen tekst
        </button>
      </div>

      {/* AI mode */}
      {!isCustomTextMode && (
        <>
          {!showGeneratedLyrics ? (
            <div className="space-y-3">
              {/* Concept textarea */}
              <div className="relative">
                <textarea
                  value={concept}
                  onChange={(e) => onConceptChange(e.target.value)}
                  placeholder="F.eks: En drikkevise til vorspiel om gjengen som alltid bestiller en øl til..."
                  maxLength={500}
                  disabled={isGenerating}
                  rows={5}
                  className={cn(
                    'w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)] px-4 py-3',
                    'text-sm text-white placeholder:text-gray-500 resize-none',
                    'focus:outline-none focus:border-[#F26522]/50 transition-colors',
                    isGenerating && 'opacity-50'
                  )}
                />
                <span className="absolute bottom-2 right-3 text-xs text-gray-500">
                  {concept.length}/500
                </span>
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!isConceptValid || isGenerating}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isConceptValid && !isGenerating
                    ? 'bg-[#F26522] text-white hover:bg-[#E05A1B] shadow-lg shadow-[#F26522]/20'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Genererer sangtekst...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generer sangtekst
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Generated lyrics textarea */}
              <div className="relative">
                <textarea
                  value={displayedLyrics}
                  onChange={(e) => {
                    if (!isAnimating) onLyricsChange(e.target.value)
                  }}
                  readOnly={isAnimating}
                  maxLength={2000}
                  className={cn(
                    'w-full min-h-[280px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)] px-4 py-3',
                    'text-sm text-white font-mono leading-relaxed resize-none whitespace-pre-wrap',
                    'focus:outline-none focus:border-[#F26522]/50 transition-colors',
                    isAnimating && 'cursor-pointer'
                  )}
                />
                {!isAnimating && (
                  <span className="absolute bottom-2 right-3 text-xs text-gray-500">
                    {lyrics.length}/2000
                  </span>
                )}
              </div>

              {/* Reset button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetDescription}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Ny beskrivelse
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom text mode */}
      {isCustomTextMode && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={lyrics}
              onChange={(e) => onLyricsChange(e.target.value)}
              placeholder={`Skriv din egen sangtekst her...\n\n[Verse 1]\nI morges våkna jeg\nOg tenkte på deg\n\n[Chorus]\nDu er min...`}
              maxLength={2000}
              rows={12}
              className={cn(
                'w-full min-h-[280px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)] px-4 py-3',
                'text-sm text-white font-mono leading-relaxed resize-none whitespace-pre-wrap',
                'focus:outline-none focus:border-[#F26522]/50 transition-colors'
              )}
            />
            <span className="absolute bottom-2 right-3 text-xs text-gray-500">
              {lyrics.length}/2000
            </span>
          </div>
        </div>
      )}

      <WizardNavButtons
        showBack={false}
        onNext={onNext}
        nextLabel="Neste: Velg stil →"
        nextDisabled={!hasLyrics}
      />
    </div>
  )
}
