/**
 * Norwegian Date Formatting Utilities
 *
 * Provides relative date formatting in Norwegian (nb-NO locale)
 * Used for displaying song creation dates in a user-friendly way
 */

export function formatRelativeDate(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Akkurat nå'
  if (diffMinutes === 1) return '1 minutt siden'
  if (diffMinutes < 60) return `${diffMinutes} minutter siden`
  if (diffHours === 1) return '1 time siden'
  if (diffHours < 24) return `${diffHours} timer siden`
  if (diffDays === 1) return 'I går'
  if (diffDays < 7) return `${diffDays} dager siden`

  // Fallback to formatted date for older songs
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
