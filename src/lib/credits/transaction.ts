/**
 * Credit Transaction Utility Functions
 *
 * Provides atomic credit deduction and refund operations using database stored procedures.
 * These functions ensure financial integrity through database-level row locking and transactions.
 *
 * @module credits/transaction
 */

import { createClient } from '@/lib/supabase/server'
import type {
  CreditTransaction,
  DeductCreditsParams,
  RefundCreditsParams
} from '@/types/credit'
import {
  InsufficientCreditsError,
  CreditOperationError
} from '@/types/credit'

// Re-export error classes for convenient import
export { InsufficientCreditsError, CreditOperationError }

/**
 * Atomically deduct credits from a user's balance
 *
 * Uses database stored procedure `deduct_credits()` with row locking to prevent
 * race conditions and ensure atomic updates. If the user has insufficient credits,
 * throws InsufficientCreditsError.
 *
 * @param userId - User UUID
 * @param amount - Number of credits to deduct
 * @param description - Human-readable description for audit log
 * @param songId - Optional song UUID to link this transaction
 * @returns Credit transaction record
 * @throws {InsufficientCreditsError} If user has insufficient credits
 * @throws {CreditOperationError} If database operation fails
 *
 * @example
 * ```typescript
 * try {
 *   const txn = await deductCredits(
 *     user.id,
 *     CREDIT_COSTS.SONG_GENERATION,
 *     'Song generation',
 *     songId
 *   )
 *   console.log(`Deducted ${txn.amount} credits, new balance: ${txn.balance_after}`)
 * } catch (error) {
 *   if (error instanceof InsufficientCreditsError) {
 *     return { error: { code: 'INSUFFICIENT_CREDITS', message: 'Not enough credits' } }
 *   }
 *   throw error
 * }
 * ```
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  songId?: string
): Promise<CreditTransaction> {
  const supabase = await createClient()

  const params: DeductCreditsParams = {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    ...(songId && { p_song_id: songId })
  }

  const { data, error } = await supabase.rpc('deduct_credits', params)

  if (error) {
    // Check if this is an insufficient credits error
    if (error.message && error.message.includes('Insufficient credits')) {
      throw new InsufficientCreditsError(error.message)
    }

    // Otherwise, it's a system error
    throw new CreditOperationError(`Credit deduction failed: ${error.message}`, error)
  }

  if (!data) {
    throw new CreditOperationError('Credit deduction failed: No data returned from stored procedure')
  }

  return data as CreditTransaction
}

/**
 * Atomically refund credits to a user's balance
 *
 * Uses database stored procedure `refund_credits()` with row locking to ensure
 * atomic updates. Creates a compensating transaction record (type='refund').
 * This is NOT a database rollback - it's a separate credit addition.
 *
 * @param userId - User UUID
 * @param amount - Number of credits to refund
 * @param description - Human-readable description for audit log (e.g., "Generation failed - API error")
 * @param songId - Optional song UUID to link this transaction
 * @returns Credit transaction record
 * @throws {CreditOperationError} If database operation fails
 *
 * @example
 * ```typescript
 * try {
 *   const deductionTxn = await deductCredits(user.id, 10, 'Song generation')
 *
 *   // Attempt Suno API call
 *   const result = await generateSong(...)
 *
 *   // Success - credits remain deducted
 *   return { data: result }
 *
 * } catch (sunoError) {
 *   // Failure - refund credits
 *   await refundCredits(user.id, 10, `Generation failed - ${sunoError.message}`)
 *   return { error: { code: 'GENERATION_FAILED', message: 'Credits refunded' } }
 * }
 * ```
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  songId?: string
): Promise<CreditTransaction> {
  const supabase = await createClient()

  const params: RefundCreditsParams = {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    ...(songId && { p_song_id: songId })
  }

  const { data, error } = await supabase.rpc('refund_credits' as any, params)

  if (error) {
    throw new CreditOperationError(`Credit refund failed: ${error.message}`, error)
  }

  if (!data) {
    throw new CreditOperationError('Credit refund failed: No data returned from stored procedure')
  }

  return data as CreditTransaction
}

/**
 * Check if user has sufficient credits before deduction
 *
 * This is a client-side validation helper. Always validate server-side as well
 * using the deductCredits() function which enforces atomicity.
 *
 * @param balance - Current user credit balance
 * @param required - Credits required for operation
 * @returns True if user has sufficient credits
 *
 * @example
 * ```typescript
 * if (!hasSufficientCredits(user.credit_balance, CREDIT_COSTS.SONG_GENERATION)) {
 *   return { error: { code: 'INSUFFICIENT_CREDITS', message: 'Not enough credits' } }
 * }
 *
 * // Proceed with credit deduction
 * await deductCredits(user.id, CREDIT_COSTS.SONG_GENERATION, 'Song generation')
 * ```
 */
export function hasSufficientCredits(balance: number, required: number): boolean {
  return balance >= required
}
