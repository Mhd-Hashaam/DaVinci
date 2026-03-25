import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { ProfileRow } from '@/types/database';

interface AuthState {
    user: User | null;
    session: Session | null;
    profile: ProfileRow | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isSessionExpired: boolean;
    isAdmin: boolean;
    setSession: (session: Session | null) => void;
    setProfile: (profile: ProfileRow | null) => void;
    setLoading: (loading: boolean) => void;
    setSessionExpired: (isExpired: boolean) => void;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            profile: null,
            isLoading: true,
            isAuthenticated: false,
            isSessionExpired: false,
            isAdmin: false,
            setSession: (session) => set({
                session,
                user: session?.user ?? null,
                isAuthenticated: !!session,
                isSessionExpired: false // Clear expiry if session is set
            }),
            setProfile: (profile) => set({
                profile,
                isAdmin: profile?.role === 'admin',
            }),
            setLoading: (isLoading) => set({ isLoading }),
            setSessionExpired: (isSessionExpired) => set({ isSessionExpired }),
            signOut: () => set({
                user: null,
                session: null,
                profile: null,
                isAuthenticated: false,
                isSessionExpired: false,
                isAdmin: false,
            }),
        }),
        {
            name: 'davinci-auth-cache',
            storage: createJSONStorage(() => localStorage),
            // Only persist the profile for instant UI, not session/user for security
            partialize: (state) => ({ profile: state.profile }),
            version: 1,
        }
    )
);
