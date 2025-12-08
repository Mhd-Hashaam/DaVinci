import React from 'react';
import { Flame, Clock, Users, Star, Filter } from 'lucide-react';

interface ExploreFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    timeframe: string;
    onTimeframeChange: (timeframe: string) => void;
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
    activeFilter,
    onFilterChange,
    timeframe,
    onTimeframeChange
}) => {
    const filters = [
        { id: 'trending', label: 'Trending', icon: <Flame size={16} /> },
        { id: 'recent', label: 'New Arrivals', icon: <Clock size={16} /> },
        { id: 'top', label: 'Top Rated', icon: <Star size={16} /> },
        { id: 'following', label: 'Following', icon: <Users size={16} /> },
    ];

    const timeframes = ['Today', 'This Week', 'This Month', 'All Time'];

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${activeFilter === filter.id
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {filter.icon}
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-zinc-400 text-sm">
                    <Filter size={14} />
                    <span className="hidden sm:inline">Filter by:</span>
                </div>
                <select
                    value={timeframe}
                    onChange={(e) => onTimeframeChange(e.target.value)}
                    className="bg-white/5 border border-white/5 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                    {timeframes.map((tf) => (
                        <option key={tf} value={tf} className="bg-zinc-900 text-white">{tf}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ExploreFilters;
