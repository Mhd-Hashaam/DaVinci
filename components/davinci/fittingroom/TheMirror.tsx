'use client';

import React from 'react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const TheMirror: React.FC = () => {
    const { selectedShirts, activeShirtId, designs, activeDesignId } = useFittingRoomStore();

    const activeShirt = selectedShirts.find(s => s.id === activeShirtId);
    const activeDesign = designs.find(d => d.id === activeDesignId);

    const hasSelection = activeShirt || activeDesign;

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-center px-4 h-[50px] border-b border-white/5">
                <span className="text-[15px] font-bold text-zinc-500 tracking-widest">
                    Mirror
                </span>
            </div>

            {/* Preview Area - Centered Shirt with Floating CTA */}
            <div className="flex-1 relative flex items-center justify-center p-6 pt-10 overflow-hidden">
                {hasSelection ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Shirt Preview Container - Center */}
                        <div className="relative h-full max-h-[calc(100%-2rem)] aspect-[3/4] flex-shrink-0">
                            {/* Visual Box (Rounded & Clip) */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden bg-black/20 border border-white/5 shadow-2xl">
                                {/* Shirt Layer */}
                                {activeShirt && (
                                    <Image
                                        src={activeShirt.image}
                                        alt={activeShirt.name}
                                        fill
                                        className="object-cover"
                                    />
                                )}

                                {/* Design Overlay (Placeholder) */}
                                {activeDesign && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative w-1/2 aspect-square opacity-80">
                                            <Image
                                                src={activeDesign.thumbnail}
                                                alt={activeDesign.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Selection Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    {activeShirt && (
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wide mb-1">
                                            {activeShirt.name}
                                        </p>
                                    )}
                                    {activeDesign && (
                                        <p className="text-[9px] text-zinc-400">
                                            + {activeDesign.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* CTA Button - Docked to the right of the shirt box */}
                            <div className="absolute left-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-3">
                                <button
                                    className={cn(
                                        "flex items-center justify-center w-14 h-14 rounded-full font-bold transition-all duration-300 shadow-xl border cursor-pointer",
                                        hasSelection
                                            ? "bg-white text-black hover:bg-zinc-200 border-white/50 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                            : "bg-black/40 text-zinc-600 border-white/5 cursor-not-allowed"
                                    )}
                                    disabled={!hasSelection}
                                    title="Add to Bag"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                        <path d="M3 6h18" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </button>
                                <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold whitespace-nowrap">
                                    Add to Bag
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center text-center gap-4 max-w-xs">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-3xl">👁️</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">
                                Preview Your Design
                            </p>
                            <p className="text-[10px] text-zinc-600 leading-relaxed">
                                Select a shirt from TheCloset and a design from TheArtWall to preview your custom creation
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

