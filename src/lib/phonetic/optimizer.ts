// Norwegian pronunciation optimizer using GPT-4
import OpenAI from 'openai'
import { applyCachedRules, shouldPreserveWord, type PhoneticRule } from './rules'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface PhoneticChange {
  original: string
  optimized: string
  reason: string
  lineNumber: number
}

export interface OptimizationResult {
  originalLyrics: string
  optimizedLyrics: string
  changes: PhoneticChange[]
  cacheHitRate: number // Percentage of words optimized from cache
}

/**
 * Optimize Norwegian lyrics for authentic pronunciation in AI-generated songs
 * Uses cache-first approach, then GPT-4 for remaining words
 */
export async function optimizeLyrics(
  lyrics: string
): Promise<OptimizationResult> {
  if (!lyrics || lyrics.trim().length === 0) {
    return {
      originalLyrics: lyrics,
      optimizedLyrics: lyrics,
      changes: [],
      cacheHitRate: 0
    }
  }

  // Step 1: Apply cached phonetic rules
  const cachedRules = applyCachedRules(lyrics)
  const totalWords = lyrics.split(/\s+/).length
  const cacheHitRate =
    totalWords > 0 ? (cachedRules.length / totalWords) * 100 : 0

  // Step 2: Identify words to preserve (proper nouns, place names)
  const lines = lyrics.split('\n')
  const preservedWordsList: string[] = []
  lines.forEach(line => {
    const words = line.split(/\s+/)
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:"'\-()]/g, '')
      if (shouldPreserveWord(cleanWord)) {
        preservedWordsList.push(cleanWord)
      }
    })
  })

  // Step 3: Call GPT-4 for intelligent phonetic optimization
  let gptChanges: PhoneticChange[] = []

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.3, // Low temperature for consistency
      messages: [
        {
          role: 'system',
          content: `Du er en norsk fonetikkekspert som optimaliserer sangtekster for AI-generert musikk (Suno AI).

KRITISK: Suno AI produserer "amerikansk-klingende" vokal for norsk tekst uten fonetisk optimalisering.

Din oppgave er å analysere norsk tekst og foreslå fonetiske stavemåter som gir autentisk norsk uttale.

FOKUSOMRÅDER:
1. Rullende R-lyder (rrr): "rundt" → "rrrrundt", "rød" → "rrrød"
2. Norske vokalpar (æ, ø, å): Forlenget uttale der naturlig
3. Konsonantklynger (kj, skj, gj): Tydelig norsk uttale
4. Tonefall og stress: Norsk prosodi

VIKTIGE REGLER:
- Behold egennavn og stedsnavn UENDRET: ${preservedWordsList.join(', ')}
- Ikke endre ord som allerede er fonetisk optimert fra cache
- Bevar linjestruktur og strofeinndeling
- Ikke endre spesialtegn (æ, ø, å)
- Fokuser på ord som vil gi "amerikansk" uttale uten optimalisering

Returner JSON med denne eksakte strukturen:
{
  "changes": [
    {
      "original": "ord",
      "optimized": "optimalisert-ord",
      "reason": "kort forklaring",
      "lineNumber": 1
    }
  ]
}

Hvis ingen optimalisering trengs, returner: {"changes": []}`
        },
        {
          role: 'user',
          content: `Optimaliser denne norske sangteksten for autentisk uttale:\n\n${lyrics}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800
    })

    const responseContent = completion.choices[0]?.message?.content
    if (responseContent) {
      const result = JSON.parse(responseContent)
      gptChanges = result.changes || []
    }
  } catch (error) {
    console.error('GPT-4 phonetic optimization failed:', error)
    // Graceful degradation: continue with cache-only optimization
  }

  // Step 4: Merge cached rules with GPT-4 changes
  const allChanges: PhoneticChange[] = []

  // Add cached rules with line numbers
  cachedRules.forEach(rule => {
    lines.forEach((line, index) => {
      if (
        line
          .toLowerCase()
          .includes(rule.original.toLowerCase())
      ) {
        allChanges.push({
          original: rule.original,
          optimized: rule.optimized,
          reason: rule.reason,
          lineNumber: index + 1
        })
      }
    })
  })

  // Add GPT-4 changes (avoid duplicates)
  gptChanges.forEach(change => {
    const isDuplicate = allChanges.some(
      existing =>
        existing.original.toLowerCase() === change.original.toLowerCase() &&
        existing.lineNumber === change.lineNumber
    )
    if (!isDuplicate) {
      allChanges.push(change)
    }
  })

  // Step 5: Apply all optimizations to create optimized lyrics
  let optimizedLyrics = lyrics

  // Sort changes by line number and position for consistent application
  const sortedChanges = [...allChanges].sort(
    (a, b) => a.lineNumber - b.lineNumber
  )

  sortedChanges.forEach(change => {
    // Use word boundary regex to avoid partial matches
    // Case-insensitive matching, but preserve original case in non-matching parts
    const regex = new RegExp(`\\b${escapeRegex(change.original)}\\b`, 'gi')
    optimizedLyrics = optimizedLyrics.replace(regex, change.optimized)
  })

  return {
    originalLyrics: lyrics,
    optimizedLyrics,
    changes: sortedChanges,
    cacheHitRate: Math.round(cacheHitRate)
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Quick validation that optimization preserved meaning
 * Checks that line count and approximate word count are similar
 */
export function validateOptimization(
  original: string,
  optimized: string
): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  const originalLines = original.split('\n').length
  const optimizedLines = optimized.split('\n').length

  if (originalLines !== optimizedLines) {
    issues.push('Line count mismatch - struktur endret')
  }

  const originalWords = original.split(/\s+/).length
  const optimizedWords = optimized.split(/\s+/).length

  // Allow up to 10% word count difference (phonetic additions like "rrr")
  const wordCountDiff = Math.abs(originalWords - optimizedWords)
  const maxAllowedDiff = Math.ceil(originalWords * 0.1)

  if (wordCountDiff > maxAllowedDiff) {
    issues.push(
      `Word count mismatch too large - ${wordCountDiff} words difference`
    )
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}
