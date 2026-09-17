import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { notifyNewProject, notifyResubmit } from '@/lib/telegram';

async function getSessionUser(): Promise<{ id: string; email?: string | null } | null> {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}

function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const parsed = new URL(stringUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET — return the user's project
export async function GET() {
  const authUser = await getSessionUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'You already have a project submission. Edit it instead.' }, { status: 409 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, url, description, how_using, logo_url } = body;

  if (!name || !url || !description || !how_using) {
    return NextResponse.json({ error: 'name, url, description, and how_using are required.' }, { status: 400 });
  }

  if (
    typeof name !== 'string' || name.length > 100 ||
    typeof description !== 'string' || description.length > 2000 ||
    typeof how_using !== 'string' || how_using.length > 2000
  ) {
    return NextResponse.json({ error: 'Input exceeds maximum allowed length.' }, { status: 400 });
  }

  const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  if (!isValidHttpUrl(normalizedUrl) || normalizedUrl.length > 500) {
    return NextResponse.json({ error: 'Invalid project URL.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: authUser.id,
      name: name.trim(),
      url: normalizedUrl,
      description: description.trim(),
      how_using: how_using.trim(),
      logo_url: typeof logo_url === 'string' && logo_url.length <= 500 ? logo_url : null,
      status: 'pending',
    })
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

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

  if (
    (name && (typeof name !== 'string' || name.length > 100)) ||
    (description && (typeof description !== 'string' || description.length > 2000)) ||
    (how_using && (typeof how_using !== 'string' || how_using.length > 2000))
  ) {
    return NextResponse.json({ error: 'Input exceeds maximum allowed length.' }, { status: 400 });
  }

  let normalizedUrl: string | undefined;
  if (url && typeof url === 'string') {
    const candidateUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    if (!isValidHttpUrl(candidateUrl) || candidateUrl.length > 500) {
      return NextResponse.json({ error: 'Invalid project URL.' }, { status: 400 });
    }
    normalizedUrl = candidateUrl;
  }

  const wasRejected = existing.status === 'rejected';

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...(name ? { name: name.trim() } : {}),
      ...(normalizedUrl ? { url: normalizedUrl } : {}),
      ...(description ? { description: description.trim() } : {}),
      ...(how_using ? { how_using: how_using.trim() } : {}),
      ...(logo_url !== undefined ? { logo_url: typeof logo_url === 'string' ? logo_url : null } : {}),
      status: 'pending', // resubmit resets to pending
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
    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', authUser.id)
      .single();
    await notifyResubmit(data, { name: userProfile?.name, email: authUser.email });
  }

  return NextResponse.json({ project: data, message: 'Project resubmitted for review.' });
}
