'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, Pencil, Sparkles } from 'lucide-react'
import { useSnackbar } from '@/hooks/use-snackbar'
import { Snackbar } from '@/components/snackbar'
import { AIAssistantModal } from '@/components/ai-assistant/modal'
import { EditPromptModal } from '@/components/ai-assistant/edit-prompt-modal'
import {
  getCustomGenres,
  saveCustomGenre,
  updateCustomGenre,
  isCustomGenre,
  type CustomGenreData
} from '@/lib/custom-genres-storage'

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
  onGenreSelect?: (genreId: string, genreName: string) => void
  defaultSelectedId?: string
  selectedGenreId?: string | null  // Controlled mode - sync with parent
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
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [removedGenre, setRemovedGenre] = useState<Genre | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [editingGenreId, setEditingGenreId] = useState<string | null>(null)
  const [showEditPrompt, setShowEditPrompt] = useState(false)

  const snackbar = useSnackbar()

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
        const { data, error} = await supabase
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

        // Convert Supabase data to Genre type with proper gradient_colors typing
        const convertedGenres: Genre[] = (data || []).map(row => ({
          ...row,
          gradient_colors: isGradientColors(row.gradient_colors) ? row.gradient_colors : null
        }))

        // Load custom genres from localStorage and merge with database genres
        const customGenres = getCustomGenres()
        const customGenreObjects: Genre[] = customGenres.map(cg => ({
          id: cg.id,
          name: cg.name,
          display_name: cg.display_name,
          emoji: null,
          sort_order: 999,
          gradient_colors: {
            from: '#FF6B35',
            to: '#7C3AED'
          }
        }))

        const allGenres = [...convertedGenres, ...customGenreObjects]
        setGenres(allGenres)
        setIsLoading(false)

        // Auto-select first DEFAULT genre if none selected
        const defaultGenresList = allGenres.filter(g => DEFAULT_GENRES.includes(g.name)).slice(0, 4)
        if (!selectedId && defaultGenresList.length > 0) {
          setSelectedId(defaultGenresList[0].id)
          onGenreSelect?.(defaultGenresList[0].id, defaultGenresList[0].name)
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

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const removeGenre = (genreId: string) => {
    if (!editMode) return

    const genreToRemove = genres.find(g => g.id === genreId)
    if (!genreToRemove) return

    // Store reference for undo
    setRemovedGenre(genreToRemove)

    // Archive genre (soft delete - remove from display)
    const updatedGenres = genres.filter(g => g.id !== genreId)
    setGenres(updatedGenres)

    // Show snackbar with undo callback
    snackbar.show(
      `${genreToRemove.display_name} arkivert`,
      () => restoreGenre(genreToRemove)
    )

    // TODO: In Story 4, archived genres will be stored for restore
    console.log(`Genre ${genreId} archived`)
  }

  const restoreGenre = (genre: Genre) => {
    // Restore genre to array
    setGenres([...genres, genre])
    setRemovedGenre(null)
    console.log(`Genre ${genre.id} restored`)
  }

  const handleSaveCustomGenre = (customGenre: {
    id: string
    name: string
    display_name: string
    sunoPrompt: string
    createdAt: Date
    isCustom: true
  }) => {
    // Check if this is an update or new genre
    const isUpdate = editingGenreId !== null

    if (isUpdate) {
      // Update existing genre
      const genreData: CustomGenreData = {
        id: customGenre.id,
        name: customGenre.name,
        display_name: customGenre.display_name,
        sunoPrompt: customGenre.sunoPrompt,
        createdAt: customGenre.createdAt.toISOString(),
        updatedAt: new Date().toISOString()
      }

      updateCustomGenre(editingGenreId, genreData)

      // Update in UI
      setGenres(genres.map(g =>
        g.id === editingGenreId
          ? { ...g, name: customGenre.name, display_name: customGenre.display_name }
          : g
      ))

      snackbar.show(`${customGenre.display_name} oppdatert!`, () => {})
      setEditingGenreId(null)
    } else {
      // Save new custom genre to localStorage
      const genreData: CustomGenreData = {
        id: customGenre.id,
        name: customGenre.name,
        display_name: customGenre.display_name,
        sunoPrompt: customGenre.sunoPrompt,
        createdAt: customGenre.createdAt.toISOString()
      }

      saveCustomGenre(genreData)

      // Convert custom genre to Genre interface format for UI
      const newGenre: Genre = {
        id: customGenre.id,
        name: customGenre.name,
        display_name: customGenre.display_name,
        emoji: null,
        sort_order: 999,
        gradient_colors: {
          from: '#FF6B35',
          to: '#7C3AED'
        }
      }

      // Add to genres list
      setGenres([...genres, newGenre])

      // Auto-select the new genre
      setSelectedId(newGenre.id)
      onGenreSelect?.(newGenre.id, newGenre.name)

      snackbar.show(`${newGenre.display_name} opprettet!`, () => {})
    }
  }

  const handleEditCustomGenre = (genreId: string) => {
    setEditingGenreId(genreId)
    setShowEditPrompt(true)
  }

  const handleUpdateGenrePrompt = (genreName: string, sunoPrompt: string) => {
    if (!editingGenreId) return

    // Update in localStorage
    updateCustomGenre(editingGenreId, {
      display_name: genreName,
      name: genreName,
      sunoPrompt: sunoPrompt
    })

    // Update in UI
    setGenres(genres.map(g =>
      g.id === editingGenreId
        ? { ...g, name: genreName, display_name: genreName }
        : g
    ))

    snackbar.show(`${genreName} oppdatert!`, () => {})
    setEditingGenreId(null)
  }

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="grid grid-cols-2 gap-3">
          {/* Loading skeleton - 4 items in 2x2 grid */}
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
  const displayGenres = showAllGenres
    ? genres
    : genres.filter(g => DEFAULT_GENRES.includes(g.name)).slice(0, 4)

  return (
    <div role="radiogroup" aria-label="Velg sjanger" className={`w-full ${className}`}>
      <div className="space-y-3">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wide">
            Velg sjanger
          </div>
          <button
            onClick={toggleEditMode}
            className={cn(
              "px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all",
              "border border-border hover:border-border-focus",
              editMode
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-text-secondary"
            )}
          >
            {editMode ? 'Ferdig' : 'Rediger'}
          </button>
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
                onClick={() => !editMode && handleGenreClick(genre)}
                onKeyDown={(e) => handleKeyDown(e, genre)}
                variant={isSelected ? 'default' : 'outline'}
                disabled={editMode}
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
                  editMode && "cursor-not-allowed opacity-75",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
              >
                <span className="truncate">{genre.display_name}</span>

                {/* Custom genre indicator */}
                {isCustomGenre(genre.id) && !editMode && (
                  <Sparkles className="absolute top-2 right-2 w-4 h-4 text-primary" />
                )}

                {/* Edit Button (Pencil) - Only for custom genres, only in edit mode */}
                {editMode && isCustomGenre(genre.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditCustomGenre(genre.id)
                    }}
                    className={cn(
                      "absolute top-2 right-10 w-6 h-6 rounded-full",
                      "bg-blue-600 hover:bg-blue-700 flex items-center justify-center",
                      "transition-all hover:scale-110"
                    )}
                    aria-label={`Rediger ${genre.display_name}`}
                  >
                    <Pencil className="w-3 h-3 text-white" />
                  </button>
                )}

                {/* Remove Button (X) - Only shown in edit mode */}
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeGenre(genre.id)
                    }}
                    className={cn(
                      "absolute top-2 right-2 w-6 h-6 rounded-full",
                      "bg-red-600 hover:bg-red-700 flex items-center justify-center",
                      "transition-all hover:scale-110"
                    )}
                    aria-label={`Fjern ${genre.display_name}`}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </Button>
            )
          })}
        </div>

        {/* Add Genre Button */}
        {!showAllGenres && (
          <Button
            variant="outline"
            onClick={() => setShowAIAssistant(true)}
            className="w-full h-[52px] border-2 border-dashed border-border-focus hover:bg-surface hover:border-primary/50 transition-all"
          >
            + Legg til sjanger
          </Button>
        )}
      </div>

      {/* Undo Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        onUndo={snackbar.handleUndo}
        onDismiss={snackbar.hide}
      />

      {/* AI Assistant Modal - For creating new genres */}
      <AIAssistantModal
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onSaveGenre={handleSaveCustomGenre}
      />

      {/* Edit Prompt Modal - For editing existing custom genres */}
      {editingGenreId && (
        <EditPromptModal
          open={showEditPrompt}
          onClose={() => {
            setShowEditPrompt(false)
            setEditingGenreId(null)
          }}
          genreId={editingGenreId}
          onSave={handleUpdateGenrePrompt}
        />
      )}
    </div>
  )
}
