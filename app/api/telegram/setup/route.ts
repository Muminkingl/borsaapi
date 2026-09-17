import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// One-time setup route: visit /api/telegram/setup to register the webhook
// Protected by SETUP_SECRET so only admin can trigger it
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  const expectedSecret = process.env.SETUP_SECRET;
  if (!expectedSecret || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bufSecret = Buffer.from(secret);
  const bufExpected = Buffer.from(expectedSecret);
  if (bufSecret.length !== bufExpected.length || !crypto.timingSafeEqual(bufSecret, bufExpected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!botToken || !appUrl) {
    return NextResponse.json({ error: 'Missing TELEGRAM_BOT_TOKEN or APP_URL env vars' }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const setWebhookUrl = new URL(`https://api.telegram.org/bot${botToken}/setWebhook`);
  setWebhookUrl.searchParams.set('url', webhookUrl);
  if (webhookSecret) {
    setWebhookUrl.searchParams.set('secret_token', webhookSecret);
  }

  try {
    const res = await fetch(setWebhookUrl.toString(), { method: 'GET' });
    const data = await res.json();

    return NextResponse.json({
      success: data.ok,
      telegram_response: data,
      webhook_registered_to: webhookUrl,
      secret_token_configured: !!webhookSecret,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to reach Telegram API', details: message }, { status: 500 });
  }
}
