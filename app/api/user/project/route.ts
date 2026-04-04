import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// TODO: Replace with real session auth (Google OAuth) in Phase 2
async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get('x-user-id');
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, url, description, logo_url } = body;

  if (!name) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name, url, description, logo_url, status: 'pending' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });
  }

  return NextResponse.json({ project: data, message: 'Project submitted for review.' }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, url, description, logo_url } = body;

  if (!id) {
    return NextResponse.json({ error: 'Project id is required.' }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Project not found or access denied.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ name, url, description, logo_url, status: 'pending' }) // reset to pending on edit
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
  }

  return NextResponse.json({ project: data, message: 'Project updated and re-submitted for review.' });
}
