/**
 * Standard Genre Templates
 *
 * Norwegian-optimized genre templates with Suno prompts.
 * Each prompt includes "Norwegian" twice for vocal optimization.
 * Used by the wizard step-style to auto-fill the style textarea.
 */

export interface LibraryGenre {
  id: string
  name: string
  display_name: string
  sunoPrompt: string
  isCustom?: boolean
  isStandard?: boolean
  createdAt?: string
  archivedAt?: string
}

export const STANDARD_GENRES: LibraryGenre[] = [
  {
    id: 'std-elektronisk',
    name: 'elektronisk',
    display_name: 'Elektronisk',
    sunoPrompt: 'Norwegian elektronisk, energetic synth drops, driving four-on-the-floor beat, festival EDM, euphoric build-ups, powerful Norwegian vocals, modern production',
    isStandard: true
  },
  {
    id: 'std-festlaat',
    name: 'festlaat',
    display_name: 'Festlåt',
    sunoPrompt: 'Norwegian festlåt, sing-along party anthem, catchy hook, upbeat tempo, allsang-vennlig, brass hits, clap-along rhythm, energetic Norwegian group vocals, feel-good celebration',
    isStandard: true
  },
  {
    id: 'std-rap-hiphop',
    name: 'rap-hiphop',
    display_name: 'Rap/Hip-Hop',
    sunoPrompt: 'Norwegian rap, hard-hitting 808 bass, trap drums, aggressive flow, dark atmospheric synths, modern hip-hop production, confident Norwegian rap vocals',
    isStandard: true
  },
  {
    id: 'std-russelaat',
    name: 'russelaat',
    display_name: 'Russelåt',
    sunoPrompt: 'Norwegian russelåt, high-energy party, heavy bass drops, EDM-trap fusion, anthemic chants, festival production, youthful Norwegian vocals, celebratory',
    isStandard: true
  },
  {
    id: 'std-pop',
    name: 'pop',
    display_name: 'Pop',
    sunoPrompt: 'Norwegian pop, polished studio production, catchy melodic hooks, warm synth pads, tight drums, radio-friendly, emotional Norwegian vocals, uplifting, modern Scandinavian sound',
    isStandard: true
  },
  {
    id: 'std-rock',
    name: 'rock',
    display_name: 'Rock',
    sunoPrompt: 'Norwegian rock, driving electric guitar riffs, punchy live drums, distorted power chords, anthemic chorus, arena energy, raw Norwegian vocals',
    isStandard: true
  },
  {
    id: 'std-country',
    name: 'country',
    display_name: 'Country',
    sunoPrompt: 'Norwegian country, acoustic steel-string guitar, fiddle, warm storytelling, steady backbeat, Americana-inspired, heartfelt Norwegian vocals, rustic and authentic',
    isStandard: true
  },
  {
    id: 'std-akustisk',
    name: 'akustisk',
    display_name: 'Akustisk',
    sunoPrompt: 'Norwegian akustisk, fingerpicked acoustic guitar, intimate and warm, soft percussion, gentle piano, singer-songwriter, vulnerable breathy Norwegian vocals, stripped-back production',
    isStandard: true
  }
]
