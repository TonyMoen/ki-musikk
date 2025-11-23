'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string | null
  sort_order: number
}

interface GenreSelectionProps {
  onGenreSelect?: (genreId: string, genreName: string) => void
  defaultSelectedId?: string
  className?: string
}

export function GenreSelection({
  onGenreSelect,
  defaultSelectedId,
  className = ''
}: GenreSelectionProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch genres from database
  useEffect(() => {
    let isMounted = true

    async function fetchGenres() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('genre')
          .select('id, name, display_name, emoji, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (!isMounted) return

        if (error) {
          console.error('Failed to fetch genres:', error)
          setError('Kunne ikke laste sjangre. Vennligst prøv igjen.')
          setIsLoading(false)
          return
        }

        setGenres(data || [])
        setIsLoading(false)

        // Auto-select first genre if none selected
        if (!selectedId && data && data.length > 0) {
          setSelectedId(data[0].id)
          onGenreSelect?.(data[0].id, data[0].name)
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
  }, []) // Only run on mount - onGenreSelect and selectedId intentionally excluded

  const handleGenreClick = (genre: Genre) => {
    setSelectedId(genre.id)
    onGenreSelect?.(genre.id, genre.name)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, genre: Genre) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleGenreClick(genre)
    }
  }

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {/* Loading skeleton */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="min-h-[44px] w-[140px] rounded-lg bg-gray-200 animate-pulse"
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

  return (
    <div role="radiogroup" aria-label="Velg sjanger" className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {genres.map((genre) => {
          const isSelected = selectedId === genre.id
          return (
            <Button
              key={genre.id}
              onClick={() => handleGenreClick(genre)}
              onKeyDown={(e) => handleKeyDown(e, genre)}
              variant={isSelected ? 'default' : 'outline'}
              className={`
                min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg
                transition-all duration-200
                flex items-center gap-2
                ${
                  isSelected
                    ? 'border-[3px] border-[#E94560] bg-[#E94560] text-white hover:bg-[#E94560]/90'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:ring-offset-2
              `}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
            >
              <span className="text-2xl" role="img" aria-label={genre.display_name}>
                {genre.emoji}
              </span>
              <span className="font-medium text-sm md:text-base">{genre.display_name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
