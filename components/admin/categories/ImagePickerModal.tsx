'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CMSGalleryRow } from '@/types/cms';
import { syncCategoryGalleryItemsAction } from '@/app/admin/actions';
import { toast } from 'sonner';
import CmsPagination from '../ui/CmsPagination';

interface ImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
    categoryName: string;
    allGalleryItems: CMSGalleryRow[];
    onSuccess: () => void;
}

export default function ImagePickerModal({ isOpen, onClose, categoryId, categoryName, allGalleryItems, onSuccess }: ImagePickerModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 120;
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set());
            setSearchQuery('');
            setCurrentPage(1);
        }
    }, [isOpen]);

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Scroll to top on page change
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    // Filter items NOT in this category
    const existingIdsInCat = new Set(allGalleryItems
        .filter(item => item.categories?.some(c => c.id === categoryId))
        .map(item => item.id)
    );

    const availableItems = allGalleryItems.filter(item => !existingIdsInCat.has(item.id));

    const filteredItems = availableItems.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.alt_text || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleSave = async () => {
        if (selectedIds.size === 0) {
            onClose();
            return;
        }
        
        setIsSaving(true);
        try {
            // MERGE: Keep existing IDs and add new ones
            const finalIds = [...Array.from(existingIdsInCat), ...Array.from(selectedIds)];
            const res = await syncCategoryGalleryItemsAction(categoryId, finalIds);
            if (res.error) throw res.error;
            toast.success(`${selectedIds.size} New graphics added to category`);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update graphics');
        } finally {
            setIsSaving(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-300">
            {/* Custom Modal Container */}
            <div className="relative w-full max-w-[98vw] h-[96vh] flex flex-col bg-[#000000] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
                {/* Background Texture */}
                <div 
                    className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: 'url("/Mockups/Background.webp")', backgroundSize: 'cover', backgroundPosition: 'center center' }}
                />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
                    <div>
                        <h2 className="font-cormorant text-2xl text-white tracking-wide">
                            Add Graphics to <span className="text-[var(--primary)]">{categoryName}</span>
                        </h2>
                        <p className="font-outfit text-xs font-light tracking-widest text-zinc-400 mt-1 uppercase">
                            {selectedIds.size} NEW SELECTED
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search gallery..."
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 font-outfit text-[11px] text-white placeholder-zinc-500 focus:border-[var(--primary)]/50 focus:outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div 
                    ref={scrollContainerRef}
                    className="relative z-10 flex-1 overflow-y-auto p-6 scroll-smooth bg-black/20"
                >
                    {filteredItems.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="font-outfit text-sm text-zinc-500 uppercase tracking-widest">No graphics found.</p>
                        </div>
                    ) : (
                        <div className="columns-2 sm:columns-3 lg:columns-5 xl:columns-7 2xl:columns-8 gap-4 space-y-4">
                            {paginatedItems.map(item => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={cn(
                                            "relative break-inside-avoid rounded-md overflow-hidden cursor-pointer group transition-all duration-300 border-2 mb-3",
                                            isSelected 
                                                ? "border-[var(--primary)] shadow-[0_0_20px_var(--primary)_inset]" 
                                                : "border-transparent hover:border-white/20 bg-black/40"
                                        )}
                                    >
                                        <div className="relative aspect-auto">
                                            <img 
                                                src={item.storage_url} 
                                                alt={item.title || 'Graphic'} 
                                                className={cn(
                                                    "w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 block",
                                                    isSelected ? "opacity-100 scale-105" : "opacity-80"
                                                )} 
                                                loading="lazy"
                                            />
                                            
                                            {/* Overlay & Selection Indicator */}
                                            <div className={cn(
                                                "absolute inset-0 transition-opacity duration-300 pointer-events-none",
                                                isSelected ? "bg-[var(--primary)]/10" : "bg-black/40 group-hover:bg-black/10"
                                            )} />
                                            
                                            <div className={cn(
                                                "absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10",
                                                isSelected 
                                                    ? "bg-[var(--primary)] border-[var(--primary)] text-black scale-100 opacity-100" 
                                                    : "bg-black/50 border-white/30 text-transparent scale-90 opacity-0 group-hover:opacity-100"
                                            )}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0">
                                            <p className="font-cormorant text-sm text-white truncate">{item.title || 'Untitled'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    <CmsPagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="mt-8 pb-4"
                    />
                </div>

                {/* Footer Controls */}
                <div className="relative z-10 p-5 border-t border-white/5 bg-black/60 flex items-center justify-between">
                    <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="font-outfit text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                        Clear Selection
                    </button>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onClose}
                            disabled={isSaving}
                            className="font-outfit text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-8 py-2.5 font-outfit text-[11px] font-semibold tracking-widest text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/20 hover:border-[var(--primary)]/50 disabled:opacity-50 cursor-pointer"
                        >
                            {isSaving && <Loader2 size={14} className="animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save Selection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
