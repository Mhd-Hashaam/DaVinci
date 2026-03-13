import { supabase } from './client';

/**
 * Proactive Token Heartbeat (Defense in Depth)
 * 
 * This module manages three triggers to ensure the session never expires silently:
 * 1. Granular Heartbeat: Checks every 5 minutes.
 * 2. Visibility Wakeup: Triggers when the tab becomes focused/visible.
 * 3. BFCache Recovery: Triggers when navigating "back" to the app snapshot.
 * 
 * It uses supabase.auth.getUser() as a safe proxy to trigger a refresh
 * without causing "Refresh Token Reuse" race conditions.
 */

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const REFRESH_THRESHOLD = 15 * 60; // 15 minutes before expiry

/**
 * Checks if the session needs a refresh and triggers it safely if so.
 */
export async function checkAndRefreshSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const expiresAt = session.expires_at ?? 0;
        const nowSec = Math.floor(Date.now() / 1000);
        const secondsUntilExpiry = expiresAt - nowSec;

        console.log(`[TokenHeartbeat] Interval check. Seconds until expiry: ${secondsUntilExpiry}`);

        // If we are within the threshold (e.g. 15 mins), trigger a safe refresh via getUser()
        if (secondsUntilExpiry < REFRESH_THRESHOLD) {
            console.log('[TokenHeartbeat] Session near expiry, triggering proactive refresh via getUser()...');
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.warn('[TokenHeartbeat] Proactive refresh failed or session invalid:', error?.message);
            } else {
                console.log('[TokenHeartbeat] Session successfully refreshed/validated.');
            }
        }
    } catch (err) {
        console.error('[TokenHeartbeat] Unexpected error during heartbeat check:', err);
    }
}

/**
 * Visibility change handler
 */
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        console.log('[TokenHeartbeat] Tab became visible, running immediate session check...');
        checkAndRefreshSession();
    }
}

/**
 * BFCache / Navigation handler
 */
function handlePageShow(event: PageTransitionEvent) {
    if (event.persisted) {
        console.log('[TokenHeartbeat] Page restored from BFCache, running immediate session check...');
        checkAndRefreshSession();
    }
}

/**
 * Starts the heartbeat and sets up listeners
 */
export function startTokenHeartbeat() {
    if (typeof window === 'undefined') return;

    // Clean up any existing instances first
    stopTokenHeartbeat();

    console.log('[TokenHeartbeat] Initializing Defense in Depth refresh system...');

    // 1. Initial check
    checkAndRefreshSession();

    // 2. Setup periodic heartbeat
    heartbeatInterval = setInterval(checkAndRefreshSession, CHECK_INTERVAL);

    // 3. Setup event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    // 4. Focus is also a good trigger occasionally
    window.addEventListener('focus', checkAndRefreshSession);
}

/**
 * Stops the heartbeat and removes listeners
 */
export function stopTokenHeartbeat() {
    if (typeof window === 'undefined') return;

    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('focus', checkAndRefreshSession);

    console.log('[TokenHeartbeat] Refresh system stopped.');
}
