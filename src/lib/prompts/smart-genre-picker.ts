/**
 * Smart Genre Picker Prompt
 *
 * Cheap LLM call (gpt-4o-mini) that selects the best-fit genre for a user's
 * concept + occasion. Output is structured JSON consumed by the Smart-modus
 * orchestrator before lyric generation.
 *
 * Style note: this prompt mirrors the discipline of song-writer-system-prompt.ts
 * (Norwegian Bokmål, opinionated, structured output) but is much shorter — its
 * only job is classification, not creative generation.
 */

import type { Occasion } from '@/types/smart'
import { OCCASION_LABELS } from '@/types/smart'

/**
 * Genre row passed to the picker. Matches the columns we pull from the
 * `genre` table for context.
 */
export interface PickerGenreOption {
  id: string
  name: string
  display_name: string
  description: string | null
  emoji: string | null
  suno_prompt_template: string
}

/**
 * Strict JSON shape the model must return. Validated client-side after parsing.
 */
export interface GenrePickerResult {
  genreName: string
  reasoning: string
}

/**
 * System prompt for the genre-picker.
 * Keep this stable — OpenAI auto-caches it across requests.
 */
export const SMART_GENRE_PICKER_PROMPT = `Du er en norsk musikkprodusent som hjelper folk å finne riktig sjanger for sangen sin.

## DITT OPPDRAG
Du får et konsept (hva sangen handler om) og eventuelt en anledning (bursdag, bryllup osv.).
Du får også en liste over tilgjengelige sjangre.

Velg den ENE sjangeren som passer best til konseptet — den som gir sangen mest virkning og treffer stemningen.

## VURDERINGSKRITERIER

1. **Stemning** — Match sangens følelse til sjangerens energi.
   - Festlig/energisk → party-anthem, russelåt
   - Romantisk/varmt → folk-ballad, akustisk
   - Humoristisk → country-rock, pop
   - Melankolsk/personlig → folk-ballad, akustisk
   - Energisk fest → russelåt, elektronisk

2. **Anledning** — Hvis oppgitt, vekt den tungt:
   - Russ → russelåt nesten alltid
   - Bursdag (voksen) → country-rock, pop, eller akustisk avhengig av konsept
   - Bursdag (barn) → glade, lette sjangre
   - Bryllup → folk-ballad, akustisk, romantiske valg
   - Jubileum → varierer med stemning
   - Jul → akustisk, folk-ballad, eller noe lekent

3. **Lyrikk-fit** — Vil tekstlinjene "fungere" i denne sjangeren?
   - En fest-sang funker dårlig som ballade
   - En sørgmodig tekst funker dårlig som party-anthem

## OUTPUT — STRENG JSON

Returner KUN gyldig JSON på dette formatet:

{
  "genreName": "<exact name from the provided list>",
  "reasoning": "<én kort norsk setning om hvorfor>"
}

Reglene for "genreName":
- MÅ være den nøyaktige "name"-verdien fra listen (ikke display_name)
- INGEN andre verdier — hvis du er usikker, velg den nærmeste matchen
- Aldri lage opp en ny sjanger

Reglene for "reasoning":
- Norsk Bokmål
- Maks 100 tegn
- Skal forklare valget kort, ikke forsvare det
- Eksempel: "Russelåt passer perfekt for fest med vennegjengen" eller "Folk-ballad gir den varme, intime stemningen"

## VIKTIG
- Velg ALLTID en sjanger — aldri returner tom genreName
- Hvis konseptet er vagt, velg den mest fleksible sjangeren (ofte pop eller country-rock)
- INGEN forklaringer utenfor JSON-objektet`

/**
 * Build the user message with concept, occasion, and the candidate genre list.
 * Genres are formatted as a compact JSON-ish block so the model can reliably
 * pick a `name` value from them.
 */
export function buildGenrePickerMessage(
  concept: string,
  occasion: Occasion | undefined,
  genres: PickerGenreOption[]
): string {
  const genreLines = genres.map((g) => {
    const emoji = g.emoji ? `${g.emoji} ` : ''
    const desc = g.description ? ` — ${g.description}` : ''
    return `- name: "${g.name}" | display: ${emoji}${g.display_name}${desc}`
  }).join('\n')

  const occasionLine = occasion
    ? `\n**Anledning:** ${OCCASION_LABELS[occasion]}`
    : ''

  return `**Konsept:**
${concept}
${occasionLine}

**Tilgjengelige sjangre:**
${genreLines}

Velg den ene sjangeren som passer best, og returner JSON-objektet.`
}

/**
 * Validate the model's output against the candidate list.
 * Returns the matched PickerGenreOption or null if the model hallucinated.
 */
export function validatePickerResult(
  result: unknown,
  genres: PickerGenreOption[]
): { genre: PickerGenreOption; reasoning: string } | null {
  if (!result || typeof result !== 'object') return null

  const r = result as Record<string, unknown>
  const genreName = typeof r.genreName === 'string' ? r.genreName : null
  const reasoning = typeof r.reasoning === 'string' ? r.reasoning : ''

  if (!genreName) return null

  const matched = genres.find((g) => g.name === genreName)
  if (!matched) return null

  return {
    genre: matched,
    reasoning: reasoning.slice(0, 200),
  }
}
