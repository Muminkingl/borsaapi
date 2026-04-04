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

  // 1. Check if token already exists
  const { data: existingToken } = await supabase
    .from('api_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingToken) {
    return NextResponse.json(
      { error: 'You already have an API token. Regenerate it instead.' },
      { status: 409 }
    );
  }

  // 2. Check eligibility
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const { data: project } = await supabase
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
      {
        error: 'Not eligible to create an API key.',
        reason: !project
          ? 'no_project'
          : project.status === 'pending'
          ? 'project_pending'
          : 'not_approved',
      },
      { status: 403 }
    );
  }

  // 3. Generate token and hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenPrefix = rawToken.slice(0, 8);

  // 4. Insert only the hash (never store raw token)
  const { error } = await supabase.from('api_tokens').insert({
    user_id: userId,
    token: tokenPrefix, // legacy column — store prefix only
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to create token.' }, { status: 500 });
  }

  // 5. Return plain token ONCE — never again
  return NextResponse.json(
    {
      token: rawToken,
      message: 'Copy this token now. It will never be shown again.',
    },
    { status: 201 }
  );
}
