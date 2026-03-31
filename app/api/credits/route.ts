import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() {}
                },
            }
        );

        // SECURITY: getUser() verifies token with Supabase Auth server
        // (getSession() just reads from cookies which can be forged)
        const { data: { user }, error: userError } = await authClient.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;

        // 1. Get AUP status from profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('has_accepted_ai_terms')
            .eq('id', userId)
            .single();

        // 2. Get daily limit from CMS settings
        const { data: limitSetting } = await (supabaseAdmin as any)
            .from('cms_settings')
            .select('value')
            .eq('key', 'daily_generation_limit')
            .single();

        const dailyLimit = parseInt(limitSetting?.value ?? '5', 10);

        // 3. Count today's successful generations (READ-ONLY — no credit consumed)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count } = await (supabaseAdmin as any)
            .from('generation_logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'success')
            .gte('created_at', todayStart.toISOString());

        const used = count ?? 0;
        const remaining = Math.max(0, dailyLimit - used);

        return NextResponse.json({
            success: true,
            hasAcceptedTerms: (profile as any)?.has_accepted_ai_terms ?? false,
            creditsRemaining: remaining,
            dailyLimit,
        });
    } catch (err) {
        console.error('[Credits GET] Error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// Accept terms endpoint
export async function POST() {
    try {
        const cookieStore = await cookies();
        const authClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    }
                },
            }
        );

        const { data: { user }, error: userError } = await authClient.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ has_accepted_ai_terms: true } as any)
            .eq('id', user.id);

        if (error) {
            console.error('[Credits POST] DB error:', error);
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Credits POST] Error:', err);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
