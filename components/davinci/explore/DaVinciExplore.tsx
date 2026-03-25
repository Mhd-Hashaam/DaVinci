'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExploreFilterBar } from './ExploreFilterBar';
import { ExploreMasonry } from './ExploreMasonry';
import { ExplorePagination } from './ExplorePagination';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
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

    const [galleryItems, setGalleryItems] = useState<(GeneratedImage & { categories: any[] })[]>([]);
    const [categories, setCategories] = useState<CMSCategoryRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // URL Category Sync
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const categorySlug = params.get('category');
        if (categorySlug && categories.length > 0) {
            const cat = categories.find(c => c.slug === categorySlug);
            if (cat) setActiveFilter(cat.id);
        }
    }, [categories]);


    // Scroll to top on page change
    useEffect(() => {
        const scrollHost = document.querySelector('.csb-host');
        if (scrollHost) {
            scrollHost.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setIsLoading(true);
            try {
                // Fetch gallery items with their category links
                const [galleryRes, catRes] = await Promise.all([
                    supabase
                        .from('cms_gallery')
                        .select(`*, category_links:cms_gallery_categories(category:cms_categories(*))`)
                        .eq('is_published', true)
                        .order('display_order', { ascending: true }),
                    supabase
                        .from('cms_categories')
                        .select('*')
                        .order('display_order', { ascending: true }),
                ]);

                if (!isMounted) return;

                if (galleryRes.data) {
                    const mapped = galleryRes.data.map((row: any) => {
                        const withCats = {
                            ...row,
                            categories: row.category_links?.map((l: any) => l.category).filter(Boolean) || [],
                        };
                        return rowToImage(withCats);
                    });
                    setGalleryItems(mapped);
                }
                if (catRes.data) setCategories(catRes.data);
            } catch (err) {
                console.error('DaVinciExplore: failed to load data', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        load();
        return () => { isMounted = false; };
    }, []);

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
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 size={32} className="animate-spin text-white/30" />
                            <p className="text-zinc-600 text-[11px] uppercase tracking-widest font-outfit">Loading gallery...</p>
                        </div>
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
