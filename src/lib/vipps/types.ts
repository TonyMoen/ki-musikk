/**
 * Vipps ePayment API TypeScript Types
 * Based on Vipps ePayment API v1
 */

// Auth Token
export interface VippsAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  ext_expires_in: number
}

// Payment Creation
export interface VippsCreatePaymentRequest {
  amount: {
    currency: 'NOK'
    value: number // Amount in øre (1 NOK = 100 øre)
  }
  paymentMethod: {
    type: 'WALLET'
  }
  customer?: {
    phoneNumber?: string
  }
  reference: string
  userFlow: 'WEB_REDIRECT' | 'NATIVE_REDIRECT' | 'PUSH_MESSAGE'
  returnUrl: string
  paymentDescription: string
}

export interface VippsCreatePaymentResponse {
  reference: string
  state: VippsPaymentState
  aggregate: {
    authorizedAmount: {
      currency: string
      value: number
    }
    cancelledAmount: {
      currency: string
      value: number
    }
    capturedAmount: {
      currency: string
      value: number
    }
    refundedAmount: {
      currency: string
      value: number
    }
  }
  pspReference: string
  redirectUrl: string
}

// Payment States
export type VippsPaymentState =
  | 'CREATED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'AUTHORIZED'
  | 'TERMINATED'

// Get Payment Response
export interface VippsGetPaymentResponse {
  reference: string
  state: VippsPaymentState
  aggregate: {
    authorizedAmount: {
      currency: string
      value: number
    }
    cancelledAmount: {
      currency: string
      value: number
    }
    capturedAmount: {
      currency: string
      value: number
    }
    refundedAmount: {
      currency: string
      value: number
    }
  }
  pspReference?: string
  paymentMethod?: {
    type: string
  }
}

// Capture Payment
export interface VippsCapturePaymentRequest {
  modificationAmount: {
    currency: 'NOK'
    value: number
  }
}

export interface VippsCapturePaymentResponse {
  reference: string
  state: VippsPaymentState
  aggregate: {
    authorizedAmount: {
      currency: string
      value: number
    }
    cancelledAmount: {
      currency: string
      value: number
    }
    capturedAmount: {
      currency: string
      value: number
    }
    refundedAmount: {
      currency: string
      value: number
    }
  }
  pspReference: string
}

// Webhook Events
export interface VippsWebhookEvent {
  msn: string
  reference: string
  pspReference: string
  name: VippsWebhookEventName
  amount: {
    currency: string
    value: number
  }
  timestamp: string
  idempotencyKey: string
  success: boolean
}

export type VippsWebhookEventName =
  | 'CREATED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'AUTHORIZED'
  | 'TERMINATED'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'CANCELLED'

// Credit Package Types (NOK)
export interface CreditPackageNOK {
  id: 'starter' | 'pro' | 'premium'
  name: string
  priceNOK: number // Price in NOK (whole kroner)
  priceOre: number // Price in øre for API
  credits: number
  description: string
  badge?: string
}

// Database Types
export interface VippsPaymentRecord {
  id: string
  reference: string
  user_id: string
  package_id: string
  credits: number
  amount_ore: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
}
