import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const CREATORS = [
    { id: 1, name: 'Aurora', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', isLive: true, status: 'Trending' },
    { id: 2, name: 'PixelMage', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80', isLive: false, status: 'Top Rated' },
    { id: 3, name: 'Visionary', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&q=80', isLive: true, status: 'New' },
    { id: 4, name: 'CyberSaint', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80', isLive: false, status: 'Pro' },
    { id: 5, name: 'NeonDreams', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80', isLive: true, status: 'Live' },
    { id: 6, name: 'GlitchArt', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&q=80', isLive: false, status: 'Rising' },
    { id: 7, name: 'AIOps', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80', isLive: false, status: 'Expert' },
    { id: 8, name: 'DesignBot', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', isLive: true, status: 'Featured' },
];

export const CreatorsRail = () => {
    return (
        <div className="w-full py-6 overflow-x-auto no-scrollbar">
            <div className="flex items-start gap-6 px-4 min-w-max">
                {/* Your Story / Add */}
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="relative w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-zinc-700/50 group-hover:border-zinc-500 transition-colors">
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                            <Plus size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                            <Plus size={10} className="text-white" />
                        </div>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">You</span>
                </div>

                {/* Creators List */}
                {CREATORS.map((creator, index) => (
                    <motion.div
                        key={creator.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col items-center gap-2 cursor-pointer group relative"
                    >
                        {/* Avatar Ring */}
                        <div className={cn(
                            "relative w-16 h-16 rounded-full p-[2px] transition-all duration-300",
                            creator.isLive
                                ? "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 animate-spin-slow"
                                : "bg-gradient-to-tr from-purple-500/50 to-blue-500/50 group-hover:from-purple-400 group-hover:to-blue-400"
                        )}>
                            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
                                <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Live Badge */}
                            {creator.isLive && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 px-1.5 py-0.5 rounded-sm border-2 border-black">
                                    <span className="text-[8px] font-black text-white uppercase tracking-wider block leading-none">LIVE</span>
                                </div>
                            )}
                        </div>

                        {/* Name & Status */}
                        <div className="text-center">
                            <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors block leading-tight">
                                {creator.name}
                            </span>
                            {!creator.isLive && (
                                <span className="text-[9px] text-zinc-600 block">{creator.status}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
