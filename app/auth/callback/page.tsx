'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Get the return URL from search params
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('returnTo') || '/profile';

        // The Supabase client is configured to automatically handle the hash fragment
        // We just need to listen for the resulting session change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || session) {
                // Successful OAuth login
                // We use replace to prevent going back to the callback page
                router.replace(returnTo);
            }
        });

        // Fallback: If no event fires quickly (e.g. already handled), check session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.replace(returnTo);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#09090b] text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="text-zinc-400 animate-pulse">Completing secure sign in...</p>
            </div>
        </div>
    );
}
