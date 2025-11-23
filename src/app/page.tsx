'use client'

import { useState } from 'react'
import { GenreSelection } from '@/components/genre-selection'
import { ConceptInput } from '@/components/concept-input'
import { LyricsEditor } from '@/components/lyrics-editor'
import { PronunciationToggle } from '@/components/pronunciation-toggle'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import type { OptimizationResult } from '@/types/song'

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<{
    id: string
    name: string
  } | null>(null)
  const [concept, setConcept] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [originalLyrics, setOriginalLyrics] = useState('')
  const [optimizedLyrics, setOptimizedLyrics] = useState('')
  const [pronunciationEnabled, setPronunciationEnabled] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const { toast } = useToast()

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

      // Display optimized version if pronunciation is enabled
      if (pronunciationEnabled) {
        setLyrics(result.optimizedLyrics)
      }

      toast({
        title: 'Uttale optimalisert! 🎵',
        description: `${result.changes.length} ord optimalisert for autentisk norsk uttale (${result.cacheHitRate}% fra cache)`
      })
    } catch (error) {
      console.error('Pronunciation optimization error:', error)

      toast({
        variant: 'destructive',
        title: 'Optimalisering feilet',
        description:
          error instanceof Error
            ? error.message
            : 'Kunne ikke optimalisere uttale. Bruker original tekst.'
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
        description: 'Vennligst velg en sjanger før du genererer tekst'
      })
      return
    }

    if (concept.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Konsept for kort',
        description: 'Konseptet må være minst 10 tegn'
      })
      return
    }

    if (concept.length > 500) {
      toast({
        variant: 'destructive',
        title: 'Konsept for langt',
        description: 'Konseptet kan ikke være mer enn 500 tegn'
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
        description: 'AI har laget norsk sangtekst basert på konseptet ditt'
      })

      // Automatically optimize pronunciation if enabled
      if (pronunciationEnabled) {
        await handleOptimizePronunciation(generatedLyrics)
      }
    } catch (error) {
      console.error('Lyric generation error:', error)

      toast({
        variant: 'destructive',
        title: 'Generering feilet',
        description:
          error instanceof Error
            ? error.message
            : 'Kunne ikke generere tekst. Prøv igjen.'
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
  }

  const handleReoptimize = async () => {
    if (lyrics && lyrics.trim().length > 0) {
      await handleOptimizePronunciation(lyrics)
    }
  }

  const isGenerateDisabled =
    !selectedGenre ||
    concept.length < 10 ||
    concept.length > 500 ||
    isGenerating ||
    isOptimizing

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="z-10 w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-2 text-center md:text-left">
          Musikkfabrikken
        </h1>
        <p className="text-lg mb-8 text-center md:text-left text-gray-600">
          Lag morsomme norske sanger med AI - autentisk norsk uttale!
        </p>

        {/* Genre Selection Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center md:text-left">
            Velg sjanger
          </h2>
          <GenreSelection onGenreSelect={handleGenreSelect} />
        </div>

        {/* Concept Input Section */}
        <div className="mb-8">
          <ConceptInput
            value={concept}
            onChange={setConcept}
            disabled={isGenerating || isOptimizing}
          />
        </div>

        {/* Pronunciation Toggle */}
        <div className="mb-8">
          <PronunciationToggle
            enabled={pronunciationEnabled}
            onToggle={handlePronunciationToggle}
            disabled={isGenerating || isOptimizing}
          />
        </div>

        {/* Generate Button */}
        <div className="mb-8">
          <Button
            onClick={handleGenerateLyrics}
            disabled={isGenerateDisabled}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Genererer tekst...
              </>
            ) : isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Optimaliserer uttale...
              </>
            ) : (
              'Generer tekst med AI'
            )}
          </Button>
        </div>

        {/* Lyrics Editor Section */}
        {(lyrics || isGenerating || isOptimizing) && (
          <div className="mb-8">
            <LyricsEditor
              value={lyrics}
              onChange={handleLyricsChange}
              disabled={isGenerating || isOptimizing}
              placeholder={
                isGenerating
                  ? 'Genererer norsk sangtekst...'
                  : isOptimizing
                  ? 'Optimaliserer uttale...'
                  : 'Genererte tekster vil vises her...'
              }
            />

            {/* Re-optimize button if lyrics were manually edited */}
            {lyrics &&
              !isGenerating &&
              !isOptimizing &&
              !originalLyrics &&
              pronunciationEnabled && (
                <Button
                  onClick={handleReoptimize}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Optimaliser uttale
                </Button>
              )}
          </div>
        )}
      </div>
    </main>
  )
}
