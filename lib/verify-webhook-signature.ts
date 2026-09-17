import crypto from 'crypto';

/**
 * Verifies the HMAC-SHA256 signature from Wayl webhook requests using timing-safe comparison.
 * @param body - Raw request body string
 * @param signature - Signature from x-wayl-signature header
 * @param secret - Your WAYL_WEBHOOK_SECRET
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!secret || !signature || !body) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(signature);

    if (expectedBuf.length !== signatureBuf.length) return false;

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}
