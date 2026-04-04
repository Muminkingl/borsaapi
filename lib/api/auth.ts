import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface AuthResult {
  user_id: string;
  token_id: string;
  plan: 'free' | 'supporter';
}

export async function validateBearerToken(
  req: NextRequest
): Promise<{ auth: AuthResult } | { error: NextResponse }> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Bearer YOUR_TOKEN' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7).trim();

  // Look up token in api_tokens, join to users for plan
  const { data, error } = await supabase
    .from('api_tokens')
    .select('id, user_id, users(plan)')
    .eq('token', token)
    .single();

  if (error || !data) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API token.' },
        { status: 401 }
      ),
    };
  }

  const plan = (data.users as { plan: string } | null)?.plan ?? 'free';

  return {
    auth: {
      user_id: data.user_id,
      token_id: data.id,
      plan: plan as 'free' | 'supporter',
    },
  };
}
