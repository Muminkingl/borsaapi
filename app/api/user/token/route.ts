import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// TODO: Replace with real session auth (Google OAuth) in Phase 2
// For now, accepts X-User-Id header for development testing
async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get('x-user-id');
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('api_tokens')
    .select('id, token, created_at, last_used_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No API token found for this user.' }, { status: 404 });
  }

  return NextResponse.json({
    token: data.token,
    created_at: data.created_at,
    last_used_at: data.last_used_at,
  });
}
