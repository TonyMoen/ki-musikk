# Musikkfabrikken - Backlog & Action Items

Generated: 2025-11-20
Project: ibe160 (Musikkfabrikken)

This file tracks action items, technical debt, and follow-up tasks discovered during code reviews and development.

## Action Items

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
|------|-------|------|------|----------|-------|--------|-------|
| 2025-11-20 | 1.6 | 1 | TechDebt | Medium | TBD | Open | Preserve RLS testing evidence for AC #8 verification - Run manual RLS test with two authenticated users, document test procedure, capture screenshots showing auth.uid() filtering works correctly. Save test results to /docs/test-results/1-6-rls-testing.md or append to story file. Affects user_profile, song, credit_transaction, mastering_request RLS policies. |
| 2025-11-20 | 1.6 | 1 | Cleanup | Low | TBD | Open | Delete stray type definition file srctypessupabase.ts from project root (typo/leftover file). Verify correct file is src/types/supabase.ts. Run git status to confirm cleanup. |
