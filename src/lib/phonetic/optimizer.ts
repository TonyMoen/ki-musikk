// Norwegian pronunciation optimizer using deterministic rule engine
// Replaces GPT-4 API calls with consistent, predictable transformations (v3.0)

import { applyAllRules, type TransformationResult } from './rule-engine'

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
  cacheHitRate: number // Kept for backward compatibility (always 100% with rule engine)
}

/**
 * Convert rule engine results to PhoneticChange format for backward compatibility
 */
function transformResultsToChanges(
  results: TransformationResult[]
): PhoneticChange[] {
  return results.map(result => ({
    original: result.original,
    optimized: result.transformed,
    reason: result.rule,
    lineNumber: result.lineNumber
  }))
}

/**
 * Optimize Norwegian lyrics for authentic pronunciation in AI-generated songs
 * Uses deterministic rule engine (no API calls)
 *
 * Rules applied in order:
 * 1. Silent D removal (rød→rø, god→go, with "død" context detection)
 * 2. ND→NN pattern (land→lann, strand→strann)
 * 3. RD→R pattern (fjord→fjor, nord→nor)
 * 4. OG→Å replacement (og→å)
 * 5. Acronym expansion (FRP→Eff-Err-Pe, NRK→Enn-Err-Kå)
 * 6. Number expansion (2025→tjue-tjue-fem)
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

  // Apply all transformation rules
  const { transformedLyrics, changes } = applyAllRules(lyrics)

  // Convert to PhoneticChange format for backward compatibility
  const phoneticChanges = transformResultsToChanges(changes)

  // Deduplicate changes (same word on same line)
  const uniqueChanges: PhoneticChange[] = []
  const seen = new Set<string>()

  for (const change of phoneticChanges) {
    const key = `${change.original.toLowerCase()}-${change.lineNumber}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueChanges.push(change)
    }
  }

  return {
    originalLyrics: lyrics,
    optimizedLyrics: transformedLyrics,
    changes: uniqueChanges,
    cacheHitRate: 100 // Rule engine is 100% deterministic (no cache misses)
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

  // Allow up to 20% word count difference (acronym expansions add hyphens)
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
