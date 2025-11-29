// Norwegian phonetic rules configuration
// Preserved words list and helper functions for phonetic optimization

export interface PhoneticRule {
  original: string
  optimized: string
  reason: string
}

/**
 * Words/patterns that should NEVER be phonetically altered
 * Proper nouns, place names, brand names, etc.
 */
export const preservedWords: string[] = [
  // Norwegian place names
  'oslo',
  'bergen',
  'trondheim',
  'stavanger',
  'tromsø',
  'drammen',
  'kristiansand',
  'fredrikstad',
  'sandnes',
  'ålesund',
  'bodø',
  'haugesund',
  'lillehammer',
  'hammerfest',
  'kirkenes',
  'longyearbyen',
  'svalbard',
  'lofoten',
  'nordkapp',
  'geilo',
  'voss',

  // Common Norwegian names
  'lars',
  'ole',
  'kari',
  'mari',
  'per',
  'bjørn',
  'erik',
  'anna',
  'liv',
  'nina',
  'magnus',
  'ingrid',
  'astrid',
  'sigrid',
  'olav',
  'harald',
  'sonja',
  'mette',
  'haakon',

  // Brand names (may appear in lyrics)
  'spotify',
  'netflix',
  'youtube',
  'google',
  'facebook',
  'instagram',
  'tiktok',
  'apple',
  'microsoft',
  'tesla',

  // Musical terms
  'piano',
  'guitar',
  'bass',
  'drums',
  'synth',
  'beat',
  'groove',
  'jazz',
  'rock',
  'pop',
  'hip-hop',
  'rap'
]

/**
 * Check if a word should be preserved (not phonetically altered)
 */
export function shouldPreserveWord(word: string): boolean {
  const normalized = word.toLowerCase().trim().replace(/[.,!?;:"'\-()]/g, '')
  return preservedWords.includes(normalized)
}

/**
 * Get a cached phonetic rule (deprecated - kept for backward compatibility)
 * The new rule engine applies transformations dynamically
 */
export function getCachedPhonetic(word: string): PhoneticRule | null {
  // Deprecated: The new rule engine handles all transformations
  return null
}

/**
 * Apply cached rules (deprecated - kept for backward compatibility)
 * The new rule engine applies transformations dynamically
 */
export function applyCachedRules(text: string): PhoneticRule[] {
  // Deprecated: The new rule engine handles all transformations
  return []
}
