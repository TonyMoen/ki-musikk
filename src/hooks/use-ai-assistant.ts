'use client'

import { useState, useCallback } from 'react'
import { INITIAL_GREETING } from '@/lib/prompts/genre-assistant-system-prompt'

interface Message {
  id: string
  type: 'ai' | 'user'
  text: string
  timestamp: Date
}

interface CustomGenre {
  id: string
  name: string
  display_name: string
  sunoPrompt: string
  createdAt: Date
  isCustom: true
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAIAssistant(onSave: (genre: CustomGenre) => void) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: INITIAL_GREETING,
      timestamp: new Date(),
    },
  ])

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMessage = useCallback((text: string, type: 'ai' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const sendMessageToGPT = useCallback(
    async (userMessage: string): Promise<void> => {
      setIsLoading(true)
      setError(null)

      // Add user message to chat history
      const newChatHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage },
      ]

      try {
        const response = await fetch('/api/genre-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newChatHistory,
          }),
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || 'Kunne ikke generere svar')
        }

        const { message, isFinalPrompt, sunoPrompt } = data.data

        // Add AI response to messages
        addMessage(message, 'ai')

        // Update chat history with AI response
        setChatHistory([
          ...newChatHistory,
          { role: 'assistant', content: message },
        ])

        // If this is the final prompt, save it
        if (isFinalPrompt && sunoPrompt) {
          setGeneratedPrompt(sunoPrompt)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'En ukjent feil oppstod'
        setError(errorMessage)
        addMessage(
          `Beklager, det oppstod en feil: ${errorMessage}. Vennligst prøv igjen.`,
          'ai'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [chatHistory, addMessage]
  )

  const handleUserResponse = useCallback(
    async (answer: string) => {
      // Add user's answer to messages immediately
      addMessage(answer, 'user')

      // Send to GPT-4 for response
      await sendMessageToGPT(answer)
    },
    [addMessage, sendMessageToGPT]
  )

  const saveGenre = useCallback(
    (genreName: string) => {
      if (!generatedPrompt) return

      const newGenre: CustomGenre = {
        id: `custom-${Date.now()}`,
        name: genreName,
        display_name: genreName,
        sunoPrompt: generatedPrompt,
        createdAt: new Date(),
        isCustom: true,
      }

      onSave(newGenre)
    },
    [generatedPrompt, onSave]
  )

  const resetConversation = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        text: INITIAL_GREETING,
        timestamp: new Date(),
      },
    ])
    setChatHistory([])
    setGeneratedPrompt(null)
    setError(null)
  }, [])

  return {
    messages,
    generatedPrompt,
    handleUserResponse,
    saveGenre,
    resetConversation,
    isComplete: generatedPrompt !== null,
    isLoading,
    error,
    // Deprecated - no longer used with real AI
    getCurrentQuickAnswers: () => [],
    getCurrentPlaceholder: () =>
      generatedPrompt
        ? 'Skriv et navn for sjangeren...'
        : 'Skriv ditt svar her...',
  }
}
