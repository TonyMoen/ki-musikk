/**
 * Credit Package and Cost Constants
 * Updated pricing - NOK currency for Norwegian market via Vipps
 */

export interface CreditPackage {
  id: 'starter' | 'pro' | 'premium'
  name: string
  priceNOK: number // Price in NOK (whole kroner)
  priceOre: number // Price in øre for Vipps API (1 NOK = 100 øre)
  credits: number
  description: string
  badge?: string
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Allsang',
    priceNOK: 99,
    priceOre: 9900,
    credits: 100,
    description: '10 sanger',
  },
  {
    id: 'pro',
    name: 'Hitmaker',
    priceNOK: 199,
    priceOre: 19900,
    credits: 250,
    description: '25 sanger',
    badge: 'MEST POPULÆR',
  },
  {
    id: 'premium',
    name: 'Headliner',
    priceNOK: 499,
    priceOre: 49900,
    credits: 1000,
    description: '100 sanger',
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
  credits: '10 kreditter = 1 sang. Kjøp kreditter under Innstillinger.',
  freePreview: '30-sekunders forhåndsvisning for å høre sangen din før kjøp',
  download: 'Last ned hele sangen som MP3 (tilgjengelig i 14 dager)',
} as const

export type TooltipKey = keyof typeof TOOLTIPS

/**
 * Feature Flags
 * Control feature availability throughout the app
 * Change these values to enable/disable features without code changes
 */
export const FEATURES = {
  ENABLE_PHONETIC_OPTIMIZATION: false, // Disabled for simplified UX per customer feedback
  ENABLE_AI_GENRE_ASSISTANT: false, // AI genre creation wizard (inactive)
} as const

export type FeatureFlags = typeof FEATURES

/**
 * AI Assistant Conversation Flow
 * Step-by-step configuration for creating custom genres via conversational AI
 */
export interface ConversationStep {
  step: number
  question: string
  quickAnswers: string[]
  placeholder: string
  saveAs: 'mainGenre' | 'instruments' | 'mood' | 'production' | 'extras'
  optional?: boolean
}

export const CONVERSATION_FLOW: ConversationStep[] = [
  {
    step: 0,
    question: "Hva er hovedstilen eller sjangeren?",
    quickAnswers: ['70s rock', '80s synth-pop', 'Modern trap', 'Country ballad'],
    placeholder: "F.eks: 'Indie folk' eller 'Jazz fusion'",
    saveAs: 'mainGenre'
  },
  {
    step: 1,
    question: "Hvilke instrumenter skal dominere lyden?",
    quickAnswers: ['electric guitar', 'synthesizers', 'acoustic guitar', '808 bass', 'piano'],
    placeholder: "F.eks: 'saxophone, trumpet'",
    saveAs: 'instruments'
  },
  {
    step: 2,
    question: "Hvilken stemning eller energinivå?",
    quickAnswers: ['upbeat energetic', 'melancholic slow', 'aggressive intense', 'chill relaxed', 'dramatic emotional'],
    placeholder: "F.eks: 'nostalgic and warm'",
    saveAs: 'mood'
  },
  {
    step: 3,
    question: "Noen spesifikke produksjonsdetaljer?",
    quickAnswers: ['heavy reverb', 'distorted', 'clean production', 'vintage analog', 'Hopp over'],
    placeholder: "F.eks: 'lo-fi crackle' eller klikk 'Hopp over'",
    saveAs: 'production',
    optional: true
  },
  {
    step: 4,
    question: "Vil du legge til noe mer spesifikt?",
    quickAnswers: ['male vocals', 'female vocals', 'fast tempo 140 bpm', 'slow tempo 70 bpm', 'Nei, ferdig'],
    placeholder: "F.eks: 'duet' eller klikk 'Nei, ferdig'",
    saveAs: 'extras',
    optional: true
  }
]
