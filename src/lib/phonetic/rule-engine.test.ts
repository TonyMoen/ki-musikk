// Norwegian Phonetic Rule Engine Tests
// Tests all 10 v3.0 test cases from norwegian-phonetic-rules.md
// Run with: npx ts-node src/lib/phonetic/rule-engine.test.ts

import { applyAllRules } from './rule-engine'
import { convertNumberToNorwegian } from './number-converter'

// Helper function to run test and report result
function runTest(
  testName: string,
  input: string,
  expected: string
): { passed: boolean; message: string } {
  const { transformedLyrics } = applyAllRules(input)
  const passed = transformedLyrics === expected

  if (passed) {
    return { passed: true, message: `✓ ${testName}` }
  } else {
    return {
      passed: false,
      message: `✗ ${testName}\n  Input:    "${input}"\n  Expected: "${expected}"\n  Got:      "${transformedLyrics}"`
    }
  }
}

// Run all tests
export function runAllTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = []
  let passed = 0
  let failed = 0

  console.log('Norwegian Phonetic Rule Engine Tests (v3.0)')
  console.log('=' .repeat(50))

  // Test 1: Silent D + OG rule
  const test1 = runTest(
    'Test 1: Silent D + OG rule',
    'Rød og død',
    'Rø å dø'
  )
  results.push(test1.message)
  test1.passed ? passed++ : failed++
  console.log(test1.message)

  // Test 2: Multiple patterns
  const test2 = runTest(
    'Test 2: Multiple patterns (ND→NN, Silent D, RD→R)',
    'I land ved fjord',
    'I lann ve fjor'
  )
  results.push(test2.message)
  test2.passed ? passed++ : failed++
  console.log(test2.message)

  // Test 3: Acronym + year
  const test3 = runTest(
    'Test 3: Acronym + year',
    'FRP i 2025',
    'Eff-Err-Pe i tjue-tjue-fem'
  )
  results.push(test3.message)
  test3.passed ? passed++ : failed++
  console.log(test3.message)

  // Test 4: Multi-line
  const test4 = runTest(
    'Test 4: Multi-line',
    'God morgen under bar\nVed fjord i nord',
    'Go morgen under bar\nVe fjor i nor'
  )
  results.push(test4.message)
  test4.passed ? passed++ : failed++
  console.log(test4.message)

  // Test 5: Silent D + ND pattern
  const test5 = runTest(
    'Test 5: Silent D + ND pattern',
    'Med død håp står jeg der\nI dette land',
    'Me dø håp står jeg der\nI dette lann'
  )
  results.push(test5.message)
  test5.passed ? passed++ : failed++
  console.log(test5.message)

  // Test 6: Acronym + number + multiple patterns
  const test6 = runTest(
    'Test 6: Acronym + number + multiple patterns',
    'NRK sender i 89 år\nFra bord til bord',
    'Enn-Err-Kå sender i åtti-ni år\nFra bor til bor'
  )
  results.push(test6.message)
  test6.passed ? passed++ : failed++
  console.log(test6.message)

  // Test 7: All rules including OG
  const test7 = runTest(
    'Test 7: All rules including OG',
    'Hard rock ved strand\nGlad og rød under',
    'Har rock ve strann\nGla å rø under'
  )
  results.push(test7.message)
  test7.passed ? passed++ : failed++
  console.log(test7.message)

  // Test 8: Complex real-world example
  const test8 = runTest(
    'Test 8: Complex real-world example',
    'I 2025 ved fjord i nord\nStår FRP med god vilje\n89 år siden siste krig ved strand\nDer håper vi for mer',
    'I tjue-tjue-fem ve fjor i nor\nStår Eff-Err-Pe me go vilje\nåtti-ni år siden siste krig ve strann\nDer håper vi for mer'
  )
  results.push(test8.message)
  test8.passed ? passed++ : failed++
  console.log(test8.message)

  // Test 9: "død" Context Distinction
  const test9 = runTest(
    'Test 9: "død" Context Distinction',
    'Han er død og kald\nDet er mye død i verden\nVed fjord og strand',
    'Han er dø å kall\nDet er mye død i verden\nVe fjor å strann'
  )
  results.push(test9.message)
  test9.passed ? passed++ : failed++
  console.log(test9.message)

  // Test 10: Neuter forms + OG
  const test10 = runTest(
    'Test 10: Neuter forms + OG',
    'Et godt liv og en god dag',
    'Et gott liv å en go dag'
  )
  results.push(test10.message)
  test10.passed ? passed++ : failed++
  console.log(test10.message)

  // Number converter tests
  console.log('\nNumber Converter Tests')
  console.log('-'.repeat(50))

  const numberTests = [
    { input: 2000, expected: 'to-tusen' },
    { input: 2001, expected: 'to-tusen-å-en' },
    { input: 2002, expected: 'to-tusen-å-to' },
    { input: 2009, expected: 'to-tusen-å-ni' },
    { input: 2010, expected: 'tjue-ti' },
    { input: 2011, expected: 'tjue-elleve' },
    { input: 2025, expected: 'tjue-tjue-fem' },
    { input: 1985, expected: 'nitten-åtti-fem' },
    { input: 1990, expected: 'nitten-nitti' },
    { input: 89, expected: 'åtti-ni' },
    { input: 42, expected: 'førti-to' },
    { input: 15, expected: 'femten' },
    { input: 7, expected: 'sju' }
  ]

  for (const { input, expected } of numberTests) {
    const result = convertNumberToNorwegian(input)
    if (result === expected) {
      const msg = `✓ Number ${input} → ${expected}`
      results.push(msg)
      console.log(msg)
      passed++
    } else {
      const msg = `✗ Number ${input}: expected "${expected}", got "${result}"`
      results.push(msg)
      console.log(msg)
      failed++
    }
  }

  // Proper noun preservation test
  console.log('\nProper Noun Preservation Tests')
  console.log('-'.repeat(50))

  const properNounTest = runTest(
    'Proper noun preservation',
    'I Oslo ved fjord',
    'I Oslo ve fjor'
  )
  results.push(properNounTest.message)
  console.log(properNounTest.message)
  properNounTest.passed ? passed++ : failed++

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`Results: ${passed} passed, ${failed} failed`)

  return { passed, failed, results }
}

// Performance test
export function runPerformanceTest(): { avgMs: number; maxMs: number } {
  const sampleLyrics = `God morgen FRP i 2025
Jeg står ved fjord i nord
Med død håp i land
Men håper for mer
Hard rock ved strand
Glad og rød under
NRK sender i 89 år
Fra bord til bord`

  const iterations = 100
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    applyAllRules(sampleLyrics)
    const end = performance.now()
    times.push(end - start)
  }

  const avgMs = times.reduce((a, b) => a + b, 0) / times.length
  const maxMs = Math.max(...times)

  console.log(`\nPerformance Test (${iterations} iterations):`)
  console.log(`  Average: ${avgMs.toFixed(3)}ms`)
  console.log(`  Maximum: ${maxMs.toFixed(3)}ms`)
  console.log(`  Requirement: <100ms - ${maxMs < 100 ? '✓ PASS' : '✗ FAIL'}`)

  return { avgMs, maxMs }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
  runPerformanceTest()
}
