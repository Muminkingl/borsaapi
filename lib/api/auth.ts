import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

  const rawToken = authHeader.split(' ')[1];

  // Hash the token since DB stores hashed tokens (Assuming we used SHA-256 for token_hash)
  const crypto = require('crypto');
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

  // Ensure the user actually has an approved project (Business logic constraint)
  const { data: project } = await supabase
    .from('projects')
    .select('status')
    .eq('user_id', tokenRecord.user_id)
    .single();

  if (project?.status !== 'approved') {
     return {
       error: NextResponse.json({ error: 'Project not approved. Visit dashboard/projects' }, { status: 403 }),
     };
  }

  return {
    auth: {
      tokenId: tokenRecord.id,
      userId: tokenRecord.user_id,
      plan: (tokenRecord.users as any)?.plan || 'free',
    },
  };
}
