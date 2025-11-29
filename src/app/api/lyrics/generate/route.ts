import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { LyricGenerationResponse } from '@/types/song'
import {
  SONG_WRITER_SYSTEM_PROMPT,
  getRandomStructure,
  detectStructureOverrides,
  buildUserMessage,
} from '@/lib/prompts/song-writer-system-prompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest): Promise<NextResponse<LyricGenerationResponse>> {
  try {
    const { concept, genre } = await request.json()

    // Validate inputs
    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CONCEPT',
            message: 'Konsept er påkrevd'
          }
        },
        { status: 400 }
      )
    }

    if (concept.length < 10) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCEPT_TOO_SHORT',
            message: 'Konseptet må være minst 10 tegn'
          }
        },
        { status: 400 }
      )
    }

    if (concept.length > 500) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCEPT_TOO_LONG',
            message: 'Konseptet kan ikke være mer enn 500 tegn'
          }
        },
        { status: 400 }
      )
    }

    if (!genre || typeof genre !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_GENRE',
            message: 'Sjanger er påkrevd'
          }
        },
        { status: 400 }
      )
    }

    // Detect structure overrides from user prompt
    const overrides = detectStructureOverrides(concept)

    // Use detected structure or random selection
    const structure = overrides.structure ?? getRandomStructure()

    // Build user message with structure instructions
    const userMessage = buildUserMessage(concept, genre, structure, overrides)

    // Generate lyrics with GPT-4 using comprehensive song writer prompt
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: SONG_WRITER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 1000
    })

    const rawOutput = completion.choices[0]?.message?.content?.trim() || ''

    if (!rawOutput) {
      return NextResponse.json(
        {
          error: {
            code: 'GENERATION_FAILED',
            message: 'Kunne ikke generere tekst. Prøv igjen.'
          }
        },
        { status: 500 }
      )
    }

    // Parse title from first line (before any [Tag])
    const lines = rawOutput.split('\n')
    let title = 'Uten tittel'
    let lyricsStartIndex = 0

    // Find title (first non-empty line that doesn't start with '[')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('[')) {
        title = line
        lyricsStartIndex = i + 1
        break
      } else if (line.startsWith('[')) {
        // No title found, lyrics start immediately
        lyricsStartIndex = i
        break
      }
    }

    // Skip any empty lines between title and first tag
    while (lyricsStartIndex < lines.length && !lines[lyricsStartIndex].trim()) {
      lyricsStartIndex++
    }

    const lyrics = lines.slice(lyricsStartIndex).join('\n').trim()

    // Truncate title to max 20 characters
    const truncatedTitle = title.length > 20 ? title.substring(0, 20).trim() : title

    return NextResponse.json({
      data: { lyrics, title: truncatedTitle }
    })
  } catch (error) {
    console.error('Lyric generation failed:', error)

    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: {
            code: 'API_KEY_ERROR',
            message: 'Kunne ikke koble til AI-tjenesten. Vennligst prøv igjen senere.'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'GENERATION_FAILED',
          message: 'Kunne ikke generere tekst. Prøv igjen.'
        }
      },
      { status: 500 }
    )
  }
}
