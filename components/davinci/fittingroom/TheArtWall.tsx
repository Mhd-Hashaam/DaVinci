'use client';

import React, { useEffect } from 'react';
import { IconGhost2Filled } from '@tabler/icons-react';
import { Trash2, Plus } from 'lucide-react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const TheArtWall: React.FC = () => {
    const {
        designs,
        activeDesignId,
        setActiveDesign,
        removeDesign,
        clearDesigns,
        triggerGalleryView,
        triggerCreateView
    } = useFittingRoomStore();

    // Local state for popover
    const [popoverSlotIndex, setPopoverSlotIndex] = React.useState<number | null>(null);

    // Clear any ghost data on mount (one-time cleanup)
    useEffect(() => {
        clearDesigns();
    }, [clearDesigns]);

    // Handle click outside to close popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverSlotIndex !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('.artwall-popover-trigger')) {
                    setPopoverSlotIndex(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popoverSlotIndex]);

    // Show minimum 4 slots (empty placeholders if needed)
    const minSlots = 4;
    const slotCount = Math.max(designs.length, minSlots);
    const emptyCount = slotCount - designs.length;

    const handleOptionSelect = (type: 'gallery' | 'create') => {
        if (type === 'gallery') {
            triggerGalleryView();
        } else {
            triggerCreateView();
        }
        setPopoverSlotIndex(null);
    };

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-[50px] border-b border-white/5">
                <span className="text-[15px] font-bold text-zinc-500 tracking-widest">
                    ArtWall
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600">
                        {designs.length}/10
                    </span>
                    {designs.length === 0 && (
                        <button
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            // If no designs, open popover on first slot logic or just default to gallery? 
                            // Let's wire this button to open Gallery for quick access
                            onClick={() => triggerGalleryView()}
                            title="Add design from Gallery"
                        >
                            <Plus size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Slots */}
            <div className="flex-1 overflow-y-auto p-3 container-scroll">
                <div className="grid grid-cols-2 gap-3">
                    {/* Render filled design slots */}
                    {designs.map((design) => {
                        const isActive = design.id === activeDesignId;

                        return (
                            <div
                                key={design.id}
                                onClick={() => setActiveDesign(design.id)}
                                className={cn(
                                    "relative rounded-xl overflow-hidden cursor-pointer group transition-all aspect-[3/4]",
                                    isActive
                                        ? "ring-2 ring-[var(--lamp-color)] shadow-lg shadow-[var(--lamp-glow)]"
                                        : "border border-white/10 hover:border-white/20"
                                )}
                            >
                                <Image
                                    src={design.thumbnail}
                                    alt={design.name}
                                    fill
                                    className="object-cover"
                                />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Design Name */}
                                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wide line-clamp-1">
                                        {design.name}
                                    </span>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeDesign(design.id);
                                    }}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Trash2 size={12} className="text-white" />
                                </button>
                            </div>
                        );
                    })}

                    {/* Render empty placeholder slots */}
                    {Array.from({ length: emptyCount }).map((_, i) => {
                        const isPopoverOpen = popoverSlotIndex === i;

                        return (
                            <div
                                key={`empty-${i}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPopoverSlotIndex(i);
                                }}
                                className={cn(
                                    "artwall-popover-trigger relative rounded-xl border-dashed bg-black/20 flex flex-col items-center justify-center gap-2 aspect-[3/4] transition-all cursor-pointer",
                                    isPopoverOpen
                                        ? "border-2 border-[var(--lamp-color)] bg-black/60 z-10"
                                        : "border-2 border-white/10 hover:border-white/30 hover:bg-white/5"
                                )}
                            >
                                {isPopoverOpen ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-2 animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOptionSelect('gallery');
                                            }}
                                            className="w-full py-2 px-3 rounded-lg bg-[var(--lamp-color)] hover:brightness-110 text-black text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-[var(--lamp-glow)]/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            Gallery
                                        </button>
                                        <div className="text-[9px] text-white/40 font-medium uppercase tracking-widest">- OR -</div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOptionSelect('create');
                                            }}
                                            className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <IconGhost2Filled className="w-8 h-8 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                                        <Plus className="w-4 h-4 text-zinc-700 absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
