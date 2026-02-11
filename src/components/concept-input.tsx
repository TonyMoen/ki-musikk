'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ConceptInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

const MIN_CHARS = 10
const MAX_CHARS = 500

export function ConceptInput({
  value,
  onChange,
  disabled = false,
  className
}: ConceptInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const charCount = value.length
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS
  const isTooShort = charCount > 0 && charCount < MIN_CHARS
  const isTooLong = charCount > MAX_CHARS

  const getCharCountColor = () => {
    if (isTooLong) return 'text-red-600'
    if (isTooShort) return 'text-yellow-600'
    if (isValid) return 'text-green-600'
    return 'text-[rgba(180,200,240,0.5)]'
  }

  const getCharCountMessage = () => {
    if (isTooLong) return 'For mange tegn'
    if (isTooShort) return 'For få tegn'
    if (isValid) return 'Bra lengde'
    return ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor="concept-input"
        className="block text-sm font-medium text-[rgba(180,200,240,0.5)]"
      >
        Beskriv sangkonseptet ditt
      </label>

      <Textarea
        id="concept-input"
        placeholder="Eksempel: Morsom bursdagssang for vennen min Lars som elsker fiske"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'min-h-[100px] resize-none',
          isTooLong && 'border-red-500 focus-visible:ring-red-500',
          isTooShort && isFocused && 'border-yellow-500 focus-visible:ring-yellow-500',
          isValid && 'border-green-500 focus-visible:ring-green-500'
        )}
        maxLength={MAX_CHARS + 50} // Allow some overage for better UX
      />

      <div className="flex items-center justify-between text-xs">
        <span className={getCharCountColor()}>
          {getCharCountMessage()}
        </span>
        <span className={cn('font-mono', getCharCountColor())}>
          {charCount} / {MAX_CHARS} tegn
        </span>
      </div>

      {isTooShort && charCount > 0 && (
        <p className="text-xs text-yellow-600">
          Minst {MIN_CHARS} tegn er nødvendig for god AI-generering
        </p>
      )}

      {isTooLong && (
        <p className="text-xs text-red-600">
          Maksimalt {MAX_CHARS} tegn er tillatt
        </p>
      )}
    </div>
  )
}
