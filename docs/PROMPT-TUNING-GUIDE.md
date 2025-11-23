# AI Prompt Tuning Guide
**Musikkfabrikken - Norwegian Song Creation**

This guide helps you manually enhance and fine-tune the AI agents for lyric generation and pronunciation optimization.

---

## 📝 1. Lyric Generation Agent (ChatGPT)

### Location
**File:** `src/app/api/lyrics/generate/route.ts`

### Current System Prompt
```typescript
// Lines ~30-50 in route.ts
const systemPrompt = `Du er en kreativ sangtekstforfatter...`
```

### Key Parameters to Adjust

#### A. Temperature (Creativity Level)
**Location:** Line ~60
```typescript
temperature: 0.7  // Current setting
```

**What it does:**
- **Lower (0.1-0.4)**: More consistent, predictable, safer lyrics
- **Medium (0.5-0.7)**: Balanced creativity and coherence (current)
- **Higher (0.8-1.0)**: More creative, unexpected, risky word choices

**When to adjust:**
- Lyrics too generic/boring? → Increase to 0.8-0.9
- Lyrics too chaotic/nonsensical? → Decrease to 0.5-0.6
- Need consistency for testing? → Use 0.3

#### B. Genre Instructions
**Location:** System prompt section
```typescript
const systemPrompt = `
  Du er en kreativ sangtekstforfatter som skriver norske sangtekster.

  GENRE GUIDELINES:
  - Pop: Catchy refrains, relatable emotions, 3-4 verses + chorus
  - Rock: Powerful imagery, rebellion themes, 4-5 verses
  - Rap: Wordplay, rhythm, internal rhymes, 16+ bars
  ...add more genres as needed
`
```

**How to enhance:**
1. Test with real users for each genre
2. Note what feels "off" about the output
3. Add specific constraints or examples to the prompt
4. Test again and iterate

**Example enhancement:**
```typescript
// BEFORE
- Pop: Catchy refrains, relatable emotions

// AFTER (more specific)
- Pop:
  * Chorus should repeat 2-3 times
  * Use simple, conversational Norwegian (ikke for poetisk)
  * Focus on universal themes: love, longing, summer, friendship
  * Avoid complex metaphors - keep it direct
```

#### C. Lyric Structure Control
**Location:** User message construction
```typescript
const userMessage = `
  Skriv en ${genre} sangtekst basert på konseptet: "${concept}"

  STRUKTUR:
  - 4-8 linjer (passende for Suno AI)
  - Tydelig rytme og rim-skjema
  - Unngå for komplekse metaforer
`
```

**What to adjust:**
- Line count requirements
- Rhyme scheme enforcement
- Verse/chorus structure
- Language complexity level

### Testing Workflow

1. **Backup current prompt:**
   ```bash
   # Copy the file first
   cp src/app/api/lyrics/generate/route.ts src/app/api/lyrics/generate/route.ts.backup
   ```

2. **Make one change at a time** (temperature, or one prompt section, not both)

3. **Test with 5-10 generations** in the same genre with similar concepts

4. **Document results:**
   ```
   Test Date: 2025-11-23
   Change: Increased temperature from 0.7 → 0.9
   Genre: Pop
   Results:
   - More creative word choices ✓
   - Sometimes too abstract ✗
   - Users liked 3/5 outputs
   Decision: Try 0.8 as middle ground
   ```

5. **Rollback if worse:**
   ```bash
   cp src/app/api/lyrics/generate/route.ts.backup src/app/api/lyrics/generate/route.ts
   ```

---

## 🗣️ 2. Phonetic Pronunciation Optimizer (GPT-4)

### Location
**File:** `src/lib/phonetic/optimizer.ts`

### Current System Prompt
```typescript
// Lines ~40-60 in optimizer.ts
const systemMessage = {
  role: 'system',
  content: `Du er en norsk fonetikkekspert som optimaliserer sangtekster for AI-generert musikk.
            Analyser teksten og foreslå fonetiske stavemåter som gir autentisk norsk uttale.
            Fokuser på: Rullende R-lyder, norske vokalpar, konsonantklynger, tonefall.
            Behold egennavn og stedsnavn uendret.
            Returner JSON: [{"original": "ord", "optimized": "ord", "reason": "forklaring", "lineNumber": 1}]`
}
```

### Key Parameters to Adjust

#### A. Temperature (Consistency Level)
**Location:** Line ~45
```typescript
temperature: 0.3  // Current setting
```

**What it does:**
- **Lower (0.1-0.2)**: Very consistent, same words always optimized the same way
- **Medium (0.3-0.5)**: Balanced (current)
- **Higher (0.6-0.8)**: More varied phonetic suggestions

**When to adjust:**
- Need exact same optimization every time? → Use 0.1
- Want some variation in phonetic choices? → Try 0.5
- Getting stale/repetitive optimizations? → Try 0.4

#### B. Phonetic Rules Guidance
**Location:** System prompt, phonetic rules section

**Current focus areas:**
```typescript
Fokuser på: Rullende R-lyder, norske vokalpar, konsonantklynger, tonefall
```

**How to enhance based on testing:**

**Example - if R sounds aren't rolling enough:**
```typescript
// BEFORE
Fokuser på: Rullende R-lyder, norske vokalpar...

// AFTER (more specific)
Fokuser på:
- Rullende R-lyder: Bruk "rrr" for å forsterke R-lyder (barn → baarrn)
- Doble vokaler for lengre lyd (på → påå, deg → dægg)
- Norske diftonger: æi, øy, au (jeg → jæi, deg → dæi)
- Myke konsonanter: kj → tj, skj → shj, gj → yj
```

**Example - if proper nouns are being changed:**
```typescript
// Add to system prompt
VIKTIG: Disse ordene skal ALDRI endres:
- Alle egennavn (Lars, Kari, Ola)
- Alle stedsnavn (Oslo, Bergen, Trondheim)
- Engelske låneord (cool, party, weekend)
- Merkevarer og produktnavn
```

#### C. Aggressiveness Level
**Location:** System prompt instructions

**Control how much to optimize:**

```typescript
// Conservative (fewer changes)
const systemPrompt = `
  Optimaliser NÅR NØDVENDIG for autentisk uttale.
  Gjør kun endringer som VESENTLIG forbedrer norsk uttale.
  Når i tvil - behold original stavemåte.
`

// Moderate (current approach)
const systemPrompt = `
  Analyser teksten og foreslå fonetiske stavemåter...
`

// Aggressive (maximum optimization)
const systemPrompt = `
  Optimaliser ALLE ord for MAKSIMAL norsk uttale-autentisitet.
  Vær kreativ med fonetiske stavemåter.
  Prioriter uttale over lesbarhet.
`
```

**When to use each:**
- **Conservative**: Users complain lyrics look "weird" or unreadable
- **Moderate**: Balanced approach (current default)
- **Aggressive**: Suno still sounds "American" even with optimization

#### D. Phonetic Cache (Common Words)
**Location:** `src/lib/phonetic/rules.ts`

```typescript
export const phoneticCache: Record<string, string> = {
  // Current entries
  'jeg': 'jæi',
  'deg': 'dæi',
  'på': 'påå',
  // ...add more as you discover patterns
}
```

**How to enhance:**
1. **Test with real users** and note which words sound "American"
2. **Ask Suno to generate** the optimized version
3. **Listen to the result** - does it sound more Norwegian?
4. **If YES**: Add to cache for instant optimization
5. **If NO**: Try different phonetic spelling

**Example workflow:**
```
Original word: "kjærlighet"
Test 1: "tjærrleihett" → Sounds too harsh
Test 2: "tjærlihett" → Better, but "light" sound wrong
Test 3: "tjærrlihæt" → Good! Sounds Norwegian
Add to cache: 'kjærlighet': 'tjærrlihæt'
```

#### E. Preserve Words List
**Location:** `src/lib/phonetic/rules.ts`

```typescript
export const preserveWords = new Set([
  // Names
  'lars', 'oslo', 'bergen',
  // Add words users report as incorrectly changed
])
```

**How to maintain:**
- User reports "My name was changed in lyrics!" → Add to preserveWords
- Test with Norwegian locations → Add common place names
- International words/brands → Add to preserve list

### Testing Workflow for Pronunciation

1. **Create test lyrics set:**
   ```typescript
   // Save this in a file: test-lyrics.txt
   Jeg elsker deg under stjernene
   Vi danser på gaten i Bergen
   Lars og Kari synger sammen
   Sommeren kommer snart til Oslo
   ```

2. **Test current optimization:**
   - Run through optimizer
   - Save results: `optimized-v1.txt`
   - Generate song with Suno
   - **Listen and note:** What sounds good? What sounds weird?

3. **Make ONE change** to prompt/cache/temperature

4. **Test same lyrics again:**
   - Save results: `optimized-v2.txt`
   - Compare differences
   - Generate with Suno
   - A/B test: Which sounds more Norwegian?

5. **Document findings:**
   ```
   Test Date: 2025-11-23
   Change: Added "deg → dægg" (double g) to cache
   Result:
   - "deg" sounds more Norwegian ✓
   - But "Bergen" was wrongly changed to "Bærrgæn" ✗
   Fix: Added "bergen" to preserveWords list
   Retest: Now working ✓
   ```

---

## 🔧 Quick Reference: Where to Edit

| What to Change | File | Line(s) |
|----------------|------|---------|
| Lyric creativity (temperature) | `src/app/api/lyrics/generate/route.ts` | ~60 |
| Lyric generation prompt | `src/app/api/lyrics/generate/route.ts` | ~30-50 |
| Genre-specific instructions | `src/app/api/lyrics/generate/route.ts` | ~35-45 |
| Pronunciation aggressiveness | `src/lib/phonetic/optimizer.ts` | ~40-60 |
| Phonetic temperature | `src/lib/phonetic/optimizer.ts` | ~45 |
| Phonetic rules detail | `src/lib/phonetic/optimizer.ts` | ~42-48 |
| Common word cache | `src/lib/phonetic/rules.ts` | ~5-40 |
| Preserve words (no changes) | `src/lib/phonetic/rules.ts` | ~45-60 |

---

## 📊 Tuning Strategy

### Phase 1: Lyric Quality (Week 1-2)
1. Test lyric generation with 20+ concepts across all genres
2. Identify which genres need improvement
3. Adjust temperature and genre instructions
4. Re-test until satisfied

### Phase 2: Pronunciation Basics (Week 2-3)
1. Generate 10 songs with default pronunciation
2. Listen to all - note "American" sounding words
3. Add those words to phonetic cache with better spellings
4. Re-test same lyrics

### Phase 3: Fine-Tuning (Week 3-4)
1. A/B test with real users (Norwegian speakers)
2. Gather feedback on both lyrics quality AND pronunciation
3. Make small prompt adjustments
4. Build up phonetic cache to 100+ common words

### Phase 4: Edge Cases (Ongoing)
1. User reports issues → Document
2. Test edge case
3. Add to preserve list OR cache as appropriate
4. Verify fix doesn't break existing good cases

---

## 💡 Pro Tips

### For Lyric Generation:
- **Keep temperature ≤ 0.8** or you'll get nonsense
- **Test each genre separately** - they need different instructions
- **Use real Norwegian song lyrics** as reference when writing prompt guidance
- **Ask Norwegian speakers** what feels natural vs. forced

### For Pronunciation:
- **Start conservative, get aggressive gradually** - easier to add optimizations than remove
- **Temperature 0.1-0.3 is ideal** - you want consistency here
- **Build cache organically** - add words as you discover them, don't try to pre-fill everything
- **Trust your ears** - if Suno sounds Norwegian, the optimization works!
- **Preserve > Optimize** - when in doubt, don't change the word

### General:
- **Change one thing at a time** - otherwise you won't know what helped/hurt
- **Keep backups** before major prompt changes
- **Document everything** - you'll forget why you made changes
- **Test with REAL users** early and often

---

## 🚀 Quick Start: First Tuning Session

1. **Test current system:**
   ```bash
   npm run dev
   # Generate 5 songs, note issues
   ```

2. **Pick ONE issue** (e.g., "Pop lyrics too formal")

3. **Edit the relevant prompt** (e.g., add "Use casual, conversational Norwegian" to Pop genre)

4. **Restart dev server:**
   ```bash
   # Ctrl+C, then
   npm run dev
   ```

5. **Test again** - Generate 5 more songs

6. **Compare** - Better? Worse? Document it!

7. **Keep or rollback** your change

---

## 📝 Tuning Log Template

Keep a log file to track your changes:

```markdown
# Prompt Tuning Log - Musikkfabrikken

## 2025-11-23 - Session 1
**Target**: Improve Pop lyric quality
**Change**: Increased temperature 0.7 → 0.8
**Test Results**:
- 5 generations tested
- 3/5 more creative ✓
- 2/5 slightly weird word choices ✗
**Decision**: Keep at 0.8, monitor

## 2025-11-24 - Session 2
**Target**: Fix "deg" pronunciation
**Change**: Added 'deg': 'dæi' to phonetic cache
**Test Results**:
- "Jeg elsker deg" → now sounds Norwegian ✓
**Decision**: Keep, add more pronouns

...continue logging
```

---

## 🆘 Troubleshooting

**Problem**: Changes to prompts not taking effect
- **Fix**: Restart the dev server (Ctrl+C, then `npm run dev`)

**Problem**: Optimization too aggressive, lyrics unreadable
- **Fix**: Add problematic words to `preserveWords` set in `rules.ts`

**Problem**: Temperature changes making things worse
- **Fix**: Rollback to backup file, try smaller increment (0.1 instead of 0.2)

**Problem**: Cache not being used
- **Fix**: Check that words in cache are lowercase (code converts to lowercase before lookup)

---

Good luck tuning your AI agents! Remember: **Small changes, frequent testing, document everything.** 🎵
