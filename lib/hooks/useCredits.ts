import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface CreditsData {
    success: boolean;
    hasAcceptedTerms: boolean;
    creditsRemaining: number;
}

export function useCredits() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [data, setData] = useState<CreditsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchCredits = useCallback(async () => {
        if (isAuthLoading) return; // Wait for auth to settle
        
        if (!user) {
            setData(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log('[Credits] Fetching credit balance...');
            const res = await fetch('/api/credits');
            const json = await res.json();
            console.log('[Credits] Response:', json);
            
            if (json.success) {
                setData(json);
                setIsError(false);
            } else {
                console.error('[Credits] API returned failure:', json);
                setIsError(true);
            }
        } catch (e) {
            console.error('[Credits] Fetch failed:', e);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAuthLoading]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    const acceptTerms = async () => {
        const res = await fetch('/api/credits', { method: 'POST' });
        if (res.ok) {
            await fetchCredits();
        }
    };

    return {
        credits: data?.creditsRemaining ?? null,
        hasAcceptedTerms: data?.hasAcceptedTerms ?? null,
        isLoading: isLoading || isAuthLoading,
        isError,
        mutate: fetchCredits,
        acceptTerms
    };
}
