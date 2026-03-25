'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ChevronDown, Check, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CMSGalleryRow, CMSCategoryRow } from '@/types/cms';
import { DashboardGalleryCard } from './DashboardGalleryCard';

interface DashboardGallerySectionProps {
    items: CMSGalleryRow[];
    categories: CMSCategoryRow[];
}

export function DashboardGallerySection({ items, categories }: DashboardGallerySectionProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
    
    // UI State for custom dropdowns
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const categoryRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeCategory = categories.find(c => c.id === selectedCategoryId);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = !selectedCategoryId || 
                (item.categories || []).some(c => c.id === selectedCategoryId);
            
            const matchesStatus = 
                statusFilter === 'all' ||
                (statusFilter === 'published' && item.is_published) ||
                (statusFilter === 'draft' && !item.is_published) ||
                (statusFilter === 'featured' && item.is_featured);

            return matchesCategory && matchesStatus;
        }).slice(0, 4); // Only show top 4 on dashboard
    }, [items, selectedCategoryId, statusFilter]);

    return (
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">Gallery Management</h2>
                <div className="flex items-center gap-3">
                    <Link href="/admin/gallery" className="font-outfit text-[9px] uppercase tracking-widest text-[var(--primary)] hover:text-white transition-colors">View All</Link>
                    <button className="text-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer"><MoreHorizontal size={14} /></button>
                </div>
            </div>

            <div className="flex items-center gap-2 px-1">
                {/* Category Dropdown */}
                <div className="relative" ref={categoryRef}>
                    <button 
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={cn(
                            "flex items-center gap-2 rounded-lg border px-5 py-2 font-outfit text-[10px] uppercase tracking-wider transition-all cursor-pointer",
                            selectedCategoryId ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]" : "border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.12]"
                        )}
                    >
                        {activeCategory ? activeCategory.name : 'All Categories'}
                        <ChevronDown size={12} className={cn("transition-transform duration-300", isCategoryOpen && "rotate-180")} />
                    </button>

                    {isCategoryOpen && (
                        <div className="absolute left-0 mt-2 w-56 p-1.5 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => { setSelectedCategoryId(null); setIsCategoryOpen(false); }}
                                className="flex items-center justify-between w-full px-4 py-2 text-left font-outfit text-[10px] uppercase tracking-widest rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
                            >
                                All Categories
                                {!selectedCategoryId && <Check size={12} className="text-[var(--primary)]" />}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategoryId(cat.id); setIsCategoryOpen(false); }}
                                    className="flex items-center justify-between w-full px-4 py-2 text-left font-outfit text-[10px] uppercase tracking-widest rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
                                >
                                    {cat.name}
                                    {selectedCategoryId === cat.id && <Check size={12} className="text-[var(--primary)]" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter Dropdown */}
                <div className="relative" ref={filterRef}>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "flex items-center gap-2 rounded-lg border px-5 py-2 font-outfit text-[10px] uppercase tracking-wider transition-all cursor-pointer",
                            statusFilter !== 'all' ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]" : "border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.12]"
                        )}
                    >
                        <Filter size={10} className={statusFilter !== 'all' ? 'text-[var(--primary)]' : 'text-zinc-500'} />
                        {statusFilter === 'all' ? 'Filter' : statusFilter}
                        <ChevronDown size={12} className={cn("transition-transform duration-300", isFilterOpen && "rotate-180")} />
                    </button>

                    {isFilterOpen && (
                        <div className="absolute left-0 mt-2 w-48 p-1.5 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            {(['all', 'published', 'draft', 'featured'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setStatusFilter(f); setIsFilterOpen(false); }}
                                    className="flex items-center justify-between w-full px-4 py-2 text-left font-outfit text-[10px] uppercase tracking-widest rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
                                >
                                    {f}
                                    {statusFilter === f && <Check size={12} className="text-[var(--primary)]" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2×2 Image Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredItems.length === 0 ? (
                    <div className="col-span-2 py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                        <p className="font-outfit text-[10px] uppercase tracking-[0.2em] text-zinc-600">No graphics found</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <DashboardGalleryCard 
                            key={item.id} 
                            item={item} 
                            // Deterministic fake stats based on ID to avoid hydration mismatch
                            likes={item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1500 + 500} 
                            views={item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 4000 + 1000} 
                        />
                    ))
                )}
            </div>
        </div>
    );
}
