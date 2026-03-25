'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplorePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const ExplorePagination: React.FC<ExplorePaginationProps> = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    className 
}) => {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className={cn("flex items-center justify-center gap-4 py-12", className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-0 transition-all cursor-pointer"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
                {getPages().map((page, i) => (
                    <React.Fragment key={i}>
                        {page === '...' ? (
                            <span className="w-8 text-center text-zinc-700 text-[10px] font-bold tracking-widest">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className={cn(
                                    "w-10 h-10 rounded-full text-[11px] font-black tracking-widest transition-all duration-500 cursor-pointer relative",
                                    page === currentPage 
                                        ? "text-white" 
                                        : "text-zinc-600 hover:text-zinc-400"
                                )}
                            >
                                {page === currentPage && (
                                    <div 
                                        className="absolute inset-0 rounded-full opacity-20 blur-md -z-10"
                                        style={{ backgroundColor: 'var(--lamp-color)' }}
                                    />
                                )}
                                {page === currentPage && (
                                    <div 
                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-[0_0_8px_var(--lamp-color)]"
                                        style={{ backgroundColor: 'var(--lamp-color)' }}
                                    />
                                )}
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-0 transition-all cursor-pointer"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};
