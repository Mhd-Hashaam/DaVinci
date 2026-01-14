'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, Bookmark, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DaVinciProfileTimeline() {
    const activities = [
        { id: 1, type: 'create', label: 'Generated "Cyberpunk Neo-Tokyo"', time: '2 mins ago', icon: Zap, color: 'text-yellow-400' },
        { id: 2, type: 'like', label: 'Liked "Ethereal Dreamscape"', time: '1 hour ago', icon: Heart, color: 'text-red-400' },
        { id: 3, type: 'bookmark', label: 'Bookmarked "Obsidian Palace"', time: '4 hours ago', icon: Bookmark, color: 'text-blue-400' },
        { id: 4, type: 'settings', label: 'Updated Avatar Matrix', time: '1 day ago', icon: Settings, color: 'text-zinc-400' },
        { id: 5, type: 'create', label: 'Generated "Vortex of Infinity"', time: '2 days ago', icon: Zap, color: 'text-yellow-400' },
    ];

    return (
        <div className="relative w-full bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/5 p-8 overflow-hidden">
            {/* Check Background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
                    Activity Matrix
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">SEQ_LOG: LIVE</span>
            </div>

            <div className="relative space-y-8">
                {/* Connecting Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/5" />

                {activities.map((activity, idx) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="relative pl-10 group"
                    >
                        {/* Static Bullet */}
                        <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-lg bg-black border border-white/10 flex items-center justify-center z-10 group-hover:border-white/20 transition-colors shadow-xl">
                            <activity.icon size={12} className={activity.color} />
                        </div>

                        <div>
                            <p className="text-xs text-zinc-200 font-medium leading-none mb-1 group-hover:text-white transition-colors">{activity.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-600 font-mono">{activity.time}</span>
                                <div className="h-px w-2 bg-zinc-800" />
                                <span className="text-[8px] text-zinc-700 uppercase tracking-tighter">Verified_Sync</span>
                            </div>
                        </div>

                        {/* Interactive hover glow */}
                        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10" />
                    </motion.div>
                ))}
            </div>

            {/* View Full History Button */}
            <button className="w-full mt-10 py-3 rounded-2xl border border-white/5 text-[10px] text-zinc-500 uppercase font-black tracking-widest hover:bg-white/5 hover:text-white transition-all">
                Full Sequence Log →
            </button>
        </div>
    );
}
