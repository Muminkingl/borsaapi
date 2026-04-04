import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.ANON_SEC!;

// Server-side client using service role key — bypasses RLS
// Only used in API route handlers, never exposed to client
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
