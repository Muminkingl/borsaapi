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
  const item = searchParams.get('item')?.toLowerCase();
  const location = searchParams.get('location')?.toLowerCase();

  if (!item || !location) {
    return NextResponse.json(
      { error: 'Missing required params: item and location' },
      { status: 400 }
    );
  }

  // 3. Check rate limit & log
  const rateResult = await checkRateLimit(auth, item, location);
  if ('error' in rateResult) return rateResult.error;

  // 4. Resolve item_id
  const { data: itemRow } = await supabase
    .from('items')
    .select('id')
    .eq('slug', item)
    .single();

  if (!itemRow) {
    return NextResponse.json(
      { error: `Unknown item: "${item}". Use /api/v2/items to see valid values.` },
      { status: 400 }
    );
  }

  // 5. Resolve city_id
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

  // 6. Get latest price for this item+city (uses our index)
  const { data: priceRow, error } = await supabase
    .from('prices')
    .select('value, created_at')
    .eq('item_id', itemRow.id)
    .eq('city_id', cityRow.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !priceRow) {
    return NextResponse.json(
      { error: `No price data available for ${item} in ${location}.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    value: priceRow.value,
    item,
    location,
    created_at: priceRow.created_at,
    is_stale: isStale(priceRow.created_at),
  });
}
