import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const client = await createClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // Parallel queries to construct the analytics response
  const [
    userPlanReq,
    todayReq,
    monthReq,
    lastUsedReq,
    chartReq,
  ] = await Promise.all([
    // User Plan (to infer rate limit limit)
    supabase.from('users').select('plan').eq('id', userId).single(),

    // Calls Today
    supabase.from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('requested_at', todayStart),

    // Calls This Month
    supabase.from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('requested_at', monthStart),

    // Last Used Time
    supabase.from('usage_logs')
      .select('requested_at')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Chart Data (Last 6 Months parallelized)
    fetchMonthCounts(userId),
  ]);

  const plan = userPlanReq.data?.plan || 'free';

  return NextResponse.json({
    calls_today: todayReq.count || 0,
    calls_this_month: monthReq.count || 0,
    last_used: lastUsedReq.data?.requested_at || null,
    rate_limit: plan === 'supporter' ? 120 : 30,
    chart: chartReq,
  });
}

async function fetchMonthCounts(userId: string) {
  const now = new Date();
  const intervals = [5, 4, 3, 2, 1, 0].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    return {
      monthStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      start: d.toISOString(),
      end: end.toISOString(),
    };
  });

  const countPromises = intervals.map(async ({ monthStr, start, end }) => {
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('requested_at', start)
      .lt('requested_at', end);

    return {
      month: monthStr,
      total: count || 0,
    };
  });

  return Promise.all(countPromises);
}
