import { getGalleryItems, getCategories } from '@/lib/api/admin-cms';
import CuratedGalleryManager from '@/components/admin/curation/CuratedGalleryManager';
import { redirect } from 'next/navigation';

export default async function TopPicksPage() {
    // 1. Fetch Data
    const [galleryRes, categoryRes] = await Promise.all([
        getGalleryItems(),
        getCategories()
    ]);

    const galleryItems = galleryRes.data || [];
    const allCategories = categoryRes.data || [];

    // 2. Find "Top Picks" Category
    let topPicksCategory = allCategories.find(c => c.name === 'Top Picks' || c.slug === 'top-picks');

    // 3. Auto-Create if missing
    if (!topPicksCategory) {
        const { createServerClient } = await import('@supabase/ssr');
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) { /* Not needed for read */ }
                }
            }
        );
        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (!session || !session.user) redirect('/login');

        const { createCategory } = await import('@/lib/api/admin-cms');
        const res = await createCategory(session.user.id, { 
            name: 'Top Picks', 
            slug: 'top-picks'
        });

        if (res.data) {
            topPicksCategory = res.data;
        } else {
            return (
                <div className="p-20 text-center">
                     <h2 className="text-white text-2xl font-cormorant mb-4">Curation Category Not Found</h2>
                     <p className="text-zinc-500 mb-8">The "Top Picks" category is currently missing and couldn't be auto-created.</p>
                     <a href="/admin/categories" className="px-6 py-2 bg-[var(--primary)] text-black rounded-lg text-xs uppercase tracking-widest font-bold">Manage Categories</a>
                </div>
            );
        }
    }

    // 4. Filter curated items
    const curatedItems = galleryItems.filter((item: any) => 
        item.categories?.some((c: any) => c.id === topPicksCategory!.id)
    );

    return (
        <CuratedGalleryManager 
            categoryId={topPicksCategory.id}
            categoryName="Top Picks"
            items={curatedItems}
            allGalleryItems={galleryItems}
        />
    );
}
