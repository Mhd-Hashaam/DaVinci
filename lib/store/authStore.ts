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
    setSession: (session: Session | null) => void;
    setProfile: (profile: ProfileRow | null) => void;
    setLoading: (loading: boolean) => void;
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
            setSession: (session) => set({
                session,
                user: session?.user ?? null,
                isAuthenticated: !!session
            }),
            setProfile: (profile) => set({ profile }),
            setLoading: (isLoading) => set({ isLoading }),
            signOut: () => set({
                user: null,
                session: null,
                profile: null,
                isAuthenticated: false
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
