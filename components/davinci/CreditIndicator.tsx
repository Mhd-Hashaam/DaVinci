'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useCredits } from '@/lib/hooks/useCredits';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CreditIndicator() {
    const { user } = useAuth();
    const { credits, isLoading } = useCredits();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center gap-1.5 p-3 px-4 transition-all w-full cursor-not-allowed group">
                <div className="h-[1px] w-full bg-white/10 mb-3" />
                <div className="flex items-center gap-2 text-zinc-500 bg-white/5 rounded-full px-3 py-1.5 border border-white/5 shadow-inner">
                    <Sparkles size={12} className="opacity-50" />
                    <span className="font-outfit text-[9px] uppercase tracking-widest text-zinc-500 whitespace-nowrap">Sign in to Create</span>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-1.5 p-3 px-4 transition-all w-full">
                <div className="h-[1px] w-full bg-white/10 mb-3" />
                <div className="flex items-center justify-center p-2">
                    <Loader2 size={14} className="animate-spin text-zinc-600" />
                </div>
            </div>
        );
    }

    const isLow = credits !== null && credits <= 2;
    const isEmpty = credits === 0;

    return (
        <div className="flex flex-col items-center justify-center gap-1.5 p-3 px-4 transition-all w-full z-10">
            <div className="h-[1px] w-full bg-white/10 mb-3" />
            
            <div className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all duration-500 shadow-xl group",
                isEmpty ? "bg-red-500/5 text-red-500/70 border-red-500/20 shadow-red-500/5 cursor-not-allowed" :
                isLow ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-amber-500/10 cursor-default animate-pulse" : 
                "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)]/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] cursor-default"
            )}>
                <Sparkles size={12} className={cn(
                    "transition-transform",
                    !isEmpty && "group-hover:rotate-12"
                )} />
                <span className="font-outfit text-[10px] font-medium tracking-widest uppercase whitespace-nowrap">
                    {isEmpty ? 'Empty' : `${credits} Tokens`}
                </span>
            </div>
            
            {isEmpty && (
                <span className="font-outfit text-[8px] uppercase tracking-[0.2em] text-red-500/50 mt-1">
                    Refills at midnight
                </span>
            )}
        </div>
    );
}
