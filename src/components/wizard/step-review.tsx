'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

interface StepReviewProps {
  lyrics: string
  selectedGenre: { id: string; name: string } | null
  styleText: string
  isGeneratingSong: boolean
  onGoToStep: (step: 1 | 2 | 3) => void
  onBack: () => void
  onGenerate: () => void
}

export function StepReview({
  lyrics,
  selectedGenre,
  styleText,
  isGeneratingSong,
  onGoToStep,
  onBack,
  onGenerate,
}: StepReviewProps) {
  // Show first ~5 lines of lyrics with gradient fade
  const previewLines = lyrics.split('\n').slice(0, 5).join('\n')
  const hasMoreLines = lyrics.split('\n').length > 5

  return (
    <div className="space-y-5">
      {/* Lyrics summary card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Sangtekst
          </p>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-xs text-[#F26522] hover:text-[#F26522]/80 transition-colors font-medium"
          >
            Rediger
          </button>
        </div>
        <div className="relative">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
            {previewLines}
          </pre>
          {hasMoreLines && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[rgba(255,255,255,0.03)] to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Style summary card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Stil & sjanger
          </p>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="text-xs text-[#F26522] hover:text-[#F26522]/80 transition-colors font-medium"
          >
            Rediger
          </button>
        </div>
        {selectedGenre && (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#F26522]/15 text-[#F26522] border border-[#F26522]/20">
            {selectedGenre.name}
          </span>
        )}
        {styleText && (
          <p className="text-sm text-gray-300">{styleText}</p>
        )}
      </div>

      {/* Navigation + Generate */}
      <div className="flex justify-between gap-3 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-xl"
        >
          ← Tilbake
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGeneratingSong}
          className={cn(
            'relative px-8 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden',
            isGeneratingSong
              ? 'bg-[#F26522]/70 text-white cursor-wait'
              : 'bg-[#F26522] text-white hover:bg-[#E05A1B] shadow-lg shadow-[#F26522]/20'
          )}
        >
          {/* Shimmer overlay when generating */}
          {isGeneratingSong && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
          <span className="relative flex items-center gap-2">
            {isGeneratingSong ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starter generering...
              </>
            ) : (
              <>
                <AppLogo size={16} />
                Lag sang
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
