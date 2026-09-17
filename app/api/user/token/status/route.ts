import { NextResponse } from 'next/server';
import { supabase as adminSupabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = authUser.id;

  // Get user plan + project status + existing token in one go
  const [userRes, projectRes, tokenRes] = await Promise.all([
    adminSupabase.from('users').select('plan').eq('id', userId).single(),
    adminSupabase
      .from('projects')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    adminSupabase
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
