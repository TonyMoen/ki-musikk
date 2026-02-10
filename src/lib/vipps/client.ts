/**
 * Vipps ePayment API Client
 * Handles authentication and API calls to Vipps
 */

import type {
  VippsAccessToken,
  VippsCreatePaymentRequest,
  VippsCreatePaymentResponse,
  VippsGetPaymentResponse,
  VippsCapturePaymentRequest,
  VippsCapturePaymentResponse,
} from './types'

// Token cache (in-memory for serverless, consider Redis for production)
let tokenCache: {
  token: string
  expiresAt: number
} | null = null

const getVippsConfig = () => {
  const clientId = process.env.VIPPS_CLIENT_ID
  const clientSecret = process.env.VIPPS_CLIENT_SECRET
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY
  const msn = process.env.VIPPS_MSN
  const apiUrl = process.env.VIPPS_API_URL || 'https://api.vipps.no'

  if (!clientId || !clientSecret || !subscriptionKey || !msn) {
    throw new Error(
      'Missing Vipps environment variables. Required: VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN'
    )
  }

  return { clientId, clientSecret, subscriptionKey, msn, apiUrl }
}

/**
 * Get access token from Vipps
 * Caches token until 5 minutes before expiry
 */
export async function getAccessToken(): Promise<string> {
  // Check cache first
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const { clientId, clientSecret, subscriptionKey, apiUrl } = getVippsConfig()

  const response = await fetch(`${apiUrl}/accesstoken/get`, {
    method: 'POST',
    headers: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Merchant-Serial-Number': process.env.VIPPS_MSN!,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Vipps auth failed:', errorText)
    throw new Error(`Vipps authentication failed: ${response.status}`)
  }

  const data: VippsAccessToken = await response.json()

  // Cache token (expire 5 minutes early for safety)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }

  return data.access_token
}

/**
 * Get common headers for Vipps API requests
 */
async function getHeaders(): Promise<HeadersInit> {
  const { subscriptionKey, msn } = getVippsConfig()
  const accessToken = await getAccessToken()

  return {
    'Authorization': `Bearer ${accessToken}`,
    'Ocp-Apim-Subscription-Key': subscriptionKey,
    'Merchant-Serial-Number': msn,
    'Content-Type': 'application/json',
    'Vipps-System-Name': 'KI-MUSIKK',
    'Vipps-System-Version': '1.0.0',
  }
}

/**
 * Create a new payment
 */
export async function createPayment(
  request: VippsCreatePaymentRequest
): Promise<VippsCreatePaymentResponse> {
  const { apiUrl } = getVippsConfig()
  const headers = await getHeaders()

  const response = await fetch(`${apiUrl}/epayment/v1/payments`, {
    method: 'POST',
    headers: {
      ...headers,
      'Idempotency-Key': request.reference,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Vipps create payment failed:', errorText)
    throw new Error(`Failed to create Vipps payment: ${response.status}`)
  }

  return response.json()
}

/**
 * Get payment status
 */
export async function getPayment(
  reference: string
): Promise<VippsGetPaymentResponse> {
  const { apiUrl } = getVippsConfig()
  const headers = await getHeaders()

  const response = await fetch(
    `${apiUrl}/epayment/v1/payments/${reference}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Vipps get payment failed:', errorText)
    throw new Error(`Failed to get Vipps payment: ${response.status}`)
  }

  return response.json()
}

/**
 * Capture an authorized payment
 */
export async function capturePayment(
  reference: string,
  request: VippsCapturePaymentRequest
): Promise<VippsCapturePaymentResponse> {
  const { apiUrl } = getVippsConfig()
  const headers = await getHeaders()

  const response = await fetch(
    `${apiUrl}/epayment/v1/payments/${reference}/capture`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Vipps capture payment failed:', errorText)
    throw new Error(`Failed to capture Vipps payment: ${response.status}`)
  }

  return response.json()
}

/**
 * Cancel an authorized payment
 */
export async function cancelPayment(reference: string): Promise<void> {
  const { apiUrl } = getVippsConfig()
  const headers = await getHeaders()

  const response = await fetch(
    `${apiUrl}/epayment/v1/payments/${reference}/cancel`,
    {
      method: 'POST',
      headers,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Vipps cancel payment failed:', errorText)
    throw new Error(`Failed to cancel Vipps payment: ${response.status}`)
  }
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `kimusikk-${timestamp}-${randomPart}`
}
