'use client'

import { Loader2, RotateCcw, Dices, SlidersHorizontal, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGenreIcon } from '@/lib/genre-icons'

interface SmartReviewProps {
  lyrics: string
  onLyricsChange: (value: string) => void
  title: string
  genreDisplayName: string
  genreSunoPrompt: string
  onReset: () => void
  onRegenerate: () => Promise<void>
  onSwitchToTilpass: () => void
  onConfirm: () => Promise<void>
  isRegenerating: boolean
  isConfirming: boolean
}

/**
 * Smart-modus review screen: shows the picked genre, the editable lyrics,
 * and three action paths (reset / regenerate / switch to Tilpass) plus the
 * primary "Lag sangen min" CTA which triggers the auth gate + Suno call.
 *
 * The textarea is fully editable in place — same UX as the post-generation
 * state in step-lyrics.tsx, so the modes feel consistent.
 */
export function SmartReview({
  lyrics,
  onLyricsChange,
  title,
  genreDisplayName,
  genreSunoPrompt,
  onReset,
  onRegenerate,
  onSwitchToTilpass,
  onConfirm,
  isRegenerating,
  isConfirming,
}: SmartReviewProps) {
  const isBusy = isRegenerating || isConfirming
  const GenreIcon = getGenreIcon(genreDisplayName)

  // Show the leading slice of the technical Suno prompt as proof-of-work.
  // Truncate long prompts but keep enough context to read as concrete.
  const promptSnippet =
    genreSunoPrompt.length > 110
      ? `${genreSunoPrompt.slice(0, 110).trim()}…`
      : genreSunoPrompt

  return (
    <div className="space-y-5">
      {/* Genre badge */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(40,80,160,0.15)] border border-[rgba(90,140,255,0.1)]">
          <span className="text-xs uppercase tracking-wide text-[rgba(130,170,240,0.55)]">
            KI valgte
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-white">
            <GenreIcon className="h-3.5 w-3.5 text-[#F26522]" />
            {genreDisplayName}
          </span>
        </div>
        {promptSnippet && (
          <p className="text-xs font-mono text-[rgba(130,170,240,0.55)] text-center max-w-md px-3">
            {promptSnippet}
          </p>
        )}
      </div>

      {/* Title (read-only display, derived from lyrics) */}
      {title && title !== 'Uten tittel' && (
        <p className="text-base font-semibold text-white text-center">
          {title}
        </p>
      )}

      {/* Editable lyrics */}
      <div className="relative">
        <textarea
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          maxLength={2000}
          disabled={isBusy}
          className={cn(
            'w-full min-h-[280px] rounded-2xl border border-[rgba(90,140,255,0.1)] bg-[rgba(8,16,35,0.7)] px-4 py-3',
            'text-sm text-white font-mono leading-relaxed resize-none whitespace-pre-wrap',
            'focus:outline-none focus:border-[#F26522]/50 transition-colors',
            isBusy && 'opacity-50'
          )}
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-500">
          {lyrics.length}/2000
        </span>
      </div>

      {/* Secondary actions row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isBusy}
            className={cn(
              'flex items-center gap-1.5 text-[rgba(130,170,240,0.6)] hover:text-white transition-colors',
              isBusy && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Ny beskrivelse
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isBusy}
            className={cn(
              'flex items-center gap-1.5 text-[rgba(130,170,240,0.6)] hover:text-white transition-colors',
              isBusy && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isRegenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Dices className="h-3.5 w-3.5" />
            )}
            Prøv igjen
          </button>
        </div>
        <button
          type="button"
          onClick={onSwitchToTilpass}
          disabled={isBusy}
          className={cn(
            'flex items-center gap-1.5 text-[rgba(130,170,240,0.6)] hover:text-white transition-colors',
            isBusy && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Bytt til Tilpass
        </button>
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isBusy || lyrics.trim().length === 0}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all',
          !isBusy && lyrics.trim().length > 0
            ? 'bg-[#F26522] text-white hover:bg-[#E05A1B] shadow-lg shadow-[#F26522]/20'
            : 'bg-[rgba(40,80,160,0.15)] text-[rgba(180,200,240,0.5)] cursor-not-allowed'
        )}
      >
        {isConfirming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Lager sangen...
          </>
        ) : (
          <>
            <Music className="h-4 w-4" />
            Lag sangen min
          </>
        )}
      </button>

      <p className="text-xs text-center text-[rgba(130,170,240,0.45)]">
        Bruker 10 kreditter • Genereres på ca. 2 minutter
      </p>
    </div>
  )
}
