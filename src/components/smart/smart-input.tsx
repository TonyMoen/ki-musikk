'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartInputProps {
  concept: string
  onConceptChange: (value: string) => void
  onSubmit: () => Promise<void>
  isGenerating: boolean
}

// Curated Norwegian placeholder concepts. One is picked at random on mount
// to show breadth and inspire users without anchoring them to a single template.
const PLACEHOLDER_CONCEPTS = [
  'Min farmor blir 90, hun samler på trolldukker og hører på hardingfele hver kveld',
  'Pappa fyller 60, han griller selv når det øsregner og kaller alle kollegene "sjefen"',
  'Bestemor mistet katten Mons, vi trenger noe trøstende men ikke for trist',
  'Russebussen Kaboom 2026, vi er fra Stavanger og det meste går ofte galt',
  'Polterabend for Karianne — hun går på kaffe etter spinning og dømmer ingen',
  'En låt om vorspielet hvor Lars alltid glemmer pizzaen i ovnen',
  'En sang om mandag morgen i Bergen når regnet treffer ansiktet ditt skrått',
  'Hyttetur i februar, peisen virker ikke, vi har glemt brød og er litt for stille',
  'Bryllup i Lofoten i juli, vi møttes på telttur og gikk oss vill første kveld',
  'Sølvbryllup for foreldrene — 25 år sammen, fortsatt krangler de om radiokanalen',
  'Sommerkvelden hvor ingenting skjedde, men jeg husker den fortsatt',
  'Tromsø i januar når sola endelig kommer tilbake',
]

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
  // Pick one placeholder per mount — feels alive, suggests breadth.
  const [placeholder] = useState(
    () => PLACEHOLDER_CONCEPTS[Math.floor(Math.random() * PLACEHOLDER_CONCEPTS.length)]
  )
  const isConceptValid = concept.length >= 1 && concept.length <= 500

  return (
    <div className="space-y-5">
      {/* Helper copy */}
      <p className="text-sm text-center text-[var(--ink-2)] max-w-md mx-auto">
        Vi gjør jobben — fortell oss hva sangen handler om, så finner AI sjanger og skriver tekst.
      </p>

      {/* Concept textarea */}
      <div className="relative">
        <textarea
          value={concept}
          onChange={(e) => onConceptChange(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          disabled={isGenerating}
          rows={5}
          className={cn(
            'w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3',
            'text-sm text-[var(--ink)] placeholder:text-[var(--ink-4)] resize-none',
            'focus:outline-none focus:border-[#F26522]/50 transition-colors',
            isGenerating && 'opacity-50'
          )}
        />
        <span className="absolute bottom-2 right-3 text-xs text-[var(--ink-4)]">
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
            ? 'bg-[#F26522] text-[var(--ink)] hover:bg-[#E05A1B] shadow-lg shadow-[#F26522]/20'
            : 'bg-[var(--surface-2)] text-[var(--ink-2)] cursor-not-allowed'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            AI velger sjanger og skriver tekst...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Lag sang for meg
          </>
        )}
      </button>

      <p className="text-xs text-center text-[var(--ink-3)]">
        AI velger sjanger basert på konseptet — du kan endre alt etterpå
      </p>
    </div>
  )
}
