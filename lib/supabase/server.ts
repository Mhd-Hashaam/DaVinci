import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Server-side Supabase client using the service role key.
 * 
 * IMPORTANT: This bypasses RLS entirely. Only use in:
 * - Server Components
 * - API Routes
 * - Server Actions
 * 
 * NEVER import this file in client components.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Server] Missing Supabase server environment variables.');
}

export const supabaseAdmin = createClient<Database>(
    supabaseUrl || '',
    supabaseServiceKey || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
