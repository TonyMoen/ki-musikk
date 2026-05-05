/**
 * Smart-modus: AI-orchestrated lyric + genre generation.
 *
 * Pipeline (single request):
 *   1. Validate concept + occasion
 *   2. Rate limit (shared 'generate' bucket with manual lyrics endpoint)
 *   3. Fetch active genres from DB
 *   4. Genre picker call (gpt-4o-mini, JSON output) → picks best-fit genre
 *   5. Lyric generator call (gpt-4o, reuses Tilpass songwriter prompt + structure
 *      randomization) → writes lyrics with picked-genre context
 *   6. Return everything for the Smart review screen
 *
 * NOTE: This endpoint does NOT trigger Suno generation. It only produces
 * lyrics + genre suggestion. The user clicks "Lag sangen min" on the review
 * screen, which auth-gates and then calls the existing /api/songs/generate.
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import {
  checkLyricsRateLimit,
  recordLyricsUsage,
  getClientIp,
} from '@/lib/lyrics-rate-limit'
import {
  SONG_WRITER_SYSTEM_PROMPT,
  getRandomStructure,
  detectStructureOverrides,
  buildUserMessage,
} from '@/lib/prompts/song-writer-system-prompt'
import {
  SMART_GENRE_PICKER_PROMPT,
  buildGenrePickerMessage,
  validatePickerResult,
  type PickerGenreOption,
} from '@/lib/prompts/smart-genre-picker'
import type {
  SmartGenerateRequest,
  SmartGenerateResponse,
  Occasion,
} from '@/types/smart'

// Lazy-init OpenAI to avoid throwing at build-time page-data collection.
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

const VALID_OCCASIONS: ReadonlyArray<Occasion> = [
  'bursdag',
  'bryllup',
  'russ',
  'jubileum',
  'jul',
  'annet',
]

/**
 * Smart-modus quick-pick chips that map directly to a DB `genre.name`.
 * When the user picks one of these, the picker LLM is bypassed and the
 * matching genre is used as-is — same prompt template Tilpass step 2/3
 * applies, so the audio output is consistent across both flows.
 *
 * 'Bursdag' is intentionally NOT mapped: it's an occasion, not a genre,
 * and the picker is allowed to choose the most fitting genre for it.
 */
const QUICK_PICK_GENRE_NAME: Record<string, string> = {
  Russ: 'russelaat',
  Festmusikk: 'festlaat',
  Country: 'country',
  Rock: 'rock',
}

const VALID_QUICK_PICKS: ReadonlyArray<string> = [
  'Bursdag',
  'Russ',
  'Festmusikk',
  'Country',
  'Rock',
]

export async function POST(
  request: NextRequest
): Promise<NextResponse<SmartGenerateResponse>> {
  try {
    const body = (await request.json()) as Partial<SmartGenerateRequest>
    const { concept, occasion, quickPick } = body

    // 1. Validate concept
    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_CONCEPT', message: 'Konsept er påkrevd' } },
        { status: 400 }
      )
    }
    if (concept.length < 1) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCEPT_EMPTY',
            message: 'Konsept kan ikke være tomt',
          },
        },
        { status: 400 }
      )
    }
    if (concept.length > 500) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCEPT_TOO_LONG',
            message: 'Konseptet kan ikke være mer enn 500 tegn',
          },
        },
        { status: 400 }
      )
    }

    // Validate occasion if provided
    let validOccasion: Occasion | undefined
    if (occasion !== undefined) {
      if (typeof occasion !== 'string' || !VALID_OCCASIONS.includes(occasion as Occasion)) {
        return NextResponse.json(
          {
            error: { code: 'INVALID_OCCASION', message: 'Ugyldig anledning' },
          },
          { status: 400 }
        )
      }
      validOccasion = occasion as Occasion
    }

    // Validate quickPick if provided. Unknown values are dropped silently —
    // we don't want a stale frontend to break generation; the picker will
    // just run as fallback.
    let validQuickPick: string | undefined
    if (quickPick !== undefined) {
      if (typeof quickPick === 'string' && VALID_QUICK_PICKS.includes(quickPick)) {
        validQuickPick = quickPick
      }
    }

    // 2. Rate limit (shared bucket with manual lyrics endpoint)
    const ip = getClientIp(request)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const rateLimit = await checkLyricsRateLimit(user?.id ?? null, ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: rateLimit.requiresLogin
              ? 'LYRICS_RATE_LIMIT_ANON'
              : 'LYRICS_RATE_LIMIT',
            message:
              rateLimit.message || 'For mange forespørsler. Prøv igjen senere.',
          },
        },
        { status: 429 }
      )
    }

    // 3. Fetch active genres
    const { data: genreRows, error: genreError } = await supabase
      .from('genre')
      .select('id, name, display_name, description, emoji, suno_prompt_template')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (genreError || !genreRows || genreRows.length === 0) {
      console.error('Smart-generate: failed to fetch genres', genreError)
      return NextResponse.json(
        {
          error: {
            code: 'GENRE_FETCH_FAILED',
            message: 'Kunne ikke hente sjangere. Prøv igjen.',
          },
        },
        { status: 500 }
      )
    }

    const genres = genreRows as PickerGenreOption[]

    // 4. Genre selection — quick-pick shortcut OR picker LLM call.
    // If the user clicked a chip that maps to a concrete DB genre, skip the
    // picker entirely and use that row's prompt template directly. Mirrors
    // Tilpass step 2/3, where selecting a genre auto-fills the same template.
    let pickedGenre: PickerGenreOption
    let pickerReasoning: string

    const directGenreName = validQuickPick ? QUICK_PICK_GENRE_NAME[validQuickPick] : undefined
    const directMatch = directGenreName
      ? genres.find((g) => g.name.toLowerCase() === directGenreName.toLowerCase())
      : undefined

    if (directMatch) {
      pickedGenre = directMatch
      pickerReasoning = `Valgt av bruker via hurtigvalg: ${validQuickPick}`
    } else {
      try {
        const pickerCompletion = await getOpenAI().chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SMART_GENRE_PICKER_PROMPT },
            {
              role: 'user',
              content: buildGenrePickerMessage(concept, validOccasion, genres),
            },
          ],
          max_tokens: 200,
        })

        const rawPickerOutput = pickerCompletion.choices[0]?.message?.content || '{}'
        const parsed = JSON.parse(rawPickerOutput)
        const validated = validatePickerResult(parsed, genres)

        if (!validated) {
          // Picker hallucinated or returned invalid output — fall back to first genre
          // (sort_order 1, typically the most "default" genre).
          console.warn('Smart-generate: picker returned invalid genre, falling back', {
            rawPickerOutput,
          })
          pickedGenre = genres[0]
          pickerReasoning = 'Standardvalg basert på konseptet'
        } else {
          pickedGenre = validated.genre
          pickerReasoning = validated.reasoning
        }
      } catch (err) {
        console.error('Smart-generate: genre picker failed', err)
        // Graceful degradation: use first genre rather than failing the whole request
        pickedGenre = genres[0]
        pickerReasoning = 'Standardvalg (AI-valg feilet)'
      }
    }

    // 5. Lyric generator call (mirrors /api/lyrics/generate logic with picked genre)
    const overrides = detectStructureOverrides(concept)
    const structure = overrides.structure ?? getRandomStructure()
    const userMessage = buildUserMessage(
      concept,
      pickedGenre.display_name,
      structure,
      overrides
    )

    const lyricCompletion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
        { role: 'system', content: SONG_WRITER_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1000,
    })

    const rawLyrics = lyricCompletion.choices[0]?.message?.content?.trim() || ''
    if (!rawLyrics) {
      return NextResponse.json(
        {
          error: {
            code: 'GENERATION_FAILED',
            message: 'Kunne ikke generere tekst. Prøv igjen.',
          },
        },
        { status: 500 }
      )
    }

    // 6. Parse title + lyrics (mirrors /api/lyrics/generate parsing)
    const lines = rawLyrics.split('\n')
    let title = 'Uten tittel'
    let lyricsStartIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('[')) {
        title = line
        lyricsStartIndex = i + 1
        break
      } else if (line.startsWith('[')) {
        lyricsStartIndex = i
        break
      }
    }

    while (lyricsStartIndex < lines.length && !lines[lyricsStartIndex].trim()) {
      lyricsStartIndex++
    }

    const lyrics = lines.slice(lyricsStartIndex).join('\n').trim()
    const truncatedTitle =
      title.length > 40 ? title.substring(0, 40).trim() : title

    // 7. Record usage
    await recordLyricsUsage(user?.id ?? null, ip, 'generate')

    return NextResponse.json({
      data: {
        lyrics,
        title: truncatedTitle,
        genreId: pickedGenre.id,
        genreName: pickedGenre.name,
        genreDisplayName: pickedGenre.display_name,
        genreEmoji: pickedGenre.emoji,
        genreReasoning: pickerReasoning,
        genreSunoPrompt: pickedGenre.suno_prompt_template,
      },
    })
  } catch (error) {
    console.error('Smart-generate failed:', error)
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
          code: 'GENERATION_FAILED',
          message: 'Kunne ikke generere tekst. Prøv igjen.',
        },
      },
      { status: 500 }
    )
  }
}
