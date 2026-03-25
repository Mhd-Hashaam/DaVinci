import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Star, Clock, Sparkles, Search, X } from 'lucide-react';

const SORTS = [
    { id: 'popular', label: 'Popular', icon: Flame },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'top_rated', label: 'Top Rated', icon: Star },
];

interface ExploreFilterBarProps {
    onFilterChange: (filter: string) => void;
    onSortChange: (sort: string) => void;
    onSearchChange: (search: string) => void;
    totalResults: number;
    categories: { id: string; name: string }[];
}

export const ExploreFilterBar: React.FC<ExploreFilterBarProps> = ({ 
    onFilterChange, 
    onSortChange,
    onSearchChange,
    totalResults,
    categories,
}) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('popular');
    const [searchValue, setSearchValue] = useState('');

    const handleFilterClick = (id: string) => {
        setActiveFilter(id);
        onFilterChange(id);
    };

    const handleSortClick = (id: string) => {
        setActiveSort(id);
        onSortChange(id);
    };

    const handleSearchChange = (val: string) => {
        setSearchValue(val);
        onSearchChange(val);
    };

    const filters = [{ id: 'All', name: 'All' }, ...categories];

    return (
        <div className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-2xl border-b border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-4">
                
                {/* Primary Navigation Row: Search & Trends */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Integrated Search Bar - Premium Minimalist */}
                    <div className="relative group w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search size={16} className="text-zinc-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Explore DaVinci creations..."
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all"
                        />
                        <AnimatePresence>
                            {searchValue && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => handleSearchChange('')}
                                    className="absolute inset-y-0 right-3 flex items-center px-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Live Category Filters */}
                    <div className="overflow-x-auto no-scrollbar mask-fade-right">
                        <div className="flex items-center gap-2 min-w-max">
                            {filters.map((filter) => {
                                const isActive = activeFilter === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => handleFilterClick(filter.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border cursor-pointer !shadow-none !before:hidden !after:hidden",
                                            isActive
                                                ? "bg-white/[0.12] border-white/40 text-white ring-1 ring-white/20 backdrop-blur-md"
                                                : "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                                        )}
                                    >
                                        {filter.id === 'All' && <Sparkles size={12} className={isActive ? "text-white" : "text-zinc-500"} />}
                                        {filter.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Secondary Row: Sorting & Stats */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mr-2">Sort by:</span>
                        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
                            {SORTS.map((sort) => {
                                const Icon = sort.icon;
                                const isActive = activeSort === sort.id;
                                return (
                                    <button
                                        key={sort.id}
                                        onClick={() => handleSortClick(sort.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                                            isActive
                                                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                                                : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        <Icon size={12} className={cn(isActive ? "text-purple-400" : "text-zinc-600")} />
                                        {sort.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-px w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-[0.25em]">
                            <span className="text-white font-black">{totalResults}</span> Curated Graphics
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
