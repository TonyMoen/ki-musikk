'use client'

import { useState } from 'react'
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
import { useGeneratingSongStore } from '@/stores/generating-song-store'
import { Loader2, Music } from 'lucide-react'
import type { OptimizationResult, PhoneticChange } from '@/types/song'

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
  const { toast } = useToast()
  const { showError } = useErrorToast()
  const { showOnboarding, completeOnboarding, isLoading: isOnboardingLoading } = useOnboarding()
  const { setGeneratingSong } = useGeneratingSongStore()

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

      // Display optimized version if pronunciation is enabled
      if (pronunciationEnabled) {
        setLyrics(result.optimizedLyrics)
      }

      toast({
        title: 'Uttale optimalisert! 🎵',
        description: `${result.changes.length} ord optimalisert for autentisk norsk uttale (${result.cacheHitRate}% fra cache)`
      })
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
      setLyrics(generatedLyrics)
      setOriginalLyrics(generatedLyrics)

      toast({
        title: 'Tekst generert! ✨',
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
    // - AI mode: use concept for title, originalLyrics for base text
    const firstLine = lyrics.split('\n')[0]?.trim() || ''
    const songTitle = isCustomTextMode
      ? firstLine.substring(0, 50) || 'Min egen sang'
      : concept || 'Min sang'

    // API requires concept - in custom mode, use first 2 non-empty lines as concept
    const songConcept = isCustomTextMode
      ? lyrics.split('\n').filter(line => line.trim()).slice(0, 2).join(' ').substring(0, 200) || 'Egendefinert sangtekst'
      : concept

    const baseLyrics = isCustomTextMode
      ? lyrics
      : originalLyrics || lyrics

    try {
      const response = await fetch('/api/songs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: songTitle,
          genre: selectedGenre.name,
          concept: songConcept,
          lyrics: baseLyrics,
          optimizedLyrics: optimizedLyrics || null,
          phoneticEnabled: !!optimizedLyrics, // Only if user optimized
          vocalGender: vocalGender
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke starte generering')
      }

      // Add song to generating store - it will appear in the songs list with generating state
      setGeneratingSong({
        id: data.data.songId,
        title: songTitle,
        genre: selectedGenre.name,
        startedAt: new Date()
      })

      toast({
        title: 'Generering startet! 🎵',
        description: 'Sangen vil vises i listen nedenfor når den er ferdig'
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

  const handleOnboardingComplete = async (selectedGenres: string[], songConcept: string) => {
    await completeOnboarding()

    // Pre-fill concept if provided
    if (songConcept) {
      setConcept(songConcept)
    }

    // Trigger spotlight effect on genre carousel
    setShowGenreSpotlight(true)
    setTimeout(() => setShowGenreSpotlight(false), 3000)

    toast({
      title: 'Velkommen! 🎉',
      description: 'Du er klar til å lage din første sang!'
    })
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
        <h1 className="text-4xl font-bold mb-2 text-center md:text-left text-primary">
          AIMusikk
        </h1>
        <p className="text-lg mb-8 text-center md:text-left text-gray-600">
          Lag morsomme norske sanger med AI - autentisk norsk uttale!
        </p>

        {/* Genre Selection Section */}
        <div className={`mb-8 rounded-lg transition-all duration-500 ${
          showGenreSpotlight ? 'ring-4 ring-[#E94560] ring-opacity-60 animate-pulse p-4 bg-pink-50/30' : ''
        }`}>
          <h2 className="text-2xl font-semibold mb-4 text-center md:text-left">
            Velg sjanger
          </h2>
          <GenreSelection onGenreSelect={handleGenreSelect} />
        </div>

        {/* Voice Gender Selection Section */}
        <div className="mb-8">
          <VoiceGenderSelector
            value={vocalGender}
            onChange={setVocalGender}
          />
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

        {/* Generate Song Button - Main CTA (always visible) */}
        <div className="mb-8">
          <Button
            onClick={handleGenerateSong}
            disabled={isGeneratingSong || isGenerating || isOptimizing}
            className="w-full h-14 text-lg bg-[#E94560] hover:bg-[#D62839]"
            size="lg"
          >
            {isGeneratingSong ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Starter generering...
              </>
            ) : (
              <>
                <Music className="mr-2 h-6 w-6" />
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
