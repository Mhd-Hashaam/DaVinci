import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Proxy (formerly Middleware) — Admin Route Protection
 * 
 * Protects /admin/* pages and /api/admin/* API routes.
 * Fast-gate check: reads the user's session and queries their role.
 */
export async function proxy(req: NextRequest) {
    console.log('[Proxy] Running for path:', req.nextUrl.pathname);
    let res = NextResponse.next();
    const pathname = req.nextUrl.pathname;

    // Only guard admin routes
    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminAPI = pathname.startsWith('/api/admin');

    if (!isAdminRoute && !isAdminAPI) {
        return res;
    }

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return req.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            req.cookies.set(name, value);
                            res = NextResponse.next({ request: req });
                            res.cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('[Proxy] Session check:', session ? `User ${session.user.id}` : 'NO SESSION', sessionError ? `Error: ${sessionError.message}` : '');

        if (!session) {
            console.log('[Proxy] ❌ Redirecting: No session found');
            if (isAdminAPI) {
                return NextResponse.json(
                    { error: 'Unauthorized: No session' },
                    { status: 401 }
                );
            }
            return NextResponse.redirect(new URL('/davinci', req.url));
        }

        const { data: profile, error: profileError } = await (supabase as any)
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        console.log('[Proxy] Profile query result:', JSON.stringify(profile), 'Error:', profileError ? JSON.stringify(profileError) : 'none');

        const isAdmin = profile?.role === 'admin';
        console.log('[Proxy] isAdmin:', isAdmin, '| Role value:', profile?.role);

        if (!isAdmin) {
            console.log('[Proxy] ❌ Redirecting: Not admin. Profile role =', profile?.role || 'NULL');
            if (isAdminAPI) {
                return NextResponse.json(
                    { error: 'Forbidden: Admin access required' },
                    { status: 403 }
                );
            }
            return NextResponse.redirect(new URL('/davinci', req.url));
        }

        console.log('[Proxy] ✅ Admin access granted');

        return res;

    } catch (error) {
        console.error('[Proxy] Admin check failed:', error);
        if (isAdminAPI) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
        return NextResponse.redirect(new URL('/davinci', req.url));
    }
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
