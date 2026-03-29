import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Star, Clock, Sparkles, Search, X, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

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
    categories: { id: string; name: string; icon?: string | null }[];
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
    
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (offset: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

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
        <div className="sticky top-0 z-40 w-full bg-[#050505]/80 backdrop-blur-3xl border-b border-white/5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-5">
                
                {/* Primary Navigation Row: Search & Trends */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Integrated Search Bar - Premium Minimalist */}
                    <div className="relative group w-full lg:w-80 shrink-0">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search size={16} className="text-zinc-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Explore DaVinci creations..."
                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-12 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all font-medium"
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

                    <div className="hidden lg:block h-6 w-px bg-white/10 mx-2" />

                    {/* Premium Live Category Nav with Scroll Arrows */}
                    <div className="relative flex items-center w-full min-w-0 group/nav">
                        
                        {/* Left Gradient & Arrow */}
                        <div className="absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10 flex items-center">
                            <button 
                                onClick={() => scroll(-300)} 
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-all transform -translate-x-2 opacity-0 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 cursor-pointer shadow-xl border border-white/5 ml-1"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full px-4 py-1 scroll-smooth">
                            {filters.map((filter) => {
                                const isActive = activeFilter === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => handleFilterClick(filter.id)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-300 border cursor-pointer shrink-0 group",
                                            isActive
                                                ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                                : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                        )}
                                    >
                                        {filter.id === 'All' ? (
                                            <Sparkles size={14} className={isActive ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-300"} />
                                        ) : filter.icon ? (
                                            <div className="w-5 h-5 rounded overflow-hidden shrink-0 border border-white/10 bg-black/50">
                                                <img src={filter.icon} alt={filter.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <GripVertical size={14} className="text-zinc-600" />
                                        )}
                                        <span className={cn("tracking-wide", isActive ? "font-bold" : "font-medium")}>
                                            {filter.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Right Gradient & Arrow */}
                        <div className="absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-10 flex items-center justify-end">
                            <button 
                                onClick={() => scroll(300)} 
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-all transform translate-x-2 opacity-0 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 cursor-pointer shadow-xl border border-white/5 mr-1"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Row: Sorting & Stats */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mr-1">Sort by:</span>
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5">
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
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                        )}
                                    >
                                        <Icon size={12} className={cn(isActive ? "text-[#C5A572]" : "text-zinc-600")} />
                                        {sort.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em]">
                            <span className="text-white font-black">{totalResults}</span> Curated Graphics
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
