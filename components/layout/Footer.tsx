'use client';

import React from 'react';
import { Brush, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Footer = () => {
    return (
        <div className="relative w-full flex flex-col items-center justify-end pb-0 mt-auto pointer-events-none">

            {/* "DaVinci is creating..." Section */}
            <div className="flex flex-col items-center gap-2 mb-6 pointer-events-auto">
                {/* Neon Icon */}
                <div className="relative group cursor-default">
                    <Brush
                        size={32}
                        className="text-transparent stroke-[2px]"
                        style={{
                            stroke: "url(#neon-gradient)",
                            filter: "drop-shadow(0 0 8px var(--lamp-glow))"
                        }}
                    />

                    {/* SVG Gradient Definition */}
                    <svg width="0" height="0" className="absolute">
                        <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--lamp-color)" />
                            <stop offset="100%" stopColor="white" stopOpacity="0.5" />
                        </linearGradient>
                    </svg>

                    {/* Subtle Glow Pulse */}
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 blur-xl rounded-full -z-10"
                        style={{ backgroundColor: 'var(--lamp-glow)' }}
                    />
                </div>

                <span className="text-sm font-medium text-zinc-400 tracking-wide">
                    DaVinci-Aura is creating...
                </span>
            </div>

            {/* Glass Navigation Tab */}
            {/* The shape is a trapezoid/tab rising from the bottom or floating pill */}
            <div className="relative pointer-events-auto">
                <div className={cn(
                    "flex items-center gap-8 px-12 py-3",
                    "bg-black/30 backdrop-blur-2xl",
                    "border-t border-r border-l",
                    "rounded-t-3xl", // Rounded top corners to mimic the tab shape
                    "shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300"
                )}
                    style={{ borderColor: 'var(--lamp-glow)' }}>
                    {['Community', 'Docs', 'Blog', 'Help'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-xs font-medium text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Shooting Star Decoration (Right side, floating) */}
                <motion.div
                    initial={{ x: 100, y: -50, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute -right-24 -top-12 pointer-events-none"
                >
                    <Sparkles size={24} style={{ color: 'var(--lamp-color)', filter: 'drop-shadow(0 0 10px var(--lamp-color))' }} />
                    <div className="absolute top-1/2 right-1/2 w-16 h-[1px] transform -rotate-45 origin-right opacity-50"
                        style={{ background: 'linear-gradient(to right, transparent, var(--lamp-color))' }} />
                </motion.div>
            </div>
        </div>
    );
};
