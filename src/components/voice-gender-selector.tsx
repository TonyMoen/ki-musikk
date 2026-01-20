'use client'

import { Button } from '@/components/ui/button'

export type VocalGender = 'm' | 'f' | null

interface VoiceGenderSelectorProps {
  value: VocalGender
  onChange: (value: VocalGender) => void
  className?: string
}

export function VoiceGenderSelector({
  value,
  onChange,
  className = ''
}: VoiceGenderSelectorProps) {
  const handleSelect = (gender: VocalGender) => {
    // Toggle off if same value selected, otherwise select new value
    onChange(value === gender ? null : gender)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, gender: VocalGender) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(gender)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-sm font-medium text-text-primary mb-2 text-center">
        Stemme
      </h3>
      <div
        role="radiogroup"
        aria-label="Velg stemmetype"
        className="flex justify-center gap-3"
      >
        <Button
          type="button"
          onClick={() => handleSelect('m')}
          onKeyDown={(e) => handleKeyDown(e, 'm')}
          variant={value === 'm' ? 'default' : 'outline'}
          className={`
            group
            min-h-[48px] min-w-[100px] px-6 py-2 rounded-lg
            transition-all duration-200
            flex items-center justify-center gap-2
            ${
              value === 'm'
                ? 'border-[3px] border-[#E94560] text-white hover:opacity-90 bg-gradient-to-br from-[#E94560] to-[#FFC93C]'
                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gradient-to-br hover:from-[#E94560] hover:to-[#FFC93C] hover:text-white hover:border-[#E94560]'
            }
            focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:ring-offset-2
          `}
          role="radio"
          aria-checked={value === 'm'}
          tabIndex={0}
        >
          <span className="font-medium">Mann</span>
        </Button>

        <Button
          type="button"
          onClick={() => handleSelect('f')}
          onKeyDown={(e) => handleKeyDown(e, 'f')}
          variant={value === 'f' ? 'default' : 'outline'}
          className={`
            group
            min-h-[48px] min-w-[100px] px-6 py-2 rounded-lg
            transition-all duration-200
            flex items-center justify-center gap-2
            ${
              value === 'f'
                ? 'border-[3px] border-[#E94560] text-white hover:opacity-90 bg-gradient-to-br from-[#E94560] to-[#FFC93C]'
                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gradient-to-br hover:from-[#E94560] hover:to-[#FFC93C] hover:text-white hover:border-[#E94560]'
            }
            focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:ring-offset-2
          `}
          role="radio"
          aria-checked={value === 'f'}
          tabIndex={0}
        >
          <span className="font-medium">Kvinne</span>
        </Button>
      </div>
    </div>
  )
}
