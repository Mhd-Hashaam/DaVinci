'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconGhost2Filled } from '@tabler/icons-react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const TheCloset: React.FC = () => {
    const {
        selectedShirts,
        activeShirtId,
        setActiveShirt,
        removeShirt,
        closetMode,
        toggleClosetMode,
        triggerApparelView
    } = useFittingRoomStore();

    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

    // Show minimum 5 cards (empty placeholders if needed)
    const minCards = 5;
    const cardCount = Math.max(selectedShirts.length, minCards);
    const emptyCount = cardCount - selectedShirts.length;

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 relative z-50 flex items-center justify-between px-4 h-[50px] border-b border-white/5">
                <span className="text-[15px] font-bold text-zinc-500 tracking-widest">
                    Closet
                </span>
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
                    className={cn(
                        "absolute top-0 bottom-0 left-0 right-3 p-4 transition-all duration-500",
                        closetMode === 'expanded'
                            ? "overflow-y-auto container-scroll"
                            : "flex items-center justify-center overflow-hidden"
                    )}
                >
                    <div className={cn(
                        "w-full transition-all duration-500",
                        closetMode === 'expanded' ? "flex flex-col gap-4" : "relative h-full flex items-center justify-center"
                    )}>
                        <AnimatePresence mode="popLayout">
                            {/* UNIFIED LIST: Render a fixed number of slots (e.g., 5 or 10) that can be either Real Shirts or Empty Slots */}
                            {Array.from({ length: Math.max(selectedShirts.length + emptyCount, 6) }).map((_, i) => { // Increased min count to 6 for even grid
                                const shirt = selectedShirts[i];
                                const isRealShirt = !!shirt;

                                // Common Props
                                const isActive = isRealShirt && shirt.id === activeShirtId;
                                const isHovered = hoveredIdx === i;
                                const showGrayscale = closetMode === 'stacked' && hoveredIdx !== null && hoveredIdx !== i;

                                // Calculate visual position in stack
                                const boxIndex = isRealShirt
                                    ? emptyCount + i
                                    : (i - selectedShirts.length);

                                const totalItems = selectedShirts.length + emptyCount;
                                const isFrontCard = boxIndex === totalItems - 1;
                                // More vertical offset so ~30% of back cards are visible
                                const yPos = (boxIndex * 45) - 130;
                                const effectiveScale = 1 - (totalItems - 1 - boxIndex) * 0.02;

                                const key = isRealShirt ? shirt.id : `empty-slot-${i}`;

                                return (
                                    <motion.div
                                        key={key}
                                        layout="position"
                                        className={cn(
                                            "rounded-lg overflow-hidden cursor-pointer group shadow-xl transition-all duration-300 relative",
                                            "aspect-[3/4]",
                                            isRealShirt
                                                ? "bg-zinc-900 border border-white/10"
                                                : "bg-zinc-900 border border-white/10",
                                            // Enhanced Active Indicator: Glow + Border (INSET to avoid clipping)
                                            isActive && "ring-2 ring-inset ring-white/90 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] z-10 scale-[0.97]"
                                        )}
                                        style={{
                                            position: closetMode === 'stacked' ? 'absolute' : 'relative',
                                            width: closetMode === 'stacked' ? '75%' : '100%',
                                            zIndex: closetMode === 'stacked' ? boxIndex + (isHovered ? 100 : 0) : undefined,
                                        }}
                                        animate={closetMode === 'stacked' ? {
                                            y: (!isFrontCard && isHovered) ? yPos - 20 : yPos,
                                            scale: (!isFrontCard && isHovered) ? 1.02 : effectiveScale,
                                        } : {
                                            y: 0,
                                            // Active card scales down slightly in expanded mode
                                            scale: isActive ? 0.97 : 1,
                                        }}
                                        transition={{
                                            layout: { duration: 0.5, type: 'spring', bounce: 0.15 },
                                            default: { duration: 0.4 }
                                        }}
                                        onMouseEnter={() => {
                                            setHoveredIdx(i);
                                            // Trigger Select on Hover for real shirts
                                            if (isRealShirt) {
                                                setActiveShirt(shirt.id);
                                            }
                                        }}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    // onClick removed for selection, kept for simple interaction if needed (none for now)
                                    >
                                        {isRealShirt ? (
                                            <>
                                                <Image
                                                    src={shirt.image}
                                                    alt={shirt.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <span className={cn(
                                                        "font-bold text-white uppercase tracking-wide",
                                                        "text-[9px]"
                                                    )}>
                                                        {shirt.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeShirt(shirt.id);
                                                    }}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Trash2 size={10} className="text-white/70 hover:text-white" />
                                                </button>
                                            </>
                                        ) : (
                                            // Empty Slot Content - Styled like a Product Card
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerApparelView();
                                                }}
                                                className="flex flex-col items-center justify-center h-full opacity-30 group-hover:opacity-100 transition-all duration-300 pointer-events-auto"
                                            >
                                                <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                    <Plus className="w-3 h-3 text-white/50 group-hover:text-white" />
                                                </div>
                                                <span className="text-[8px] text-zinc-600 group-hover:text-zinc-400 font-bold uppercase tracking-widest">
                                                    {i === selectedShirts.length ? "Add" : "Empty"}
                                                </span>
                                            </div>
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