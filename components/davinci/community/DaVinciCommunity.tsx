'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExploreFilterBar } from '../explore/ExploreFilterBar';
import { ExploreMasonry } from '../explore/ExploreMasonry';
import { ExplorePagination } from '../explore/ExplorePagination';
import { FeedSkeleton } from '@/components/layout/FeedSkeleton';
import { useCMSData } from '@/lib/hooks/useCMSData';
import { getSettingsAction } from '@/app/admin/actions';
import { Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { GeneratedImage } from '@/types';
import type { CMSGalleryRow } from '@/types/cms';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function rowToImage(row: CMSGalleryRow): GeneratedImage & { categories: any[] } {
    return {
        id: row.id,
        url: row.storage_url ?? '',
        prompt: row.title || row.alt_text || 'Untitled Design',
        aspectRatio: (row.aspect_ratio || '1:1') as any,
        timestamp: new Date(row.created_at).getTime(),
        model: 'DaVinci Core',
        categories: (row as any).categories || [],
    };
}

export const DaVinciCommunity = () => {
    const [activeSort, setActiveSort] = useState('popular');
    const [searchQuery, setSearchValue] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 60;

    const [galleryMode, setGalleryMode] = useState<string>('manual');

    // Fetch Global Gallery Render Mode
    useEffect(() => {
        async function fetchMode() {
            try {
                const res = await getSettingsAction(true);
                if (res.data) {
                    const modeSetting = res.data.find((s: any) => s.key === 'gallery_render_mode');
                    if (modeSetting?.value) setGalleryMode(modeSetting.value);
                }
            } catch (err) {
                console.error('DaVinciCommunity: failed to fetch gallery mode setting:', err);
            }
        }
        fetchMode();
    }, []);

    const { data: allCmsImages, isLoading: isCMSLoading } = useCMSData<GeneratedImage & { categories: any[] }>(
        'cms_gallery',
        [],
        (row: any) => ({
            id: row.id,
            url: row.storage_url ?? '',
            prompt: row.title || row.alt_text || 'Untitled Design',
            aspectRatio: (row.aspect_ratio || '1:1') as any,
            timestamp: new Date(row.created_at).getTime(),
            model: 'DaVinci Core',
            categories: row.category_links?.map((l: any) => l.category).filter(Boolean) || [],
        }),
        '*, category_links:cms_gallery_categories(category:cms_categories(*))',
        galleryMode
    );

    // Filter for Community items
    const galleryItems = useMemo(() => {
        if (!allCmsImages) return [];
        return allCmsImages.filter(item => 
            item.categories.some((cat: any) => 
                cat.slug === 'community' || 
                cat.name === 'Community Creations' ||
                cat.name === "Community's Creation"
            )
        );
    }, [allCmsImages]);

    const isLoading = isCMSLoading;

    // Scroll to top on page change
    useEffect(() => {
        const scrollHost = document.querySelector('.csb-host');
        if (scrollHost) {
            scrollHost.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    // Filter Logic
    const filteredImages = useMemo(() => {
        let results = galleryItems;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter((img) =>
                img.prompt?.toLowerCase().includes(q) ||
                img.categories?.some((c: any) => c?.name?.toLowerCase().includes(q))
            );
        }
        return results;
    }, [searchQuery, galleryItems]);

    const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
    const displayedImages = useMemo(() => 
        filteredImages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredImages, currentPage]);

    return (
        <div className="w-full min-h-screen pb-20">
            <div className="max-w-7xl mx-auto">
                <section className="sticky top-0 z-40 animate-in fade-in duration-700">
                    <ExploreFilterBar
                        onFilterChange={() => {}}
                        onSortChange={setActiveSort}
                        onSearchChange={(q) => { setSearchValue(q); setCurrentPage(1); }}
                        totalResults={filteredImages.length}
                        categories={[]}
                    />
                </section>

                <section className="px-4 sm:px-8 lg:px-12 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {isLoading ? (
                        <FeedSkeleton count={20} className="sm:columns-2 lg:columns-3 xl:columns-4" />
                    ) : galleryItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <p className="text-zinc-500 text-sm font-outfit">No community items available yet.</p>
                            <p className="text-zinc-700 text-[10px] uppercase tracking-[0.2em] mt-2 opacity-50">CURATED BY THE COMMUNITY</p>
                        </div>
                    ) : (
                        <>
                            <ExploreMasonry images={displayedImages} />
                            <ExplorePagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};
