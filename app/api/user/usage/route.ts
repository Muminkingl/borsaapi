import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// TODO: Replace with real session auth (Google OAuth) in Phase 2
async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get('x-user-id');
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the user's token_id
  const { data: tokenRow } = await supabase
    .from('api_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!tokenRow) {
    return NextResponse.json({ error: 'No token found for user.' }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Count today's requests
  const { count: todayCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('token_id', tokenRow.id)
    .gte('requested_at', today.toISOString());

  // Count this month's requests
  const { count: monthCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('token_id', tokenRow.id)
    .gte('requested_at', monthStart.toISOString());

  return NextResponse.json({
    today: todayCount ?? 0,
    this_month: monthCount ?? 0,
  });
}
