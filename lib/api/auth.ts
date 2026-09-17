import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export interface AuthContext {
  tokenId: string;
  userId: string;
  plan: string;
}

export async function validateBearerToken(
  req: NextRequest
): Promise<{ auth: AuthContext } | { error: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Expected: Bearer <token>' },
        { status: 401 }
      ),
    };
  }

  const rawToken = authHeader.substring(7).trim();
  if (!rawToken || rawToken.length < 16) {
    return {
      error: NextResponse.json({ error: 'Invalid API key format.' }, { status: 401 }),
    };
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const { data: tokenRecord, error } = await supabase
    .from('api_tokens')
    .select('id, user_id, users ( plan )')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !tokenRecord) {
    return {
      error: NextResponse.json({ error: 'Invalid API key.' }, { status: 401 }),
    };
  }

  const userPlan = ((tokenRecord.users as unknown) as { plan?: string } | null)?.plan || 'free';
  const isSupporter = userPlan === 'supporter';

  // If not a paying supporter, ensure the user has an approved project
  if (!isSupporter) {
    const { data: project } = await supabase
      .from('projects')
      .select('status')
      .eq('user_id', tokenRecord.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (project?.status !== 'approved') {
      return {
        error: NextResponse.json(
          { error: 'Project not approved. Visit dashboard/projects' },
          { status: 403 }
        ),
      };
    }
  }

  return {
    auth: {
      tokenId: tokenRecord.id,
      userId: tokenRecord.user_id,
      plan: userPlan,
    },
  };
}
