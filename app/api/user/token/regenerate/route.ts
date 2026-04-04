import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get('x-user-id');
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Generate new token + hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenPrefix = rawToken.slice(0, 8);

  // 2. Delete old token(s)
  await supabase.from('api_tokens').delete().eq('user_id', userId);

  // 3. Insert new hashed token
  const { error } = await supabase.from('api_tokens').insert({
    user_id: userId,
    token: tokenPrefix,
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to regenerate token.' }, { status: 500 });
  }

  // 4. Return plain token ONE TIME
  return NextResponse.json({
    token: rawToken,
    message: 'Token regenerated. Your old token is now invalid. Copy this now — it will never be shown again.',
  });
}
