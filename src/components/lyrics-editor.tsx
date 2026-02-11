'use client'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface LyricsEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function LyricsEditor({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = 'Genererte tekster vil vises her...'
}: LyricsEditorProps) {
  const lineCount = value ? value.split('\n').length : 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="lyrics-editor"
          className="block text-sm font-medium text-[rgba(180,200,240,0.5)]"
        >
          Sangtekst
        </label>
        {value && (
          <span className="text-xs text-[rgba(180,200,240,0.5)]">
            {lineCount} {lineCount === 1 ? 'linje' : 'linjer'}
          </span>
        )}
      </div>

      <Textarea
        id="lyrics-editor"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'min-h-[200px] font-mono text-sm leading-relaxed resize-none whitespace-pre-wrap',
          value && 'bg-white',
          !value && 'bg-[rgba(20,40,80,0.35)]'
        )}
      />

      {value && (
        <p className="text-xs text-[rgba(180,200,240,0.5)]">
          Du kan redigere teksten etter generering
        </p>
      )}
    </div>
  )
}
