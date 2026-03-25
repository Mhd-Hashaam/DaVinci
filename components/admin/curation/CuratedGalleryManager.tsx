'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Diamond, ChevronRight, Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { CMSGalleryRow, CMSCategoryRow } from '@/types/cms';
import { removeGalleryItemFromCategoryAction } from '@/app/admin/actions';
import ImagePickerModal from '../categories/ImagePickerModal';
import { useRouter } from 'next/navigation';

interface CuratedGalleryManagerProps {
    categoryId: string;
    categoryName: string;
    items: CMSGalleryRow[];
    allGalleryItems: CMSGalleryRow[];
}

export default function CuratedGalleryManager({ categoryId, categoryName, items, allGalleryItems }: CuratedGalleryManagerProps) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const router = useRouter();

    const handleRemove = async (itemId: string) => {
        if (!confirm('Remove this item from the collection? (Image won\'t be deleted from gallery)')) return;
        
        setIsRemoving(itemId);
        try {
            const res = await removeGalleryItemFromCategoryAction(categoryId, itemId);
            if (res.error) throw res.error;
            toast.success('Removed from collection');
            router.refresh(); // Refresh server component data
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove item');
        } finally {
            setIsRemoving(null);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">{categoryName}</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Managed Curation Module
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-[10px] font-outfit uppercase tracking-[0.2em] text-zinc-500">
                        {items.length} Curated Items
                    </div>
                </div>
            </div>

            <div className="admin-divider flex-shrink-0" />

            {/* Controls */}
            <div className="flex items-center justify-end px-8 py-4 bg-black/20">
                <button
                    onClick={() => setIsPickerOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-white/5 px-6 py-2.5 font-outfit text-[11px] font-bold tracking-[0.2em] text-[var(--primary)] uppercase transition-all duration-300 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50 !shadow-none !before:hidden !after:hidden"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Graphics
                </button>
            </div>

            {/* Grid */}
            <div className="p-8">
                {items.length === 0 ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                        <Diamond size={40} className="text-zinc-800 mb-4" strokeWidth={1} />
                        <h3 className="font-cormorant text-xl text-white/50">Collection is empty</h3>
                        <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600 mt-2">Start adding picks from your gallery</p>
                        <button 
                            onClick={() => setIsPickerOpen(true)}
                            className="mt-8 flex items-center gap-2 font-outfit text-[10px] uppercase tracking-[0.2em] text-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                        >
                            Select from Gallery <ChevronRight size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group relative break-inside-avoid rounded-xl overflow-hidden bg-zinc-900/40 border border-white/5 transition-all duration-500 hover:border-white/10"
                            >
                                <img
                                    src={item.storage_url}
                                    alt={item.title || 'Curated item'}
                                    className="w-full h-auto grayscale-[0.2] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Controls */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-4px] group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        disabled={isRemoving === item.id}
                                        className="p-2 rounded-lg bg-black/60 hover:bg-red-600/80 text-white/40 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
                                    >
                                        {isRemoving === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                    <p className="font-cormorant text-lg text-white/90 truncate mb-1">{item.title || 'Untitled'}</p>
                                    <p className="font-outfit text-[9px] uppercase tracking-widest text-zinc-500">
                                        ID: {item.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <ImagePickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                categoryId={categoryId}
                categoryName={categoryName}
                allGalleryItems={allGalleryItems}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
