/**
 * Wayl Payment Gateway Client
 * Docs: https://thewayl.com
 * Base URL: https://api.thewayl.com
 * Auth: X-WAYL-AUTHENTICATION header
 */

interface CreatePaymentLinkParams {
  referenceId: string;
  total: number;         // Amount in IQD
  currency: string;      // 'IQD'
  webhookUrl: string;
  webhookSecret: string;
  redirectionUrl: string;
  planName: string;
}

interface WaylPaymentLinkResponse {
  orderId: string;
  paymentUrl: string;
}

export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<WaylPaymentLinkResponse> {
  const {
    referenceId,
    total,
    currency,
    webhookUrl,
    webhookSecret,
    redirectionUrl,
    planName,
  } = params;

  const apiKey = process.env.WAYL_API_KEY;
  const baseUrl = process.env.WAYL_API_URL || 'https://api.thewayl.com';

  // Guard: catch placeholder / missing credentials before making the call
  if (!apiKey || apiKey === 'your_wayl_api_key_here' || apiKey.length < 8) {
    throw new Error(
      'WAYL_API_KEY is not configured. Please set your real API key from the Wayl merchant dashboard in your .env file.'
    );
  }

  const body = {
    referenceId,
    total,
    currency,
    description: planName,
    webhookUrl,
    webhookSecret,
    redirectionUrl,
    lineItem: [
      {
        label: planName,
        quantity: 1,
        amount: total,
        unitPrice: total,
        type: 'increase',
      },
    ],
  };

  const response = await fetch(`${baseUrl}/api/v1/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WAYL-AUTHENTICATION': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[WAYL CLIENT] API error:', response.status, errorText.slice(0, 200));
    throw new Error(`Wayl API error: ${response.status}`);
  }

  const data = await response.json();

  // Wayl response shape: { success: true, data: { url, id, ... } }
  const payload = data.data || data;
  const paymentUrl = payload.url || payload.payment_url || payload.paymentUrl;
  const orderId = payload.id || payload.order_id || payload.orderId || referenceId;

  if (!paymentUrl) {
    console.error('[WAYL CLIENT] No payment URL in response:', data);
    throw new Error('Wayl did not return a payment URL. Check your API key and plan.');
  }

  return { orderId, paymentUrl };
}
