import React from 'react';
import { getGalleryItems, getCategories } from '@/lib/api/admin-cms';
import GalleryManager from '@/components/admin/gallery/GalleryManager';

export const metadata = {
    title: 'Manage Gallery | DaVinci ADC',
};

// Next.js config to ensure this always stays fresh
export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
    // Fetch data in parallel
    const [galleryRes, categoryRes] = await Promise.all([
        getGalleryItems(false), // get all, not just published
        getCategories()
    ]);

    if (galleryRes.error || categoryRes.error) {
        return (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-6">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load payload</h2>
                <p className="text-zinc-400 font-mono text-sm">
                    {galleryRes.error?.message || categoryRes.error?.message}
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <GalleryManager 
                initialItems={galleryRes.data || []} 
                categories={categoryRes.data || []} 
            />
        </div>
    );
}
