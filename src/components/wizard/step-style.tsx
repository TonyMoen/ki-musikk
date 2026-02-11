'use client'

import { cn } from '@/lib/utils'
import { Sparkles, Guitar, Mic2, Radio, Headphones, Heart, Waves, Drum, Piano } from 'lucide-react'
import { STANDARD_GENRES } from '@/lib/standard-genres'
import { FEATURES } from '@/lib/constants'
import { WizardNavButtons } from './wizard-nav-buttons'
import type { LucideIcon } from 'lucide-react'

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string | null
  sort_order: number
  suno_prompt_template?: string
}

// Map genre names (lowercase) to Lucide icons
const GENRE_ICON_MAP: Record<string, LucideIcon> = {
  'elektronisk': Headphones,
  'festlåt': Drum,
  'rap/hip-hop': Mic2,
  'russelåt': Headphones,
  'pop': Radio,
  'rock': Guitar,
  'country': Guitar,
  'akustisk': Heart,
  // Legacy / fallback mappings
  'rap': Mic2,
  'hip-hop': Mic2,
  'edm': Headphones,
  'jazz': Piano,
  'folk': Guitar,
  'ballad': Heart,
  'klassisk': Piano,
  'metal': Radio,
  'blues': Guitar,
}

function getGenreIcon(genreName: string): LucideIcon {
  return GENRE_ICON_MAP[genreName.toLowerCase()] || Headphones
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
        <p className="text-xs font-semibold text-[rgba(130,170,240,0.45)] uppercase tracking-wider">
          Velg sjanger
        </p>

        {isLoadingGenres ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[56px] rounded-xl bg-[rgba(20,40,80,0.35)] animate-pulse"
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
                      ? 'border-2 border-[#F26522] bg-[#F26522]/10 text-white'
                      : 'border border-[rgba(90,140,255,0.1)] bg-[rgba(20,40,80,0.35)] text-[rgba(180,200,240,0.5)] hover:border-[rgba(90,140,255,0.13)] hover:bg-[rgba(40,80,160,0.15)]'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isSelected ? 'text-[#F26522]' : 'text-[rgba(130,170,240,0.45)]'
                  )} />
                  {genre.display_name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(90,140,255,0.1)]" />

      {/* Style textarea */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[rgba(130,170,240,0.45)] uppercase tracking-wider">
          Stil / prompt
        </p>
        <div className="relative">
          <textarea
            value={styleText}
            onChange={(e) => onStyleTextChange(e.target.value)}
            placeholder="Beskriv stilen du ønsker, f.eks: pop, akustisk gitar, rolig, norsk vokal..."
            maxLength={1000}
            rows={3}
            className={cn(
              'w-full rounded-2xl border border-[rgba(90,140,255,0.1)] bg-[rgba(8,16,35,0.7)] px-4 py-3',
              'text-sm text-white placeholder:text-[rgba(130,170,240,0.25)] resize-none',
              'focus:outline-none focus:border-[#F26522]/50 transition-colors'
            )}
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-500">
            {styleText.length}/1000
          </span>
        </div>
        <p className="text-xs text-[rgba(180,200,240,0.5)]">
          Tips: Beskriv instrumenter, tempo, stemning og stil
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
        nextDisabled={!selectedGenre}
      />
    </div>
  )
}
