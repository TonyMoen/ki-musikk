export interface GradientColors {
  from: string
  to: string
}

export const GENRE_GRADIENTS: Record<string, GradientColors> = {
  'country-rock': { from: '#E94560', to: '#FFC93C' },
  'norwegian-pop': { from: '#0F3460', to: '#E94560' },
  'folk-ballad': { from: '#06D6A0', to: '#FFC93C' },
  'party-anthem': { from: '#FFC93C', to: '#E94560' },
  'rap-hiphop': { from: '#0F3460', to: '#8B5CF6' },
  'rock-ballad': { from: '#8B5CF6', to: '#E94560' },
  'electronic-dance': { from: '#06D6A0', to: '#3B82F6' },
  'singer-songwriter': { from: '#FB923C', to: '#92400E' },
}

export const DEFAULT_GRADIENT: GradientColors = { from: '#E94560', to: '#FFC93C' }

const GRADIENT_VALUES = Object.values(GENRE_GRADIENTS)

/** Deterministic gradient for a song based on its ID */
export function getGradientForSong(songId: string, genre?: string): GradientColors {
  if (genre && GENRE_GRADIENTS[genre]) {
    return GENRE_GRADIENTS[genre]
  }
  // Hash the song ID to pick a consistent gradient
  let hash = 0
  for (let i = 0; i < songId.length; i++) {
    hash = ((hash << 5) - hash + songId.charCodeAt(i)) | 0
  }
  return GRADIENT_VALUES[Math.abs(hash) % GRADIENT_VALUES.length]
}
