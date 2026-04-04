import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateBearerToken } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { isStale } from '@/lib/api/stale';

export async function GET(req: NextRequest) {
  // 1. Validate Bearer token
  const authResult = await validateBearerToken(req);
  if ('error' in authResult) return authResult.error;
  const { auth } = authResult;

  // 2. Parse query params
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')?.toLowerCase();

  if (!location) {
    return NextResponse.json(
      { error: 'Missing required param: location' },
      { status: 400 }
    );
  }

  // 3. Check rate limit & log
  const rateResult = await checkRateLimit(auth, 'all', location);
  if ('error' in rateResult) return rateResult.error;

  // 4. Resolve city_id
  const { data: cityRow } = await supabase
    .from('cities')
    .select('id')
    .eq('slug', location)
    .single();

  if (!cityRow) {
    return NextResponse.json(
      { error: `Unknown location: "${location}". Use /api/v2/cities to see valid values.` },
      { status: 400 }
    );
  }

  // 5. Get all items
  const { data: items } = await supabase
    .from('items')
    .select('id, slug');

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items found.' }, { status: 500 });
  }

  // 6. For each item, get the latest price in this city
  const pricePromises = items.map(async (item) => {
    const { data } = await supabase
      .from('prices')
      .select('value, created_at')
      .eq('item_id', item.id)
      .eq('city_id', cityRow.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      slug: item.slug,
      data: data
        ? { value: data.value, is_stale: isStale(data.created_at), created_at: data.created_at }
        : null,
    };
  });

  const results = await Promise.all(pricePromises);

  // 7. Build response map
  const prices: Record<string, { value: number; is_stale: boolean; created_at: string } | null> = {};
  let latestUpdate: string | null = null;

  for (const r of results) {
    prices[r.slug] = r.data;
    if (r.data && (!latestUpdate || r.data.created_at > latestUpdate)) {
      latestUpdate = r.data.created_at;
    }
  }

  return NextResponse.json({
    location,
    updated_at: latestUpdate,
    prices,
  });
}
