import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// We need a public client for the frontend to read published data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export function useCMSData<T>(
    tableName: string, 
    legacyFallback: T[] = [], 
    transformer?: (row: any) => T,
    selectString: string = '*',
    overrideMode?: string
) {

    const [data, setData] = useState<T[]>(legacyFallback);
    const [isLoading, setIsLoading] = useState(true);

    // Use refs to store props that might change on every render (like inline functions/arrays)
    // and cause infinite loops in the useEffect dependency array.
    const transformerRef = useRef(transformer);
    transformerRef.current = transformer;
    const fallbackRef = useRef(legacyFallback);
    fallbackRef.current = legacyFallback;

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            // If feature flag is off, stick to legacy data immediately
            if (process.env.NEXT_PUBLIC_CMS_ENABLED !== 'true') {
                if (isMounted) {
                    setData(fallbackRef.current);
                    setIsLoading(false);
                }
                return;
            }

            try {
                // Use override mode if provided, otherwise default to manual
                const mode = overrideMode || 'manual';
                
                // Fetch published items
                let query = supabase
                    .from(tableName)
                    .select(selectString)
                    .eq('is_published', true);

                // Apply ordering based on mode (Database-side sorting)
                if (mode === 'latest') {
                    query = query.order('created_at', { ascending: false });
                } else if (mode === 'oldest') {
                    query = query.order('created_at', { ascending: true });
                } else {
                    // Default/Manual uses display_order
                    query = query.order('display_order', { ascending: true });
                }

                const { data: rows, error } = await query;

                if (error) {
                    console.error(`CMS Fetch Error (${tableName}):`, {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    throw error;
                }

                if (isMounted) {
                    if (rows && rows.length > 0) {
                        let processedRows = [...rows];
                        
                        // Handle shuffle mode (Client-side shuffle)
                        if (mode === 'shuffle' && tableName === 'cms_gallery') {
                            for (let i = processedRows.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [processedRows[i], processedRows[j]] = [processedRows[j], processedRows[i]];
                            }
                        }

                        // Transform row to match frontend component expectations if transformer provided
                        const finalData = transformerRef.current 
                            ? processedRows.map(transformerRef.current) 
                            : (processedRows as unknown as T[]);
                        setData(finalData);
                    } else {
                        // DB is empty, fallback to legacy data
                        setData(fallbackRef.current);
                    }
                }
            } catch (error) {
                console.error(`Failed to load ${tableName} from CMS, using fallback.`);
                if (isMounted) setData(fallbackRef.current);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [tableName, selectString, overrideMode]);

    return { data, isLoading };
}
