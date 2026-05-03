'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartInputProps {
  concept: string
  onConceptChange: (value: string) => void
  onSubmit: () => Promise<void>
  isGenerating: boolean
}

/**
 * Smart-modus input screen: helper copy + concept textarea + CTA.
 * Mirrors the visual language of step-lyrics.tsx (dark surfaces, orange CTA)
 * so the two modes feel like siblings.
 */
export function SmartInput({
  concept,
  onConceptChange,
  onSubmit,
  isGenerating,
}: SmartInputProps) {
  const isConceptValid = concept.length >= 10 && concept.length <= 500

  return (
    <div className="space-y-5">
      {/* Helper copy */}
      <p className="text-sm text-center text-[rgba(180,200,240,0.55)] max-w-md mx-auto">
        Vi gjør jobben — fortell oss hva sangen handler om, så finner KI sjanger og skriver tekst.
      </p>

      {/* Concept textarea */}
      <div className="relative">
        <textarea
          value={concept}
          onChange={(e) => onConceptChange(e.target.value)}
          placeholder="F.eks: En sang til min farmor som fyller 80 år, hun elsker å danse..."
          maxLength={500}
          disabled={isGenerating}
          rows={5}
          className={cn(
            'w-full rounded-2xl border border-[rgba(90,140,255,0.1)] bg-[rgba(8,16,35,0.7)] px-4 py-3',
            'text-sm text-white placeholder:text-[rgba(130,170,240,0.25)] resize-none',
            'focus:outline-none focus:border-[#F26522]/50 transition-colors',
            isGenerating && 'opacity-50'
          )}
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-500">
          {concept.length}/500
        </span>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!isConceptValid || isGenerating}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all',
          isConceptValid && !isGenerating
            ? 'bg-[#F26522] text-white hover:bg-[#E05A1B] shadow-lg shadow-[#F26522]/20'
            : 'bg-[rgba(40,80,160,0.15)] text-[rgba(180,200,240,0.5)] cursor-not-allowed'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            KI velger sjanger og skriver tekst...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Lag sang for meg
          </>
        )}
      </button>

      <p className="text-xs text-center text-[rgba(130,170,240,0.45)]">
        KI velger sjanger basert på konseptet — du kan endre alt etterpå
      </p>
    </div>
  )
}
