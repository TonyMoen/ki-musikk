'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { InfoTooltip } from '@/components/info-tooltip'
import { ConceptInput } from '@/components/concept-input'
import { TOOLTIPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, ChevronDown, ChevronUp, Eye } from 'lucide-react'

interface LyricsInputSectionProps {
  lyrics: string
  onLyricsChange: (lyrics: string) => void
  pronunciationEnabled: boolean
  onPronunciationToggle: (enabled: boolean) => void
  concept: string
  onConceptChange: (concept: string) => void
  onGenerateLyrics: () => Promise<void>
  onOptimizeLyrics: () => Promise<void>
  onOpenDiffViewer: () => void
  isGenerating: boolean
  isOptimizing: boolean
  hasPhoneticChanges: boolean
  hasOriginalLyrics: boolean
  selectedGenre: { id: string; name: string } | null
}

export function LyricsInputSection({
  lyrics,
  onLyricsChange,
  pronunciationEnabled,
  onPronunciationToggle,
  concept,
  onConceptChange,
  onGenerateLyrics,
  onOptimizeLyrics,
  onOpenDiffViewer,
  isGenerating,
  isOptimizing,
  hasPhoneticChanges,
  hasOriginalLyrics,
  selectedGenre
}: LyricsInputSectionProps) {
  const [isConceptExpanded, setIsConceptExpanded] = useState(false)
  const lineCount = lyrics ? lyrics.split('\n').length : 0

  const isConceptValid = concept.length >= 10 && concept.length <= 500
  const canGenerate = selectedGenre && isConceptValid && !isGenerating && !isOptimizing

  const handleGenerateClick = async () => {
    await onGenerateLyrics()
    // Collapse after successful generation
    setIsConceptExpanded(false)
  }

  const handleToggleConceptArea = () => {
    setIsConceptExpanded(!isConceptExpanded)
  }

  return (
    <div className="space-y-4">
      {/* Main Lyrics Textarea - Always Visible */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="lyrics-input"
            className="block text-sm font-medium text-gray-700"
          >
            Tekst
          </label>
          {lyrics && (
            <span className="text-xs text-gray-500">
              {lineCount} {lineCount === 1 ? 'linje' : 'linjer'}
            </span>
          )}
        </div>

        <Textarea
          id="lyrics-input"
          placeholder="Skriv sangteksten din her, eller bruk AI-generering nedenfor..."
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          disabled={isGenerating || isOptimizing}
          className={cn(
            'min-h-[200px] font-mono text-sm leading-relaxed resize-none whitespace-pre-wrap',
            lyrics && 'bg-white',
            !lyrics && 'bg-gray-50',
            (isGenerating || isOptimizing) && 'opacity-50'
          )}
        />

        {lyrics && !isGenerating && !isOptimizing && (
          <p className="text-xs text-gray-500">
            Du kan redigere teksten direkte
          </p>
        )}

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
      </div>

      {/* Pronunciation Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <Label
            htmlFor="pronunciation-toggle"
            className="text-base font-medium cursor-pointer"
          >
            Norsk uttale
          </Label>
          <InfoTooltip content={TOOLTIPS.pronunciation} side="right" />
        </div>

        <Switch
          id="pronunciation-toggle"
          checked={pronunciationEnabled}
          onCheckedChange={onPronunciationToggle}
          disabled={isGenerating || isOptimizing}
          className="data-[state=checked]:bg-[#06D6A0]"
        />
      </div>

      {/* Action buttons for existing lyrics */}
      {lyrics && !isGenerating && !isOptimizing && (
        <div className="flex flex-wrap gap-3">
          {/* Preview phonetic changes */}
          {hasOriginalLyrics && hasPhoneticChanges && (
            <Button
              onClick={onOpenDiffViewer}
              variant="outline"
              size="sm"
            >
              <Eye className="mr-2 h-4 w-4" />
              Forhåndsvis fonetiske endringer
            </Button>
          )}

          {/* Re-optimize button if lyrics were manually edited */}
          {!hasOriginalLyrics && pronunciationEnabled && (
            <Button
              onClick={onOptimizeLyrics}
              variant="outline"
              size="sm"
            >
              Optimaliser uttale
            </Button>
          )}
        </div>
      )}

      {/* Expandable AI Generation Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={handleToggleConceptArea}
          disabled={isGenerating || isOptimizing}
          className={cn(
            'w-full flex items-center justify-between p-4 text-left transition-colors',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E94560]',
            (isGenerating || isOptimizing) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#E94560]" />
            <span className="font-medium">Generer tekst med AI</span>
          </div>
          {isConceptExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {/* Expanded concept input area */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isConceptExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="p-4 pt-0 space-y-4 border-t">
            {!selectedGenre && (
              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                Velg en sjanger ovenfor for å generere tekst
              </p>
            )}

            <ConceptInput
              value={concept}
              onChange={onConceptChange}
              disabled={isGenerating || isOptimizing}
            />

            <Button
              onClick={handleGenerateClick}
              disabled={!canGenerate}
              className="w-full bg-[#E94560] hover:bg-[#D62839]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Genererer...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generer tekst
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
