import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// TODO: Replace with real session auth (Google OAuth) in Phase 2
async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get('x-user-id');
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate new token
  const newToken = crypto.randomBytes(32).toString('hex');

  // Delete old token(s) for this user
  await supabase.from('api_tokens').delete().eq('user_id', userId);

  // Insert new token
  const { data, error } = await supabase
    .from('api_tokens')
    .insert({ user_id: userId, token: newToken })
    .select('token, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to regenerate token.' }, { status: 500 });
  }

  return NextResponse.json({
    token: data.token,
    created_at: data.created_at,
    message: 'Token regenerated. Your old token is now invalid.',
  });
}
