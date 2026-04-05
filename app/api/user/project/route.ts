import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notifyNewProject, notifyResubmit } from '@/lib/telegram';

async function getSessionUser(): Promise<{ id: string; email?: string | null } | null> {
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
  return { id: data.user.id, email: data.user.email };
}

// GET — return the user's project
export async function GET(req: NextRequest) {
  const authUser = await getSessionUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return NextResponse.json({ project: null });
  return NextResponse.json({ project: data });
}

// POST — create project
export async function POST(req: NextRequest) {
  const authUser = await getSessionUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // One project per user
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', authUser.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'You already have a project submission. Edit it instead.' }, { status: 409 });
  }

  const body = await req.json();
  const { name, url, description, how_using, logo_url } = body;

  if (!name || !url || !description || !how_using) {
    return NextResponse.json({ error: 'name, url, description, and how_using are required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: authUser.id, name, url, description, how_using, logo_url, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });

  // Fetch user profile for notification (name field)
  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', authUser.id)
    .single();

  // Fire and wait for Telegram notification
  await notifyNewProject(data, { name: userProfile?.name, email: authUser.email });

  return NextResponse.json({ project: data, message: 'Project submitted for review!' }, { status: 201 });
}

// PUT — edit project (pending or rejected only)
export async function PUT(req: NextRequest) {
  const authUser = await getSessionUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, url, description, how_using, logo_url } = body;

  const { data: existing } = await supabase
    .from('projects')
    .select('id, status')
    .eq('user_id', authUser.id)
    .single();

  if (!existing) return NextResponse.json({ error: 'No project found.' }, { status: 404 });

  if (existing.status === 'approved') {
    return NextResponse.json({ error: 'Approved projects cannot be edited.' }, { status: 403 });
  }

  const wasRejected = existing.status === 'rejected';

  const { data, error } = await supabase
    .from('projects')
    .update({
      name,
      url,
      description,
      how_using,
      logo_url,
      status: 'pending',          // resubmit resets to pending
      rejection_reason: null,
      reviewed_at: null,
      reviewed_by: null,
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });

  // Fire Telegram notification (resubmit or plain edit)
  if (wasRejected) {
    // Fetch user profile for the notification
    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', authUser.id)
      .single();
    await notifyResubmit(data, { name: userProfile?.name, email: authUser.email });
  }

  return NextResponse.json({ project: data, message: 'Project resubmitted for review.' });
}
