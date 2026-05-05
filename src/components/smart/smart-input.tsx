'use client'

import { useRef, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HurtigvalgChips, type QuickPick } from './hurtigvalg-chips'

interface SmartInputProps {
  concept: string
  onConceptChange: (value: string) => void
  quickPick: QuickPick | null
  onQuickPickChange: (next: QuickPick | null) => void
  onSubmit: () => Promise<void>
  isGenerating: boolean
  generationStage?: string | null
}

const PLACEHOLDER =
  'F.eks: En sang til min farmor som fyller 80 år, hun elsker å danse…'
const MIN_CHARS = 10
const MAX_CHARS = 500
const WARNING_AT = 450

/**
 * Smart-modus input screen: hurtigvalg chips + concept textarea + CTA + reassurance.
 * Mode toggle and mode description live in the parent — this component owns only
 * the form fields and primary CTA.
 */
export function SmartInput({
  concept,
  onConceptChange,
  quickPick,
  onQuickPickChange,
  onSubmit,
  isGenerating,
  generationStage,
}: SmartInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [shake, setShake] = useState(false)
  const [validationMsg, setValidationMsg] = useState('')

  const trimmedLen = concept.trim().length
  const isValid = trimmedLen >= MIN_CHARS && concept.length <= MAX_CHARS
  const charCount = concept.length
  const inWarning = charCount > WARNING_AT

  const handleSubmit = async () => {
    if (!isValid) {
      setValidationMsg(
        trimmedLen === 0
          ? 'Skriv noen ord om sangen før du sender inn.'
          : `Skriv minst ${MIN_CHARS} tegn så AI har noe å jobbe med.`
      )
      setShake(true)
      textareaRef.current?.focus()
      window.setTimeout(() => setShake(false), 450)
      return
    }
    setValidationMsg('')
    await onSubmit()
  }

  const ctaLabel = isGenerating
    ? generationStage || 'Lager sang…'
    : 'Lag sang for meg'

  const ctaActive = isValid && !isGenerating

  return (
    <div className="space-y-7">
      <HurtigvalgChips
        value={quickPick}
        onChange={onQuickPickChange}
        disabled={isGenerating}
      />

      {/* Konsept textarea */}
      <div className="space-y-2">
        <label
          htmlFor="smart-concept"
          className="block text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-4)]"
        >
          Konsept
        </label>
        <div className={cn('relative', shake && 'animate-shake')}>
          <textarea
            id="smart-concept"
            ref={textareaRef}
            value={concept}
            onChange={(e) => {
              const next = e.target.value
              if (next.length > MAX_CHARS) return
              onConceptChange(next)
              if (validationMsg) setValidationMsg('')
            }}
            placeholder={PLACEHOLDER}
            maxLength={MAX_CHARS}
            disabled={isGenerating}
            rows={6}
            aria-invalid={validationMsg ? true : undefined}
            aria-describedby="smart-concept-counter"
            className={cn(
              'w-full min-h-[160px] rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 pb-9',
              'text-base text-[var(--ink)] placeholder:text-[var(--ink-4)] resize-none',
              'focus:outline-none focus:border-[#F26522]/50 transition-colors',
              isGenerating && 'opacity-50'
            )}
          />
          <span
            id="smart-concept-counter"
            aria-live="polite"
            className={cn(
              'absolute bottom-3 right-4 text-xs tabular-nums transition-colors',
              inWarning ? 'text-[hsl(var(--warning))]' : 'text-[var(--ink-4)]'
            )}
          >
            {charCount} / {MAX_CHARS}
          </span>
        </div>
        {validationMsg && (
          <p role="alert" className="text-xs text-[hsl(var(--warning))]">
            {validationMsg}
          </p>
        )}
      </div>

      {/* CTA — glows at rest, intensifies on hover, shimmer sweeps across */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isGenerating}
        aria-busy={isGenerating}
        className={cn(
          'group relative w-full overflow-hidden flex items-center justify-center gap-2 px-5 h-14 rounded-xl text-base font-semibold',
          ctaActive
            ? 'bg-[#F26522] text-[var(--ink)] hover:bg-[#E05A1B] cta-glow'
            : 'bg-[var(--surface-2)] text-[var(--ink-2)] cursor-not-allowed transition-colors'
        )}
      >
        {ctaActive && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
        )}
        <span className="relative inline-flex items-center gap-2">
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          )}
          {ctaLabel}
        </span>
      </button>

      {/* Reassurance hint */}
      <p className="text-xs italic text-center text-[var(--ink-3)]">
        AI velger sjanger basert på konseptet — du kan endre alt etterpå.
      </p>
    </div>
  )
}
