/**
 * Structured Logging Utility
 *
 * Provides JSON-formatted structured logging for all application events.
 * Follows architecture logging strategy with consistent format and trace IDs.
 *
 * @module utils/logger
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface LogContext {
  userId?: string
  transactionId?: string
  songId?: string
  amount?: number
  balanceAfter?: number
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * Format and output a structured log entry
 *
 * @param level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param message - Human-readable log message
 * @param context - Additional context data (user ID, transaction ID, etc.)
 * @param error - Optional error object for ERROR level logs
 */
function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }

  const logString = JSON.stringify(entry)

  switch (level) {
    case 'ERROR':
      console.error(logString)
      break
    case 'WARN':
      console.warn(logString)
      break
    case 'INFO':
      console.info(logString)
      break
    case 'DEBUG':
    default:
      console.log(logString)
      break
  }
}

/**
 * Log a debug message (development only, disabled in production)
 *
 * @param message - Debug message
 * @param context - Optional context data
 *
 * @example
 * ```typescript
 * logDebug('Credit deduction starting', { userId: user.id, amount: 10 })
 * ```
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    log('DEBUG', message, context)
  }
}

/**
 * Log an informational message (important business events)
 *
 * @param message - Info message
 * @param context - Optional context data
 *
 * @example
 * ```typescript
 * logInfo('Credit deduction successful', {
 *   userId: user.id,
 *   amount: CREDIT_COSTS.SONG_GENERATION,
 *   transactionId: txn.id,
 *   balanceAfter: txn.balance_after
 * })
 * ```
 */
export function logInfo(message: string, context?: LogContext): void {
  log('INFO', message, context)
}

/**
 * Log a warning message (unexpected but handled situations)
 *
 * @param message - Warning message
 * @param context - Optional context data
 *
 * @example
 * ```typescript
 * logWarn('User attempted generation with low credits', {
 *   userId: user.id,
 *   balance: user.credit_balance,
 *   required: CREDIT_COSTS.SONG_GENERATION
 * })
 * ```
 */
export function logWarn(message: string, context?: LogContext): void {
  log('WARN', message, context)
}

/**
 * Log an error message (exceptions, failures)
 *
 * @param message - Error message
 * @param error - Error object
 * @param context - Optional context data
 *
 * @example
 * ```typescript
 * try {
 *   await deductCredits(user.id, amount, 'Song generation')
 * } catch (error) {
 *   logError('Credit deduction failed', error as Error, {
 *     userId: user.id,
 *     amount,
 *     balance: user.credit_balance
 *   })
 *   throw error
 * }
 * ```
 */
export function logError(message: string, error: Error, context?: LogContext): void {
  log('ERROR', message, context, error)
}

/**
 * Credit-specific logging helpers
 */
export const creditLogger = {
  /**
   * Log successful credit deduction
   */
  deductionSuccess(userId: string, amount: number, transactionId: string, balanceAfter: number, songId?: string): void {
    logInfo('Credit deduction successful', {
      userId,
      amount,
      transactionId,
      balanceAfter,
      songId
    })
  },

  /**
   * Log credit deduction failure
   */
  deductionFailure(userId: string, amount: number, error: Error, balance?: number): void {
    logError('Credit deduction failed', error, {
      userId,
      amount,
      balanceAfter: balance
    })
  },

  /**
   * Log credit refund
   */
  refundIssued(userId: string, amount: number, reason: string, transactionId: string, balanceAfter: number, originalTransactionId?: string): void {
    logInfo('Credit refund issued', {
      userId,
      amount,
      reason,
      transactionId,
      balanceAfter,
      originalTransactionId
    })
  },

  /**
   * Log credit purchase
   */
  purchaseCompleted(userId: string, amount: number, stripeSessionId: string, transactionId: string, balanceAfter: number): void {
    logInfo('Credit purchase completed', {
      userId,
      amount,
      stripeSessionId,
      transactionId,
      balanceAfter
    })
  },

  /**
   * Log insufficient credits attempt
   */
  insufficientCredits(userId: string, required: number, balance: number, action: string): void {
    logWarn('Insufficient credits for action', {
      userId,
      required,
      balance,
      action
    })
  }
}
