'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const TopLamp = ({ className }: { className?: string }) => {
    return (
        <div className={cn("absolute top-0 left-0 right-0 flex justify-center z-0 pointer-events-none", className)}>
            {/* 
        Lamp Effect Container 
        positioned absolutely at top center
      */}
            <div className="relative w-full max-w-5xl h-40 flex justify-center items-start">

                {/* Glow behind the lines (The "Lamp" ambient light) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-[-50%] w-[80%] h-32 bg-indigo-500/20 blur-[80px] rounded-full mix-blend-screen"
                />

                {/* Main Line Structure */}
                <div className="absolute top-0 w-full flex flex-col items-center">

                    {/* Longest/Dimmer Line */}
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                        className="relative h-[2px] w-full max-w-4xl bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-[2px]"
                    />
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                        className="absolute top-0 h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"
                    />

                    {/* Medium/Brighter Line */}
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "60%" }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
                        className="absolute top-0 h-[4px] w-full max-w-2xl bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-[4px]"
                    />
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "60%" }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
                        className="absolute top-0 h-[2px] w-full max-w-2xl bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    />

                    {/* Center Hotspot (The "Bulb") */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="absolute top-0 w-32 h-6 bg-cyan-400/30 blur-xl rounded-full"
                    />
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="absolute top-0 w-24 h-[3px] bg-white blur-[1px] rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};
