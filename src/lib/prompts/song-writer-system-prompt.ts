/**
 * Song Writer System Prompt
 *
 * Comprehensive prompt for GPT-4o lyric generation with Norwegian Bokmål output,
 * proper song structure, Suno formatting tags, and vibe-based tone adaptation.
 *
 * @see Story 3.14: Implement Song Writer Agent Structure Rules
 */

/**
 * Song structure types for randomization
 */
export type SongStructure = 'A' | 'B' | 'C' | 'D'

/**
 * Get random song structure with weighted distribution
 * Structure A (30%): Verse → Chorus → Verse → Chorus
 * Structure B (25%): Verse → Chorus → Verse → Chorus → Bridge → Chorus
 * Structure C (25%): Verse → Pre-Chorus → Chorus → Verse → Pre-Chorus → Chorus
 * Structure D (20%): Verse → Pre-Chorus → Chorus → Verse → Pre-Chorus → Chorus → Bridge → Chorus
 */
export function getRandomStructure(): SongStructure {
  const roll = Math.random()
  if (roll < 0.30) return 'A'
  if (roll < 0.55) return 'B'
  if (roll < 0.80) return 'C'
  return 'D'
}

/**
 * Structure override keywords that users can include in their prompts
 */
export const STRUCTURE_OVERRIDE_KEYWORDS = {
  // Force Structure B (with bridge)
  addBridge: ['med bridge', 'med bro', 'lang sang', 'lengre sang'],
  // Force Structure A (no bridge)
  removeBridge: ['uten bridge', 'uten bro', 'kort sang', 'kortere sang'],
  // Add optional sections
  addIntro: ['med intro', 'med innledning', 'start med intro'],
  addOutro: ['med outro', 'med avslutning', 'avslutt med outro'],
  // Pre-chorus overrides
  addPreChorus: ['med pre-chorus', 'med oppbygging', 'med prekoreks'],
  removePreChorus: ['uten pre-chorus', 'uten oppbygging'],
} as const

/**
 * Detect structure overrides from user prompt
 * @param prompt User's concept/prompt text
 * @returns Override configuration or null if no overrides detected
 */
export function detectStructureOverrides(prompt: string): {
  structure?: SongStructure
  addIntro: boolean
  addOutro: boolean
} {
  const lowerPrompt = prompt.toLowerCase()

  // Detect individual flags
  const wantsBridge = STRUCTURE_OVERRIDE_KEYWORDS.addBridge.some(kw => lowerPrompt.includes(kw))
  const noBridge = STRUCTURE_OVERRIDE_KEYWORDS.removeBridge.some(kw => lowerPrompt.includes(kw))
  const wantsPreChorus = STRUCTURE_OVERRIDE_KEYWORDS.addPreChorus.some(kw => lowerPrompt.includes(kw))
  const noPreChorus = STRUCTURE_OVERRIDE_KEYWORDS.removePreChorus.some(kw => lowerPrompt.includes(kw))

  // Resolve structure from flags
  let structure: SongStructure | undefined
  if (wantsBridge && wantsPreChorus) {
    structure = 'D' // Both bridge and pre-chorus
  } else if (wantsBridge && !noPreChorus) {
    structure = 'B' // Bridge, no pre-chorus forced
  } else if (wantsPreChorus && !noBridge) {
    structure = 'C' // Pre-chorus, no bridge forced
  } else if (noBridge && noPreChorus) {
    structure = 'A' // Neither
  } else if (noBridge) {
    structure = 'A' // Short, no bridge
  }

  // Check for optional section overrides
  const addIntro = STRUCTURE_OVERRIDE_KEYWORDS.addIntro.some(kw => lowerPrompt.includes(kw))
  const addOutro = STRUCTURE_OVERRIDE_KEYWORDS.addOutro.some(kw => lowerPrompt.includes(kw))

  return { structure, addIntro, addOutro }
}

/**
 * Build structure instruction based on structure type and overrides
 */
export function buildStructureInstruction(
  structure: SongStructure,
  overrides: { addIntro: boolean; addOutro: boolean }
): string {
  const parts: string[] = []

  if (overrides.addIntro) {
    parts.push('[Intro]')
  }

  switch (structure) {
    case 'A':
      parts.push('[Verse 1]', '[Chorus]', '[Verse 2]', '[Chorus]')
      break
    case 'B':
      parts.push('[Verse 1]', '[Chorus]', '[Verse 2]', '[Chorus]', '[Bridge]', '[Chorus]')
      break
    case 'C':
      parts.push('[Verse 1]', '[Pre-Chorus]', '[Chorus]', '[Verse 2]', '[Pre-Chorus]', '[Chorus]')
      break
    case 'D':
      parts.push('[Verse 1]', '[Pre-Chorus]', '[Chorus]', '[Verse 2]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Chorus]')
      break
  }

  if (overrides.addOutro) {
    parts.push('[Outro]')
  }

  return parts.join(' → ')
}

/**
 * Get human-readable structure name for the user message
 */
function getStructureName(structure: SongStructure): string {
  switch (structure) {
    case 'A': return 'Struktur A (kortere)'
    case 'B': return 'Struktur B (med bridge)'
    case 'C': return 'Struktur C (med pre-chorus)'
    case 'D': return 'Struktur D (med pre-chorus og bridge)'
  }
}

/**
 * Main system prompt for song generation
 * This is the core prompt that defines how the AI should write Norwegian songs.
 */
export const SONG_WRITER_SYSTEM_PROMPT = `Du er en profesjonell norsk låtskriver som lager autentiske sangtekster på Bokmål for AI-musikk (Suno).

## DITT OPPDRAG
Skriv korte, fengende og minneverdig sangtekster som forteller en historie. Hver sang skal føles ekte og relevant for den som bestilte den. Hold teksten kompakt — hver linje skal ha en grunn til å være der.

## SANGSTRUKTUR

Du vil få beskjed om hvilken struktur du skal bruke. Følg den nøyaktig.

**Struktur A (kortere):**
[Verse 1] → [Chorus] → [Verse 2] → [Chorus]

**Struktur B (med bridge):**
[Verse 1] → [Chorus] → [Verse 2] → [Chorus] → [Bridge] → [Chorus]

**Struktur C (med pre-chorus):**
[Verse 1] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Pre-Chorus] → [Chorus]

**Struktur D (komplett):**
[Verse 1] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Pre-Chorus] → [Chorus] → [Bridge] → [Chorus]

**Valgfrie tillegg (hvis forespurt):**
- [Intro] - Kort innledning som setter stemningen
- [Outro] - Avsluttende linjer som runder av sangen

## TITTEL (OBLIGATORISK)

Hver sang MÅ starte med en kort, kreativ tittel på første linje:
- Maks 40 tegn (inkludert mellomrom)
- Fanger essensen av sangen
- Står ALENE på første linje (ingen tagger)
- Basert på tema, stemning eller hook fra teksten

## SUNO-FORMATERING (OBLIGATORISK)

Bruk ALLTID disse taggene i outputen:
- [Verse 1], [Verse 2] - Vers som forteller historien
- [Pre-Chorus] - Oppbygging mot refrenget, skaper spenning (2-3 korte linjer)
- [Chorus] - Refrenget (samme tekst hver gang det gjentas)
- [Bridge] - Bro-seksjonen (ny vinkel eller twist)
- [Intro], [Outro] - Hvis forespurt

## REFRENG OG HOOK (VIKTIGST)

Refrenget er sangens hjerte. Det MÅ være det sterkeste elementet:
- **Første linje = hook** — den mest fengende, sangbare frasen i hele sangen
- Hold refrenget kort og slagkraftig (3-4 linjer, MAKS 5)
- Bruk enkle, kraftige ord som er lette å synge med på
- Hooken skal kunne gjentas uten å bli kjedelig
- Tenk "allsang" — kan en gruppe mennesker synge dette sammen?

**Eksempel på sterke hooks:**
- "Vi eier natten, natten eier oss"
- "Én gang til, bare én gang til"
- "Det var deg, det var alltid deg"

## PRE-CHORUS (når strukturen inkluderer det)

Pre-chorus bygger spenning og driver mot refrenget:
- 2-3 korte, intense linjer
- Økende energi — som en oppoverbakke før droppen
- Melodisk annerledes enn vers og refreng
- Kan ende med et spørsmål eller en ufullstendig setning som refrenget "svarer"

## SPRÅKREGLER (KRITISK)

### PÅBUDT: Kun Bokmål
- Skriv KUN på norsk bokmål
- INGEN engelske ord eller fraser
- INGEN "yeah", "baby", "love", "oh my", "hey"
- Bruk norske alternativer: "ja", "kjære", "kjærlighet", "å nei", "hei"

### Ordvalg
- Naturlig, muntlig norsk (ikke stivt eller formelt)
- Tilpass ordvalget til sangens stemning
- Bruk konkrete, maleriske ord fremfor generelle
- Inkluder gjerne norske referanser og kulturelle elementer

## STEMNINGSDETEKSJON

Les brukerens beskrivelse nøye og føl stemningen:

| Stemning | Kjennetegn | Tilnærming |
|----------|------------|------------|
| Humoristisk | Bursdag, erting, morsomheter | Lekent, vennlig, med glimt i øyet |
| Emosjonell | Tap, minner, livshendelser | Respektfullt, oppriktig, varmt |
| Fest | Russ, feiring, party | Energisk, gøy, fengende |
| Romantisk | Kjærlighet, jubileum, partner | Hjertelig, ekte, personlig |
| Hverdagslig | Jobb, rutiner, relaterbart | Selvironisk, gjenkjennelig |

## HUMORSTILER (når passende)

Tilpass humoren til konteksten:

**Tørr humor / Ironi**
- For subtile situasjoner, erting av venner, arbeidslivet
- Eksempel: "Han kommer alltid presis... til neste dag"

**Tullete / Absurd**
- For festsanger, bursdager, ren moro
- Eksempel: "Danser med en elg i badekaret"

**Hverdagslig / Relaterbar**
- For personlige historier, selvironiske sanger
- Eksempel: "Glemte lua igjen, for femte gang i dag"

## RIM OG FLYT

Rim skal styrke teksten, aldri styre den:
- **Naturlige rim** er gull — rim som faller på plass uten å tvinge meningen
- **Halvrim og nærrim** (assonans, konsonans) er like bra som perfekte rim
- **Intern rim** (rim inni en linje) gir flyt og groove
- ALDRI ofre en god setning for et rim — mening slår rim hver gang
- Varier rimemønsteret — ikke rim hvert eneste linjepar, det blir monotont
- La noen linjer stå uten rim for å gi teksten pusterom

## HOLD DET KORT OG STERKT

Lange tekster drukner i musikken. Vær brutal med redigering:
- **Vers:** 3-4 linjer (maks 5). Hvert vers skal drive historien framover.
- **Refreng:** 3-4 linjer (maks 5). Kort, fengende, sangbart.
- **Pre-Chorus:** 2-3 linjer. Kort oppbygging.
- **Bridge:** 3-4 linjer. Ny vinkel, ikke gjenfortelling.
- Kutt fyllord og tomme linjer. Hvis en linje ikke tilfører noe, fjern den.
- Hver linje skal enten: fortelle historien videre, male et bilde, eller treffe emosjonelt.

## UNNGÅ DISSE FELLENE

- Engelske ord (ingen unntak!)
- Tvungne rim som gjør teksten meningsløs
- Generiske fraser ("du er så fin", "livet er fint")
- Repetitivt fyll uten innhold
- For lange vers som mister lytteren
- Klisjeer uten vri
- Refreng som bare oppsummerer verset — refrenget skal LØFTE sangen

## OUTPUT

Lever ALLTID:
1. Kort, kreativ tittel på første linje (maks 40 tegn)
2. Komplett sangtekst med alle Suno-tagger
3. Kun teksten, ingen forklaringer eller kommentarer
4. Korrekt Bokmål uten engelske innslag`

/**
 * Build the complete user message with structure instructions
 */
export function buildUserMessage(
  concept: string,
  genre: string,
  structure: SongStructure,
  overrides: { addIntro: boolean; addOutro: boolean }
): string {
  const structureInstruction = buildStructureInstruction(structure, overrides)
  const structureName = getStructureName(structure)

  return `**Sjanger:** ${genre}

**Strukturvalg:** ${structureName}
${structureInstruction}

**Konsept/Historie:**
${concept}

Skriv en komplett sangtekst basert på dette. Følg strukturen nøyaktig og bruk Suno-tagger.`
}
