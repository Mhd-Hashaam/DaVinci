import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// We need a public client for the frontend to read published data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export function useCMSData<T>(
    tableName: string, 
    legacyFallback: T[] = [], 
    transformer?: (row: any) => T,
    selectString: string = '*'
) {

    const [data, setData] = useState<T[]>(legacyFallback);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            // If feature flag is off, stick to legacy data immediately
            if (process.env.NEXT_PUBLIC_CMS_ENABLED !== 'true') {
                if (isMounted) {
                    setData(legacyFallback);
                    setIsLoading(false);
                }
                return;
            }

            try {
                // Fetch only published items, ordered correctly
                const { data: rows, error } = await supabase
                    .from(tableName)
                    .select(selectString)
                    .eq('is_published', true)
                    .order('display_order', { ascending: true });

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
                        // Transform row to match frontend component expectations if transformer provided
                        const finalData = transformer ? rows.map(transformer) : (rows as unknown as T[]);
                        setData(finalData);
                    } else {
                        // DB is empty, fallback to legacy data
                        setData(legacyFallback);
                    }
                }
            } catch (error) {
                console.error(`Failed to load ${tableName} from CMS, using fallback.`);
                if (isMounted) setData(legacyFallback);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [tableName, legacyFallback, transformer]);

    return { data, isLoading };
}
