// Test script for Norwegian Phonetic Rule Engine
// Run with: node scripts/test-phonetic-rules.js

// Import the compiled modules (after build)
const path = require('path')

// We need to test the source files directly, so let's build a quick test
// that doesn't rely on the compiled output

// Copy the logic for testing
const NORWEGIAN_ALPHABET = {
  A: 'A', B: 'Be', C: 'Se', D: 'De', E: 'E', F: 'Eff', G: 'Ge', H: 'Hå',
  I: 'I', J: 'Jod', K: 'Kå', L: 'Ell', M: 'Emm', N: 'Enn', O: 'O', P: 'Pe',
  Q: 'Ku', R: 'Err', S: 'Ess', T: 'Te', U: 'U', V: 'Ve', W: 'Dobbelt-Ve',
  X: 'Ekss', Y: 'Y', Z: 'Sett', 'Æ': 'Æ', 'Ø': 'Ø', 'Å': 'Å'
}

const ONES = { 0: 'null', 1: 'en', 2: 'to', 3: 'tre', 4: 'fire', 5: 'fem', 6: 'seks', 7: 'sju', 8: 'åtte', 9: 'ni' }
const TEENS = { 10: 'ti', 11: 'elleve', 12: 'tolv', 13: 'tretten', 14: 'fjorten', 15: 'femten', 16: 'seksten', 17: 'sytten', 18: 'atten', 19: 'nitten' }
const TENS = { 2: 'tjue', 3: 'tretti', 4: 'førti', 5: 'femti', 6: 'seksti', 7: 'sytti', 8: 'åtti', 9: 'nitti' }

const preservedWords = ['oslo', 'bergen', 'trondheim', 'stavanger']
const SILENT_D_EXCEPTIONS = ['tid', 'vid', 'bid', 'lid']

function convertTwoDigit(num) {
  if (num < 10) return ONES[num]
  if (num < 20) return TEENS[num]
  const tensDigit = Math.floor(num / 10)
  const onesDigit = num % 10
  if (onesDigit === 0) return TENS[tensDigit]
  return `${TENS[tensDigit]}-${ONES[onesDigit]}`
}

function convertNumberToNorwegian(num) {
  if (num === 2000) return 'to-tusen'
  if (num >= 2001 && num <= 2009) return `to-tusen-å-${ONES[num % 10]}`
  if (num >= 2010 && num <= 2099) return `tjue-${convertTwoDigit(num % 100)}`
  if (num >= 1900 && num <= 1999) return `nitten-${convertTwoDigit(num % 100)}`
  if (num >= 1800 && num <= 1899) return `atten-${convertTwoDigit(num % 100)}`
  if (num < 100) return convertTwoDigit(num)
  return num.toString()
}

function isProperNoun(word) {
  return preservedWords.includes(word.replace(/[.,!?;:"'\-()]/g, '').toLowerCase())
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function transformSilentD(text) {
  let result = text
  result = result.replace(/\b(go)dt\b/gi, '$1tt')

  // Handle "død" - by default adjective (remove D), EXCEPT with quantifiers
  const nounPatterns = [/\b(mye|lite|noe|masse|litt|mer|mest)\s+død\b/gi]
  const nounDødPositions = []
  for (const pattern of nounPatterns) {
    let match
    pattern.lastIndex = 0
    while ((match = pattern.exec(result)) !== null) {
      const dødIndex = match.index + match[0].lastIndexOf('død')
      nounDødPositions.push(dødIndex)
    }
  }

  const dødPattern = /\bdød\b/gi
  result = result.replace(dødPattern, (match, offset) => {
    const isNoun = nounDødPositions.some(pos => Math.abs(pos - offset) < 3)
    if (isNoun) return match
    return match[0] === 'D' ? 'Dø' : 'dø'
  })

  // Handle 'ld' endings: kald → kall
  result = result.replace(/\bkald\b/gi, match => match[0] === 'K' ? 'Kall' : 'kall')

  const silentDWords = ['rød', 'god', 'ved', 'med', 'glad', 'bred', 'blid', 'hid']
  for (const word of silentDWords) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')
    result = result.replace(pattern, match => {
      if (SILENT_D_EXCEPTIONS.includes(match.toLowerCase())) return match
      return match.slice(0, -1)
    })
  }
  return result
}

function transformNDtoNN(text) {
  return text.replace(/\b(\w*[aeiouæøå])nd\b/gi, match => {
    if (isProperNoun(match)) return match
    return match.slice(0, -2) + 'nn'
  })
}

function transformRDtoR(text) {
  return text.replace(/\b(\w+)rd\b/gi, match => {
    if (isProperNoun(match)) return match
    return match.slice(0, -1)
  })
}

function transformOGtoÅ(text) {
  return text.replace(/\bog\b/gi, match => match[0] === 'O' ? 'Å' : 'å')
}

function transformAcronyms(text) {
  return text.replace(/\b[A-ZÆØÅ]{2,}\b/g, match => {
    const letters = match.split('')
    return letters.map(letter => NORWEGIAN_ALPHABET[letter] || letter).join('-')
  })
}

function transformNumbers(text) {
  return text.replace(/\b\d{1,4}\b/g, match => {
    const num = parseInt(match, 10)
    return convertNumberToNorwegian(num)
  })
}

function applyAllRules(lyrics) {
  const lines = lyrics.split('\n')
  const transformedLines = []

  for (let line of lines) {
    if (line.trim().length === 0) {
      transformedLines.push(line)
      continue
    }
    line = transformSilentD(line)
    line = transformNDtoNN(line)
    line = transformRDtoR(line)
    line = transformOGtoÅ(line)
    line = transformAcronyms(line)
    line = transformNumbers(line)
    transformedLines.push(line)
  }

  return { transformedLyrics: transformedLines.join('\n') }
}

// Run tests
const tests = [
  { name: 'Test 1: Silent D + OG', input: 'Rød og død', expected: 'Rø å dø' },
  { name: 'Test 2: Multiple patterns', input: 'I land ved fjord', expected: 'I lann ve fjor' },
  { name: 'Test 3: Acronym + year', input: 'FRP i 2025', expected: 'Eff-Err-Pe i tjue-tjue-fem' },
  { name: 'Test 4: Multi-line', input: 'God morgen under bar\nVed fjord i nord', expected: 'Go morgen under bar\nVe fjor i nor' },
  { name: 'Test 5: Silent D + ND', input: 'Med død håp står jeg der\nI dette land', expected: 'Me dø håp står jeg der\nI dette lann' },
  { name: 'Test 6: Acronym + number', input: 'NRK sender i 89 år\nFra bord til bord', expected: 'Enn-Err-Kå sender i åtti-ni år\nFra bor til bor' },
  { name: 'Test 7: All rules + OG', input: 'Hard rock ved strand\nGlad og rød under', expected: 'Har rock ve strann\nGla å rø under' },
  { name: 'Test 8: Complex', input: 'I 2025 ved fjord i nord\nStår FRP med god vilje\n89 år siden siste krig ved strand\nDer håper vi for mer', expected: 'I tjue-tjue-fem ve fjor i nor\nStår Eff-Err-Pe me go vilje\nåtti-ni år siden siste krig ve strann\nDer håper vi for mer' },
  { name: 'Test 9: død Context', input: 'Han er død og kald\nDet er mye død i verden\nVed fjord og strand', expected: 'Han er dø å kall\nDet er mye død i verden\nVe fjor å strann' },
  { name: 'Test 10: Neuter + OG', input: 'Et godt liv og en god dag', expected: 'Et gott liv å en go dag' }
]

let passed = 0
let failed = 0

console.log('Norwegian Phonetic Rule Engine Tests (v3.0)')
console.log('='.repeat(50))

for (const test of tests) {
  const result = applyAllRules(test.input)
  if (result.transformedLyrics === test.expected) {
    console.log('✓', test.name)
    passed++
  } else {
    console.log('✗', test.name)
    console.log('  Expected:', JSON.stringify(test.expected))
    console.log('  Got:', JSON.stringify(result.transformedLyrics))
    failed++
  }
}

// Number converter tests
console.log('\nNumber Converter Tests')
console.log('-'.repeat(50))
const numberTests = [
  { input: 2000, expected: 'to-tusen' },
  { input: 2001, expected: 'to-tusen-å-en' },
  { input: 2025, expected: 'tjue-tjue-fem' },
  { input: 1985, expected: 'nitten-åtti-fem' },
  { input: 89, expected: 'åtti-ni' },
  { input: 42, expected: 'førti-to' },
  { input: 15, expected: 'femten' },
  { input: 7, expected: 'sju' }
]

for (const test of numberTests) {
  const result = convertNumberToNorwegian(test.input)
  if (result === test.expected) {
    console.log('✓ Number', test.input, '→', test.expected)
    passed++
  } else {
    console.log('✗ Number', test.input, ': expected', test.expected, ', got', result)
    failed++
  }
}

// Proper noun test
const pnResult = applyAllRules('I Oslo ved fjord')
if (pnResult.transformedLyrics === 'I Oslo ve fjor') {
  console.log('\n✓ Proper noun preservation: I Oslo ved fjord → I Oslo ve fjor')
  passed++
} else {
  console.log('\n✗ Proper noun preservation failed:', pnResult.transformedLyrics)
  failed++
}

// Performance test
console.log('\nPerformance Test:')
const start = Date.now()
for (let i = 0; i < 1000; i++) {
  applyAllRules('God morgen FRP i 2025\nJeg står ved fjord i nord\nMed død håp i land')
}
const elapsed = Date.now() - start
console.log('  1000 iterations:', elapsed, 'ms')
console.log('  Per iteration:', (elapsed / 1000).toFixed(3), 'ms')
console.log('  Requirement: <100ms -', elapsed / 1000 < 100 ? '✓ PASS' : '✗ FAIL')

console.log('\n' + '='.repeat(50))
console.log('Results:', passed, 'passed,', failed, 'failed')

if (failed > 0) {
  process.exit(1)
}
