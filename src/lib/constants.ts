/**
 * Credit Package and Cost Constants
 * Updated pricing - more generous model to encourage adoption
 */

export interface CreditPackage {
  id: 'starter' | 'pro' | 'premium'
  name: string
  price: number // Price in cents (USD)
  credits: number
  description: string
  badge?: string
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1500, // $15
    credits: 500,
    description: '~50 songs',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2500, // $25
    credits: 1000,
    description: '~100 songs',
    badge: 'MOST POPULAR',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5000, // $50
    credits: 2500,
    description: '~250 songs',
  },
]

export const CREDIT_COSTS = {
  SONG_GENERATION: 10, // 10 credits per song
  CANVAS_GENERATION: 5, // Future feature
  MASTERING_SERVICE: 20, // Future feature
  FREE_PREVIEW: 0, // 30-second previews are free
} as const

export type CreditCostType = keyof typeof CREDIT_COSTS

/**
 * Tooltip Constants (Norwegian)
 * Centralized tooltip content for info icons throughout the app
 */
export const TOOLTIPS = {
  pronunciation: 'Forbedrer automatisk norsk uttale for Suno AI',
  credits: '1 kreditt ≈ kr 5. Full sang koster 10 kreditter.',
  freePreview: '30-sekunders forhåndsvisning for å høre sangen din før kjøp',
  download: 'Last ned hele sangen som MP3 (tilgjengelig i 14 dager)',
} as const

export type TooltipKey = keyof typeof TOOLTIPS
