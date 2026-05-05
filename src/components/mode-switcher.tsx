'use client'

import { useRef, type KeyboardEvent } from 'react'
import { Sparkles, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WizardMode = 'smart' | 'tilpass'

interface ModeSwitcherProps {
  mode: WizardMode
  onChange: (mode: WizardMode) => void
}

const MODES: { key: WizardMode; label: string; Icon: typeof Sparkles }[] = [
  { key: 'smart', label: 'Smart', Icon: Sparkles },
  { key: 'tilpass', label: 'Tilpass', Icon: SlidersHorizontal },
]

/**
 * Tablist switching between Smart and Tilpass entry flows. Arrow keys move
 * focus AND activate the next/prev tab so the panel below updates immediately.
 */
export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') {
      return
    }
    e.preventDefault()
    let nextIndex = index
    if (e.key === 'ArrowLeft') nextIndex = (index - 1 + MODES.length) % MODES.length
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % MODES.length
    if (e.key === 'Home') nextIndex = 0
    if (e.key === 'End') nextIndex = MODES.length - 1
    onChange(MODES[nextIndex].key)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Velg modus"
      className="flex bg-[var(--surface-2)] rounded-full p-1 w-fit mx-auto"
    >
      {MODES.map(({ key, label, Icon }, index) => {
        const active = mode === key
        return (
          <button
            key={key}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`mode-tab-${key}`}
            aria-selected={active}
            aria-controls={`mode-panel-${key}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200',
              active
                ? 'bg-[#F26522] text-[var(--ink)] mode-toggle-active-glow'
                : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
