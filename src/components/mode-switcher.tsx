'use client'

import { Sparkles, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WizardMode = 'smart' | 'tilpass'

interface ModeSwitcherProps {
  mode: WizardMode
  onChange: (mode: WizardMode) => void
}

/**
 * Two-mode entry switcher. Smart is the default/prominent option;
 * Tilpass is a quieter sibling. Mirrors the pill-toggle pattern used in
 * step-lyrics.tsx but operates at the flow level.
 */
export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex bg-[rgba(40,80,160,0.15)] rounded-full p-1 w-fit mx-auto">
      <button
        type="button"
        onClick={() => onChange('smart')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
          mode === 'smart'
            ? 'bg-[#F26522] text-white shadow-sm shadow-[#F26522]/30'
            : 'text-[rgba(130,170,240,0.45)] hover:text-white'
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Smart
      </button>
      <button
        type="button"
        onClick={() => onChange('tilpass')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
          mode === 'tilpass'
            ? 'bg-[#F26522] text-white shadow-sm shadow-[#F26522]/30'
            : 'text-[rgba(130,170,240,0.45)] hover:text-white'
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Tilpass
      </button>
    </div>
  )
}
