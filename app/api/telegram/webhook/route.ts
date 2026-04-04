import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTelegramMessage } from '@/lib/telegram';

const ADMIN_CHAT_ID = Number(process.env.TELEGRAM_CHAT_ID!);

// ─── Types ────────────────────────────────────────────────────────────────────

interface TelegramMessage {
  message_id: number;
  from: { id: number; username?: string };
  chat: { id: number };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reply(chatId: number, text: string): Promise<void> {
  return sendTelegramMessage(chatId, text);
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

async function handleApprove(projectId: string, chatId: number) {
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('name, url, user_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) {
    await reply(chatId, `❌ Project <code>${projectId}</code> not found.`);
    return;
  }

  const { error } = await supabase
    .from('projects')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: process.env.ADMIN_EMAIL ?? 'muminrtx@gmail.com',
      rejection_reason: null,
    })
    .eq('id', projectId);

  if (error) {
    await reply(chatId, `❌ Failed to approve — DB error: ${error.message}`);
    return;
  }

  await reply(
    chatId,
    `✅ <b>Approved!</b>\n\n🌐 ${project.name}\n🔗 ${project.url}\n\nUser can now create an API key.`
  );
}

async function handleReject(projectId: string, reason: string, chatId: number) {
  if (!reason.trim()) {
    await reply(chatId, `❌ Rejection reason is empty.\n\nUsage: /reject_${projectId} your reason here`);
    return;
  }

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('name, url')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) {
    await reply(chatId, `❌ Project <code>${projectId}</code> not found.`);
    return;
  }

  const { error } = await supabase
    .from('projects')
    .update({
      status: 'rejected',
      rejection_reason: reason.trim(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: process.env.ADMIN_EMAIL ?? 'muminrtx@gmail.com',
    })
    .eq('id', projectId);

  if (error) {
    await reply(chatId, `❌ Failed to reject — DB error: ${error.message}`);
    return;
  }

  await reply(
    chatId,
    `❌ <b>Rejected!</b>\n\n🌐 ${project.name}\n🔗 ${project.url}\n\n📝 Reason sent to user:\n<i>${reason.trim()}</i>`
  );
}

async function handleStats(chatId: number) {
  // Parallel queries for speed
  const [
    { count: totalUsers },
    { count: supporterUsers },
    { count: pendingProjects },
    { count: approvedProjects },
    { count: rejectedProjects },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'supporter'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ]);

  const freeUsers = (totalUsers ?? 0) - (supporterUsers ?? 0);

  const text =
    `📊 <b>BorsaAPI Stats</b>\n\n` +
    `👥 Total Users: <b>${totalUsers ?? 0}</b>\n` +
    `⭐ Supporter: <b>${supporterUsers ?? 0}</b>\n` +
    `🆓 Free: <b>${freeUsers}</b>\n\n` +
    `📁 Projects\n` +
    `⏳ Pending: <b>${pendingProjects ?? 0}</b>\n` +
    `✅ Approved: <b>${approvedProjects ?? 0}</b>\n` +
    `❌ Rejected: <b>${rejectedProjects ?? 0}</b>`;

  await reply(chatId, text);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let update: TelegramUpdate;

  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = update.message;

  // Always return 200 to Telegram so it doesn't retry
  if (!message?.text) return NextResponse.json({ ok: true });

  const fromId = message.from.id;
  const chatId = message.chat.id;
  const text = message.text.trim();

  // 🔒 SECURITY: Only accept commands from your chat_id
  if (fromId !== ADMIN_CHAT_ID) {
    // Silently ignore — don't reveal the bot is here
    return NextResponse.json({ ok: true });
  }

  // ─── /approve_PROJECT_ID ─────────────────────────────────────────────────
  const approveMatch = text.match(/^\/approve_([a-zA-Z0-9\-_]+)/);
  if (approveMatch) {
    await handleApprove(approveMatch[1], chatId);
    return NextResponse.json({ ok: true });
  }

  // ─── /reject_PROJECT_ID reason text ──────────────────────────────────────
  const rejectMatch = text.match(/^\/reject_([a-zA-Z0-9\-_]+)\s*([\s\S]*)/);
  if (rejectMatch) {
    await handleReject(rejectMatch[1], rejectMatch[2] ?? '', chatId);
    return NextResponse.json({ ok: true });
  }

  // ─── /stats ───────────────────────────────────────────────────────────────
  if (text === '/stats') {
    await handleStats(chatId);
    return NextResponse.json({ ok: true });
  }

  // ─── /help ────────────────────────────────────────────────────────────────
  if (text === '/help' || text === '/start') {
    await reply(
      chatId,
      `🤖 <b>BorsaAPI Admin Bot</b>\n\n` +
      `Available commands:\n` +
      `✅ /approve_PROJECT_ID\n` +
      `❌ /reject_PROJECT_ID reason\n` +
      `📊 /stats`
    );
    return NextResponse.json({ ok: true });
  }

  // Unknown command — gentle reminder
  await reply(chatId, `🤔 Unknown command. Send /help to see available commands.`);
  return NextResponse.json({ ok: true });
}
