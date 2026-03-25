'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconGhost2Filled } from '@tabler/icons-react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useCMSData } from '@/lib/hooks/useCMSData';
import type { CMSWardrobeRow } from '@/types/cms';

import { Shirt, Scissors, PersonStanding, Sparkles } from 'lucide-react';
const AVAILABLE_3D_MODELS = [
    {
        name: 'Basic Tee',
        path: '/Apparel Media/Shirt 3D Models/basic_t-shirt.glb',
        snapshot: '/Apparel Media/Shirt 3D Models/3D Shirts Snapshots/basic_t-shirt snapshot.webp',
        icon: <Shirt size={24} />
    },
    {
        name: 'Female Tee',
        path: '/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb',
        snapshot: '/Apparel Media/Shirt 3D Models/3D Shirts Snapshots/t-shirt_for_female snapshot.webp',
        icon: <PersonStanding size={24} />
    },
];

export const TheCloset: React.FC = () => {
    const {
        selectedShirts,
        activeShirtId,
        setActiveShirt,
        removeShirt,
        closetMode,
        toggleClosetMode,
        // 3D Mode State
        selected3DModelPath,
        set3DModel
    } = useFittingRoomStore();

    const scrollRef = React.useRef<HTMLDivElement>(null);

    // CMS Integration for 3D Models
    const { data: models } = useCMSData(
        'cms_wardrobe',
        [],
        (row: CMSWardrobeRow) => ({
            name: row.name,
            path: row.model_path,
            snapshot: row.thumbnail_url,
            // Fallback icons based on basic name matching
            icon: row.name.toLowerCase().includes('female') ? <PersonStanding size={24} /> : <Shirt size={24} />
        })
    );

    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

    // Show minimum 5 cards (empty placeholders if needed)
    const minCards = 5;
    const cardCount = Math.max(selectedShirts.length, minCards);
    const emptyCount = cardCount - selectedShirts.length;

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 relative z-50 flex items-center justify-between px-4 h-[50px] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-zinc-500 tracking-widest">
                        Closet
                    </span>
                    <div className="relative w-7 h-7 opacity-50">
                        <Image
                            src="/Icons/ClosetColored.png"
                            alt="Closet Icon"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600">
                        {selectedShirts.length}/10
                    </span>
                    <button
                        onClick={toggleClosetMode}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        {closetMode === 'stacked' ? <Plus size={12} /> : <Minus size={12} />}
                    </button>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    ref={scrollRef}
                    className={cn(
                        "absolute top-0 bottom-0 left-0 right-0 p-4 transition-all duration-500",
                        closetMode === 'expanded'
                            ? "overflow-y-auto"
                            : "flex items-center justify-center overflow-hidden"
                    )}
                >
                    <div className={cn(
                        "w-full transition-all duration-500",
                        closetMode === 'expanded' ? "flex flex-col gap-4" : "relative h-full flex items-center justify-center"
                    )}>
                        <AnimatePresence mode="popLayout">
                            {/* UNIFIED LIST: 3D Models Only */}
                            {models.map((model, i) => {
                                const isActive = selected3DModelPath === model.path;
                                const isHovered = hoveredIdx === i;

                                // Stack Logic for 3D Models
                                const boxIndex = i;
                                const totalItems = models.length;
                                const stackIndex = i;

                                const yPos = (stackIndex * 45) - (totalItems * 20); // Adjust to center
                                const effectiveScale = 1 - (totalItems - 1 - stackIndex) * 0.02;

                                return (
                                    <motion.div
                                        key={model.path}
                                        layout="position"
                                        className={cn(
                                            "rounded-lg overflow-hidden cursor-pointer group shadow-xl transition-all duration-300 relative",
                                            "aspect-[3/4] bg-zinc-900 border border-white/10",
                                            isActive && "ring-2 ring-inset ring-white/90 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] z-10 scale-[0.97]"
                                        )}
                                        style={{
                                            position: closetMode === 'stacked' ? 'absolute' : 'relative',
                                            width: closetMode === 'stacked' ? '35%' : '100%',
                                            zIndex: closetMode === 'stacked' ? stackIndex + (isHovered ? 100 : 0) : undefined,
                                        }}
                                        animate={closetMode === 'stacked' ? {
                                            y: (isHovered) ? yPos - 20 : yPos,
                                            scale: (isHovered) ? 1.02 : effectiveScale,
                                        } : {
                                            y: 0,
                                            scale: isActive ? 0.97 : 1,
                                        }}
                                        onClick={() => set3DModel(model.path)}
                                        onMouseEnter={() => setHoveredIdx(i)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    >
                                        {/* Static Snapshot Preview */}
                                        <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={model.snapshot}
                                                    alt={model.name}
                                                    fill
                                                    className="object-cover scale-125 transition-transform duration-500 group-hover:scale-[1.35]"
                                                />
                                            </div>
                                        </div>

                                        {/* Model Name Overlay */}
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                                            <span className="text-[10px] font-bold text-white uppercase text-center px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                                                {model.name}
                                            </span>
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Empty State Text for Expanded Mode */}
                        {closetMode === 'expanded' && selectedShirts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                                <IconGhost2Filled className="w-8 h-8 text-zinc-600" />
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                                    No Shirts Selected
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};