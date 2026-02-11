'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GenreSelection } from '@/components/genre-selection'
import { VoiceGenderSelector, type VocalGender } from '@/components/voice-gender-selector'
import { LyricsInputSection } from '@/components/lyrics-input-section'
import { PhoneticDiffViewer } from '@/components/phonetic-diff-viewer'
import { OnboardingModal } from '@/components/onboarding-modal'
import { HomepageSongs } from '@/components/homepage-songs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useGeneratingSongStore, MAX_CONCURRENT_SONGS } from '@/stores/generating-song-store'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Music } from 'lucide-react'
import type { OptimizationResult, PhoneticChange } from '@/types/song'
import { FEATURES } from '@/lib/constants'
import { getGenreSunoPrompt, isCustomGenre } from '@/lib/custom-genres-storage'

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<{
    id: string
    name: string
  } | null>(null)
  const [concept, setConcept] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [originalLyrics, setOriginalLyrics] = useState('')
  const [optimizedLyrics, setOptimizedLyrics] = useState('')
  const [phoneticChanges, setPhoneticChanges] = useState<PhoneticChange[]>([])
  const [pronunciationEnabled, setPronunciationEnabled] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isDiffViewerOpen, setIsDiffViewerOpen] = useState(false)
  const [isGeneratingSong, setIsGeneratingSong] = useState(false)
  const [showGenreSpotlight, setShowGenreSpotlight] = useState(false)
  const [vocalGender, setVocalGender] = useState<VocalGender>(null)
  const [isCustomTextMode, setIsCustomTextMode] = useState(false)
  const router = useRouter()
  const [generatedTitle, setGeneratedTitle] = useState('')
  const { toast } = useToast()
  const { showError } = useErrorToast()
  const { showOnboarding, completeOnboarding, isLoading: isOnboardingLoading } = useOnboarding()
  const { addGeneratingSong, generatingSongs, canAddMoreSongs } = useGeneratingSongStore()

  const PENDING_SONG_KEY = 'kimusikk_pending_song'

  // Helper function to save form state immediately (used before login redirect)
  const savePendingSongData = () => {
    try {
      const hasData = selectedGenre || concept || lyrics || isCustomTextMode || vocalGender
      if (!hasData) return

      const dataToSave = {
        genre: selectedGenre,
        concept,
        lyrics,
        isCustomTextMode,
        vocalGender,
        generatedTitle,
        originalLyrics
      }
      localStorage.setItem(PENDING_SONG_KEY, JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Could not save pending song data:', e)
    }
  }

  // Restore pending song data from localStorage after login
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PENDING_SONG_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.genre) setSelectedGenre(data.genre)
        if (data.concept) setConcept(data.concept)
        if (data.lyrics) setLyrics(data.lyrics)
        if (data.isCustomTextMode !== undefined) setIsCustomTextMode(data.isCustomTextMode)
        if (data.vocalGender !== undefined) setVocalGender(data.vocalGender)
        if (data.generatedTitle) setGeneratedTitle(data.generatedTitle)
        if (data.originalLyrics) setOriginalLyrics(data.originalLyrics)
        // Clear after restoring
        localStorage.removeItem(PENDING_SONG_KEY)
      }
    } catch (e) {
      console.warn('Could not restore pending song data:', e)
    }
  }, [])

  // Auto-save form state to localStorage immediately when data changes
  // This ensures state is preserved when user navigates to login via header/nav
  useEffect(() => {
    const hasData = selectedGenre || concept || lyrics || isCustomTextMode || vocalGender
    if (!hasData) return

    // Save immediately (no debounce) to ensure data isn't lost on navigation
    try {
      const dataToSave = {
        genre: selectedGenre,
        concept,
        lyrics,
        isCustomTextMode,
        vocalGender,
        generatedTitle,
        originalLyrics
      }
      localStorage.setItem(PENDING_SONG_KEY, JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Could not auto-save pending song data:', e)
    }
  }, [selectedGenre, concept, lyrics, isCustomTextMode, vocalGender, generatedTitle, originalLyrics])

  // Backup: save on page unload (handles browser back/refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePendingSongData()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  const handleGenreSelect = (genreId: string, genreName: string) => {
    setSelectedGenre({ id: genreId, name: genreName })
  }

  const handleOptimizePronunciation = async (lyricsToOptimize: string) => {
    setIsOptimizing(true)

    try {
      const response = await fetch('/api/lyrics/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lyrics: lyricsToOptimize
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke optimalisere uttale')
      }

      const result: OptimizationResult = data.data

      setOriginalLyrics(result.originalLyrics)
      setOptimizedLyrics(result.optimizedLyrics)
      setPhoneticChanges(result.changes)

      // Open diff viewer so user can review and choose which changes to keep
      if (result.changes.length > 0) {
        setIsDiffViewerOpen(true)
      } else {
        toast({
          title: 'Ingen endringer nødvendig',
          description: 'Teksten er allerede optimalisert for norsk uttale'
        })
      }
    } catch (error) {
      showError(error, {
        context: 'pronunciation-optimization',
        onRetry: () => handleOptimizePronunciation(lyricsToOptimize)
      })

      // Fallback: use original lyrics
      setOriginalLyrics(lyricsToOptimize)
      setOptimizedLyrics(lyricsToOptimize)
      setLyrics(lyricsToOptimize)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleGenerateLyrics = async () => {
    if (!selectedGenre) {
      toast({
        variant: 'destructive',
        title: 'Ingen sjanger valgt',
        description: 'Vennligst velg en sjanger for du genererer tekst'
      })
      return
    }

    if (concept.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Konsept for kort',
        description: 'Konseptet ma vaere minst 10 tegn'
      })
      return
    }

    if (concept.length > 500) {
      toast({
        variant: 'destructive',
        title: 'Konsept for langt',
        description: 'Konseptet kan ikke vaere mer enn 500 tegn'
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concept,
          genre: selectedGenre.name
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke generere tekst')
      }

      const generatedLyrics = data.data.lyrics
      const aiTitle = data.data.title
      setLyrics(generatedLyrics)
      setOriginalLyrics(generatedLyrics)
      setGeneratedTitle(aiTitle || '')

      toast({
        title: 'Tekst generert!',
        description: 'Klikk "Optimaliser tekst" for å forbedre uttalen'
      })
    } catch (error) {
      showError(error, {
        context: 'lyric-generation',
        onRetry: handleGenerateLyrics
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePronunciationToggle = (enabled: boolean) => {
    setPronunciationEnabled(enabled)

    // If we have both versions, switch between them
    if (originalLyrics && optimizedLyrics) {
      setLyrics(enabled ? optimizedLyrics : originalLyrics)

      toast({
        title: enabled ? 'Norsk uttale aktivert' : 'Norsk uttale deaktivert',
        description: enabled
          ? 'Viser optimalisert tekst for autentisk uttale'
          : 'Viser original tekst'
      })
    }
  }

  const handleLyricsChange = (newLyrics: string) => {
    setLyrics(newLyrics)
    // Reset optimized versions when user manually edits
    setOriginalLyrics('')
    setOptimizedLyrics('')
    setPhoneticChanges([])
  }

  const handleOpenDiffViewer = () => {
    setIsDiffViewerOpen(true)
  }

  const handleCloseDiffViewer = () => {
    setIsDiffViewerOpen(false)
  }

  const handleAcceptChanges = (mergedLyrics: string) => {
    setLyrics(mergedLyrics)
    setOptimizedLyrics(mergedLyrics)
    setIsDiffViewerOpen(false)

    toast({
      title: 'Endringer godtatt',
      description: 'Fonetiske optimaliseringer er anvendt'
    })
  }

  const handleRevertChanges = () => {
    setLyrics(originalLyrics)
    setOptimizedLyrics(originalLyrics)
    setPronunciationEnabled(false)
    setIsDiffViewerOpen(false)

    toast({
      title: 'Tilbakestilt til original',
      description: 'Bruker original tekst uten optimalisering'
    })
  }

  const handleReoptimize = async () => {
    if (lyrics && lyrics.trim().length > 0) {
      await handleOptimizePronunciation(lyrics)
    }
  }

  const handleGenerateSong = async () => {
    // Check if user is logged in first
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Save form state before redirecting to login
      savePendingSongData()
      router.push('/auth/logg-inn')
      return
    }

    // Check if at max concurrent generations
    if (!canAddMoreSongs()) {
      toast({
        variant: 'destructive',
        title: `Maks ${MAX_CONCURRENT_SONGS} sanger samtidig`,
        description: 'Vent til en sang er ferdig før du starter en ny'
      })
      return
    }

    if (!selectedGenre) {
      toast({
        variant: 'destructive',
        title: 'Ingen sjanger valgt',
        description: 'Vennligst velg en sjanger før du genererer sang'
      })
      return
    }

    if (!lyrics || lyrics.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Ingen tekst',
        description: isCustomTextMode
          ? 'Vennligst skriv eller lim inn sangtekst'
          : 'Vennligst generer sangtekst først'
      })
      return
    }

    setIsGeneratingSong(true)

    // Mode-aware logic:
    // - Custom mode: use lyrics directly, derive title and concept from lyrics
    // - AI mode: use AI-generated title, fallback to concept
    const firstLine = lyrics.split('\n')[0]?.trim() || ''
    const songTitle = isCustomTextMode
      ? firstLine.substring(0, 50) || 'Min egen sang'
      : generatedTitle || concept || 'Min sang'

    // API requires concept - in custom mode, use first 2 non-empty lines as concept
    const songConcept = isCustomTextMode
      ? lyrics.split('\n').filter(line => line.trim()).slice(0, 2).join(' ').substring(0, 200) || 'Egendefinert sangtekst'
      : concept

    const baseLyrics = isCustomTextMode
      ? lyrics
      : originalLyrics || lyrics

    try {
      // Check if this is a custom genre and get its Suno prompt
      const customPrompt = isCustomGenre(selectedGenre.id)
        ? getGenreSunoPrompt(selectedGenre.id)
        : null

      const response = await fetch('/api/songs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: songTitle,
          genre: isCustomGenre(selectedGenre.id) ? selectedGenre.id : selectedGenre.name,
          concept: songConcept,
          lyrics: baseLyrics,
          optimizedLyrics: FEATURES.ENABLE_PHONETIC_OPTIMIZATION ? (optimizedLyrics || null) : null,
          phoneticEnabled: FEATURES.ENABLE_PHONETIC_OPTIMIZATION && !!optimizedLyrics, // Only if feature enabled and user optimized
          vocalGender: vocalGender,
          customGenrePrompt: customPrompt || undefined
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke starte generering')
      }

      // Add song to generating store - it will appear in the songs list with generating state
      addGeneratingSong({
        id: data.data.songId,
        title: songTitle,
        genre: selectedGenre.name,
        startedAt: new Date()
      })

      // Clear pending song data after successful generation start
      try {
        localStorage.removeItem(PENDING_SONG_KEY)
      } catch (e) {
        // Ignore localStorage errors
      }

      const currentCount = generatingSongs.length + 1
      toast({
        title: 'Generering startet!',
        description: currentCount < MAX_CONCURRENT_SONGS
          ? `Sang ${currentCount} av maks ${MAX_CONCURRENT_SONGS} genererer`
          : 'Sangen vil vises i listen nedenfor når den er ferdig'
      })
    } catch (error) {
      showError(error, {
        context: 'song-generation',
        onRetry: handleGenerateSong
      })
    } finally {
      setIsGeneratingSong(false)
    }
  }

  const handleOnboardingComplete = async (
    selectedGenre: { id: string; name: string } | null,
    songConcept: string
  ) => {
    await completeOnboarding()

    // Set the selected genre and concept
    if (selectedGenre) {
      setSelectedGenre(selectedGenre)
    }
    if (songConcept) {
      setConcept(songConcept)
    }

    // If both genre and concept are provided, auto-generate lyrics (but not the song)
    if (selectedGenre && songConcept) {
      toast({
        title: 'Genererer tekst...',
        description: 'Vi lager sangtekst basert på konseptet ditt!'
      })

      // Generate lyrics only - let user review before generating song
      setIsGenerating(true)
      try {
        const lyricsResponse = await fetch('/api/lyrics/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genre: selectedGenre.name,
            concept: songConcept
          })
        })

        const lyricsData = await lyricsResponse.json()

        if (!lyricsResponse.ok || lyricsData.error) {
          throw new Error(lyricsData.error?.message || 'Kunne ikke generere tekst')
        }

        const generatedLyrics = lyricsData.data.lyrics
        const aiTitle = lyricsData.data.title
        setLyrics(generatedLyrics)
        setOriginalLyrics(generatedLyrics)
        setGeneratedTitle(aiTitle || '')

        toast({
          title: 'Tekst generert!',
          description: 'Se over teksten og trykk "Lag sang" når du er klar'
        })
      } catch (error) {
        console.error('Onboarding lyrics generation error:', error)
        // Silently fail - user can generate manually
      } finally {
        setIsGenerating(false)
      }
    } else {
      // No genre/concept - just show welcome
      setShowGenreSpotlight(true)
      setTimeout(() => setShowGenreSpotlight(false), 3000)

      toast({
        title: 'Velkommen!',
        description: 'Du er klar til å lage din første sang!'
      })
    }
  }

  const handleOnboardingSkip = async () => {
    await completeOnboarding()

    toast({
      title: 'Onboarding hoppet over',
      description: 'Du kan alltid starte når som helst!'
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="z-10 w-full max-w-3xl">
        <p className="text-lg mb-8 text-center text-gray-300">
          Lag den perfekte festsangen med KI - autentisk norsk uttale!
        </p>

        {/* Genre Selection Section */}
        <div className={`mb-8 rounded-lg transition-all duration-500 ${
          showGenreSpotlight ? 'ring-4 ring-[#E94560] ring-opacity-60 animate-pulse p-4 bg-pink-50/30' : ''
        }`}>
          <GenreSelection onGenreSelect={handleGenreSelect} selectedGenreId={selectedGenre?.id} />
        </div>

        {/* Lyrics Input Section - Main textarea + AI generation */}
        <div className="mb-8">
          <LyricsInputSection
            lyrics={lyrics}
            onLyricsChange={handleLyricsChange}
            concept={concept}
            onConceptChange={setConcept}
            onGenerateLyrics={handleGenerateLyrics}
            onOptimizeLyrics={handleReoptimize}
            isGenerating={isGenerating}
            isOptimizing={isOptimizing}
            selectedGenre={selectedGenre}
            isCustomTextMode={isCustomTextMode}
            onCustomTextModeChange={setIsCustomTextMode}
          />
        </div>

        {/* Generate Song Button - Main CTA (always visible, centered) */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={handleGenerateSong}
            disabled={isGeneratingSong || isGenerating || isOptimizing}
            className="px-8 h-11 text-base bg-[#FF6B35] hover:bg-[#E85A2A]"
          >
            {isGeneratingSong ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starter generering...
              </>
            ) : (
              <>
                <Music className="mr-2 h-5 w-5" />
                Lag sang
              </>
            )}
          </Button>
        </div>

        {/* My Songs Section */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">
            Mine sanger
          </h2>
          <HomepageSongs />
        </div>
      </div>

      {/* Phonetic Diff Viewer Modal */}
      <PhoneticDiffViewer
        originalLyrics={originalLyrics}
        optimizedLyrics={optimizedLyrics}
        changes={phoneticChanges}
        isOpen={isDiffViewerOpen}
        onClose={handleCloseDiffViewer}
        onAccept={handleAcceptChanges}
        onRevert={handleRevertChanges}
      />

      {/* Onboarding Modal for First-Time Users */}
      <OnboardingModal
        open={showOnboarding && !isOnboardingLoading}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

    </main>
  )
}
