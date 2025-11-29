'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'

interface LyricsInputSectionProps {
  lyrics: string
  onLyricsChange: (lyrics: string) => void
  concept: string
  onConceptChange: (concept: string) => void
  onGenerateLyrics: () => Promise<void>
  onOptimizeLyrics: () => Promise<void>
  isGenerating: boolean
  isOptimizing: boolean
  selectedGenre: { id: string; name: string } | null
  isCustomTextMode: boolean
  onCustomTextModeChange: (enabled: boolean) => void
}

export function LyricsInputSection({
  lyrics,
  onLyricsChange,
  concept,
  onConceptChange,
  onGenerateLyrics,
  onOptimizeLyrics,
  isGenerating,
  isOptimizing,
  selectedGenre,
  isCustomTextMode,
  onCustomTextModeChange
}: LyricsInputSectionProps) {
  // Track if we've generated lyrics in AI mode (to show lyrics instead of concept)
  const hasGeneratedLyrics = lyrics.trim().length > 0

  // In AI mode:
  //   - Before generation: shows concept/description, "Lag tekst" button visible
  //   - After generation: shows generated lyrics in same textarea, "Lag tekst" hidden
  // In Custom mode: shows user's custom lyrics directly

  const isConceptValid = concept.length >= 10 && concept.length <= 500
  const canGenerate = selectedGenre && isConceptValid && !isGenerating && !isOptimizing

  // Determine what to show in AI mode: concept (pre-generation) or lyrics (post-generation)
  const showGeneratedLyricsInAIMode = !isCustomTextMode && hasGeneratedLyrics

  // Dynamic labels and placeholders based on mode and state
  const textareaLabel = isCustomTextMode
    ? 'Skriv sangteksten din'
    : showGeneratedLyricsInAIMode
      ? 'Generert sangtekst'
      : 'Beskriv sangen'

  const textareaPlaceholder = isCustomTextMode
    ? 'Skriv eller lim inn sangteksten din her...'
    : 'F.eks: Bursdagssang til Per som alltid kommer for sent og snakker om båten sin...'

  // Textarea value logic:
  // - Custom mode: always show lyrics
  // - AI mode with generated lyrics: show lyrics
  // - AI mode without lyrics: show concept (description)
  const textareaValue = isCustomTextMode
    ? lyrics
    : showGeneratedLyricsInAIMode
      ? lyrics
      : concept

  const handleTextareaChange = (value: string) => {
    if (isCustomTextMode) {
      onLyricsChange(value)
    } else if (showGeneratedLyricsInAIMode) {
      // Editing generated lyrics in AI mode
      onLyricsChange(value)
    } else {
      // Editing concept/description before generation
      onConceptChange(value)
    }
  }

  // Handle AI generation - generates lyrics and puts them in the textarea
  const handleGenerateLyrics = async () => {
    await onGenerateLyrics()
    // After generation, lyrics will be set via onLyricsChange from parent
    // We stay in AI mode but the lyrics are now available
  }

  // Check if there's content to optimize (either in lyrics or from generated text)
  const hasContent = lyrics.trim().length > 0

  return (
    <div className="space-y-2">
      {/* Header: Dynamic label + "Egen tekst" toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="lyrics-input"
          className="text-sm font-medium text-gray-700"
        >
          {textareaLabel}
        </label>
        <div className="flex items-center gap-2">
          <Switch
            id="custom-text-toggle"
            checked={isCustomTextMode}
            onCheckedChange={onCustomTextModeChange}
            disabled={isGenerating || isOptimizing}
            className="data-[state=checked]:bg-[#06D6A0]"
          />
          <label
            htmlFor="custom-text-toggle"
            className="text-sm text-gray-600 cursor-pointer"
          >
            Egen tekst
          </label>
        </div>
      </div>

      {/* Main Textarea with relative positioning for the optimize link */}
      <div className="relative">
        <Textarea
          id="lyrics-input"
          placeholder={textareaPlaceholder}
          value={textareaValue}
          onChange={(e) => handleTextareaChange(e.target.value)}
          disabled={isGenerating || isOptimizing}
          className={cn(
            'min-h-[200px] font-mono text-sm leading-relaxed resize-none whitespace-pre-wrap pb-8',
            textareaValue && 'bg-white',
            !textareaValue && 'bg-gray-50',
            (isGenerating || isOptimizing) && 'opacity-50'
          )}
        />

        {/* "Optimaliser tekst" link - positioned bottom-right, only when content exists */}
        {hasContent && !isGenerating && !isOptimizing && (
          <button
            onClick={onOptimizeLyrics}
            className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-[#E94560] flex items-center gap-1 transition-colors"
          >
            <Wand2 className="h-3 w-3" />
            Optimaliser tekst
          </button>
        )}
      </div>

      {/* Status messages */}
      {isGenerating && (
        <p className="text-xs text-[#E94560] flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Genererer norsk sangtekst...
        </p>
      )}

      {isOptimizing && (
        <p className="text-xs text-[#E94560] flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Optimaliserer uttale...
        </p>
      )}

      {/* "✨ Lag tekst" button area - fixed height to prevent layout shift */}
      {/* Hidden in custom mode OR after lyrics generated in AI mode */}
      <div className="h-12 flex items-center justify-end pt-2">
        {!isCustomTextMode && !showGeneratedLyricsInAIMode && (
          <Button
            onClick={handleGenerateLyrics}
            disabled={!canGenerate}
            size="sm"
            className="bg-[#E94560] hover:bg-[#D62839] text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Genererer...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Lag tekst
              </>
            )}
          </Button>
        )}
        {/* Show "Ny beskrivelse" button when lyrics exist in AI mode, to allow re-generation */}
        {!isCustomTextMode && showGeneratedLyricsInAIMode && (
          <Button
            onClick={() => onLyricsChange('')}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            Ny beskrivelse
          </Button>
        )}
      </div>
    </div>
  )
}
