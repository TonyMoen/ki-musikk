'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { number: 1, label: 'Sangtekst' },
  { number: 2, label: 'Stil & sjanger' },
  { number: 3, label: 'Oppsummering' },
]

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
  onStepClick: (step: 1 | 2 | 3) => void
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isCurrent = step.number === currentStep
        const isFuture = step.number > currentStep

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <button
              type="button"
              onClick={() => isCompleted && onStepClick(step.number as 1 | 2 | 3)}
              disabled={!isCompleted}
              className={cn(
                'flex flex-col items-center gap-1.5 group',
                isCompleted && 'cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  isCurrent && 'bg-[#F26522] text-white shadow-lg shadow-[#F26522]/25',
                  isCompleted && 'border-2 border-[#F26522] text-[#F26522] group-hover:bg-[#F26522]/10',
                  isFuture && 'border-2 border-[rgba(90,140,255,0.13)] text-[rgba(180,200,240,0.5)]'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent && 'text-white',
                  isCompleted && 'text-[#F26522]',
                  isFuture && 'text-[rgba(180,200,240,0.5)]'
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[2px] mx-2 mt-[-20px] transition-colors duration-300',
                  step.number < currentStep ? 'bg-[#F26522]' : 'bg-[rgba(90,140,255,0.1)]'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
