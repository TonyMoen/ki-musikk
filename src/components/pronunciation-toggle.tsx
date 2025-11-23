// Pronunciation toggle component for Norwegian phonetic optimization
'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

export interface PronunciationToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
}

export function PronunciationToggle({
  enabled,
  onToggle,
  disabled = false
}: PronunciationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <Label
          htmlFor="pronunciation-toggle"
          className="text-base font-medium cursor-pointer"
        >
          Uttalelse Bokmål
        </Label>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Optimaliserer norsk uttale automatisk ved å bruke AI til å
                foreslå fonetiske stavemåter. Dette gir autentisk norsk vokal
                i stedet for &quot;amerikansk-klingende&quot; resultat.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Switch
        id="pronunciation-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-[#06D6A0]"
      />

      <p className="text-sm text-muted-foreground mt-1 w-full">
        {enabled
          ? 'Norsk uttale aktivert - teksten optimaliseres automatisk'
          : 'Norsk uttale deaktivert - bruker original tekst'}
      </p>
    </div>
  )
}
