'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Maximize2, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedImage } from '@/types';

interface DaVinciProfileGalleryProps {
    images: GeneratedImage[];
}

export function DaVinciProfileGallery({ images }: DaVinciProfileGalleryProps) {
    if (images.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-32 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                    <Maximize2 className="text-zinc-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Zero Artifacts Detected</h3>
                <p className="text-zinc-500 text-sm max-w-xs text-center">Your neural gallery is empty. Initialize your first generation to begin storage.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, idx) => (
                <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 + 0.5 }}
                    whileHover={{ y: -8, transition: { duration: 0.4 } }}
                    className="relative group aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl"
                >
                    {/* Image */}
                    <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />

                    {/* Glass Overlay (Cyberpunk HUD style) */}
                    <div className="absolute inset-x-4 bottom-4 p-5 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-mono text-cyan-400 tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">ID_{img.id.slice(0, 8)}</span>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"><Share2 size={12} /></button>
                                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white transition-colors"><MoreHorizontal size={12} /></button>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-medium mb-4 italic">
                            "{img.prompt}"
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <button className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest hover:text-cyan-400 transition-colors">
                                View Full <ExternalLink size={10} />
                            </button>
                            <span className="text-[9px] text-zinc-600 font-mono">1024x1024_PNG</span>
                        </div>
                    </div>

                    {/* Decorative Corner Elements */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-white/10 rounded-tl-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-white/10 rounded-br-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
            ))}
        </div>
    );
}
