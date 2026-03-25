import React from 'react';
import { cn } from '@/lib/utils';

interface FeedSkeletonProps {
  count?: number;
  className?: string;
}

export function FeedSkeleton({ count = 8, className }: FeedSkeletonProps) {
  return (
    <div className={cn("columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-20", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "break-inside-avoid relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse",
            // Variety in heights for masonry feel
            i % 4 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-square" : i % 2 === 0 ? "aspect-[4/3]" : "aspect-[9/16]"
          )}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          
          {/* Bottom metadata placeholders */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="h-3 w-1/2 bg-white/5 rounded" />
            <div className="h-2 w-1/4 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
