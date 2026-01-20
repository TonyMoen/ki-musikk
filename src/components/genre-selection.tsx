'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { STANDARD_GENRES } from '@/lib/standard-genres'

// Default genres to display in 2x2 grid (reduces decision paralysis)
const DEFAULT_GENRES = ['Country', 'Norsk pop', 'Rap/Hip-Hop', 'Dans/Elektronisk']

interface GradientColors {
  from: string
  to: string
}

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string | null
  sort_order: number
  gradient_colors: GradientColors | null
  sunoPrompt?: string
}

// Type guard for gradient colors
function isGradientColors(value: unknown): value is GradientColors {
  return (
    typeof value === 'object' &&
    value !== null &&
    'from' in value &&
    'to' in value &&
    typeof (value as GradientColors).from === 'string' &&
    typeof (value as GradientColors).to === 'string'
  )
}

interface GenreSelectionProps {
  onGenreSelect?: (genreId: string, genreName: string, sunoPrompt?: string) => void
  defaultSelectedId?: string
  selectedGenreId?: string | null
  className?: string
}

export function GenreSelection({
  onGenreSelect,
  defaultSelectedId,
  selectedGenreId,
  className = ''
}: GenreSelectionProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promptText, setPromptText] = useState('')

  // Sync with parent's selectedGenreId (controlled mode)
  useEffect(() => {
    if (selectedGenreId !== undefined) {
      setSelectedId(selectedGenreId)
    }
  }, [selectedGenreId])

  // Fetch genres from database
  useEffect(() => {
    let isMounted = true

    async function fetchGenres() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('genre')
          .select('id, name, display_name, emoji, sort_order, gradient_colors')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (!isMounted) return

        if (error) {
          console.error('Failed to fetch genres:', error)
          setError('Kunne ikke laste sjangre. Vennligst prøv igjen.')
          setIsLoading(false)
          return
        }

        // Convert Supabase data to Genre type
        const convertedGenres: Genre[] = (data || []).map(row => ({
          ...row,
          gradient_colors: isGradientColors(row.gradient_colors) ? row.gradient_colors : null
        }))

        setGenres(convertedGenres)
        setIsLoading(false)

        // Auto-select first DEFAULT genre if none selected
        const defaultGenresList = convertedGenres.filter(g => DEFAULT_GENRES.includes(g.name)).slice(0, 4)
        if (!selectedId && defaultGenresList.length > 0) {
          const firstGenre = defaultGenresList[0]
          setSelectedId(firstGenre.id)
          onGenreSelect?.(firstGenre.id, firstGenre.name, '')
        }
      } catch (err) {
        if (!isMounted) return
        console.error('Unexpected error fetching genres:', err)
        setError('En uventet feil oppstod.')
        setIsLoading(false)
      }
    }

    fetchGenres()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenreClick = (genre: Genre) => {
    setSelectedId(genre.id)
    // Pre-fill prompt with genre's default prompt if available
    const defaultPrompt = genre.sunoPrompt || `${genre.display_name.toLowerCase()}, melodisk, norsk`
    setPromptText(defaultPrompt)
    onGenreSelect?.(genre.id, genre.name, defaultPrompt)
  }

  const handleStandardGenreClick = (stdGenre: typeof STANDARD_GENRES[0]) => {
    // Use standard genre's prompt
    setPromptText(stdGenre.sunoPrompt)
    // Find matching genre in database or use the standard genre id
    const matchingGenre = genres.find(g =>
      g.name.toLowerCase() === stdGenre.name.toLowerCase() ||
      g.display_name.toLowerCase() === stdGenre.display_name.toLowerCase()
    )
    if (matchingGenre) {
      setSelectedId(matchingGenre.id)
      onGenreSelect?.(matchingGenre.id, matchingGenre.name, stdGenre.sunoPrompt)
    } else {
      // Use standard genre as custom selection
      setSelectedId(stdGenre.id)
      onGenreSelect?.(stdGenre.id, stdGenre.name, stdGenre.sunoPrompt)
    }
  }

  const handlePromptChange = (newPrompt: string) => {
    setPromptText(newPrompt)
    // Notify parent of prompt change
    if (selectedId) {
      const selectedGenre = genres.find(g => g.id === selectedId)
      const genreName = selectedGenre?.name || 'Egendefinert'
      onGenreSelect?.(selectedId, genreName, newPrompt)
    }
  }

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[70px] rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  // Filter to show only 4 default genres (2x2 grid)
  const displayGenres = genres.filter(g => DEFAULT_GENRES.includes(g.name)).slice(0, 4)

  return (
    <div role="radiogroup" aria-label="Velg sjanger" className={`w-full ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="text-sm font-bold text-text-secondary uppercase tracking-wide">
          Velg sjanger
        </div>

        {/* Genre Grid - Fixed 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {displayGenres.map((genre) => {
            const isSelected = selectedId === genre.id
            const gradientFrom = genre.gradient_colors?.from || '#FF6B35'
            const gradientTo = genre.gradient_colors?.to || '#FF006E'

            return (
              <Button
                key={genre.id}
                onClick={() => handleGenreClick(genre)}
                variant={isSelected ? 'default' : 'outline'}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
                    : 'white',
                }}
                className={cn(
                  "relative h-[70px] w-full px-4 py-5 rounded-lg",
                  "text-[15px] font-bold",
                  "transition-all duration-200",
                  "flex items-center justify-center",
                  isSelected
                    ? 'border-[3px] border-primary text-white hover:opacity-90'
                    : 'border border-gray-300 text-gray-800 hover:border-primary/50 hover:bg-gray-50',
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
              >
                <span className="truncate">{genre.display_name}</span>
              </Button>
            )
          })}
        </div>

        {/* Standard Genre Quick-Add Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {STANDARD_GENRES.slice(0, 4).map((stdGenre) => (
            <button
              key={stdGenre.id}
              onClick={() => handleStandardGenreClick(stdGenre)}
              className={cn(
                "py-2 px-2 text-xs font-medium rounded-lg transition-all truncate",
                "bg-white border border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
              )}
              title={`Bruk ${stdGenre.display_name} prompt`}
            >
              + {stdGenre.display_name}
            </button>
          ))}
        </div>

        {/* Prompt Text Box */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Suno prompt (valgfritt)
          </label>
          <Textarea
            value={promptText}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Beskriv stilen du onsker, f.eks: pop, akustisk gitar, rolig, norsk vokal..."
            className="min-h-[80px] text-text-primary placeholder:text-text-secondary"
          />
          <p className="text-xs text-gray-500">
            Tips: Beskriv instrumenter, tempo, stemning og stil
          </p>
        </div>
      </div>
    </div>
  )
}
