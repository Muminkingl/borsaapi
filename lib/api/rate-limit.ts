import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AuthResult } from './auth';

const RATE_LIMITS: Record<string, number> = {
  free: 30,
  supporter: 120,
};

export async function checkRateLimit(
  auth: AuthResult,
  item_slug: string,
  city_slug: string
): Promise<{ allowed: true } | { error: NextResponse }> {
  const limit = RATE_LIMITS[auth.plan] ?? 30;

  // Count requests in the last 1 minute
  const since = new Date(Date.now() - 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('token_id', auth.token_id)
    .gte('requested_at', since);

  if (error) {
    // On rate limit check failure, allow through (fail open)
    console.error('Rate limit check error:', error);
  } else if ((count ?? 0) >= limit) {
    return {
      error: NextResponse.json(
        {
          error: 'Rate limit exceeded.',
          limit,
          plan: auth.plan,
          upgrade: 'https://borsaapi.vercel.app/#pricing',
        },
        { status: 429, headers: { 'X-RateLimit-Limit': String(limit) } }
      ),
    };
  }

  // Log this request (fire-and-forget)
  supabase
    .from('usage_logs')
    .insert({ token_id: auth.token_id, item_slug, city_slug })
    .then(() => {});

  // Update last_used_at on the token
  supabase
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', auth.token_id)
    .then(() => {});

  return { allowed: true };
}
