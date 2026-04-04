import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get('x-user-id');
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user plan + project status + existing token in one go
  const [userRes, projectRes, tokenRes] = await Promise.all([
    supabase.from('users').select('plan').eq('id', userId).single(),
    supabase
      .from('projects')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('api_tokens')
      .select('id, token_prefix, created_at, last_used_at')
      .eq('user_id', userId)
      .single(),
  ]);

  const plan = userRes.data?.plan ?? 'free';
  const projectStatus = projectRes.data?.status ?? null;
  const token = tokenRes.data ?? null;

  const canCreate =
    plan === 'supporter' || projectStatus === 'approved';

  return NextResponse.json({
    plan,
    project_status: projectStatus,
    can_create: canCreate,
    has_token: !!token,
    token: token
      ? {
          prefix: token.token_prefix,
          created_at: token.created_at,
          last_used_at: token.last_used_at,
        }
      : null,
  });
}
