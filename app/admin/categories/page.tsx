import React from 'react';
import { getCategories, getGalleryItems } from '@/lib/api/admin-cms';
import CategoryManager from '@/components/admin/categories/CategoryManager';

export const metadata = {
    title: 'Manage Categories | DaVinci ADC',
};

// Next.js config to ensure this always stays fresh
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    // Fetch categories and gallery items directly from DB on the server
    const [{ data: categories, error: catError }, { data: galleryItems, error: galError }] = await Promise.all([
        getCategories(),
        getGalleryItems()
    ]);

    if (catError || galError) {
        return (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-6">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load data</h2>
                <p className="text-zinc-400 font-mono text-sm">{catError?.message || galError?.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <CategoryManager initialData={categories || []} galleryItems={galleryItems || []} />
        </div>
    );
}
