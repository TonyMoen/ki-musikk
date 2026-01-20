'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, Wand2, Info } from 'lucide-react'
import { FEATURES } from '@/lib/constants'

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

// Lyric template starters for quick concept generation
const LYRIC_TEMPLATES = {
  birthday: 'En morsom bursdagssang til en venn som...',
  love: 'En romantisk kjærlighetssang om...',
  party: 'En energisk festlåt som handler om...',
  motivation: 'En inspirerende sang som motiverer til...'
} as const

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
  const hasGeneratedLyrics = lyrics.trim().length > 0
  const isConceptValid = concept.length >= 10 && concept.length <= 500
  const canGenerate = selectedGenre && isConceptValid && !isGenerating && !isOptimizing

  // Show generated lyrics in AI mode after generation
  const showGeneratedLyricsInAIMode = !isCustomTextMode && hasGeneratedLyrics

  const handleTextareaChange = (value: string) => {
    if (isCustomTextMode) {
      onLyricsChange(value)
    } else if (showGeneratedLyricsInAIMode) {
      onLyricsChange(value)
    } else {
      onConceptChange(value)
    }
  }

  const handleGenerateLyrics = async () => {
    await onGenerateLyrics()
  }

  const fillTemplate = (template: string) => {
    onConceptChange(template)
  }

  const hasContent = lyrics.trim().length > 0

  return (
    <div className="space-y-2">
      <Tabs
        value={isCustomTextMode ? 'own' : 'ai'}
        onValueChange={(v) => onCustomTextModeChange(v === 'own')}
        className="w-full"
      >
        {/* Tab Selector - Segmented Control Style */}
        <TabsList className="grid w-full grid-cols-2 h-10 bg-elevated p-1 rounded-lg mb-4">
          <TabsTrigger
            value="ai"
            disabled={isGenerating || isOptimizing}
            className={cn(
              "text-sm font-medium rounded-md transition-all",
              "data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
            )}
          >
            AI Genererer
          </TabsTrigger>
          <TabsTrigger
            value="own"
            disabled={isGenerating || isOptimizing}
            className={cn(
              "text-sm font-medium rounded-md transition-all",
              "data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
            )}
          >
            Egen tekst
          </TabsTrigger>
        </TabsList>

        {/* AI Genererer Tab Content */}
        <TabsContent value="ai" className="space-y-4 mt-0">
          {/* Show concept input BEFORE lyrics generated */}
          {!showGeneratedLyricsInAIMode && (
            <>
              {/* Concept Input */}
              <div className="space-y-2">
                <Label htmlFor="concept-input" className="text-sm font-medium text-text-primary">
                  Beskriv hva sangen skal handle om
                </Label>
                <Textarea
                  id="concept-input"
                  placeholder="F.eks: En bursdagssang til Per som alltid kommer for sent og snakker om båten sin..."
                  rows={4}
                  value={concept}
                  onChange={(e) => onConceptChange(e.target.value)}
                  maxLength={500}
                  disabled={isGenerating || isOptimizing}
                  className={cn(
                    "font-mono text-sm resize-none",
                    (isGenerating || isOptimizing) && 'opacity-50'
                  )}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">
                    {concept.length}/500 tegn
                  </span>
                </div>
              </div>

              {/* Template Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-primary">
                  Eller velg en mal:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fillTemplate(LYRIC_TEMPLATES.birthday)}
                    disabled={isGenerating || isOptimizing}
                    className="h-[56px] text-[15px] font-bold rounded-lg border border-gray-300 text-gray-800 bg-white hover:border-primary/50 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Bursdagssang
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fillTemplate(LYRIC_TEMPLATES.love)}
                    disabled={isGenerating || isOptimizing}
                    className="h-[56px] text-[15px] font-bold rounded-lg border border-gray-300 text-gray-800 bg-white hover:border-primary/50 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Kjærlighetssang
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fillTemplate(LYRIC_TEMPLATES.party)}
                    disabled={isGenerating || isOptimizing}
                    className="h-[56px] text-[15px] font-bold rounded-lg border border-gray-300 text-gray-800 bg-white hover:border-primary/50 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Festlåt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fillTemplate(LYRIC_TEMPLATES.motivation)}
                    disabled={isGenerating || isOptimizing}
                    className="h-[56px] text-[15px] font-bold rounded-lg border border-gray-300 text-gray-800 bg-white hover:border-primary/50 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Motivasjonssang
                  </Button>
                </div>
              </div>

              {/* Info Box with Generate Button */}
              <div className="flex items-center justify-between gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-700">
                    AI lager både melodi og tekst basert på din beskrivelse.
                    Jo mer detaljer, jo bedre resultat!
                  </p>
                </div>
                <Button
                  onClick={handleGenerateLyrics}
                  disabled={!canGenerate}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
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
              </div>
            </>
          )}

          {/* Show generated lyrics AFTER generation */}
          {showGeneratedLyricsInAIMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="generated-lyrics" className="text-sm font-medium text-text-primary">
                  Generert sangtekst
                </Label>
              </div>

              <div className="relative">
                <Textarea
                  id="generated-lyrics"
                  value={lyrics}
                  onChange={(e) => onLyricsChange(e.target.value)}
                  disabled={isGenerating || isOptimizing}
                  className={cn(
                    'min-h-[200px] font-mono text-sm leading-relaxed resize-none whitespace-pre-wrap pb-8',
                    (isGenerating || isOptimizing) && 'opacity-50'
                  )}
                />

                {/* "Optimaliser tekst" link - hidden when phonetic optimization disabled */}
                {FEATURES.ENABLE_PHONETIC_OPTIMIZATION && hasContent && !isGenerating && !isOptimizing && (
                  <button
                    onClick={onOptimizeLyrics}
                    className="absolute bottom-2 right-4 text-xs text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <Wand2 className="h-3 w-3" />
                    Optimaliser tekst
                  </button>
                )}
              </div>

              {/* Status messages */}
              {isOptimizing && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Optimaliserer uttale...
                </p>
              )}

              {/* "Ny beskrivelse" button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => onLyricsChange('')}
                  variant="outline"
                  size="sm"
                  className="text-text-primary hover:text-text-primary"
                >
                  Ny beskrivelse
                </Button>
              </div>
            </div>
          )}

          {/* Status message for generating */}
          {isGenerating && (
            <p className="text-xs text-primary flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Genererer norsk sangtekst...
            </p>
          )}
        </TabsContent>

        {/* Egen Tekst Tab Content */}
        <TabsContent value="own" className="space-y-2 mt-0">
          <div className="relative">
            <Textarea
              id="custom-lyrics"
              placeholder={`Skriv din egen sangtekst her...

Vers 1:
I morges våkna jeg
Og tenkte på deg

Refreng:
Du er min...`}
              rows={12}
              maxLength={1000}
              value={lyrics}
              onChange={(e) => onLyricsChange(e.target.value)}
              disabled={isGenerating || isOptimizing}
              className={cn(
                "font-mono text-sm min-h-[280px] resize-none pb-8",
                (isGenerating || isOptimizing) && 'opacity-50'
              )}
            />

            {/* "Optimaliser tekst" link - hidden when phonetic optimization disabled */}
            {FEATURES.ENABLE_PHONETIC_OPTIMIZATION && hasContent && !isGenerating && !isOptimizing && (
              <button
                onClick={onOptimizeLyrics}
                className="absolute bottom-2 right-4 text-xs text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Wand2 className="h-3 w-3" />
                Optimaliser tekst
              </button>
            )}
          </div>

          {/* Character counter */}
          <div className="flex justify-end">
            <span className={cn(
              "text-sm",
              lyrics.length > 900 ? "text-warning" : "text-text-secondary"
            )}>
              {lyrics.length}
            </span>
            <span className="text-sm text-text-secondary"> / 1000 tegn</span>
          </div>

          {/* Status message for optimizing */}
          {isOptimizing && (
            <p className="text-xs text-primary flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Optimaliserer uttale...
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
