'use client'

import { Button } from '@/components/ui/button'

interface QuickAnswersProps {
  answers: string[]
  onSelect: (answer: string) => void
}

export function QuickAnswers({ answers, onSelect }: QuickAnswersProps) {
  if (answers.length === 0) return null

  return (
    <div className="px-6 pb-4">
      <p className="text-xs text-text-secondary mb-2">Hurtigsvar:</p>
      <div className="grid grid-cols-2 gap-2">
        {answers.map((answer, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(answer)}
            className="h-auto py-2 px-3 text-xs hover:bg-primary/10 hover:border-primary/50 text-left whitespace-normal"
          >
            {answer}
          </Button>
        ))}
      </div>
    </div>
  )
}
