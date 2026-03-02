import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Some features will be disabled.');
}

/**
 * Supabase client for browser-side operations.
 *
 * IMPORTANT: We do NOT use a custom fetch wrapper here.
 * Wrapping Supabase's fetch with AbortController-based timeouts is a known
 * bug pattern — it kills GoTrueClient's internal token-refresh calls, which
 * causes ALL subsequent requests to silently fail with expired JWTs.
 *
 * Reliability strategy lives in the service layer (session-aware retries)
 * rather than here at the transport level.
 */
export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: 'davinci-auth',
        },
    }
);

export const getSupabaseClient = () => supabase;

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Ensures the current session is valid before running a critical operation.
 * If the access token is expired or nearly expired, forces a refresh first.
 * This is the correct industry-standard pattern vs. intercepting fetch.
 */
export async function ensureValidSession(): Promise<boolean> {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return false;

        // If token expires in less than 60 seconds, proactively refresh it
        const expiresAt = session.expires_at ?? 0;
        const nowSec = Math.floor(Date.now() / 1000);
        if (expiresAt - nowSec < 60) {
            console.log('[Auth] Token near expiry, refreshing proactively...');
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
                console.error('[Auth] Proactive refresh failed:', refreshError.message);
                return false;
            }
            console.log('[Auth] Session refreshed successfully.');
        }
        return true;
    } catch (err) {
        console.error('[Auth] ensureValidSession error:', err);
        return false;
    }
}
