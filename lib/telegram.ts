const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Escapes special HTML characters so Telegram's HTML parse_mode
 * does not throw entity parsing errors or allow HTML injection.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send a plain text or HTML message to a specific chat.
 * Fire-and-forget safe (errors are logged and caught).
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<void> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Telegram API error:', res.status, errText);
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    // Never crash the user's request over a Telegram failure
  }
}

/**
 * Send the rich "New Project Submitted" notification to the admin.
 */
export async function notifyNewProject(project: {
  id: string;
  name: string;
  url: string;
  description: string;
  how_using: string;
  status: string;
}, user: {
  name?: string | null;
  email?: string | null;
}): Promise<void> {
  const safeName = escapeHtml(user.name ?? 'Unknown');
  const safeEmail = escapeHtml(user.email ?? 'Unknown');
  const safeProjectName = escapeHtml(project.name);
  const safeUrl = escapeHtml(project.url);
  const safeHowUsing = escapeHtml(project.how_using);
  const safeDescription = escapeHtml(project.description);
  const safeId = encodeURIComponent(project.id);

  const text =
    `🆕 <b>New Project Submitted</b>\n\n` +
    `👤 Name: ${safeName}\n` +
    `📧 Email: ${safeEmail}\n` +
    `🌐 Project: ${safeProjectName}\n` +
    `🔗 URL: ${safeUrl}\n` +
    `📝 Use case: ${safeHowUsing}\n\n` +
    `📄 Description: ${safeDescription}\n\n` +
    `Reply (Tap to copy):\n` +
    `✅ <code>/approve_${safeId}</code>\n` +
    `❌ <code>/reject_${safeId} your reason here</code>`;

  await sendTelegramMessage(ADMIN_CHAT_ID, text);
}

/**
 * Send the resubmit notification (project was rejected, user fixed and resubmitted).
 */
export async function notifyResubmit(project: {
  id: string;
  name: string;
  url: string;
  how_using: string;
}, user: {
  name?: string | null;
  email?: string | null;
}): Promise<void> {
  const safeName = escapeHtml(user.name ?? 'Unknown');
  const safeEmail = escapeHtml(user.email ?? 'Unknown');
  const safeProjectName = escapeHtml(project.name);
  const safeUrl = escapeHtml(project.url);
  const safeHowUsing = escapeHtml(project.how_using);
  const safeId = encodeURIComponent(project.id);

  const text =
    `🔄 <b>Project Resubmitted</b>\n\n` +
    `👤 Name: ${safeName}\n` +
    `📧 Email: ${safeEmail}\n` +
    `🌐 Project: ${safeProjectName}\n` +
    `🔗 URL: ${safeUrl}\n` +
    `📝 Use case: ${safeHowUsing}\n\n` +
    `Reply (Tap to copy):\n` +
    `✅ <code>/approve_${safeId}</code>\n` +
    `❌ <code>/reject_${safeId} your reason here</code>`;

  await sendTelegramMessage(ADMIN_CHAT_ID, text);
}
