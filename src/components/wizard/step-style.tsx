'use client'

import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { STANDARD_GENRES } from '@/lib/standard-genres'
import { FEATURES } from '@/lib/constants'
import { WizardNavButtons } from './wizard-nav-buttons'
import { getGenreIcon } from '@/lib/genre-icons'

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string | null
  sort_order: number
  suno_prompt_template?: string
}

interface StepStyleProps {
  genres: Genre[]
  isLoadingGenres: boolean
  selectedGenre: { id: string; name: string } | null
  onGenreSelect: (genreId: string, genreName: string) => void
  styleText: string
  onStyleTextChange: (text: string) => void
  onBack: () => void
  onNext: () => void
}

export function StepStyle({
  genres,
  isLoadingGenres,
  selectedGenre,
  onGenreSelect,
  styleText,
  onStyleTextChange,
  onBack,
  onNext,
}: StepStyleProps) {
  const handleGenreClick = (genre: Genre) => {
    onGenreSelect(genre.id, genre.name)

    // Use the Suno prompt from DB first, then fall back to STANDARD_GENRES match
    if (genre.suno_prompt_template) {
      onStyleTextChange(genre.suno_prompt_template)
    } else {
      const match = STANDARD_GENRES.find(
        (sg) =>
          sg.name.toLowerCase() === genre.name.toLowerCase() ||
          sg.display_name.toLowerCase() === genre.display_name.toLowerCase()
      )
      onStyleTextChange(match?.sunoPrompt || `${genre.display_name.toLowerCase()}, melodisk, norsk`)
    }
  }

  return (
    <div className="space-y-5">
      {/* Genre grid */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[var(--ink-3)] uppercase tracking-wider">
          Velg sjanger
        </p>

        {isLoadingGenres ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[56px] rounded-xl bg-[var(--surface)] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {genres.map((genre) => {
              const isSelected = selectedGenre?.id === genre.id
              const Icon = getGenreIcon(genre.display_name)
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreClick(genre)}
                  className={cn(
                    'h-[56px] rounded-xl px-4 text-sm font-semibold transition-all duration-200',
                    'flex items-center justify-center gap-2',
                    isSelected
                      ? 'border-2 border-[#F26522] bg-[#F26522]/10 text-[var(--ink)]'
                      : 'border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isSelected ? 'text-[#F26522]' : 'text-[var(--ink-3)]'
                  )} />
                  {genre.display_name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-soft)]" />

      {/* Style textarea */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--ink-3)] uppercase tracking-wider">
          Stil / prompt
        </p>
        <div className="relative">
          <textarea
            value={styleText}
            onChange={(e) => onStyleTextChange(e.target.value)}
            placeholder="Beskriv stilen du ønsker, f.eks: pop, akustisk gitar, rolig, norsk vokal..."
            maxLength={500}
            rows={3}
            className={cn(
              'w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3',
              'text-sm text-[var(--ink)] placeholder:text-[var(--ink-4)] resize-none',
              'focus:outline-none focus:border-[#F26522]/50 transition-colors'
            )}
          />
          <span className="absolute bottom-2 right-3 text-xs text-[var(--ink-4)]">
            {styleText.length}/500
          </span>
        </div>
        <p className="text-xs text-[var(--ink-2)]">
          Tips: Beskriv instrumenter, tempo, stemning og stil. Velg en sjanger over <em>eller</em> skriv en helt egen stil.
        </p>
      </div>

      {/* AI Genre Assistant - hidden behind feature flag */}
      {FEATURES.ENABLE_AI_GENRE_ASSISTANT && (
        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#F26522] border-2 border-dashed border-[#F26522]/40 rounded-xl hover:bg-[#F26522]/5 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Lag egen sjanger med AI
          </button>
        </div>
      )}

      <WizardNavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="Neste: Se oppsummering →"
        nextDisabled={!selectedGenre && !styleText.trim()}
      />
    </div>
  )
}
