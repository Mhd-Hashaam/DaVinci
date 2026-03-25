'use client';

import React from 'react';
import { Eye, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CMSGalleryRow } from '@/types/cms';

interface DashboardGalleryCardProps {
    item?: CMSGalleryRow;
    // Fallbacks for static demo
    title?: string;
    date?: string;
    likes?: number;
    views?: number;
    gradient?: string;
}

export function DashboardGalleryCard({ item, title, date, likes, views, gradient }: DashboardGalleryCardProps) {
    const displayTitle = item?.title || title || 'Untitled';
    const displayDate = item?.created_at 
        ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : date || 'Recently';
    
    return (
        <div className="group relative overflow-hidden rounded-xl cursor-pointer bg-zinc-950" style={{ aspectRatio: '3.5/4.2' }}>
            {/* Background: Image or Gradient */}
            {item?.storage_url ? (
                <img 
                    src={item.storage_url} 
                    alt={displayTitle}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110"
                />
            ) : (
                <div className={cn("absolute inset-0 bg-gradient-to-b opacity-80 transition-transform duration-1000 group-hover:scale-105", gradient || 'from-zinc-800 to-black')} />
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-10 transition-opacity duration-700" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="font-cormorant text-base font-light text-white/90 leading-tight mb-1 truncate">{displayTitle}</h4>
                <p className="font-outfit text-[8px] uppercase tracking-[0.2em] text-zinc-600 mb-3">{displayDate}</p>
                
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="flex items-center gap-1.5 font-outfit text-[9px] text-zinc-500">
                        <Gem size={9} className="text-[var(--primary)] opacity-60" /> {(likes || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-outfit text-[9px] text-zinc-500">
                        <Eye size={9} /> {(views || 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
