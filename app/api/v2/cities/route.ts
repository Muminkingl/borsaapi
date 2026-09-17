import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('cities')
    .select('slug, name_en, name_ku')
    .order('id');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch cities.' }, { status: 500 });
  }

  return NextResponse.json(
    { cities: data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
