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
    const mirrorContainerRef = React.useRef<HTMLDivElement>(null);

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

            {/* Preview Area */}
            <div className="flex-1 relative flex items-center justify-center p-0 overflow-hidden bg-transparent">
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
