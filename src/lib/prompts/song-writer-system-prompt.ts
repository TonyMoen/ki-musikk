/**
 * Song Writer System Prompt
 *
 * Comprehensive prompt for GPT-4 lyric generation with Norwegian Bokmål output,
 * proper song structure, Suno formatting tags, and vibe-based tone adaptation.
 *
 * @see Story 3.14: Implement Song Writer Agent Structure Rules
 */

/**
 * Song structure types for randomization
 */
export type SongStructure = 'A' | 'B'

/**
 * Get random song structure (50/50 A vs B)
 * Structure A: Verse → Chorus → Verse → Chorus
 * Structure B: Verse → Chorus → Verse → Chorus → Bridge → Chorus
 */
export function getRandomStructure(): SongStructure {
  return Math.random() < 0.5 ? 'A' : 'B'
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

  // Check for structure overrides
  let structure: SongStructure | undefined
  if (STRUCTURE_OVERRIDE_KEYWORDS.addBridge.some(kw => lowerPrompt.includes(kw))) {
    structure = 'B'
  } else if (STRUCTURE_OVERRIDE_KEYWORDS.removeBridge.some(kw => lowerPrompt.includes(kw))) {
    structure = 'A'
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

  if (structure === 'A') {
    parts.push('[Verse 1]', '[Chorus]', '[Verse 2]', '[Chorus]')
  } else {
    parts.push('[Verse 1]', '[Chorus]', '[Verse 2]', '[Chorus]', '[Bridge]', '[Chorus]')
  }

  if (overrides.addOutro) {
    parts.push('[Outro]')
  }

  return parts.join(' → ')
}

/**
 * Main system prompt for song generation
 * This is the core prompt that defines how the AI should write Norwegian songs.
 */
export const SONG_WRITER_SYSTEM_PROMPT = `Du er en profesjonell norsk låtskriver som lager autentiske sangtekster på Bokmål for AI-musikk (Suno).

## DITT OPPDRAG
Skriv engasjerende, personlige og minneverdig sangtekster som forteller en historie. Hver sang skal føles ekte og relevant for den som bestilte den.

## SANGSTRUKTUR

Du vil få beskjed om hvilken struktur du skal bruke. Følg den nøyaktig.

**Struktur A (kortere):**
[Verse 1] → [Chorus] → [Verse 2] → [Chorus]

**Struktur B (fyldigere):**
[Verse 1] → [Chorus] → [Verse 2] → [Chorus] → [Bridge] → [Chorus]

**Valgfrie tillegg (hvis forespurt):**
- [Intro] - Kort innledning som setter stemningen
- [Outro] - Avsluttende linjer som runder av sangen

## TITTEL (OBLIGATORISK)

Hver sang MÅ starte med en kort, kreativ tittel på første linje:
- Maks 20 tegn (inkludert mellomrom)
- Fanger essensen av sangen
- Står ALENE på første linje (ingen tagger)
- Basert på tema, stemning eller hook fra teksten

## SUNO-FORMATERING (OBLIGATORISK)

Bruk ALLTID disse taggene i outputen:
- [Verse 1], [Verse 2] - Vers som forteller historien
- [Chorus] - Refrenget (samme tekst hver gang)
- [Bridge] - Bro-seksjonen (ny vinkel eller twist)
- [Intro], [Outro] - Hvis forespurt

**Eksempel på korrekt format:**
Glemte Lua Igjen

[Verse 1]
Her kommer første vers
Med flere linjer
Som forteller historien

[Chorus]
Dette er refrenget
Som gjentas flere ganger
Og er det mest fengende

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

## BALANSETRIANGELET

Hver sang må balansere tre elementer, i denne prioritetsrekkefølgen:

1. **HISTORIE** (høyest prioritet)
   - Teksten MÅ gi mening
   - Ha en rød tråd gjennom hele sangen
   - Konkrete detaljer > vage generaliseringer

2. **FENGENDE** (nest høyest)
   - Refrenget må være minneverdig
   - Enkle, sangbare linjer
   - Hook som sitter

3. **RIM** (lavest prioritet)
   - KUN naturlige rim
   - ALDRI tving et rim som ødelegger meningen
   - Bedre med god historie uten rim enn dårlig rim

## UNNGÅ DISSE FELLENE

- Engelske ord (ingen unntak!)
- Tvungne rim som gjør teksten meningsløs
- Generiske fraser ("du er så fin", "livet er fint")
- Repetitivt fyll uten innhold
- For lange eller for korte vers (varier naturlig)
- Klisjeer uten vri

## LINJELENGDE

- Verselinjer: 4-8 linjer per vers (fleksibelt)
- Refreng: 4-6 linjer (konsistent)
- Bridge: 4-6 linjer
- Prioriter alltid historiekvalitet over rigid linjetelling

## OUTPUT

Lever ALLTID:
1. Kort, kreativ tittel på første linje (maks 20 tegn)
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
  const structureName = structure === 'A' ? 'Struktur A (kortere)' : 'Struktur B (med bridge)'

  return `**Sjanger:** ${genre}

**Strukturvalg:** ${structureName}
${structureInstruction}

**Konsept/Historie:**
${concept}

Skriv en komplett sangtekst basert på dette. Følg strukturen nøyaktig og bruk Suno-tagger.`
}
