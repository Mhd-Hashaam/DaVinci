'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExploreFilterBar } from './ExploreFilterBar';
import { ExploreMasonry } from './ExploreMasonry';
import { ExplorePagination } from './ExplorePagination';
import { FeedSkeleton } from '@/components/layout/FeedSkeleton';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useCMSData } from '@/lib/hooks/useCMSData';
import { getSettingsAction } from '@/app/admin/actions';
import type { GeneratedImage } from '@/types';
import type { CMSGalleryRow, CMSCategoryRow } from '@/types/cms';

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

export const DaVinciExplore = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 60; // 15 rows * 4 columns

    const [categories, setCategories] = useState<CMSCategoryRow[]>([]);
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
                console.error('DaVinciExplore: failed to fetch gallery mode setting:', err);
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

    // Categories still need to be fetched separately as useCMSData is per-table
    useEffect(() => {
        let isMounted = true;
        async function loadCats() {
            try {
                const { data } = await supabase
                    .from('cms_categories')
                    .select('*')
                    .order('display_order', { ascending: true });
                if (isMounted && data) setCategories(data);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        }
        loadCats();
        return () => { isMounted = false; };
    }, []);

    const isLoading = isCMSLoading || categories.length === 0;
    const galleryItems = allCmsImages;

    // Filter Logic
    const filteredImages = useMemo(() => {
        let results = galleryItems;

        // 1. Category Filter
        if (activeFilter !== 'All') {
            results = results.filter((img) =>
                img.categories?.some((c: any) => c?.id === activeFilter)
            );
        }

        // 2. Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter((img) =>
                img.prompt?.toLowerCase().includes(q) ||
                img.categories?.some((c: any) => c?.name?.toLowerCase().includes(q))
            );
        }

        return results;
    }, [activeFilter, searchQuery, galleryItems]);

    // Pagination
    const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
    const displayedImages = useMemo(() => 
        filteredImages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredImages, currentPage, ITEMS_PER_PAGE]);

    const handleFilterChange = (filter: string) => { 
        setActiveFilter(filter); 
        setCurrentPage(1); 
    };

    return (
        <div className="w-full min-h-screen pb-20">
            <div className="max-w-7xl mx-auto">

                {/* 1. Sticky Filters */}
                <section className="sticky top-0 z-40 animate-in fade-in duration-700">
                    <ExploreFilterBar
                        onFilterChange={handleFilterChange}
                        onSortChange={setActiveSort}
                        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
                        totalResults={filteredImages.length}
                        categories={categories}
                    />
                </section>

                {/* 2. Gallery Masonry */}
                <section className="px-4 sm:px-8 lg:px-12 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {isLoading ? (
                        <FeedSkeleton count={20} className="sm:columns-2 lg:columns-3 xl:columns-4" />
                    ) : galleryItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <p className="text-zinc-500 text-sm font-outfit">No published gallery items yet.</p>
                            <p className="text-zinc-700 text-xs font-outfit">Upload images in the admin panel and set them to Published.</p>
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
