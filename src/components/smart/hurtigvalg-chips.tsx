'use client'

import { Cake, GraduationCap, PartyPopper, Music2, Flame, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuickPick = 'Bursdag' | 'Russ' | 'Festmusikk' | 'Country' | 'Rock'

interface HurtigvalgChipsProps {
  value: QuickPick | null
  onChange: (next: QuickPick | null) => void
  disabled?: boolean
}

const CHIPS: { key: QuickPick; icon: LucideIcon }[] = [
  { key: 'Bursdag', icon: Cake },
  { key: 'Russ', icon: GraduationCap },
  { key: 'Festmusikk', icon: PartyPopper },
  { key: 'Country', icon: Music2 },
  { key: 'Rock', icon: Flame },
]

export function HurtigvalgChips({ value, onChange, disabled }: HurtigvalgChipsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-4)]">
        <span>Hurtigvalg</span>
        <span aria-hidden="true">—</span>
        <span className="text-[var(--ink-4)]/70">valgfritt</span>
      </div>
      <div
        role="group"
        aria-label="Hurtigvalg"
        className="flex flex-wrap md:flex-nowrap justify-center gap-2 md:overflow-x-auto"
      >
        {CHIPS.map(({ key, icon: Icon }) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(active ? null : key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                active
                  ? 'border-[#F26522] bg-[#F26522]/15 text-[#F26522]'
                  : 'border-[var(--border-soft)] bg-[var(--surface-2)]/50 text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--border-strong)]',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
