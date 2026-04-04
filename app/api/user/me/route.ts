/**
 * GET /api/user/me
 * Returns the current authenticated user's basic info including their plan.
 * Used by the landing page PricingSection to detect current plan.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabase as adminSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch plan from users table
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, plan, created_at')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      // User authenticated but not yet in our DB — return defaults
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? null,
        plan: 'free',
      });
    }

    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      plan: userData.plan ?? 'free',
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/user/me]', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
