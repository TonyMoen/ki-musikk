'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useGeneratingSongStore, MAX_CONCURRENT_SONGS } from '@/stores/generating-song-store'
import { useCreditsStore } from '@/stores/credits-store'
import { isCustomGenre, getGenreSunoPrompt } from '@/lib/custom-genres-storage'
import { STANDARD_GENRES } from '@/lib/standard-genres'
import { WizardHeader } from './wizard-header'
import { StepIndicator } from './step-indicator'
import { StepLyrics } from './step-lyrics'
import { StepStyle } from './step-style'
import { StepReview } from './step-review'

const PENDING_SONG_KEY = 'kimusikk_pending_song'
const PENDING_SONG_TTL_MS = 30 * 60 * 1000 // 30 minutes

interface Genre {
  id: string
  name: string
  display_name: string
  emoji: string | null
  sort_order: number
  suno_prompt_template?: string
}

export function WizardContainer() {
  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Step 1 state
  const [isCustomTextMode, setIsCustomTextMode] = useState(false)
  const [concept, setConcept] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [originalLyrics, setOriginalLyrics] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Step 2 state
  const [selectedGenre, setSelectedGenre] = useState<{
    id: string
    name: string
  } | null>(null)
  const [styleText, setStyleText] = useState('')
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)

  // Step 3 state
  const [songTitle, setSongTitle] = useState('')
  const [isGeneratingSong, setIsGeneratingSong] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { showError } = useErrorToast()
  const { addGeneratingSong, canAddMoreSongs } = useGeneratingSongStore()

  // ------- localStorage persistence -------

  const savePendingSongData = () => {
    try {
      const hasData = selectedGenre || concept || lyrics || isCustomTextMode || styleText
      if (!hasData) return

      const dataToSave = {
        genre: selectedGenre,
        concept,
        lyrics,
        isCustomTextMode,
        generatedTitle,
        originalLyrics,
        currentStep,
        styleText,
        songTitle,
        savedAt: Date.now(),
      }
      localStorage.setItem(PENDING_SONG_KEY, JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Could not save pending song data:', e)
    }
  }

  // Restore on mount (only if within TTL)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PENDING_SONG_KEY)
      if (saved) {
        const data = JSON.parse(saved)

        // Discard if older than TTL
        if (data.savedAt && Date.now() - data.savedAt > PENDING_SONG_TTL_MS) {
          localStorage.removeItem(PENDING_SONG_KEY)
          return
        }

        if (data.genre) setSelectedGenre(data.genre)
        if (data.concept) setConcept(data.concept)
        if (data.lyrics) setLyrics(data.lyrics)
        if (data.isCustomTextMode !== undefined) setIsCustomTextMode(data.isCustomTextMode)
        if (data.generatedTitle) setGeneratedTitle(data.generatedTitle)
        if (data.originalLyrics) setOriginalLyrics(data.originalLyrics)
        if (data.currentStep && [1, 2, 3].includes(data.currentStep)) {
          setCurrentStep(data.currentStep as 1 | 2 | 3)
        }
        if (data.styleText) setStyleText(data.styleText)
        if (data.songTitle) setSongTitle(data.songTitle)
      }
    } catch (e) {
      console.warn('Could not restore pending song data:', e)
    }
  }, [])

  // Auto-save on state changes
  useEffect(() => {
    const hasData = selectedGenre || concept || lyrics || isCustomTextMode || styleText
    if (!hasData) return

    try {
      const dataToSave = {
        genre: selectedGenre,
        concept,
        lyrics,
        isCustomTextMode,
        generatedTitle,
        originalLyrics,
        currentStep,
        styleText,
        songTitle,
        savedAt: Date.now(),
      }
      localStorage.setItem(PENDING_SONG_KEY, JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Could not auto-save pending song data:', e)
    }
  }, [selectedGenre, concept, lyrics, isCustomTextMode, generatedTitle, originalLyrics, currentStep, styleText, songTitle])

  // Save on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePendingSongData()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  const resetWizard = () => {
    setCurrentStep(1)
    setIsCustomTextMode(false)
    setConcept('')
    setLyrics('')
    setOriginalLyrics('')
    setGeneratedTitle('')
    setSongTitle('')
    setSelectedGenre(null)
    setStyleText('')
    try {
      localStorage.removeItem(PENDING_SONG_KEY)
    } catch (e) {
      // Ignore
    }
  }

  // ------- Genre fetch -------

  useEffect(() => {
    let isMounted = true

    async function fetchGenres() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('genre')
          .select('id, name, display_name, emoji, sort_order, suno_prompt_template')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (!isMounted) return

        if (error) {
          console.error('Failed to fetch genres:', error)
          setIsLoadingGenres(false)
          return
        }

        setGenres((data || []) as Genre[])
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
  }, [])

  // ------- Step 1 handlers -------

  const handleGenerateLyrics = async () => {
    if (concept.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Konsept for kort',
        description: 'Konseptet må være minst 10 tegn',
      })
      return
    }

    if (concept.length > 500) {
      toast({
        variant: 'destructive',
        title: 'Konsept for langt',
        description: 'Konseptet kan ikke være mer enn 500 tegn',
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          genre: selectedGenre?.name || '',
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        if (response.status === 429) {
          showError(data, { context: 'lyric-generation' })
          return
        }
        throw new Error(data.error?.message || 'Kunne ikke generere tekst')
      }

      const generatedLyrics = data.data.lyrics
      const aiTitle = data.data.title
      setLyrics(generatedLyrics)
      setOriginalLyrics(generatedLyrics)
      setGeneratedTitle(aiTitle || '')

      toast({ title: 'Tekst generert!' })
    } catch (error) {
      showError(error, {
        context: 'lyric-generation',
        onRetry: handleGenerateLyrics,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLyricsChange = (newLyrics: string) => {
    setLyrics(newLyrics)
    setOriginalLyrics('')
  }

  // ------- Step 2 handlers -------

  const handleGenreSelect = (genreId: string, genreName: string) => {
    setSelectedGenre({ id: genreId, name: genreName })
  }

  // ------- Step 3 handler -------

  const handleGenerateSong = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      savePendingSongData()
      router.push('/auth/logg-inn')
      return
    }

    if (!canAddMoreSongs()) {
      toast({
        variant: 'destructive',
        title: `Maks ${MAX_CONCURRENT_SONGS} sanger samtidig`,
        description: 'Vent til en sang er ferdig før du starter en ny',
      })
      return
    }

    if (!selectedGenre) {
      toast({
        variant: 'destructive',
        title: 'Ingen sjanger valgt',
        description: 'Vennligst velg en sjanger før du genererer sang',
      })
      return
    }

    if (!lyrics || lyrics.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Ingen tekst',
        description: isCustomTextMode
          ? 'Vennligst skriv eller lim inn sangtekst'
          : 'Vennligst generer sangtekst først',
      })
      return
    }

    setIsGeneratingSong(true)

    const firstLine = lyrics.split('\n')[0]?.trim() || ''
    const finalTitle = songTitle.trim()
      || (isCustomTextMode
        ? firstLine.substring(0, 50) || 'Min egen sang'
        : generatedTitle || concept || 'Min sang')

    const songConcept = isCustomTextMode
      ? lyrics
          .split('\n')
          .filter((line) => line.trim())
          .slice(0, 2)
          .join(' ')
          .substring(0, 200) || 'Egendefinert sangtekst'
      : concept

    const baseLyrics = isCustomTextMode ? lyrics : originalLyrics || lyrics

    try {
      const customPrompt = isCustomGenre(selectedGenre.id)
        ? getGenreSunoPrompt(selectedGenre.id)
        : null

      const response = await fetch('/api/songs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          genre: isCustomGenre(selectedGenre.id) ? selectedGenre.id : selectedGenre.name,
          concept: songConcept,
          lyrics: baseLyrics,
          optimizedLyrics: null,
          phoneticEnabled: false,
          vocalGender: null,
          customGenrePrompt: customPrompt || undefined,
          sunoPrompt: styleText || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke starte generering')
      }

      addGeneratingSong({
        id: data.data.songId,
        title: finalTitle,
        genre: selectedGenre.name,
        startedAt: new Date(),
      })

      if (data.data.balanceAfter !== undefined) {
        useCreditsStore.getState().setBalance(data.data.balanceAfter)
      }

      try {
        localStorage.removeItem(PENDING_SONG_KEY)
      } catch (e) {
        // Ignore localStorage errors
      }

    } catch (error) {
      showError(error, {
        context: 'song-generation',
        onRetry: handleGenerateSong,
      })
    } finally {
      setIsGeneratingSong(false)
    }
  }

  // ------- Navigation -------

  const goToStep = (step: 1 | 2 | 3) => {
    // Pre-fill title when entering review step if empty
    if (step === 3 && !songTitle.trim()) {
      const firstLine = lyrics.split('\n')[0]?.trim() || ''
      const defaultTitle = isCustomTextMode
        ? firstLine.substring(0, 50) || ''
        : generatedTitle || concept || ''
      setSongTitle(defaultTitle)
    }
    setCurrentStep(step)
  }

  return (
    <div className="max-w-[640px] mx-auto pt-12 px-5">
      <div className="space-y-8">
        <WizardHeader />
        <div className="space-y-2">
          <StepIndicator currentStep={currentStep} onStepClick={goToStep} />
          {(currentStep > 1 || concept || lyrics || isCustomTextMode) && (
            <div className="text-center">
              <button
                type="button"
                onClick={resetWizard}
                className="text-xs text-[rgba(180,200,240,0.4)] hover:text-[rgba(180,200,240,0.7)] transition-colors"
              >
                Start på nytt
              </button>
            </div>
          )}
        </div>

        {/* Step content with fade-up animation */}
        <div key={currentStep} className="animate-fade-up">
          {currentStep === 1 && (
            <StepLyrics
              isCustomTextMode={isCustomTextMode}
              onCustomTextModeChange={setIsCustomTextMode}
              concept={concept}
              onConceptChange={setConcept}
              lyrics={lyrics}
              onLyricsChange={handleLyricsChange}
              onGenerateLyrics={handleGenerateLyrics}
              isGenerating={isGenerating}
              onNext={() => goToStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepStyle
              genres={genres}
              isLoadingGenres={isLoadingGenres}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
              styleText={styleText}
              onStyleTextChange={setStyleText}
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}

          {currentStep === 3 && (
            <StepReview
              lyrics={lyrics}
              selectedGenre={selectedGenre}
              styleText={styleText}
              songTitle={songTitle}
              onSongTitleChange={setSongTitle}
              isGeneratingSong={isGeneratingSong}
              onGoToStep={goToStep}
              onBack={() => goToStep(2)}
              onGenerate={handleGenerateSong}
            />
          )}
        </div>
      </div>
    </div>
  )
}
