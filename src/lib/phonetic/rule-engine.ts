// Norwegian Bokmål Phonetic Transformation Rule Engine
// Deterministic rule-based pronunciation optimizer (v3.0)
// Replaces GPT-4 API calls with consistent, predictable transformations

import { convertNumberToNorwegian } from './number-converter'
import { preservedWords } from './rules'

export interface TransformationResult {
  original: string
  transformed: string
  rule: string
  lineNumber: number
}

/**
 * Norwegian alphabet for acronym expansion
 */
const NORWEGIAN_ALPHABET: Record<string, string> = {
  A: 'A',
  B: 'Be',
  C: 'Se',
  D: 'De',
  E: 'E',
  F: 'Eff',
  G: 'Ge',
  H: 'Hå',
  I: 'I',
  J: 'Jod',
  K: 'Kå',
  L: 'Ell',
  M: 'Emm',
  N: 'Enn',
  O: 'O',
  P: 'Pe',
  Q: 'Ku',
  R: 'Err',
  S: 'Ess',
  T: 'Te',
  U: 'U',
  V: 'Ve',
  W: 'Dobbelt-Ve',
  X: 'Ekss',
  Y: 'Y',
  Z: 'Sett',
  Æ: 'Æ',
  Ø: 'Ø',
  Å: 'Å'
}

/**
 * Words that should NOT have Silent D applied
 */
const SILENT_D_EXCEPTIONS: string[] = ['tid', 'vid', 'bid', 'lid']

/**
 * Check if a word is a proper noun (should be preserved)
 */
function isProperNoun(word: string): boolean {
  const cleanWord = word.replace(/[.,!?;:"'\-()]/g, '').toLowerCase()
  return preservedWords.includes(cleanWord)
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get all matches for a regex pattern in text
 */
function getAllMatches(text: string, pattern: RegExp): RegExpExecArray[] {
  const matches: RegExpExecArray[] = []
  let match: RegExpExecArray | null

  // Reset lastIndex for global patterns
  pattern.lastIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    matches.push(match)
    // Prevent infinite loop for zero-length matches
    if (match[0].length === 0) {
      pattern.lastIndex++
    }
  }

  return matches
}

/**
 * Rule 1: Silent D Removal
 * Removes 'd' from word endings (with special handling for "død")
 */
export function applySilentDRule(
  text: string,
  lineNumber: number
): TransformationResult[] {
  const results: TransformationResult[] = []
  let workingText = text

  // Handle neuter forms first: godt → gott
  const neuterPattern = /\b(go)dt\b/gi
  const neuterMatches = getAllMatches(workingText, neuterPattern)
  for (const match of neuterMatches) {
    const original = match[0]
    // Preserve case
    const transformed = original.endsWith('t')
      ? original.slice(0, -2) + 'tt'
      : original.slice(0, -2) + 'TT'
    results.push({
      original,
      transformed,
      rule: 'Stum D (nøytrum): godt → gott',
      lineNumber
    })
  }
  workingText = workingText.replace(/\b(go)dt\b/gi, '$1tt')

  // Handle "død" with context detection
  // By default, "død" is treated as adjective (remove D)
  // EXCEPT when preceded by quantifiers like "mye", "lite", "noe" etc. (noun usage - keep D)

  // First, mark noun usages that should NOT be transformed
  const nounPatterns = [
    /\b(mye|lite|noe|masse|litt|mer|mest)\s+død\b/gi // "mye død" = "much death" (noun)
  ]

  // Track which "død" instances are nouns (should keep D)
  const nounDødPositions: number[] = []
  for (const pattern of nounPatterns) {
    let match
    pattern.lastIndex = 0
    while ((match = pattern.exec(workingText)) !== null) {
      // Find the position of "død" in this match
      const dødIndex = match.index + match[0].lastIndexOf('død')
      nounDødPositions.push(dødIndex)
    }
  }

  // Now transform all "død" instances EXCEPT those at noun positions
  const dødPattern = /\bdød\b/gi
  const dødMatches = getAllMatches(workingText, dødPattern)

  for (const match of dødMatches) {
    const matchPosition = match.index
    const isNoun = nounDødPositions.some(pos => Math.abs(pos - matchPosition) < 3)

    if (!isNoun) {
      results.push({
        original: 'død',
        transformed: 'dø',
        rule: 'Stum D (adjektiv): død → dø',
        lineNumber
      })
    }
  }

  // Apply transformations
  workingText = workingText.replace(dødPattern, (match: string, offset: number) => {
    const isNoun = nounDødPositions.some(pos => Math.abs(pos - offset) < 3)
    if (isNoun) return match // Keep "død" for noun usage
    return match[0] === 'D' ? 'Dø' : 'dø'
  })

  // Handle 'ld' endings: kald → kall (special case - 'd' becomes extra 'l' for pronunciation)
  const kaldPattern = /\bkald\b/gi
  const kaldMatches = getAllMatches(workingText, kaldPattern)
  for (const match of kaldMatches) {
    results.push({
      original: match[0],
      transformed: match[0][0] === 'K' ? 'Kall' : 'kall',
      rule: 'Stum D (ld→ll): kald → kall',
      lineNumber
    })
  }
  workingText = workingText.replace(kaldPattern, (match: string) =>
    match[0] === 'K' ? 'Kall' : 'kall'
  )

  // Standard Silent D words
  const silentDWords = ['rød', 'god', 'ved', 'med', 'glad', 'bred', 'blid', 'hid']

  for (const word of silentDWords) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')
    const matches = getAllMatches(workingText, pattern)
    for (const match of matches) {
      const original = match[0]
      // Don't apply if exception
      if (!SILENT_D_EXCEPTIONS.includes(original.toLowerCase())) {
        const transformed = original.slice(0, -1) // Remove 'd'
        results.push({
          original,
          transformed,
          rule: `Stum D: ${word} → ${word.slice(0, -1)}`,
          lineNumber
        })
      }
    }
    workingText = workingText.replace(pattern, (match: string) => {
      if (SILENT_D_EXCEPTIONS.includes(match.toLowerCase())) return match
      return match.slice(0, -1)
    })
  }

  return results
}

/**
 * Rule 2: ND → NN Pattern
 * Words ending in 'nd' change to 'nn'
 */
export function applyNDtoNNRule(
  text: string,
  lineNumber: number
): TransformationResult[] {
  const results: TransformationResult[] = []

  // Common ND words and their patterns
  const ndPattern = /\b(\w*[aeiouæøå])nd\b/gi
  const matches = getAllMatches(text, ndPattern)

  for (const match of matches) {
    const original = match[0]

    // Skip proper nouns
    if (isProperNoun(original)) continue

    const transformed = original.slice(0, -2) + 'nn'
    results.push({
      original,
      transformed,
      rule: 'ND→NN: nd → nn',
      lineNumber
    })
  }

  return results
}

/**
 * Apply ND→NN transformation to text
 */
export function transformNDtoNN(text: string): string {
  const ndPattern = /\b(\w*[aeiouæøå])nd\b/gi
  return text.replace(ndPattern, (match: string) => {
    if (isProperNoun(match)) return match
    return match.slice(0, -2) + 'nn'
  })
}

/**
 * Rule 3: RD → R Pattern
 * Words ending in 'rd' drop the 'd'
 */
export function applyRDtoRRule(
  text: string,
  lineNumber: number
): TransformationResult[] {
  const results: TransformationResult[] = []

  // Match words ending in 'rd'
  const rdPattern = /\b(\w+)rd\b/gi
  const matches = getAllMatches(text, rdPattern)

  for (const match of matches) {
    const original = match[0]

    // Skip proper nouns
    if (isProperNoun(original)) continue

    const transformed = original.slice(0, -1) // Remove 'd'
    results.push({
      original,
      transformed,
      rule: 'RD→R: rd → r',
      lineNumber
    })
  }

  return results
}

/**
 * Apply RD→R transformation to text
 */
export function transformRDtoR(text: string): string {
  const rdPattern = /\b(\w+)rd\b/gi
  return text.replace(rdPattern, (match: string) => {
    if (isProperNoun(match)) return match
    return match.slice(0, -1)
  })
}

/**
 * Rule 4: OG → Å
 * Replace all instances of "og" with "å"
 */
export function applyOGtoÅRule(
  text: string,
  lineNumber: number
): TransformationResult[] {
  const results: TransformationResult[] = []

  const ogPattern = /\bog\b/gi
  const matches = getAllMatches(text, ogPattern)

  for (const match of matches) {
    const original = match[0]
    const transformed = original[0] === 'O' ? 'Å' : 'å'
    results.push({
      original,
      transformed,
      rule: 'OG→Å: og → å',
      lineNumber
    })
  }

  return results
}

/**
 * Apply OG→Å transformation to text
 */
export function transformOGtoÅ(text: string): string {
  return text.replace(/\bog\b/gi, (match: string) => (match[0] === 'O' ? 'Å' : 'å'))
}

/**
 * Rule 5: Acronym Expansion
 * Expand ALL-CAPS words (2+ letters) to Norwegian phonetic spelling
 */
export function applyAcronymRule(
  text: string,
  lineNumber: number
): TransformationResult[] {
  const results: TransformationResult[] = []

  // Match words that are all uppercase with 2+ letters
  const acronymPattern = /\b[A-ZÆØÅ]{2,}\b/g
  const matches = getAllMatches(text, acronymPattern)

  for (const match of matches) {
    const original = match[0]

    // Convert to Norwegian phonetic spelling
    const letters = original.split('')
    const expanded = letters
      .map((letter: string) => NORWEGIAN_ALPHABET[letter] || letter)
      .join('-')

    results.push({
      original,
      transformed: expanded,
      rule: `Akronym: ${original} → ${expanded}`,
      lineNumber
    })
  }

  return results
}

/**
 * Apply acronym expansion to text
 */
export function transformAcronyms(text: string): string {
  const acronymPattern = /\b[A-ZÆØÅ]{2,}\b/g
  return text.replace(acronymPattern, (match: string) => {
    const letters = match.split('')
    return letters.map((letter: string) => NORWEGIAN_ALPHABET[letter] || letter).join('-')
  })
}

/**
 * Rule 6: Number Expansion
 * Convert digits to Norwegian words
 */
export function applyNumberRule(
  text: string,
  lineNumber: number
): TransformationResult[] {
  const results: TransformationResult[] = []

  // Match numbers (1-4 digits)
  const numberPattern = /\b\d{1,4}\b/g
  const matches = getAllMatches(text, numberPattern)

  for (const match of matches) {
    const original = match[0]
    const num = parseInt(original, 10)

    const transformed = convertNumberToNorwegian(num)

    results.push({
      original,
      transformed,
      rule: `Tall: ${original} → ${transformed}`,
      lineNumber
    })
  }

  return results
}

/**
 * Apply number expansion to text
 */
export function transformNumbers(text: string): string {
  const numberPattern = /\b\d{1,4}\b/g
  return text.replace(numberPattern, (match: string) => {
    const num = parseInt(match, 10)
    return convertNumberToNorwegian(num)
  })
}

/**
 * Apply Silent D transformation to text
 */
export function transformSilentD(text: string): string {
  let result = text

  // Handle neuter forms first: godt → gott
  result = result.replace(/\b(go)dt\b/gi, '$1tt')

  // Handle "død" with context detection
  // By default, "død" is adjective (remove D), EXCEPT when preceded by quantifiers
  const nounPatterns = [
    /\b(mye|lite|noe|masse|litt|mer|mest)\s+død\b/gi
  ]

  // Track noun "død" positions
  const nounDødPositions: number[] = []
  for (const pattern of nounPatterns) {
    let match
    pattern.lastIndex = 0
    while ((match = pattern.exec(result)) !== null) {
      const dødIndex = match.index + match[0].lastIndexOf('død')
      nounDødPositions.push(dødIndex)
    }
  }

  // Transform "død" based on context
  const dødPattern = /\bdød\b/gi
  result = result.replace(dødPattern, (match: string, offset: number) => {
    const isNoun = nounDødPositions.some(pos => Math.abs(pos - offset) < 3)
    if (isNoun) return match // Keep "død" for noun usage
    return match[0] === 'D' ? 'Dø' : 'dø'
  })

  // Handle 'ld' endings: kald → kall (special case - 'd' becomes extra 'l')
  result = result.replace(/\bkald\b/gi, (match: string) =>
    match[0] === 'K' ? 'Kall' : 'kall'
  )

  // Standard Silent D words
  const silentDWords = ['rød', 'god', 'ved', 'med', 'glad', 'bred', 'blid', 'hid']

  for (const word of silentDWords) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')
    result = result.replace(pattern, (match: string) => {
      if (SILENT_D_EXCEPTIONS.includes(match.toLowerCase())) return match
      return match.slice(0, -1)
    })
  }

  return result
}

/**
 * Apply all 6 transformation rules in exact order
 * Returns the transformed text and all changes made
 */
export function applyAllRules(lyrics: string): {
  transformedLyrics: string
  changes: TransformationResult[]
} {
  const allChanges: TransformationResult[] = []
  const lines = lyrics.split('\n')
  const transformedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const lineNumber = i + 1

    // Skip empty lines
    if (line.trim().length === 0) {
      transformedLines.push(line)
      continue
    }

    // Rule 1: Silent D Removal
    const silentDChanges = applySilentDRule(line, lineNumber)
    allChanges.push(...silentDChanges)
    line = transformSilentD(line)

    // Rule 2: ND → NN
    const ndChanges = applyNDtoNNRule(line, lineNumber)
    allChanges.push(...ndChanges)
    line = transformNDtoNN(line)

    // Rule 3: RD → R
    const rdChanges = applyRDtoRRule(line, lineNumber)
    allChanges.push(...rdChanges)
    line = transformRDtoR(line)

    // Rule 4: OG → Å
    const ogChanges = applyOGtoÅRule(line, lineNumber)
    allChanges.push(...ogChanges)
    line = transformOGtoÅ(line)

    // Rule 5: Acronym Expansion
    const acronymChanges = applyAcronymRule(line, lineNumber)
    allChanges.push(...acronymChanges)
    line = transformAcronyms(line)

    // Rule 6: Number Expansion
    const numberChanges = applyNumberRule(line, lineNumber)
    allChanges.push(...numberChanges)
    line = transformNumbers(line)

    transformedLines.push(line)
  }

  return {
    transformedLyrics: transformedLines.join('\n'),
    changes: allChanges
  }
}
