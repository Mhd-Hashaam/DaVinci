'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    count?: number;
    rows?: number;
}

export function ProfileGallerySkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse"
                >
                    {/* Decorative HUD corners in skeleton to maintain immersion */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/5 rounded-tl-[2rem]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/5 rounded-br-[2rem]" />

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
            ))}
        </div>
    );
}

export function ProfileSectionHeaderSkeleton() {
    return (
        <div className="flex items-center gap-4 mb-4 animate-pulse">
            <div className="w-4 h-4 rounded bg-white/10" />
            <div className="w-32 h-4 bg-white/10 rounded" />
            <div className="flex-1 h-px bg-white/5" />
        </div>
    );
}

export function DaVinciProfileSkeleton() {
    return (
        <div className="space-y-12 py-8">
            {/* Session Resumption Skeleton */}
            <div>
                <ProfileSectionHeaderSkeleton />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl border border-white/5 bg-white/[0.02] animate-pulse relative">
                            <div className="absolute bottom-3 left-3 w-1/2 h-2 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bookmarks Skeleton */}
            <div>
                <ProfileSectionHeaderSkeleton />
                <ProfileGallerySkeleton count={3} />
            </div>

            {/* Creations Archive Skeleton */}
            <div>
                <ProfileSectionHeaderSkeleton />
                <ProfileGallerySkeleton count={6} />
            </div>
        </div>
    );
}
