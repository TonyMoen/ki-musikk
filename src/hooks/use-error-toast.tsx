'use client'

/**
 * useErrorToast Hook
 * Wrapper around useToast that integrates with error-handler
 * Auto-selects toast variant based on error severity
 */

import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { handleError, getErrorByCode } from '@/lib/error-handler'
import { ErrorCode, type ErrorMessage, type ErrorSeverity, type RecoveryActionType } from '@/lib/error-messages'
import { useRouter } from 'next/navigation'

/**
 * Maps error severity to toast variant
 */
const severityToVariant: Record<ErrorSeverity, 'destructive' | 'warning' | 'default'> = {
  critical: 'destructive',
  warning: 'warning',
  info: 'default'
}

interface ShowErrorOptions {
  /** Optional context for logging (e.g., 'song-generation') */
  context?: string
  /** Callback for retry action */
  onRetry?: () => void
  /** Callback for buy credits action (opens credit purchase modal) */
  onBuyCredits?: () => void
  /** Callback for login action */
  onLogin?: () => void
  /** Callback for contact support action */
  onContactSupport?: () => void
  /** Callback for dismiss action */
  onDismiss?: () => void
  /** Override the default recovery action label */
  customActionLabel?: string
}

/**
 * Hook for displaying error toasts with recovery actions
 */
export function useErrorToast() {
  const { toast, dismiss } = useToast()
  const router = useRouter()

  /**
   * Show an error toast with appropriate styling and recovery action
   *
   * @param error - Error to display (unknown type, ErrorCode, or ErrorMessage)
   * @param options - Options for handling the error
   */
  const showError = (
    error: unknown | ErrorCode | ErrorMessage,
    options?: ShowErrorOptions
  ) => {
    // Determine the error message
    let errorMessage: ErrorMessage

    if (typeof error === 'string' && error in ErrorCode) {
      // Direct ErrorCode passed
      errorMessage = getErrorByCode(error as ErrorCode)
    } else if (isErrorMessage(error)) {
      // ErrorMessage object passed
      errorMessage = error
    } else {
      // Unknown error - parse it
      errorMessage = handleError(error, options?.context)
    }

    // Skip showing generic "unknown error" toasts - just log them
    if (errorMessage.code === ErrorCode.UNKNOWN_ERROR) {
      console.warn('[Error suppressed]', error, options?.context)
      return
    }

    // Get the action handler based on recovery action type
    const actionHandler = getActionHandler(
      errorMessage.recoveryAction.action,
      options,
      router,
      dismiss
    )

    // Determine if we should show an action button
    const shouldShowAction = actionHandler !== null
    const actionLabel = options?.customActionLabel || errorMessage.recoveryAction.label

    // Create the toast
    toast({
      variant: severityToVariant[errorMessage.severity],
      title: errorMessage.title,
      description: errorMessage.description,
      action: shouldShowAction ? (
        <ToastAction altText={actionLabel} onClick={actionHandler!}>
          {actionLabel}
        </ToastAction>
      ) : undefined
    })
  }

  /**
   * Show an error by error code directly
   */
  const showErrorByCode = (code: ErrorCode, options?: ShowErrorOptions) => {
    showError(getErrorByCode(code), options)
  }

  return {
    showError,
    showErrorByCode,
    dismiss
  }
}

/**
 * Get the appropriate action handler based on recovery action type
 */
function getActionHandler(
  actionType: RecoveryActionType,
  options: ShowErrorOptions | undefined,
  router: ReturnType<typeof useRouter>,
  dismiss: (toastId?: string) => void
): (() => void) | null {
  switch (actionType) {
    case 'retry':
      return options?.onRetry || null

    case 'buy-credits':
      return options?.onBuyCredits || null

    case 'login':
      return options?.onLogin || (() => {
        // Default: redirect to login or trigger sign-in
        router.push('/api/auth/signin')
      })

    case 'contact-support':
      return options?.onContactSupport || (() => {
        // Default: open email client or help page
        window.location.href = 'mailto:hei@kimusikk.no'
      })

    case 'go-home':
      return () => router.push('/sanger')

    case 'dismiss':
      return () => dismiss()

    default:
      return null
  }
}

/**
 * Type guard for ErrorMessage
 */
function isErrorMessage(error: unknown): error is ErrorMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'title' in error &&
    'description' in error &&
    'recoveryAction' in error &&
    'severity' in error
  )
}

export type { ShowErrorOptions }
