'use client'

import { useEffect, useRef } from 'react'
import { Message } from './message'

interface ChatMessage {
  id: string
  type: 'ai' | 'user'
  text: string
  timestamp: Date
}

interface ChatContainerProps {
  messages: ChatMessage[]
}

export function ChatContainer({ messages }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-2"
      style={{ maxHeight: 'calc(90vh - 300px)' }}
    >
      {messages.map((message) => (
        <Message
          key={message.id}
          type={message.type}
          text={message.text}
        />
      ))}
    </div>
  )
}
