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

  // Get the user's token_id
  const { data: tokenRow } = await adminSupabase
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

  // Count today's and this month's requests in parallel
  const [todayRes, monthRes] = await Promise.all([
    adminSupabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('token_id', tokenRow.id)
      .gte('requested_at', today.toISOString()),
    adminSupabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('token_id', tokenRow.id)
      .gte('requested_at', monthStart.toISOString()),
  ]);

  return NextResponse.json({
    today: todayRes.count ?? 0,
    this_month: monthRes.count ?? 0,
  });
}
