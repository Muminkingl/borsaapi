import { NextResponse } from 'next/server';
import { supabase as adminSupabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

export async function POST() {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = authUser.id;

  // Verify eligibility before regenerating
  const { data: user } = await adminSupabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const { data: project } = await adminSupabase
    .from('projects')
    .select('status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const canCreate =
    user?.plan === 'supporter' || project?.status === 'approved';

  if (!canCreate) {
    return NextResponse.json(
      { error: 'Not eligible to generate an API key.' },
      { status: 403 }
    );
  }

  // 1. Generate new token + hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenPrefix = rawToken.slice(0, 8);

  // 2. Check if a token record already exists
  const { data: existingToken } = await adminSupabase
    .from('api_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  let saveError;
  if (existingToken) {
    // Update existing row in-place to maintain foreign key consistency in usage_logs
    const { error } = await adminSupabase
      .from('api_tokens')
      .update({
        token: tokenPrefix,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
        created_at: new Date().toISOString(),
      })
      .eq('id', existingToken.id);
    saveError = error;
  } else {
    const { error } = await adminSupabase.from('api_tokens').insert({
      user_id: userId,
      token: tokenPrefix,
      token_hash: tokenHash,
      token_prefix: tokenPrefix,
    });
    saveError = error;
  }

  if (saveError) {
    console.error('Failed to regenerate token:', saveError);
    return NextResponse.json({ error: 'Failed to regenerate token.' }, { status: 500 });
  }

  // 3. Return plain token ONE TIME
  return NextResponse.json({
    token: rawToken,
    message: 'Token regenerated. Your old token is now invalid. Copy this now — it will never be shown again.',
  });
}
