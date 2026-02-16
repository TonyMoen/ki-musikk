/**
 * Error Message Dictionary (Norwegian)
 * Centralized error message mapping for user-friendly error handling
 *
 * Severity-to-Toast Variant Mapping:
 * - critical → 'destructive' (red) - API failures, payment failures
 * - warning → 'warning' (yellow/amber) - Low credits, timeout pending
 * - info → 'default' - Informational messages
 */

export enum ErrorCode {
  // API Errors
  SUNO_API_ERROR = 'SUNO_API_ERROR',
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',

  // Credit Errors
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Auth Errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Rate Limit Errors
  LYRICS_RATE_LIMIT = 'LYRICS_RATE_LIMIT',
  LYRICS_RATE_LIMIT_ANON = 'LYRICS_RATE_LIMIT_ANON',

  // Song Errors
  SONG_NOT_FOUND = 'SONG_NOT_FOUND',
  SONG_DOWNLOAD_FAILED = 'SONG_DOWNLOAD_FAILED',
  SONG_DELETE_FAILED = 'SONG_DELETE_FAILED',
  PURCHASE_REQUIRED = 'PURCHASE_REQUIRED',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export type ErrorSeverity = 'critical' | 'warning' | 'info'

export type RecoveryActionType =
  | 'retry'
  | 'buy-credits'
  | 'login'
  | 'contact-support'
  | 'dismiss'
  | 'go-home'

export interface RecoveryAction {
  label: string
  action: RecoveryActionType
}

export interface ErrorMessage {
  code: ErrorCode
  title: string
  description: string
  recoveryAction: RecoveryAction
  severity: ErrorSeverity
}

/**
 * Error Messages Dictionary
 * All user-facing messages in Norwegian (Bokmal)
 * Technical error details are never exposed to users
 */
export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  // API Errors (Critical - Red)
  [ErrorCode.SUNO_API_ERROR]: {
    code: ErrorCode.SUNO_API_ERROR,
    title: 'Kunne ikke na sanggenereringstjenesten',
    description: 'Oops! Suno er midlertidig utilgjengelig. Sjekk internettforbindelsen og prov igjen.',
    recoveryAction: { label: 'Prov igjen', action: 'retry' },
    severity: 'critical'
  },

  [ErrorCode.OPENAI_API_ERROR]: {
    code: ErrorCode.OPENAI_API_ERROR,
    title: 'Kunne ikke generere tekst',
    description: 'AI-tjenesten er midlertidig utilgjengelig. Prov igjen om litt.',
    recoveryAction: { label: 'Prov igjen', action: 'retry' },
    severity: 'critical'
  },

  // Credit Errors (Warning - Yellow)
  [ErrorCode.INSUFFICIENT_CREDITS]: {
    code: ErrorCode.INSUFFICIENT_CREDITS,
    title: 'Ikke nok kreditter',
    description: 'Du trenger 10 kreditter for a generere en sang. Kjop en pakke for a fortsette.',
    recoveryAction: { label: 'Kjop kreditter', action: 'buy-credits' },
    severity: 'warning'
  },

  [ErrorCode.PAYMENT_FAILED]: {
    code: ErrorCode.PAYMENT_FAILED,
    title: 'Betaling mislyktes',
    description: 'Betalingen kunne ikke gjennomfores. Prov igjen eller kontakt support.',
    recoveryAction: { label: 'Kontakt support', action: 'contact-support' },
    severity: 'critical'
  },

  // Network Errors (Critical - Red)
  [ErrorCode.NETWORK_ERROR]: {
    code: ErrorCode.NETWORK_ERROR,
    title: 'Ingen internettforbindelse',
    description: 'Det ser ut som du er offline. Sjekk internettforbindelsen og prov igjen.',
    recoveryAction: { label: 'Prov igjen', action: 'retry' },
    severity: 'critical'
  },

  // Timeout (Warning - Yellow)
  [ErrorCode.TIMEOUT_ERROR]: {
    code: ErrorCode.TIMEOUT_ERROR,
    title: 'Generering tar tid',
    description: 'Generering tar lengre tid enn forventet. Vi varsler deg nar den er klar!',
    recoveryAction: { label: 'OK', action: 'dismiss' },
    severity: 'warning'
  },

  // Auth Errors (Critical - Red)
  [ErrorCode.AUTH_REQUIRED]: {
    code: ErrorCode.AUTH_REQUIRED,
    title: 'Innlogging pakrevd',
    description: 'Du ma logge inn for a fortsette.',
    recoveryAction: { label: 'Logg inn', action: 'login' },
    severity: 'critical'
  },

  [ErrorCode.SESSION_EXPIRED]: {
    code: ErrorCode.SESSION_EXPIRED,
    title: 'Okten har utlopt',
    description: 'Du har blitt logget ut. Logg inn pa nytt for a fortsette.',
    recoveryAction: { label: 'Logg inn', action: 'login' },
    severity: 'critical'
  },

  // Validation Errors (Info - Default)
  [ErrorCode.VALIDATION_ERROR]: {
    code: ErrorCode.VALIDATION_ERROR,
    title: 'Ugyldig inndata',
    description: 'Vennligst fyll ut alle pakrevde felt.',
    recoveryAction: { label: 'OK', action: 'dismiss' },
    severity: 'info'
  },

  // Rate Limit Errors (Warning - Yellow)
  [ErrorCode.LYRICS_RATE_LIMIT]: {
    code: ErrorCode.LYRICS_RATE_LIMIT,
    title: 'For mange foresporsler',
    description: 'Du har nådd grensen for tekstgenerering. Prov igjen om litt.',
    recoveryAction: { label: 'OK', action: 'dismiss' },
    severity: 'warning'
  },

  [ErrorCode.LYRICS_RATE_LIMIT_ANON]: {
    code: ErrorCode.LYRICS_RATE_LIMIT_ANON,
    title: 'Gratis genereringer brukt opp',
    description: 'Logg inn for a fortsette a generere tekster.',
    recoveryAction: { label: 'Logg inn', action: 'login' },
    severity: 'warning'
  },

  // Song Errors
  [ErrorCode.SONG_NOT_FOUND]: {
    code: ErrorCode.SONG_NOT_FOUND,
    title: 'Sangen ble ikke funnet',
    description: 'Sangen finnes ikke lenger. Den kan ha blitt slettet.',
    recoveryAction: { label: 'Ga til Mine sanger', action: 'go-home' },
    severity: 'warning'
  },

  [ErrorCode.SONG_DOWNLOAD_FAILED]: {
    code: ErrorCode.SONG_DOWNLOAD_FAILED,
    title: 'Nedlasting feilet',
    description: 'Kunne ikke laste ned sangen. Prov igjen.',
    recoveryAction: { label: 'Prov igjen', action: 'retry' },
    severity: 'critical'
  },

  [ErrorCode.SONG_DELETE_FAILED]: {
    code: ErrorCode.SONG_DELETE_FAILED,
    title: 'Sletting feilet',
    description: 'Kunne ikke slette sangen. Prov igjen.',
    recoveryAction: { label: 'Prov igjen', action: 'retry' },
    severity: 'critical'
  },

  [ErrorCode.PURCHASE_REQUIRED]: {
    code: ErrorCode.PURCHASE_REQUIRED,
    title: 'Kjop pakrevd for nedlasting',
    description: 'Du ma kjope kreditt for a laste ned sanger. Gratis kreditt gir kun tilgang til a lage og lytte.',
    recoveryAction: { label: 'Kjop kreditter', action: 'buy-credits' },
    severity: 'warning'
  },

  // Generic Error (Critical - Red)
  [ErrorCode.UNKNOWN_ERROR]: {
    code: ErrorCode.UNKNOWN_ERROR,
    title: 'Noe gikk galt',
    description: 'En uventet feil oppstod. Prov igjen eller kontakt support.',
    recoveryAction: { label: 'Prov igjen', action: 'retry' },
    severity: 'critical'
  }
}

/**
 * Get error message by code
 */
export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]
}
