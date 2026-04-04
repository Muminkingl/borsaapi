import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('items')
    .select('slug, name_en, name_ku')
    .order('id');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch items.' }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}
