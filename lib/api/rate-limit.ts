import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './auth';

export async function checkRateLimit(
  auth: AuthContext,
  itemSlug: string,
  citySlug: string
): Promise<{ ok: true } | { error: NextResponse }> {
  // Free = 30 req/min, Supporter = 120 req/min
  const limit = auth.plan === 'supporter' ? 120 : 30;

  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

  // Check usage in last minute
  const { count, error } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('token_id', auth.tokenId)
    .gte('requested_at', oneMinuteAgo);

  if (error) {
    console.error('Rate limit DB error:', error);
    // Fail open rather than blocking users if DB struggles briefly
    return { ok: true };
  }

  const currentUsage = count || 0;

  if (currentUsage >= limit) {
    return {
      error: NextResponse.json(
        { 
          error: 'Rate limit exceeded.',
          limit_per_minute: limit,
          current_usage: currentUsage,
          upgrade_url: 'https://borsapi.vercel.app/#pricing'
        },
        { status: 429 }
      ),
    };
  }

  return { ok: true };
}
