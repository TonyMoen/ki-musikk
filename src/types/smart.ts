/**
 * Smart-modus types
 *
 * Smart-modus is the AI-orchestrated single-step flow where the user provides
 * only a concept (and optional occasion), and the backend picks the genre
 * and writes lyrics in one orchestrated call.
 *
 * Counterpart to the manual 3-step Tilpass-modus wizard.
 */

/**
 * Occasion chips presented to the user in Smart-modus.
 * 'annet' is the catch-all for non-specific occasions.
 */
export type Occasion =
  | 'bursdag'
  | 'bryllup'
  | 'russ'
  | 'jubileum'
  | 'jul'
  | 'annet'

/**
 * Human-readable label for each occasion (used in the UI chips).
 */
export const OCCASION_LABELS: Record<Occasion, string> = {
  bursdag: 'Bursdag',
  bryllup: 'Bryllup',
  russ: 'Russ',
  jubileum: 'Jubileum',
  jul: 'Jul',
  annet: 'Annet',
}

export interface SmartGenerateRequest {
  concept: string
  occasion?: Occasion
  /**
   * UI-level quick-pick chip selection. Bursdag/Russ map to `occasion` on the
   * client; the genre-style chips (Festmusikk/Country/Rock) flow through here
   * for future genre-bias support — backend currently ignores the field.
   */
  quickPick?: 'Bursdag' | 'Russ' | 'Festmusikk' | 'Country' | 'Rock'
}

export interface SmartGenerateData {
  /** Generated lyrics with Suno tags ([Verse 1], [Chorus], etc.) */
  lyrics: string
  /** AI-generated title (max 40 chars) */
  title: string
  /** UUID of the picked genre row in the `genre` table */
  genreId: string
  /** Internal genre name (e.g., 'country-rock') */
  genreName: string
  /** Display name shown to the user (e.g., 'Country Rock') */
  genreDisplayName: string
  /** Optional emoji for the picked genre (kept for API compat — UI uses Lucide icons) */
  genreEmoji: string | null
  /** Why the AI picked this genre — short Norwegian explanation, kept for analytics */
  genreReasoning: string
  /** The technical Suno prompt template for the picked genre — surfaced in UI to prove the choice is concrete */
  genreSunoPrompt: string
}

export interface SmartGenerateResponse {
  data?: SmartGenerateData
  error?: {
    code: string
    message: string
  }
}
