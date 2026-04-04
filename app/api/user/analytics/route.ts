import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSessionUser(): Promise<{ id: string } | null> {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id };
}

export async function GET(req: NextRequest) {
  const authUser = await getSessionUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parallel queries to construct the analytics response
  const [
    userPlanReq,
    todayReq,
    monthReq,
    lastUsedReq,
    chartReq,
  ] = await Promise.all([
    // User Plan (to infer rate limit limit)
    supabase.from('users').select('plan').eq('id', authUser.id).single(),
    
    // Calls Today
    supabase.from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .gte('requested_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),

    // Calls This Month
    supabase.from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .gte('requested_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    // Last Used Time
    supabase.from('usage_logs')
      .select('requested_at')
      .eq('user_id', authUser.id)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single(),

    // Chart Data (Last 6 Months)
    // Supabase JS doesn't have a built-in GROUP BY, so we fetch logs from the last 6 months 
    // and group them in JS, or we execute a direct SQL via RPC. For simplicity and since usage_logs
    // can get large, this ideally is an RPC. However, since the user explicitly gave us SQL,
    // we can use a direct rpc call if we created one. If we didn't, we can fetch count of the last 6 months 
    // directly by doing 6 separate count queries for the last 6 months. It's safe and fast for exact counts!
    fetchMonthCounts(authUser.id)
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
  const chart = [];
  const now = new Date();
  
  // Create last 6 months intervals
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const { count } = await supabase.from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('requested_at', d.toISOString())
      .lt('requested_at', end.toISOString());
      
    chart.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      total: count || 0
    });
  }
  return chart;
}
