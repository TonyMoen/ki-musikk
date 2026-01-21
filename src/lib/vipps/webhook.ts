/**
 * Vipps Webhook Signature Verification
 * Uses HMAC-SHA256 to verify webhook authenticity
 */

import { createHmac } from 'crypto'

/**
 * Verify Vipps webhook signature
 *
 * Vipps signs webhooks using HMAC-SHA256:
 * - The signature is in the 'Authorization' header as 'Bearer <signature>'
 * - The signature is computed over the raw request body
 *
 * @param body - Raw request body as string
 * @param signature - Signature from Authorization header (without 'Bearer ' prefix)
 * @returns boolean - Whether the signature is valid
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const webhookSecret = process.env.VIPPS_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('VIPPS_WEBHOOK_SECRET is not configured')
    return false
  }

  try {
    // Compute HMAC-SHA256
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }

    return result === 0
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

/**
 * Extract signature from Authorization header
 * Vipps sends: "Bearer <signature>"
 */
export function extractSignature(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}
