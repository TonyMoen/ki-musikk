'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface InputContainerProps {
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  onSubmit: ((value: string) => void) | (() => void)
  submitLabel?: string
  submitDisabled?: boolean
}

export function InputContainer({
  placeholder,
  value: controlledValue,
  onChange,
  onSubmit,
  submitLabel = "Send",
  submitDisabled = false
}: InputContainerProps) {
  const [localValue, setLocalValue] = useState('')

  const isControlled = controlledValue !== undefined
  const inputValue = isControlled ? controlledValue : localValue

  const handleChange = (newValue: string) => {
    if (isControlled) {
      onChange?.(newValue)
    } else {
      setLocalValue(newValue)
    }
  }

  const handleSubmit = () => {
    if (submitDisabled) return

    if (isControlled) {
      // Controlled mode - call without arguments
      ;(onSubmit as () => void)()
    } else {
      // Uncontrolled mode - pass the value
      if (inputValue.trim()) {
        ;(onSubmit as (value: string) => void)(inputValue.trim())
        setLocalValue('')
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border p-4 bg-card">
      <div className="flex gap-2">
        <Textarea
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none focus-visible:ring-primary bg-background text-foreground"
          disabled={submitDisabled}
        />
        <Button
          onClick={handleSubmit}
          disabled={submitDisabled || (!isControlled && !inputValue.trim())}
          size="icon"
          className="h-[80px] w-12 bg-primary hover:bg-primary/90 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="sr-only">{submitLabel}</span>
        </Button>
      </div>
    </div>
  )
}
