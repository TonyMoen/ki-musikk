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

/**
 * Feature Flags
 * Control feature availability throughout the app
 * Change these values to enable/disable features without code changes
 */
export const FEATURES = {
  ENABLE_PHONETIC_OPTIMIZATION: false, // Disabled for simplified UX per customer feedback
  // Future flags can be added here:
  // ENABLE_GENRE_LIBRARY: false,
  // ENABLE_EDIT_MODE: false,
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
