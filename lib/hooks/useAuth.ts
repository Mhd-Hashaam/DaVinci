import { useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/authStore';
import type { ProfileRow, Database } from '@/types/database';

export function useAuth() {
    const {
        session,
        user,
        profile,
        isLoading,
        isAuthenticated,
        setSession,
        setProfile,
        setLoading,
        signOut: storeSignOut
    } = useAuthStore();

    const client = supabase as SupabaseClient<Database>;

    useEffect(() => {
        let mounted = true;

        // Failsafe: never spin forever — force resolve after 5s
        const failsafeTimer = setTimeout(() => {
            if (mounted && useAuthStore.getState().isLoading) {
                console.warn('[Auth] Loading timed out (5s), forcing complete.');
                setLoading(false);
            }
        }, 5000);

        const initAuth = async () => {
            try {
                const { data: { session: initialSession }, error } = await client.auth.getSession();
                if (error) console.error('[Auth] getSession error:', error.message);

                if (mounted) {
                    setSession(initialSession);
                    if (initialSession?.user) {
                        await fetchProfile(initialSession.user.id);
                    } else {
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.error('[Auth] Initialization error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // onAuthStateChange is the authoritative source of truth for session state.
        // It fires for: sign-in, sign-out, token refresh, tab focus, etc.
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] State change: ${event}`);
            if (mounted) {
                setSession(session);
                if (session?.user) {
                    await fetchProfile(session.user.id).catch(err =>
                        console.error('[Auth] Profile fetch failed on state change:', err)
                    );
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(failsafeTimer);
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) return; // Profile may not exist yet for new users
            if (data) setProfile(data);
        } catch (error) {
            console.error('[Auth] Error fetching profile:', error);
        }
    };

    const signOut = async () => {
        // Clear local state FIRST — UI updates instantly regardless of network
        storeSignOut();
        // Fire-and-forget the server side signout (5s window)
        try {
            await Promise.race([
                client.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('SignOut timed out')), 5000))
            ]);
        } catch {
            console.warn('[Auth] Server signOut timed out — local state already cleared.');
        }
    };

    const updateProfile = async (updates: Partial<ProfileRow>) => {
        if (!user) throw new Error('Must be authenticated to update profile');

        try {
            const { data, error } = await (client.from('profiles') as any)
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            if (data) setProfile(data as ProfileRow);
            return { success: true, data: data as ProfileRow };
        } catch (error) {
            console.error('[Auth] Error updating profile:', error);
            return { success: false, error };
        }
    };

    return {
        session,
        user,
        profile,
        isLoading,
        isAuthenticated,
        signOut,
        setProfile,
        updateProfile
    };
}
