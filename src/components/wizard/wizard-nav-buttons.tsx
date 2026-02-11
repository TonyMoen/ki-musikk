'use client'

import { cn } from '@/lib/utils'

interface WizardNavButtonsProps {
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  nextDisabled?: boolean
  showBack?: boolean
}

export function WizardNavButtons({
  onBack,
  onNext,
  backLabel = '← Tilbake',
  nextLabel = 'Neste →',
  nextDisabled = false,
  showBack = true,
}: WizardNavButtonsProps) {
  return (
    <div className={cn('flex gap-3 pt-6', showBack ? 'justify-between' : 'justify-end')}>
      {showBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-[rgba(130,170,240,0.45)] hover:text-white transition-colors rounded-xl"
        >
          {backLabel}
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={cn(
            'px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
            nextDisabled
              ? 'bg-[rgba(40,80,160,0.15)] text-[rgba(180,200,240,0.5)] cursor-not-allowed'
              : 'bg-[#F26522] text-white hover:bg-[#E05A1B] shadow-lg shadow-[#F26522]/20'
          )}
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}
