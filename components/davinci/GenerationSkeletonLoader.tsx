import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

export function GenerationSkeletonLoader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full aspect-square sm:aspect-video max-w-2xl mx-auto rounded-3xl overflow-hidden relative border border-white/10"
        >
            {/* Glassmorphic Base */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />

            {/* Pulsing Gradient Background */}
            <motion.div 
                className="absolute inset-0 opacity-40"
                animate={{
                    background: [
                        'radial-gradient(circle at 30% 30%, rgba(124,58,237,0.4) 0%, transparent 70%)',
                        'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.4) 0%, transparent 70%)',
                        'radial-gradient(circle at 30% 70%, rgba(236,72,153,0.4) 0%, transparent 70%)',
                        'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.4) 0%, transparent 70%)',
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror' }}
            />

            {/* Scanning Line Effect */}
            <motion.div 
                className="absolute left-0 right-0 h-[2px] blur-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            />

            {/* Content Centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mix-blend-plus-lighter">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    className="relative mb-6"
                >
                    <div className="absolute inset-0 animate-ping rounded-full bg-white/10 blur-xl" />
                    <Sparkles className="text-white/80 w-12 h-12" strokeWidth={1} />
                </motion.div>
                
                <h3 className="font-cormorant text-2xl font-light text-white mb-2 tracking-wide">
                    Distilling Pixels
                </h3>
                <div className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-zinc-400" />
                    <p className="font-outfit text-xs text-zinc-400 uppercase tracking-[0.2em]">
                        Applying DaVinci Core Filters
                    </p>
                </div>

                {/* Simulated Loading Bar */}
                <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 8, ease: "easeOut" }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
