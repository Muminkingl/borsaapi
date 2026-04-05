const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Send a plain text message to a specific chat.
 * Fire-and-forget safe (errors are swallowed).
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
  const text =
    `🆕 <b>New Project Submitted</b>\n\n` +
    `👤 Name: ${user.name ?? 'Unknown'}\n` +
    `📧 Email: ${user.email ?? 'Unknown'}\n` +
    `🌐 Project: ${project.name}\n` +
    `🔗 URL: ${project.url}\n` +
    `📝 Use case: ${project.how_using}\n\n` +
    `📄 Description: ${project.description}\n\n` +
    `Reply:\n` +
    `✅ /approve_${project.id}\n` +
    `❌ /reject_${project.id} your reason here`;

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
  const text =
    `🔄 <b>Project Resubmitted</b>\n\n` +
    `👤 Name: ${user.name ?? 'Unknown'}\n` +
    `📧 Email: ${user.email ?? 'Unknown'}\n` +
    `🌐 Project: ${project.name}\n` +
    `🔗 URL: ${project.url}\n` +
    `📝 Use case: ${project.how_using}\n\n` +
    `Reply:\n` +
    `✅ /approve_${project.id}\n` +
    `❌ /reject_${project.id} your reason here`;

  await sendTelegramMessage(ADMIN_CHAT_ID, text);
}
