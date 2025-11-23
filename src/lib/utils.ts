import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a transaction date as relative time (e.g., "2 minutter siden") or absolute date
 * @param dateString ISO 8601 timestamp from database
 * @returns Formatted date string in Norwegian
 */
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Recent transactions (<7 days): relative time
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes <= 1 ? 'Akkurat nå' : `${diffMinutes} minutter siden`
    }
    return diffHours === 1 ? '1 time siden' : `${diffHours} timer siden`
  } else if (diffDays === 1) {
    return 'I går'
  } else if (diffDays < 7) {
    return `${diffDays} dager siden`
  }

  // Older transactions: absolute date
  return date.toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) // e.g., "15. jan. 2025"
}
