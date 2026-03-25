'use client';

import React from 'react';
import { Brush } from 'lucide-react';
import { motion } from 'framer-motion';

export const LeVinCiBranding = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center mb-4 select-none"
        >
            <div className="flex items-center gap-5 group">
                {/* LeVinCi Text */}
                <h1 className="text-7xl md:text-[5.5rem] font-serif tracking-tight flex items-baseline relative z-10">
                    <span className="text-white drop-shadow-md italic pr-1">Le</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-indigo-100 to-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.2)]">VinCi</span>
                </h1>

                {/* Paint Brush Icon with Glow - Moved after text */}
                <div className="relative mt-2">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/40 transition-colors duration-500" />
                    <Brush 
                        size={52} 
                        className="text-indigo-400 relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transform rotate-12 group-hover:rotate-45 transition-transform duration-500"
                        strokeWidth={1.5}
                    />
                </div>
            </div>
        </motion.div>
    );
};
