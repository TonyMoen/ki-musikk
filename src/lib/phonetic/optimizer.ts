// Norwegian pronunciation optimizer - Hybrid approach
// Combines deterministic rule-engine (fast, consistent) with GPT-4 (edge cases)
// Updated 2025-11-29: Hybrid approach for best of both worlds

import OpenAI from 'openai'
import { preservedWords } from './rules'
import { applyAllRules, TransformationResult } from './rule-engine'

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
  cacheHitRate: number
}

/**
 * Convert rule-engine TransformationResult to PhoneticChange format
 */
function convertRuleEngineChanges(changes: TransformationResult[]): PhoneticChange[] {
  return changes.map(change => ({
    original: change.original,
    optimized: change.transformed,
    reason: change.rule,
    lineNumber: change.lineNumber
  }))
}

/**
 * Apply deterministic rule-engine transformations
 * Handles: Silent D, ND→NN, RD→R, OG→Å, Acronyms, Numbers
 */
function applyRuleEngineOptimizations(
  lyrics: string
): { text: string; changes: PhoneticChange[] } {
  const { transformedLyrics, changes } = applyAllRules(lyrics)
  return {
    text: transformedLyrics,
    changes: convertRuleEngineChanges(changes)
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Optimize Norwegian lyrics for authentic pronunciation in AI-generated songs
 * HYBRID APPROACH: Rule-engine (deterministic) + GPT-4 (edge cases)
 *
 * Process:
 * 1. Apply rule-engine for deterministic patterns (ND→NN, RD→R, Silent D, OG→Å, Acronyms, Numbers)
 * 2. Call GPT-4 for remaining edge cases (vowel sounds, kj/skj/gj clusters, etc.)
 * 3. Merge and deduplicate results
 */
export async function optimizeLyrics(
  lyrics: string
): Promise<OptimizationResult> {
  if (!lyrics || lyrics.trim().length === 0) {
    return {
      originalLyrics: lyrics,
      optimizedLyrics: lyrics,
      changes: [],
      cacheHitRate: 100
    }
  }

  // Step 1: Apply rule-engine (deterministic transformations)
  const {
    text: ruleEngineOptimized,
    changes: ruleEngineChanges
  } = applyRuleEngineOptimizations(lyrics)

  // Calculate rule-engine coverage
  const totalWords = lyrics.split(/\s+/).filter(w => w.length > 0).length
  const ruleEngineHitRate = totalWords > 0
    ? Math.round((ruleEngineChanges.length / totalWords) * 100)
    : 0

  // Step 2: Call GPT-4 for edge cases (vowels, consonant clusters, etc.)
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Du er en norsk fonetikkekspert som optimaliserer sangtekster for AI-generert musikk (Suno).

Teksten har allerede fått følgende transformasjoner:
- Stum D fjernet (god→go, ved→ve, etc.)
- ND→NN (land→lann)
- RD→R (fjord→fjor)
- OG→Å (og→å)
- Akronymer utvidet (FRP→Eff-Err-Pe)
- Tall konvertert (2025→tjue-tjue-fem)

Fokuser NÅ på disse GJENVÆRENDE optimaliseringene:
- Norske vokallyder (æ, ø, å - tydeliggjøres der det hjelper uttalen)
- Konsonantklynger (kj, skj, gj - fonetisk skriving)
- Andre uttalenyanser som ikke dekkes av reglene over

VIKTIG:
- IKKE endre ord som allerede er transformert
- Behold egennavn og stedsnavn UENDRET (Oslo, Bergen, Lars, etc.)
- Kun foreslå endringer som VIRKELIG forbedrer uttalen

Returner ALLTID gyldig JSON:
{
  "changes": [
    {"original": "ord", "optimized": "ord", "reason": "kort forklaring", "lineNumber": 1}
  ]
}

Hvis ingen endringer trengs, returner: {"changes": []}`
        },
        {
          role: 'user',
          content: `Optimaliser denne teksten for autentisk norsk uttale:\n\n${ruleEngineOptimized}`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content || '{}'
    const gptResult = JSON.parse(responseContent)
    const gptChanges: PhoneticChange[] = gptResult.changes || []

    // Apply GPT-4 optimizations to the rule-engine output
    let finalOptimized = ruleEngineOptimized
    for (const change of gptChanges) {
      // Skip if already transformed by rule-engine
      if (ruleEngineChanges.some(c => c.original.toLowerCase() === change.original.toLowerCase())) {
        continue
      }

      // Skip preserved words
      if (preservedWords.includes(change.original.toLowerCase())) {
        continue
      }

      const regex = new RegExp(`\\b${escapeRegex(change.original)}\\b`, 'gi')
      finalOptimized = finalOptimized.replace(regex, match => {
        // Preserve capitalization
        if (match[0] === match[0].toUpperCase()) {
          return change.optimized.charAt(0).toUpperCase() + change.optimized.slice(1)
        }
        return change.optimized
      })
    }

    // Merge changes (rule-engine + GPT-4)
    const allChanges = [...ruleEngineChanges, ...gptChanges.filter(
      gc => !ruleEngineChanges.some(rc => rc.original.toLowerCase() === gc.original.toLowerCase())
    )]

    // Deduplicate changes
    const uniqueChanges: PhoneticChange[] = []
    const seen = new Set<string>()
    for (const change of allChanges) {
      const key = `${change.original.toLowerCase()}-${change.lineNumber}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueChanges.push(change)
      }
    }

    return {
      originalLyrics: lyrics,
      optimizedLyrics: finalOptimized,
      changes: uniqueChanges,
      cacheHitRate: ruleEngineHitRate
    }
  } catch (error) {
    console.error('GPT-4 phonetic optimization failed:', error)

    // Graceful degradation: Return rule-engine optimizations only
    return {
      originalLyrics: lyrics,
      optimizedLyrics: ruleEngineOptimized,
      changes: ruleEngineChanges,
      cacheHitRate: ruleEngineHitRate
    }
  }
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

  // Allow up to 20% word count difference (phonetic expansions add characters)
  const wordCountDiff = Math.abs(originalWords - optimizedWords)
  const maxAllowedDiff = Math.ceil(originalWords * 0.2)

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
