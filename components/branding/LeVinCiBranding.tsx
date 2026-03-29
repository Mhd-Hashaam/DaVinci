'use client';

import React from 'react';
import { motion } from 'framer-motion';

const VEmblem = () => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(197,165,114,0.3)]">
        <path d="M12 16L32 48L52 16" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 16L32 32L42 16" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <defs>
            <linearGradient id="goldGrad" x1="32" y1="16" x2="32" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E5D1B0" />
                <stop offset="0.5" stopColor="#C5A572" />
                <stop offset="1" stopColor="#A88955" />
            </linearGradient>
        </defs>
    </svg>
);

export const LeVinCiBranding = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center mb-12 select-none w-full"
        >
            <div className="flex items-center justify-center gap-8 group">
                <div className="flex flex-col items-center translate-y-1">
                    <h1 className="text-8xl md:text-[8rem] font-cormorant font-light tracking-[-0.04em] leading-none flex items-baseline">
                        <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">Le</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F3E7D3] via-[#C5A572] to-[#8B6E3F] drop-shadow-[0_0_40px_rgba(197,165,114,0.2)] font-medium">VinCi</span>
                    </h1>
                    <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#C5A572]/40 to-transparent mt-1 shadow-[0_0_10px_rgba(197,165,114,0.3)]" />
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-colors duration-700" />
                    <motion.div
                        animate={{ 
                            x: [0, 4, 0],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <VEmblem />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
