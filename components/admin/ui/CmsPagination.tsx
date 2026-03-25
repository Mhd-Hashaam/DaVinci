'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CmsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function CmsPagination({ currentPage, totalPages, onPageChange, className }: CmsPaginationProps) {
    if (totalPages <= 1) return null;

    // Logic to generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Complex pagination with ellipsis
            pages.push(1);
            
            if (currentPage > 4) {
                pages.push('...');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 3) {
                pages.push('...');
            }

            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className={cn("flex items-center justify-center gap-2 py-8", className)}>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-400 transition-all hover:border-[var(--primary)]/50 hover:bg-white/5 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                        return (
                            <span key={`ell-${idx}`} className="px-2 text-zinc-600 font-outfit text-sm">
                                ...
                            </span>
                        );
                    }

                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={cn(
                                "h-10 min-w-[40px] px-3 rounded-lg border font-outfit text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer",
                                isActive
                                    ? "bg-[var(--primary)] border-[var(--primary)] text-black shadow-[0_0_20px_rgba(197,165,114,0.3)]"
                                    : "border-white/5 bg-black/20 text-zinc-500 hover:border-white/10 hover:bg-white/5 hover:text-zinc-300"
                            )}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-400 transition-all hover:border-[var(--primary)]/50 hover:bg-white/5 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
