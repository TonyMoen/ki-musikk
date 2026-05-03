/**
 * Genre → Lucide icon mapping.
 *
 * Shared between Tilpass wizard (step-style.tsx) and Smart-modus
 * (smart-review.tsx). Single source of truth for the visual genre
 * vocabulary in the app.
 */

import {
  Guitar,
  Mic2,
  Radio,
  Headphones,
  Heart,
  Drum,
  Piano,
  type LucideIcon,
} from 'lucide-react'

const GENRE_ICON_MAP: Record<string, LucideIcon> = {
  'elektronisk': Headphones,
  'festlåt': Drum,
  'rap/hip-hop': Mic2,
  'russelåt': Headphones,
  'pop': Radio,
  'rock': Guitar,
  'country': Guitar,
  'akustisk': Heart,
  // Legacy / fallback mappings
  'rap': Mic2,
  'hip-hop': Mic2,
  'edm': Headphones,
  'jazz': Piano,
  'folk': Guitar,
  'ballad': Heart,
  'klassisk': Piano,
  'metal': Radio,
  'blues': Guitar,
}

export function getGenreIcon(genreDisplayName: string): LucideIcon {
  return GENRE_ICON_MAP[genreDisplayName.toLowerCase()] || Headphones
}
