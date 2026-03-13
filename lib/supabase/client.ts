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

import { useAuthStore } from '../store/authStore';

/**
 * Ensures the current session is valid before running a critical operation.
 * 
 * IMPORTANT: We stopped calling supabase.auth.refreshSession() manually. 
 * Doing so in an inactive tab that just woke up causes a race condition with 
 * Supabase's internal auto-refresh timer, leading to "Refresh Token Reuse Detection" 
 * and session revocation.
 * 
 * Instead, we rely on getUser() to safely and internally queue a refresh if needed.
 */
export async function ensureValidSession(): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        // If no session at all, just return false
        if (!session) return false;

        const expiresAt = session.expires_at ?? 0;
        const nowSec = Math.floor(Date.now() / 1000);

        // If expired or near expiry (within 60s), use getUser() to trigger a safe internal refresh
        if (expiresAt - nowSec < 60) {
            console.log('[Auth] Session near expiry or expired, validating with getUser()...');
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.error('[Auth] Terminal session failure:', error?.message);
                useAuthStore.getState().setSessionExpired(true);
                return false;
            }

            console.log('[Auth] Session successfully recovered/refreshed via getUser().');
        }

        return true;
    } catch (err) {
        console.error('[Auth] ensureValidSession unexpected error:', err);
        return false;
    }
}
