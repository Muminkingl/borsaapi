import { NextRequest, NextResponse } from 'next/server';

// One-time setup route: visit /api/telegram/setup to register the webhook
// Protected by a secret key so only you can trigger it
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // Simple protection — must pass ?secret=YOUR_SECRET
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!botToken || !appUrl) {
    return NextResponse.json({ error: 'Missing TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_APP_URL env vars' }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,
      { method: 'GET' }
    );
    const data = await res.json();

    return NextResponse.json({
      success: data.ok,
      telegram_response: data,
      webhook_registered_to: webhookUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to reach Telegram API', details: message }, { status: 500 });
  }
}
