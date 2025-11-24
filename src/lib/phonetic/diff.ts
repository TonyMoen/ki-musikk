// Phonetic diff algorithm for line-by-line comparison
// Used by PhoneticDiffViewer to highlight pronunciation changes

import type { PhoneticChange } from '@/types/song'

export interface DiffSegment {
  text: string
  isChanged: boolean
}

export interface DiffLine {
  lineNumber: number
  originalSegments: DiffSegment[]
  optimizedSegments: DiffSegment[]
  hasChanges: boolean
  isOptimizationEnabled: boolean // User can toggle per-line
}

/**
 * Compute word-level diff between original and optimized lyrics
 * Returns line-by-line comparison with changed words highlighted
 */
export function computeDiff(
  originalLyrics: string,
  optimizedLyrics: string,
  changes: PhoneticChange[]
): DiffLine[] {
  const originalLines = originalLyrics.split('\n')
  const optimizedLines = optimizedLyrics.split('\n')

  const diffLines: DiffLine[] = []

  // Process each line
  const maxLines = Math.max(originalLines.length, optimizedLines.length)

  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || ''
    const optimizedLine = optimizedLines[i] || ''
    const lineNumber = i + 1

    // Find changes that apply to this line
    const lineChanges = changes.filter(change => change.lineNumber === lineNumber)

    // Generate segments for original line
    const originalSegments = generateSegments(originalLine, lineChanges, 'original')

    // Generate segments for optimized line
    const optimizedSegments = generateSegments(optimizedLine, lineChanges, 'optimized')

    // Determine if this line has any changes
    const hasChanges = lineChanges.length > 0

    diffLines.push({
      lineNumber,
      originalSegments,
      optimizedSegments,
      hasChanges,
      isOptimizationEnabled: true // Default: optimization enabled
    })
  }

  return diffLines
}

/**
 * Generate diff segments for a single line
 * Segments are word-level with isChanged flag
 */
function generateSegments(
  line: string,
  changes: PhoneticChange[],
  type: 'original' | 'optimized'
): DiffSegment[] {
  if (line.trim().length === 0) {
    return [{ text: '', isChanged: false }]
  }

  const segments: DiffSegment[] = []

  // Create a map of changed words for quick lookup
  const changedWordsMap = new Map<string, string>()
  changes.forEach(change => {
    changedWordsMap.set(
      change.original.toLowerCase(),
      change.optimized.toLowerCase()
    )
  })

  // Split line into words and spaces
  const tokens = line.split(/(\s+)/)

  tokens.forEach(token => {
    // If it's whitespace, add as-is (not changed)
    if (/^\s+$/.test(token)) {
      segments.push({ text: token, isChanged: false })
      return
    }

    // Clean the word (remove punctuation for comparison)
    const cleanToken = token.replace(/[.,!?;:"'\-()]/g, '').toLowerCase()

    // Check if this word was changed
    const isChanged = changedWordsMap.has(cleanToken) ||
      Array.from(changedWordsMap.values()).includes(cleanToken)

    segments.push({ text: token, isChanged })
  })

  return segments
}

/**
 * Merge lyrics based on per-line optimization toggles
 * Returns final lyrics string with user-selected lines
 */
export function mergeLyrics(
  originalLyrics: string,
  optimizedLyrics: string,
  diffLines: DiffLine[]
): string {
  const originalLines = originalLyrics.split('\n')
  const optimizedLines = optimizedLyrics.split('\n')

  const mergedLines: string[] = []

  diffLines.forEach((diffLine, index) => {
    if (diffLine.isOptimizationEnabled) {
      // Use optimized version
      mergedLines.push(optimizedLines[index] || '')
    } else {
      // Use original version
      mergedLines.push(originalLines[index] || '')
    }
  })

  return mergedLines.join('\n')
}
