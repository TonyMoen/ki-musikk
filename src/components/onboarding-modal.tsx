'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

interface GradientColors {
  from: string
  to: string
}

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string | null
  gradient_colors: GradientColors | null
}

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

interface SelectedGenre {
  id: string
  name: string
}

interface OnboardingModalProps {
  open: boolean
  onComplete: (selectedGenre: SelectedGenre | null, concept: string) => void
  onSkip: () => void
}

export function OnboardingModal({ open, onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [songConcept, setSongConcept] = useState('')
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)

  // Fetch genres from database
  useEffect(() => {
    if (!open) return

    let isMounted = true

    async function fetchGenres() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('genre')
          .select('id, name, display_name, emoji, gradient_colors')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (!isMounted) return

        if (error) {
          console.error('Failed to fetch genres:', error)
          setIsLoadingGenres(false)
          return
        }

        const convertedGenres: Genre[] = (data || []).map(row => ({
          ...row,
          gradient_colors: isGradientColors(row.gradient_colors) ? row.gradient_colors : null
        }))

        setGenres(convertedGenres)
        setIsLoadingGenres(false)
      } catch (err) {
        if (!isMounted) return
        console.error('Unexpected error fetching genres:', err)
        setIsLoadingGenres(false)
      }
    }

    fetchGenres()

    return () => {
      isMounted = false
    }
  }, [open])

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, genreId]
    })
  }

  const handleComplete = () => {
    // Get the first selected genre with its name
    const firstGenreId = selectedGenres[0]
    const firstGenre = firstGenreId
      ? genres.find(g => g.id === firstGenreId)
      : null
    const selectedGenre = firstGenre
      ? { id: firstGenre.id, name: firstGenre.name }
      : null
    onComplete(selectedGenre, songConcept)
  }

  const handleSkip = () => {
    onSkip()
  }

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setSelectedGenres([])
      setSongConcept('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {currentStep === 1 && 'Velkommen til KI MUSIKK! 🎵'}
            {currentStep === 2 && 'Hva handler sangen din om?'}
            {currentStep === 3 && 'Lag din første sang!'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStep === 1 && 'La oss lage din første norske sang på under 5 minutter.'}
            {currentStep === 2 && 'Beskriv kort hva sangen skal handle om.'}
            {currentStep === 3 && 'Du er klar til å lage din første sang!'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-8 rounded-full transition-colors ${
                step <= currentStep ? 'bg-[#E94560]' : 'bg-[rgba(20,40,80,0.35)]'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-[rgba(180,200,240,0.5)]">{currentStep} / 3</span>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] py-4">
          {/* Screen 1: Genre Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                Velg dine favorittsjangre
              </h3>
              <p className="text-sm text-[rgba(180,200,240,0.5)] text-center">
                {selectedGenres.length} av 3 valgt
              </p>

              {isLoadingGenres ? (
                <div className="flex flex-wrap gap-3 justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-32 rounded-lg bg-[rgba(20,40,80,0.35)] animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 justify-center">
                  {genres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id)
                    const gradientFrom = genre.gradient_colors?.from || '#E94560'
                    const gradientTo = genre.gradient_colors?.to || '#FFC93C'
                    const canSelect = selectedGenres.length < 3 || isSelected

                    return (
                      <button
                        key={genre.id}
                        onClick={() => canSelect && handleGenreToggle(genre.id)}
                        disabled={!canSelect}
                        className={`
                          relative min-h-[48px] px-4 py-2 rounded-lg
                          transition-all duration-200
                          flex items-center gap-2
                          ${
                            isSelected
                              ? 'text-white border-2 border-white shadow-lg'
                              : canSelect
                              ? 'border border-[rgba(90,140,255,0.13)] text-[rgba(180,200,240,0.5)] hover:bg-[rgba(40,80,160,0.15)]'
                              : 'border border-[rgba(90,140,255,0.1)] text-[rgba(130,170,240,0.45)] cursor-not-allowed'
                          }
                          focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:ring-offset-2
                        `}
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
                            : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <Check className="absolute -top-2 -right-2 h-5 w-5 bg-white rounded-full text-[#E94560] p-0.5" />
                        )}
                        <span className="text-xl" role="img" aria-label={genre.display_name}>
                          {genre.emoji}
                        </span>
                        <span className="font-medium text-sm">{genre.display_name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Screen 2: Song Concept Input */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-[#E94560]" />
              </div>

              <Textarea
                value={songConcept}
                onChange={(e) => setSongConcept(e.target.value)}
                placeholder="Bursdagssang til en venn som elsker å fiske..."
                className="min-h-[120px] text-base resize-none"
                maxLength={500}
              />

              <p className="text-sm text-[rgba(180,200,240,0.5)] text-right">
                {songConcept.length} / 500 tegn
              </p>

              <div className="bg-[rgba(20,40,80,0.35)] rounded-lg p-4">
                <p className="text-sm text-[rgba(180,200,240,0.5)]">
                  <strong>Tips:</strong> Jo mer detaljer du gir, jo bedre blir sangen!
                  Inkluder gjerne navn, hobbyer, eller morsomme detaljer.
                </p>
              </div>
            </div>
          )}

          {/* Screen 3: Generate First Song */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-gradient-to-r from-[#E94560] to-[#FFC93C] p-4">
                  <AppLogo size={48} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">Alt er klart!</p>
                <p className="text-[rgba(180,200,240,0.5)]">
                  Vi har det vi trenger for å lage din første sang.
                </p>
              </div>

              <div className="bg-[rgba(20,40,80,0.35)] rounded-lg p-4 text-left">
                <h4 className="font-semibold mb-2">Dine valg:</h4>
                <ul className="space-y-1 text-sm text-[rgba(180,200,240,0.5)]">
                  <li>
                    🎸 Sjangre:{' '}
                    {selectedGenres.length > 0
                      ? genres
                          .filter((g) => selectedGenres.includes(g.id))
                          .map((g) => g.display_name)
                          .join(', ')
                      : 'Ingen valgt'}
                  </li>
                  <li>
                    💭 Konsept:{' '}
                    {songConcept
                      ? songConcept.length > 50
                        ? songConcept.substring(0, 50) + '...'
                        : songConcept
                      : 'Ikke angitt'}
                  </li>
                </ul>
              </div>

              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-300">
                  <strong>🎁 Du har 5 gratis sanger!</strong>
                  <br />
                  Trykk Start for å lage din første sang nå.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-[rgba(180,200,240,0.5)] hover:text-[rgba(180,200,240,0.5)]"
          >
            Hopp over
          </Button>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Tilbake
              </Button>
            )}

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Neste
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-[#E94560] hover:bg-[#D62839]"
              >
                <AppLogo size={16} className="mr-2" />
                Start
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
