/**
 * Create Wayl Payment Link
 * POST /api/wayl/createlink
 *
 * Security features:
 * - Auth required (session-based via Supabase)
 * - Duplicate payment prevention (15 min window)
 * - IQD currency only
 * - Only 'supporter' plan supported
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createPaymentLink } from '@/lib/wayl-client';
import { generateReferenceId } from '@/lib/generate-reference-id';

// BorsaAPI only has one paid plan
const VALID_PLANS = ['supporter'] as const;
const VALID_CYCLES = ['monthly'] as const;

// Plan prices in IQD (must match billing_plans table)
const PLAN_PRICES_IQD: Record<string, number> = {
  supporter: 5000,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan = 'supporter', billingCycle = 'monthly' } = body;

    // Validate plan
    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Only "supporter" is available.' }, { status: 400 });
    }

    // Validate billing cycle
    if (!VALID_CYCLES.includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle. Only "monthly" is supported.' }, { status: 400 });
    }

    // Check for duplicate pending payment in last 15 minutes
    const { data: recentPending } = await supabase
      .from('billing_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .eq('plan', plan)
      .eq('billing_cycle', billingCycle)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .maybeSingle();

    // Reuse existing pending payment if it has a valid URL
    if (recentPending?.wayl_payment_url) {
      return NextResponse.json({
        success: true,
        paymentUrl: recentPending.wayl_payment_url,
        referenceId: recentPending.wayl_reference_id,
        isExisting: true,
      });
    }

    // Delete stale pending with no payment URL (from a failed Wayl call)
    if (recentPending && !recentPending.wayl_payment_url) {
      await supabase
        .from('billing_transactions')
        .delete()
        .eq('id', recentPending.id);
    }

    // Get plan price
    const amountInIQD = PLAN_PRICES_IQD[plan];
    if (!amountInIQD || amountInIQD <= 0) {
      return NextResponse.json({ error: 'Invalid plan price' }, { status: 400 });
    }

    // Fetch billing_plan record for the foreign key
    const { data: billingPlan } = await supabase
      .from('billing_plans')
      .select('id')
      .eq('tier', plan)
      .single();

    // Generate unique reference ID
    const referenceId = generateReferenceId(user.id, plan);

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('billing_transactions')
      .insert({
        user_id: user.id,
        plan,
        billing_cycle: billingCycle,
        amount: amountInIQD,
        currency: 'IQD',
        status: 'pending',
        billing_plan_id: billingPlan?.id ?? null,
        wayl_reference_id: referenceId,
      })
      .select()
      .single();

    if (txError) {
      console.error('[WAYL] Failed to create transaction:', txError);
      throw txError;
    }

    // Build URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://borsapi.vercel.app';
    const webhookUrl = `${appUrl}/api/wayl/webhook`;
    const redirectUrl = `${appUrl}/dashboard?payment=processing&ref=${referenceId}`;

    // Call Wayl to create the payment link
    const waylResponse = await createPaymentLink({
      referenceId,
      total: amountInIQD,
      currency: 'IQD',
      webhookUrl,
      webhookSecret: process.env.WAYL_WEBHOOK_SECRET!,
      redirectionUrl: redirectUrl,
      planName: 'Supporter Plan (Monthly)',
    });

    // Update transaction with Wayl order details
    await supabase
      .from('billing_transactions')
      .update({
        wayl_order_id: waylResponse.orderId,
        wayl_payment_url: waylResponse.paymentUrl,
      })
      .eq('id', transaction.id);

    console.log('[WAYL] Payment link created:', {
      userId: user.id,
      referenceId,
      plan,
      amount: amountInIQD,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: waylResponse.paymentUrl,
      referenceId,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WAYL ERROR] createlink:', message);
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
  }
}
