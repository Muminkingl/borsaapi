import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './auth';

export interface RateLimitCheck {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  headers: Record<string, string>;
  error?: NextResponse;
}

export async function checkRateLimit(
  auth: AuthContext
): Promise<RateLimitCheck> {
  // Free = 30 req/min, Supporter = 120 req/min
  const limit = auth.plan === 'supporter' ? 120 : 30;
  const now = Date.now();
  const reset = Math.ceil((now + 60000) / 1000);
  const oneMinuteAgo = new Date(now - 60000).toISOString();

  // Check usage in last minute
  const { count, error } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('token_id', auth.tokenId)
    .gte('requested_at', oneMinuteAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    // Graceful fallback with headers
    return {
      allowed: true,
      limit,
      remaining: 1,
      reset,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '1',
        'X-RateLimit-Reset': String(reset),
      },
    };
  }

  const currentUsage = count || 0;
  const remaining = Math.max(0, limit - currentUsage);

  const baseHeaders: Record<string, string> = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining - 1)),
    'X-RateLimit-Reset': String(reset),
  };

  if (currentUsage >= limit) {
    const retryAfter = '60';
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset,
      headers: {
        ...baseHeaders,
        'Retry-After': retryAfter,
      },
      error: NextResponse.json(
        {
          error: 'Rate limit exceeded. Too many requests in 1 minute.',
          limit_per_minute: limit,
          current_usage: currentUsage,
          upgrade_url: 'https://borsapi.vercel.app/#pricing',
        },
        {
          status: 429,
          headers: {
            ...baseHeaders,
            'Retry-After': retryAfter,
          },
        }
      ),
    };
  }

  return {
    allowed: true,
    limit,
    remaining,
    reset,
    headers: baseHeaders,
  };
}

/**
 * Attaches rate limit headers to a successful response
 */
export function applyRateLimitHeaders(res: NextResponse, check: RateLimitCheck): NextResponse {
  for (const [key, value] of Object.entries(check.headers)) {
    res.headers.set(key, value);
  }
  return res;
}
