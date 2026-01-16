/**
 * Custom Genres Storage
 *
 * Manages localStorage persistence for user-created custom genres
 * with their associated Suno prompts.
 */

export interface CustomGenreData {
  id: string
  name: string
  display_name: string
  sunoPrompt: string
  createdAt: string // ISO date string
  updatedAt?: string // ISO date string
}

const STORAGE_KEY = 'musikkfabrikken_custom_genres'

/**
 * Get all custom genres from localStorage
 */
export function getCustomGenres(): CustomGenreData[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const genres = JSON.parse(stored) as CustomGenreData[]
    return genres
  } catch (error) {
    console.error('Failed to load custom genres:', error)
    return []
  }
}

/**
 * Save a new custom genre to localStorage
 */
export function saveCustomGenre(genre: CustomGenreData): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getCustomGenres()
    const updated = [...existing, genre]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save custom genre:', error)
    throw new Error('Kunne ikke lagre sjanger')
  }
}

/**
 * Update an existing custom genre
 */
export function updateCustomGenre(id: string, updates: Partial<CustomGenreData>): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getCustomGenres()
    const index = existing.findIndex(g => g.id === id)

    if (index === -1) {
      throw new Error('Genre not found')
    }

    existing[index] = {
      ...existing[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Failed to update custom genre:', error)
    throw new Error('Kunne ikke oppdatere sjanger')
  }
}

/**
 * Delete a custom genre
 */
export function deleteCustomGenre(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getCustomGenres()
    const updated = existing.filter(g => g.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to delete custom genre:', error)
    throw new Error('Kunne ikke slette sjanger')
  }
}

/**
 * Get a single custom genre by ID
 */
export function getCustomGenre(id: string): CustomGenreData | null {
  const genres = getCustomGenres()
  return genres.find(g => g.id === id) || null
}

/**
 * Get Suno prompt for a genre ID (null if not a custom genre)
 */
export function getGenreSunoPrompt(genreId: string): string | null {
  const genre = getCustomGenre(genreId)
  return genre?.sunoPrompt || null
}

/**
 * Check if a genre ID is a custom genre
 */
export function isCustomGenre(genreId: string): boolean {
  return genreId.startsWith('custom-')
}
