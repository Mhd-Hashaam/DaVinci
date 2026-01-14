import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Star, Clock, Sparkles } from 'lucide-react';

const TRENDS = [
    { id: 'All', label: 'All', icon: Sparkles },
    { id: 'Christmas', label: 'Christmas', icon: null },
    { id: 'Ramadan', label: 'Ramadan', icon: null },
    { id: 'Cats', label: 'Cats', icon: null },
    { id: 'Featured', label: 'Featured', icon: null },
    { id: 'Abstract', label: 'Abstract', icon: null },
];

const SORTS = [
    { id: 'popular', label: 'Popular', icon: Flame },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'top_rated', label: 'Top Rated', icon: Star },
];

interface ExploreFilterBarProps {
    onFilterChange: (filter: string) => void;
    onSortChange: (sort: string) => void;
}

export const ExploreFilterBar: React.FC<ExploreFilterBarProps> = ({ onFilterChange, onSortChange }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('popular');

    const handleFilterClick = (id: string) => {
        setActiveFilter(id);
        onFilterChange(id);
    };

    const handleSortClick = (id: string) => {
        setActiveSort(id);
        onSortChange(id);
    };

    return (
        <div className="sticky top-0 z-40 py-2 bg-black/50 backdrop-blur-xl border-b border-white/5">
            <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-4">

                {/* 1. Trends Row (Scrollable) */}
                <div className="overflow-x-auto no-scrollbar mask-gradient-right">
                    <div className="flex items-center gap-2 min-w-max pb-2">
                        {TRENDS.map((trend) => {
                            const Icon = trend.icon;
                            const isActive = activeFilter === trend.id;
                            return (
                                <button
                                    key={trend.id}
                                    onClick={() => handleFilterClick(trend.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                        isActive
                                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                            : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {Icon && <Icon size={12} className={isActive ? "text-black" : "text-zinc-400"} />}
                                    {trend.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 2. Sort & Sub-filters Row */}
                <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                        {SORTS.map((sort) => {
                            const Icon = sort.icon;
                            const isActive = activeSort === sort.id;
                            return (
                                <button
                                    key={sort.id}
                                    onClick={() => handleSortClick(sort.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                        isActive
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    <Icon size={10} />
                                    {sort.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="text-[10px] text-zinc-600 font-mono">
                        Showing 324 results
                    </div>
                </div>
            </div>
        </div>
    );
};
