'use client';

import React from 'react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Model3DViewer = dynamic(() => import('../tryon/Model3DViewer').then(mod => mod.Model3DViewer), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span className="text-xs text-white/50 font-medium tracking-widest uppercase">Loading 3D Engine...</span>
            </div>
        </div>
    )
});
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
        shirtColor, setShirtColor
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

                {/* Right side (Empty space to balance the header) */}
                <div className="w-10" />
            </div>

            {/* Preview Area with Vertical Color Selector */}
            <div className="flex-1 relative flex items-center justify-center p-0 overflow-hidden bg-zinc-900/50">
                {/* Vertical Color Selector - Minimalist & Animated */}
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
                                    : "opacity-60 hover:opacity-100 hover:scale-105 cursor-pointer"
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
                                                : "opacity-60 hover:opacity-100 hover:scale-105 cursor-pointer"
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
                        className="w-8 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                        <motion.div
                            animate={{ rotate: isColorExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown size={12} />
                        </motion.div>
                    </button>
                </div>

                {/* 3D Viewer Area */}
                <div ref={mirrorContainerRef} className="relative w-full h-full flex justify-center">
                    <div className="relative w-full h-full">
                        {/* Full Size 3D Canvas */}
                        <Model3DViewer />
                    </div>
                </div>

                {/* Floating Action Buttons (Add to Bag / Save) */}
                <div className="absolute bottom-6 right-6 flex flex-col items-center gap-4 z-30">
                    {/* Save Progress Button */}
                    <SaveProgressButton mirrorRef={mirrorContainerRef} />
                </div>
            </div>
        </div>
    );
};
