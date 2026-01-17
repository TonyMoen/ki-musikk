/**
 * Standard Genre Templates
 *
 * Pre-made genre templates that users can add to their active genres.
 * These are hardcoded and always available in the Standard tab of the library.
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
    id: 'std-classic-rock',
    name: 'Classic Rock',
    display_name: 'Classic Rock',
    sunoPrompt: 'classic rock, electric guitar, drums, bass, powerful vocals, 70s style',
    isStandard: true
  },
  {
    id: 'std-chill-lofi',
    name: 'Chill Lofi',
    display_name: 'Chill Lofi',
    sunoPrompt: 'lofi hip hop, chill beats, mellow piano, vinyl crackle, relaxed atmosphere',
    isStandard: true
  },
  {
    id: 'std-epic-orchestral',
    name: 'Epic Orchestral',
    display_name: 'Epic Orchestral',
    sunoPrompt: 'cinematic orchestral, strings, brass, epic drums, dramatic, movie soundtrack',
    isStandard: true
  },
  {
    id: 'std-indie-folk',
    name: 'Indie Folk',
    display_name: 'Indie Folk',
    sunoPrompt: 'indie folk, acoustic guitar, soft vocals, organic sound, intimate atmosphere',
    isStandard: true
  },
  {
    id: 'std-synthwave',
    name: 'Synthwave',
    display_name: 'Synthwave',
    sunoPrompt: '80s synthwave, retro synthesizers, electronic drums, neon atmosphere, nostalgic',
    isStandard: true
  },
  {
    id: 'std-jazz-smooth',
    name: 'Jazz Smooth',
    display_name: 'Jazz Smooth',
    sunoPrompt: 'smooth jazz, saxophone, piano, upright bass, sophisticated, lounge atmosphere',
    isStandard: true
  },
  {
    id: 'std-edm-banger',
    name: 'EDM Banger',
    display_name: 'EDM Banger',
    sunoPrompt: 'edm, heavy bass drops, synth leads, high energy, festival anthem, 128 bpm',
    isStandard: true
  },
  {
    id: 'std-acoustic-ballad',
    name: 'Acoustic Ballad',
    display_name: 'Acoustic Ballad',
    sunoPrompt: 'acoustic ballad, fingerstyle guitar, emotional vocals, intimate, slow tempo',
    isStandard: true
  }
]
