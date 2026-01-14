import React, { useState, useMemo } from 'react';
import { ExploreFilterBar } from './ExploreFilterBar';
import { ExploreMasonry } from './ExploreMasonry';
import { GALLERY_IMAGES } from '@/lib/galleryData';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const DaVinciExplore = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('popular');
    const [visibleCount, setVisibleCount] = useState(40); // 10 rows * 4 cols approx

    // Filter Logic
    const filteredImages = useMemo(() => {
        if (activeFilter === 'All') {
            return GALLERY_IMAGES;
        }
        return GALLERY_IMAGES.filter(img => img.category === activeFilter);
    }, [activeFilter]);

    // Pagination Logic
    const displayedImages = useMemo(() => {
        return filteredImages.slice(0, visibleCount);
    }, [filteredImages, visibleCount]);

    const hasMore = displayedImages.length < filteredImages.length;

    const handleLoadMore = () => {
        // Add 6 rows (approx 24 images)
        setVisibleCount(prev => prev + 24);
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setVisibleCount(40); // Reset pagination on filter change
    };

    return (
        <div className="w-full min-h-screen pb-20">
            <div className="max-w-7xl mx-auto">

                {/* 1. Sticky Filters */}
                <section className="sticky top-0 z-40 animate-in fade-in duration-700">
                    <ExploreFilterBar
                        onFilterChange={handleFilterChange}
                        onSortChange={setActiveSort}
                    />
                </section>

                {/* 2. Masonry Grid */}
                <section className="mt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    <ExploreMasonry images={displayedImages} />
                </section>

                {/* 3. Load More Button */}
                {hasMore && (
                    <div className="flex justify-center py-10 animate-in fade-in">
                        <button
                            onClick={handleLoadMore}
                            className="group relative px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Load More Designs
                                <Loader2 size={14} className="group-hover:animate-spin" />
                            </span>
                            {/* Button Glow */}
                            <div className="absolute inset-0 rounded-full bg-[var(--lamp-color)] opacity-0 group-hover:opacity-20 blur-lg transition-opacity" />
                        </button>
                    </div>
                )}

                {!hasMore && filteredImages.length > 0 && (
                    <div className="text-center py-10 text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                        End of Gallery
                    </div>
                )}
            </div>
        </div>
    );
};
