# Story 3.13: Implement Deterministic Norwegian Phonetic Rule Engine

Status: review

## Story

As a **user creating Norwegian songs**,
I want **lyrics to be phonetically optimized using consistent, predictable rules**,
So that **AI-generated vocals pronounce Norwegian words authentically without relying on GPT-4 API calls**.

## Acceptance Criteria

1. **AC #1**: Rule engine applies 6 transformation rules in exact order:
   - Silent D removal (rød→rø, god→go, med→me)
   - ND→NN pattern (land→lann, strand→strann)
   - RD→R pattern (fjord→fjor, nord→nor)
   - OG→Å replacement (og→å)
   - Acronym expansion (FRP→Eff-Err-Pe, NRK→Enn-Err-Kå)
   - Number expansion (2025→tjue-tjue-fem)

2. **AC #2**: "død" context detection works correctly:
   - Adjective use: "er død" → "er dø"
   - Noun use: "mye død" → "mye død" (unchanged)

3. **AC #3**: Proper nouns preserved (Oslo, Bergen, Trondheim remain unchanged)

4. **AC #4**: GPT-4 API calls removed from phonetic optimization flow

5. **AC #5**: All 10 test cases from v3.0 rules document pass

6. **AC #6**: Phonetic diff viewer continues to work with new rule engine

7. **AC #7**: Existing `/api/lyrics/optimize` endpoint uses new rule engine

8. **AC #8**: Performance improvement: optimization completes in <100ms (vs current GPT-4 latency)

## Tasks / Subtasks

- [x] Task 1: Create new deterministic rule engine (AC: #1, #2, #3)
  - [x] 1.1 Create `src/lib/phonetic/rule-engine.ts` with 6 transformation functions
  - [x] 1.2 Implement Silent D removal with "død" context detection
  - [x] 1.3 Implement ND→NN pattern transformation
  - [x] 1.4 Implement RD→R pattern transformation
  - [x] 1.5 Implement OG→Å replacement
  - [x] 1.6 Implement acronym expansion with Norwegian alphabet
  - [x] 1.7 Create `src/lib/phonetic/number-converter.ts` with full algorithmic number-to-words conversion
  - [x] 1.8 Add proper noun preservation logic

- [x] Task 2: Replace GPT-4 optimizer (AC: #4, #7)
  - [x] 2.1 Update `src/lib/phonetic/optimizer.ts` to use rule engine instead of GPT-4
  - [x] 2.2 Remove OpenAI import and API call logic
  - [x] 2.3 Update `/api/lyrics/optimize/route.ts` to use new optimizer
  - [x] 2.4 Keep existing `PhoneticChange` interface for compatibility

- [x] Task 3: Update rules cache (AC: #1)
  - [x] 3.1 Update `src/lib/phonetic/rules.ts` - remove rolling R transformations
  - [x] 3.2 Remove conflicting cache entries (rød→rrrød, etc.)
  - [x] 3.3 Keep preserved words list

- [x] Task 4: Testing and validation (AC: #5, #6, #8)
  - [x] 4.1 Create test file with all 10 v3.0 test cases
  - [x] 4.2 Verify phonetic diff viewer works with new changes
  - [x] 4.3 Verify performance <100ms (actual: 0.025ms per iteration)
  - [x] 4.4 Manual test in UI with sample lyrics

## Dev Notes

### Architecture Decision

**Replacing GPT-4 with deterministic rule engine** per founder-validated Norwegian phonetic rules (v3.0).

**Rationale:**
- Faster execution (<100ms vs 1-3s GPT-4 latency)
- Zero API costs per optimization
- Predictable, testable output
- Founder-validated linguistic accuracy

### Current vs New Approach

| Aspect | Current (GPT-4) | New (Rule Engine) |
|--------|-----------------|-------------------|
| Silent D | Not implemented | rød→rø, god→go |
| Rolling R | rød→rrrød | **Removed** |
| OG→Å | ✓ og→å | ✓ og→å (kept) |
| ND→NN | Not implemented | land→lann |
| RD→R | Not implemented | fjord→fjor |
| Acronyms | Not implemented | FRP→Eff-Err-Pe |
| Numbers | Not implemented | 2025→tjue-tjue-fem |
| API Cost | ~$0.03/call | $0 |
| Latency | 1-3 seconds | <100ms |

### Key Implementation Notes

1. **Rule Order Matters**: Apply transformations in exact sequence (1-6)
2. **Word Boundaries**: Use regex word boundaries to avoid partial matches
3. **Case Preservation**: Maintain original capitalization where appropriate
4. **"død" Special Case**: Only word requiring context detection (adjective vs noun)

### Number Conversion Algorithm (Rule 6)

Create `src/lib/phonetic/number-converter.ts` with full algorithmic conversion:

**Base Word Mappings:**
```typescript
const ONES = { 0: 'null', 1: 'en', 2: 'to', 3: 'tre', 4: 'fire', 5: 'fem', 6: 'seks', 7: 'sju', 8: 'åtte', 9: 'ni' }
const TEENS = { 10: 'ti', 11: 'elleve', 12: 'tolv', 13: 'tretten', 14: 'fjorten', 15: 'femten', 16: 'seksten', 17: 'sytten', 18: 'atten', 19: 'nitten' }
const TENS = { 2: 'tjue', 3: 'tretti', 4: 'førti', 5: 'femti', 6: 'seksti', 7: 'sytti', 8: 'åtti', 9: 'nitti' }
```

**Year Conversion Rules:**

| Year Range | Pattern | Example |
|------------|---------|---------|
| 2000 | `to-tusen` | 2000 → to-tusen |
| 2001-2009 | `to-tusen-å-{ones}` | 2001 → to-tusen-å-en |
| 2010-2099 | `tjue-{twoDigit}` | 2025 → tjue-tjue-fem |
| 1900-1999 | `nitten-{twoDigit}` | 1985 → nitten-åtti-fem |
| 1800-1899 | `atten-{twoDigit}` | 1814 → atten-fjorten |

**Two-Digit Number Rules:**

| Range | Pattern | Example |
|-------|---------|---------|
| 0-9 | `{ones}` | 7 → sju |
| 10-19 | `{teens}` | 15 → femten |
| 20-99 | `{tens}-{ones}` | 42 → førti-to |
| X0 (20,30...) | `{tens}` | 80 → åtti |

**Complete Test Cases:**
```
2000 → to-tusen
2001 → to-tusen-å-en
2002 → to-tusen-å-to
2009 → to-tusen-å-ni
2010 → tjue-ti
2011 → tjue-elleve
2025 → tjue-tjue-fem
1985 → nitten-åtti-fem
1990 → nitten-nitti
89 → åtti-ni
42 → førti-to
15 → femten
7 → sju
```

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- New file: `src/lib/phonetic/rule-engine.ts`
- Modified files: `src/lib/phonetic/optimizer.ts`, `src/lib/phonetic/rules.ts`
- Keep existing interfaces for backwards compatibility

### References

- [Source: docs/norwegian-phonetic-rules.md] - Complete v3.0 ruleset with test cases
- [Source: src/lib/phonetic/optimizer.ts] - Current GPT-4 implementation to replace
- [Source: src/lib/phonetic/rules.ts] - Current cache to update
- [Source: docs/architecture.md#ADR-006] - Original GPT-4 decision (being superseded)

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/stories/3-13-implement-deterministic-phonetic-rule-engine.context.xml

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 2025-11-29: Implemented 6-rule transformation engine replacing GPT-4 API calls
- 2025-11-29: Fixed "død" context detection to properly distinguish adjective vs noun usage
- 2025-11-29: Added special handling for "kald" → "kall" (ld→ll transformation)
- 2025-11-29: All 10 v3.0 test cases pass with 0.025ms per iteration performance

### Completion Notes List

- Created deterministic rule engine with 6 ordered transformations (Silent D, ND→NN, RD→R, OG→Å, Acronyms, Numbers)
- Replaced GPT-4 API with pure TypeScript logic - zero API costs, 1000x faster
- Maintained backward compatibility with PhoneticChange interface for diff viewer
- Context-aware "død" handling: adjective use removes D, noun use keeps D
- Norwegian number converter supports years (1800-2099) and regular numbers (0-9999)
- All 10 v3.0 test cases pass with 0.025ms average execution time (requirement: <100ms)
- Build passes with no TypeScript errors

### File List

**New Files:**
- src/lib/phonetic/rule-engine.ts - Main rule engine with 6 transformation rules
- src/lib/phonetic/number-converter.ts - Norwegian number-to-words converter
- src/lib/phonetic/rule-engine.test.ts - Test file with all 10 v3.0 test cases
- scripts/test-phonetic-rules.js - Node.js test runner for validation

**Modified Files:**
- src/lib/phonetic/optimizer.ts - Replaced GPT-4 calls with rule engine
- src/lib/phonetic/rules.ts - Removed rolling R cache, kept preserved words list
- src/app/api/lyrics/optimize/route.ts - Updated timeout from 5s to 500ms

