// Norwegian Number-to-Words Converter
// Converts numeric digits to Norwegian word forms for phonetic optimization

/**
 * Base word mappings for Norwegian numbers
 */
const ONES: Record<number, string> = {
  0: 'null',
  1: 'en',
  2: 'to',
  3: 'tre',
  4: 'fire',
  5: 'fem',
  6: 'seks',
  7: 'sju',
  8: 'åtte',
  9: 'ni'
}

const TEENS: Record<number, string> = {
  10: 'ti',
  11: 'elleve',
  12: 'tolv',
  13: 'tretten',
  14: 'fjorten',
  15: 'femten',
  16: 'seksten',
  17: 'sytten',
  18: 'atten',
  19: 'nitten'
}

const TENS: Record<number, string> = {
  2: 'tjue',
  3: 'tretti',
  4: 'førti',
  5: 'femti',
  6: 'seksti',
  7: 'sytti',
  8: 'åtti',
  9: 'nitti'
}

/**
 * Convert a two-digit number (0-99) to Norwegian words
 */
function convertTwoDigit(num: number): string {
  if (num < 0 || num > 99) {
    throw new Error('Number must be between 0 and 99')
  }

  // Single digits
  if (num < 10) {
    return ONES[num]
  }

  // Teens (10-19)
  if (num < 20) {
    return TEENS[num]
  }

  // Tens (20, 30, ..., 90)
  const tensDigit = Math.floor(num / 10)
  const onesDigit = num % 10

  if (onesDigit === 0) {
    return TENS[tensDigit]
  }

  // Compound (21-99 excluding tens)
  return `${TENS[tensDigit]}-${ONES[onesDigit]}`
}

/**
 * Convert a year (1800-2099) to Norwegian spoken form
 *
 * Year patterns:
 * - 2000: "to-tusen"
 * - 2001-2009: "to-tusen-å-{ones}"
 * - 2010-2099: "tjue-{twoDigit}"
 * - 1900-1999: "nitten-{twoDigit}"
 * - 1800-1899: "atten-{twoDigit}"
 */
function convertYear(year: number): string {
  if (year < 1800 || year > 2099) {
    // Fall back to simple number conversion for unsupported years
    return convertNumber(year)
  }

  // Special case: exactly 2000
  if (year === 2000) {
    return 'to-tusen'
  }

  // 2001-2009: "to-tusen-å-{ones}"
  if (year >= 2001 && year <= 2009) {
    const ones = year % 10
    return `to-tusen-å-${ONES[ones]}`
  }

  // 2010-2099: "tjue-{twoDigit}"
  if (year >= 2010 && year <= 2099) {
    const lastTwo = year % 100
    return `tjue-${convertTwoDigit(lastTwo)}`
  }

  // 1900-1999: "nitten-{twoDigit}"
  if (year >= 1900 && year <= 1999) {
    const lastTwo = year % 100
    return `nitten-${convertTwoDigit(lastTwo)}`
  }

  // 1800-1899: "atten-{twoDigit}"
  if (year >= 1800 && year <= 1899) {
    const lastTwo = year % 100
    return `atten-${convertTwoDigit(lastTwo)}`
  }

  return convertNumber(year)
}

/**
 * Convert a general number to Norwegian words
 * Handles 0-9999
 */
function convertNumber(num: number): string {
  if (num < 0) {
    return `minus-${convertNumber(Math.abs(num))}`
  }

  if (num < 10) {
    return ONES[num]
  }

  if (num < 20) {
    return TEENS[num]
  }

  if (num < 100) {
    return convertTwoDigit(num)
  }

  if (num < 1000) {
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100

    if (remainder === 0) {
      if (hundreds === 1) {
        return 'hundre'
      }
      return `${ONES[hundreds]}-hundre`
    }

    const hundredsPart = hundreds === 1 ? 'hundre' : `${ONES[hundreds]}-hundre`
    return `${hundredsPart}-${convertTwoDigit(remainder)}`
  }

  if (num < 10000) {
    const thousands = Math.floor(num / 1000)
    const remainder = num % 1000

    if (remainder === 0) {
      if (thousands === 1) {
        return 'tusen'
      }
      return `${ONES[thousands]}-tusen`
    }

    const thousandsPart = thousands === 1 ? 'tusen' : `${ONES[thousands]}-tusen`

    if (remainder < 100) {
      return `${thousandsPart}-${convertTwoDigit(remainder)}`
    }

    return `${thousandsPart}-${convertNumber(remainder)}`
  }

  // For numbers >= 10000, just return digits (unlikely in lyrics)
  return num.toString()
}

/**
 * Main export: Convert a number to Norwegian words
 * Automatically detects if it's a year (4 digits starting with 18, 19, or 20)
 */
export function convertNumberToNorwegian(num: number): string {
  // Check if it looks like a year
  if (num >= 1800 && num <= 2099) {
    return convertYear(num)
  }

  return convertNumber(num)
}

/**
 * Convert ordinal number to Norwegian
 * (e.g., 1 → første, 2 → andre)
 * Note: Not currently used in phonetic rules, but available for future use
 */
export function convertOrdinalToNorwegian(num: number): string {
  const ordinals: Record<number, string> = {
    1: 'første',
    2: 'andre',
    3: 'tredje',
    4: 'fjerde',
    5: 'femte',
    6: 'sjette',
    7: 'sjuende',
    8: 'åttende',
    9: 'niende',
    10: 'tiende',
    11: 'ellevte',
    12: 'tolvte'
  }

  if (ordinals[num]) {
    return ordinals[num]
  }

  // For higher numbers, just add "-te" or "-de"
  const base = convertNumber(num)
  if (base.endsWith('e')) {
    return base.slice(0, -1) + 'te'
  }
  return base + '-de'
}
