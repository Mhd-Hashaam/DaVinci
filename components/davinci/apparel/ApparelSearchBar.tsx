'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApparelSearchBarProps {
    className?: string;
    onSearch?: (query: string) => void;
}

export function ApparelSearchBar({ className, onSearch }: ApparelSearchBarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState('');

    const isActive = isHovered || isFocused || value.length > 0;

    return (
        <div
            className={cn("relative flex items-center justify-end h-10", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative flex items-center">
                {/* Input Container - Expands to Left */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                        width: isActive ? 180 : 0,
                        opacity: isActive ? 1 : 0
                    }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative overflow-hidden flex items-center h-full mr-3" // Margin right to space from icon
                >
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            onSearch?.(e.target.value);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search apparel..."
                        className="w-full bg-transparent border-none text-white text-sm font-light placeholder:text-zinc-600 focus:outline-none px-2 h-full z-10 text-left" // Fixed caret position
                    />

                    {/* Animated Underline - More visible */}
                    <motion.div
                        className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.3)]" // Brighter, slight glow
                        initial={{ width: '0%', left: '50%' }}
                        animate={{
                            width: isActive ? '100%' : '0%',
                            left: isActive ? '0%' : '50%'
                        }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </motion.div>

                {/* Search Icon */}
                <Search
                    size={18}
                    className={cn(
                        "text-zinc-400 z-20 transition-colors duration-300 cursor-pointer", // Added cursor-pointer
                        isActive ? "text-white" : "text-zinc-500"
                    )}
                    onClick={() => {
                        // Optional: Focus input on click if not already?
                        if (!isActive) setIsFocused(true);
                    }}
                />
            </div>
        </div>
    );
}
