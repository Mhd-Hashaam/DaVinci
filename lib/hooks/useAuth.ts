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

        // Failsafe: Force loading to false after 3s to prevent infinite spinner
        const failsafeTimer = setTimeout(() => {
            if (mounted && useAuthStore.getState().isLoading) {
                console.warn('Auth loading timed out, forcing complete.');
                setLoading(false);
            }
        }, 3000);

        const initAuth = async () => {
            try {
                // Check active session
                const { data: { session: initialSession } } = await client.auth.getSession();

                if (mounted) {
                    setSession(initialSession);
                    if (initialSession?.user) {
                        try {
                            await fetchProfile(initialSession.user.id);
                        } catch (err) {
                            console.error("Profile fetch error in init:", err);
                        }
                    } else {
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session);
                if (session?.user) {
                    // We don't await this to prevent blocking UI updates for too long, 
                    // but validation might need it. Let's await but catch.
                    try {
                        await fetchProfile(session.user.id);
                    } catch (err) {
                        console.error("Profile fetch error on change:", err);
                    }
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

            if (error) {
                // Profile might not exist yet for new users
                return;
            }

            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const signOut = async () => {
        await client.auth.signOut();
        storeSignOut();
    };

    const updateProfile = async (updates: Partial<ProfileRow>) => {
        if (!user) {
            throw new Error('Must be authenticated to update profile');
        }

        try {
            // Using 'as any' workaround for Supabase inference issues in this file
            const { data, error } = await (client.from('profiles') as any)
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setProfile(data as ProfileRow);
            }

            return { success: true, data: data as ProfileRow };
        } catch (error) {
            console.error('Error updating profile:', error);
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
