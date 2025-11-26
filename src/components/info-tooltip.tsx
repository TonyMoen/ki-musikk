'use client'

import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

export interface InfoTooltipProps {
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

/**
 * InfoTooltip - Reusable info icon with tooltip
 *
 * Accessibility:
 * - Keyboard accessible (Tab to focus, Enter/Space to toggle)
 * - ARIA attributes handled by Radix UI
 * - Touch-friendly: tap to show, tap outside to dismiss
 *
 * Styling:
 * - White background with drop shadow
 * - Max-width 250px for readability
 * - Navy text for contrast
 */
export function InfoTooltip({
  content,
  side = 'top',
  className
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center p-1 rounded-full
            hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:p-1 ${className || ''}`}
          aria-label="Mer informasjon"
        >
          <Info className="h-4 w-4 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="bg-white text-secondary shadow-lg max-w-[250px] rounded-md px-3 py-2 text-sm"
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
