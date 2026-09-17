/**
 * Wayl Payment Webhook
 * POST /api/wayl/webhook
 *
 * Receives payment status updates from Wayl and:
 * - Verifies HMAC signature
 * - Prevents replay attacks (5 min window)
 * - Atomic idempotency (prevents race conditions on concurrent webhooks)
 * - On Complete: upgrades user plan to 'supporter'
 * - On Failed/Cancelled: marks transaction as failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/verify-webhook-signature';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.WAYL_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[WAYL WEBHOOK] WAYL_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const signature = req.headers.get('x-wayl-signature') || '';

    // Verify HMAC signature
    const isValid = verifyWebhookSignature(body, signature, secret);

    if (!isValid) {
      console.error('[WAYL WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Replay attack protection (reject webhooks older than 5 mins if timestamp provided)
    const webhookTimestamp = payload.timestamp || payload.createdAt;
    if (webhookTimestamp) {
      const ageMs = Date.now() - new Date(webhookTimestamp).getTime();
      if (ageMs > 5 * 60 * 1000) {
        console.error('[WAYL WEBHOOK] Expired webhook, possible replay attack');
        return NextResponse.json({ error: 'Webhook expired' }, { status: 400 });
      }
    }

    const { referenceId, status, amount: webhookAmount } = payload;

    if (!referenceId) {
      console.error('[WAYL WEBHOOK] Missing referenceId');
      return NextResponse.json({ error: 'Missing referenceId' }, { status: 400 });
    }

    // Load the transaction
    const { data: transaction, error: txError } = await supabase
      .from('billing_transactions')
      .select('*')
      .eq('wayl_reference_id', referenceId)
      .single();

    if (txError || !transaction) {
      console.error('[WAYL WEBHOOK] Transaction not found:', referenceId);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Idempotency check — skip if already processed
    if (transaction.webhook_received_at) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // Amount verification (allow ±1 IQD rounding tolerance)
    if (webhookAmount !== undefined) {
      const diff = Math.abs(webhookAmount - transaction.amount);
      if (diff > 1) {
        console.error('[WAYL WEBHOOK] Amount mismatch!', {
          expected: transaction.amount,
          received: webhookAmount,
        });
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    // ── Handle payment completion ────────────────────────────────────
    if (status === 'Complete') {
      // Atomic conditional update to prevent concurrent duplicate processing
      const { data: updatedTx, error: lockError } = await supabase
        .from('billing_transactions')
        .update({
          status: 'completed',
          webhook_received_at: now,
          updated_at: now,
        })
        .eq('id', transaction.id)
        .is('webhook_received_at', null)
        .select('id')
        .maybeSingle();

      if (lockError) {
        console.error('[WAYL WEBHOOK] Error locking transaction:', lockError);
        throw lockError;
      }

      if (!updatedTx) {
        // Another concurrent request already claimed this update
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      // Upgrade user plan in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ plan: transaction.plan }) // e.g. 'supporter'
        .eq('id', transaction.user_id);

      if (updateError) {
        console.error('[WAYL WEBHOOK] Failed to upgrade user plan:', updateError);
        throw updateError;
      }

      console.log('[WAYL WEBHOOK] Payment completed. User upgraded:', {
        userId: transaction.user_id,
        plan: transaction.plan,
        referenceId,
      });

      return NextResponse.json({ status: 'success' });

    // ── Handle failure / cancellation ───────────────────────────────
    } else if (status === 'Failed' || status === 'Cancelled') {
      await supabase
        .from('billing_transactions')
        .update({
          status: 'failed',
          webhook_received_at: now,
          updated_at: now,
        })
        .eq('id', transaction.id);

      console.log('[WAYL WEBHOOK] Payment failed/cancelled for ref:', referenceId);

      return NextResponse.json({ status: 'failed' });

    } else {
      console.warn('[WAYL WEBHOOK] Unknown status received:', status);
      return NextResponse.json({ status: 'unknown' }, { status: 200 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WAYL WEBHOOK ERROR]', message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
