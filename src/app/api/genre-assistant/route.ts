import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  GENRE_ASSISTANT_SYSTEM_PROMPT,
  extractSunoPrompt,
  isFinalPrompt,
} from '@/lib/prompts/genre-assistant-system-prompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GenreAssistantRequest {
  messages: ChatMessage[]
}

export interface GenreAssistantResponse {
  data?: {
    message: string
    isFinalPrompt: boolean
    sunoPrompt?: string
  }
  error?: {
    code: string
    message: string
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenreAssistantResponse>> {
  try {
    const { messages } = (await request.json()) as GenreAssistantRequest

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_MESSAGES',
            message: 'Meldinger er påkrevd',
          },
        },
        { status: 400 }
      )
    }

    // Ensure system prompt is first
    const messagesWithSystem: ChatMessage[] = [
      {
        role: 'system',
        content: GENRE_ASSISTANT_SYSTEM_PROMPT,
      },
      ...messages.filter((m) => m.role !== 'system'),
    ]

    // Call GPT-4 for conversational response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: messagesWithSystem,
      max_tokens: 500, // Shorter responses for chat
    })

    const aiMessage = completion.choices[0]?.message?.content?.trim() || ''

    if (!aiMessage) {
      return NextResponse.json(
        {
          error: {
            code: 'GENERATION_FAILED',
            message: 'Kunne ikke generere svar. Prøv igjen.',
          },
        },
        { status: 500 }
      )
    }

    // Check if this is a final prompt response
    const isPrompt = isFinalPrompt(aiMessage)
    const sunoPrompt = isPrompt ? extractSunoPrompt(aiMessage) : undefined

    return NextResponse.json({
      data: {
        message: aiMessage,
        isFinalPrompt: isPrompt,
        sunoPrompt: sunoPrompt || undefined,
      },
    })
  } catch (error) {
    console.error('Genre assistant chat failed:', error)

    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: {
            code: 'API_KEY_ERROR',
            message:
              'Kunne ikke koble til AI-tjenesten. Vennligst prøv igjen senere.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'CHAT_FAILED',
          message: 'Kunne ikke generere svar. Prøv igjen.',
        },
      },
      { status: 500 }
    )
  }
}
