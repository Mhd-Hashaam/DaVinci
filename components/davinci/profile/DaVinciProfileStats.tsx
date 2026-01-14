'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Eye, Heart, Share2, TrendingUp } from 'lucide-react';

export function DaVinciProfileStats() {
    const stats = [
        { label: 'Total Views', value: '42.8k', icon: Eye, color: 'text-blue-400', glow: 'bg-blue-500/10' },
        { label: 'Likes Received', value: '5.2k', icon: Heart, color: 'text-red-400', glow: 'bg-red-500/10' },
        { label: 'Shared Works', value: '891', icon: Share2, color: 'text-purple-400', glow: 'bg-purple-500/10' },
        { label: 'Global Rank', value: '#128', icon: TrendingUp, color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="relative group cursor-default"
                >
                    {/* Background Glass */}
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group-hover:border-white/20 transition-all duration-300" />

                    {/* Check Background */}
                    <div className="absolute inset-0 opacity-30 rounded-2xl pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Glow Effect */}
                    <div className={cn(
                        "absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-[8px] -z-10",
                        stat.glow
                    )} />

                    <div className="relative p-6 flex flex-col items-center text-center">
                        <div className={cn("p-2 rounded-xl bg-white/5 mb-3", stat.color)}>
                            <stat.icon size={20} />
                        </div>
                        <span className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">{stat.label}</span>
                    </div>

                    {/* Cyberpunk corner details */}
                    <div className="absolute top-2 right-2 w-1 h-1 bg-white/10 rounded-full" />
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/10 rounded-full" />
                </motion.div>
            ))}
        </div>
    );
}

// Small utility to avoid import error if cn isn't imported correctly in other files, 
// though it should be global.
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
