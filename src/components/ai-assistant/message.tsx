'use client'

import { cn } from '@/lib/utils'

interface MessageProps {
  type: 'ai' | 'user'
  text: string
}

export function Message({ type, text }: MessageProps) {
  const isAI = type === 'ai'

  return (
    <div
      className={cn(
        "flex mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl",
          isAI
            ? "bg-surface text-text-primary rounded-tl-none"
            : "bg-primary text-white rounded-tr-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  )
}
