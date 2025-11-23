/**
 * Credit Transaction Types
 * Type definitions for credit system operations
 */

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number // Positive for purchase/refund, negative for deduction
  balance_after: number
  transaction_type: 'purchase' | 'deduction' | 'refund'
  description: string
  stripe_session_id?: string | null
  song_id?: string | null
  created_at: string
}

export interface DeductCreditsParams {
  p_user_id: string
  p_amount: number
  p_description: string
  p_song_id?: string
}

export interface RefundCreditsParams {
  p_user_id: string
  p_amount: number
  p_description: string
  p_song_id?: string
}

/**
 * Custom error class for insufficient credits
 * Used to distinguish between validation errors and system errors
 */
export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsufficientCreditsError'
  }
}

/**
 * Custom error class for credit operation failures
 * Used for database or RPC errors during credit operations
 */
export class CreditOperationError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'CreditOperationError'
  }
}
