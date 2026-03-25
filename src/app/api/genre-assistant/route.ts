import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  GENRE_ASSISTANT_SYSTEM_PROMPT,
  extractSunoPrompt,
  isFinalPrompt,
} from '@/lib/prompts/genre-assistant-system-prompt'
import { getClientIp } from '@/lib/lyrics-rate-limit'
import { createClient } from '@/lib/supabase/server'

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
    // Rate limit: 10 requests per hour per IP for anonymous, 60 for authenticated
    const ipAddress = getClientIp(request)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const maxRequests = user ? 60 : 10
    const windowMs = 60 * 60 * 1000 // 1 hour

    const rateLimitKey = `genre-assistant:${user?.id || ipAddress}`
    const now = Date.now()

    // Simple in-memory rate limiting (resets on deploy, which is acceptable)
    const g = globalThis as Record<string, unknown>
    if (!g._genreRateLimits) g._genreRateLimits = new Map()
    const limits = g._genreRateLimits as Map<string, number[]>
    const timestamps = (limits.get(rateLimitKey) || []).filter(t => t > now - windowMs)

    if (timestamps.length >= maxRequests) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT', message: 'For mange forespørsler. Prøv igjen senere.' } },
        { status: 429 }
      )
    }

    timestamps.push(now)
    limits.set(rateLimitKey, timestamps)

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

    // Limit message count and size to prevent abuse
    if (messages.length > 20) {
      return NextResponse.json(
        { error: { code: 'TOO_MANY_MESSAGES', message: 'For mange meldinger.' } },
        { status: 400 }
      )
    }

    const totalChars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0)
    if (totalChars > 10000) {
      return NextResponse.json(
        { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Meldingene er for lange.' } },
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
