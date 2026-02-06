'use client';

import React from 'react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import RealisticShirtPreview from "../tryon";
import { Model3DViewer } from "../tryon/Model3DViewer";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveProgressButton } from './SaveProgressButton';

// Expanded Color palette for 3D mode (13 colors total)
const SHIRT_COLORS = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Charcoal', hex: '#1a1a1a' },
    { name: 'Dark Red', hex: '#7f1d1d' },
    { name: 'Navy Blue', hex: '#1e3a8a' },
    { name: 'Forest Green', hex: '#14532d' },
    // Expandable colors
    { name: 'Mustard', hex: '#713f12' },
    { name: 'Deep Purple', hex: '#581c87' },
    { name: 'Burnt Orange', hex: '#9a3412' },
    { name: 'Silver', hex: '#94a3b8' },
    { name: 'Brown', hex: '#44403c' },
    { name: 'Pink', hex: '#9f1239' },
    { name: 'Beige', hex: '#a8a29e' },
    { name: 'Olive', hex: '#3f6212' },
];

export const TheMirror: React.FC = () => {
    const {
        selectedShirts, activeShirtId, designs, activeDesignId,
        viewMode, setViewMode, shirtColor, setShirtColor
    } = useFittingRoomStore();

    const [isColorExpanded, setIsColorExpanded] = React.useState(false);
    const mirrorContainerRef = React.useRef<HTMLDivElement>(null);

    const activeShirt = selectedShirts.find(s => s.id === activeShirtId);
    const activeDesign = designs.find(d => d.id === activeDesignId);
    const hasSelection = activeShirt || activeDesign;

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            {/* Header with Mode Toggle */}
            <div className="flex-shrink-0 relative flex items-center justify-between px-4 h-[50px] border-b border-white/5">
                {/* Centered Title */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="text-[15px] font-bold text-zinc-500 tracking-widest">
                        TryOnMirror
                    </span>
                </div>

                {/* Left side (Empty space to balance the header) */}
                <div className="w-10" />

                {/* Right side: 2D/3D Toggle */}
                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
                    <button
                        onClick={() => setViewMode('2d')}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer",
                            viewMode === '2d'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-400 hover:text-white hover:bg-white/10"
                        )}
                    >
                        🖼️ 2D
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer",
                            viewMode === '3d'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-400 hover:text-white hover:bg-white/10"
                        )}
                    >
                        🧊 3D
                    </button>
                </div>
            </div>

            {/* Preview Area with Vertical Color Selector */}
            <div className="flex-1 relative flex items-center justify-center p-0 overflow-hidden bg-zinc-900/50">
                {/* Vertical Color Selector - Minimalist & Animated */}
                {viewMode === '3d' && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                        {/* Always visible Top 5 Colors */}
                        {SHIRT_COLORS.slice(0, 5).map((color) => (
                            <button
                                key={color.hex}
                                onClick={() => setShirtColor(color.hex)}
                                title={color.name}
                                className={cn(
                                    "w-8 h-5 rounded-full transition-all duration-300 shadow-md backdrop-blur-sm",
                                    shirtColor === color.hex
                                        ? "ring-2 ring-white scale-110 opacity-100"
                                        : "opacity-60 hover:opacity-100 hover:scale-105"
                                )}
                                style={{ backgroundColor: color.hex }}
                            />
                        ))}

                        {/* Expandable Colors with Smooth Animation */}
                        <AnimatePresence>
                            {isColorExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.8 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex flex-col gap-2 overflow-hidden items-center"
                                >
                                    {SHIRT_COLORS.slice(5).map((color) => (
                                        <button
                                            key={color.hex}
                                            onClick={() => setShirtColor(color.hex)}
                                            title={color.name}
                                            className={cn(
                                                "w-8 h-5 rounded-full transition-all duration-300 shadow-md backdrop-blur-sm",
                                                shirtColor === color.hex
                                                    ? "ring-2 ring-white scale-110 opacity-100"
                                                    : "opacity-60 hover:opacity-100 hover:scale-105"
                                            )}
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Minimalist Expand Button */}
                        <button
                            onClick={() => setIsColorExpanded(!isColorExpanded)}
                            className="w-8 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                            <motion.div
                                animate={{ rotate: isColorExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown size={12} />
                            </motion.div>
                        </button>
                    </div>
                )}

                {/* Conditional Rendering: 2D vs 3D */}
                <div ref={mirrorContainerRef} className="relative w-full h-full flex justify-center">
                    {viewMode === '3d' ? (
                        <div className="relative w-full h-full">
                            {/* Full Size 3D Canvas */}
                            <Model3DViewer />
                        </div>
                    ) : (
                        // Original 2D View
                        hasSelection ? (
                            <div className="relative w-full h-full flex items-center justify-center p-6">
                                <div className="relative h-full max-h-[calc(100%-2rem)] aspect-[3/4] flex-shrink-0">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden bg-black/20 border border-white/5 shadow-2xl">
                                        <div className="absolute inset-0">
                                            <RealisticShirtPreview />
                                        </div>

                                        {/* Selection Info Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                                            {activeShirt && (
                                                <p className="text-[10px] font-bold text-white uppercase tracking-wide mb-1">
                                                    {activeShirt.name} (Prototype)
                                                </p>
                                            )}
                                            {activeDesign && (
                                                <p className="text-[9px] text-zinc-400">
                                                    + {activeDesign.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty State
                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <RealisticShirtPreview />
                                </div>
                                <div className="z-10 mt-[450px] pointer-events-none">
                                    <p className="text-xs text-zinc-600 font-mono">
                                        REALISTIC TRY-ON ALPHA
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Floating Action Buttons (Add to Bag / Save) */}
                <div className="absolute bottom-6 right-6 flex flex-col items-center gap-4 z-30">
                    {/* Save Progress Button */}
                    <SaveProgressButton mirrorRef={mirrorContainerRef} />

                    {/* Add to Bag Button (Only when selection exists) */}
                    {hasSelection && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 shadow-xl border cursor-pointer",
                                    "bg-white text-black hover:bg-zinc-200 border-white/50 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                )}
                                title="Add to Bag"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                    <path d="M3 6h18" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </button>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold whitespace-nowrap bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                                Add
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
