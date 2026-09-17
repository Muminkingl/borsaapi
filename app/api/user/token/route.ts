import { NextResponse } from 'next/server';
import { supabase as adminSupabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminSupabase
    .from('api_tokens')
    .select('id, token_prefix, created_at, last_used_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No API token found for this user.' }, { status: 404 });
  }

  return NextResponse.json({
    prefix: data.token_prefix,
    created_at: data.created_at,
    last_used_at: data.last_used_at,
  });
}
