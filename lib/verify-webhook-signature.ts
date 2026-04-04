import { createHmac } from 'crypto';

/**
 * Verifies the HMAC-SHA256 signature from Wayl webhook requests.
 * @param body - Raw request body string
 * @param signature - Signature from x-wayl-signature header
 * @param secret - Your WAYL_WEBHOOK_SECRET
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (expectedSignature.length !== signature.length) return false;

    let result = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}
