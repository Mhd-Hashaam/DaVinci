'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Settings2, ChevronDown, Check, Zap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIModel } from '@/types/settings';
import { AspectRatio } from '@/types';
import { ASPECT_RATIOS } from '@/constants';
import { cn } from '@/lib/utils';

interface PromptCapsuleProps {
    onGenerate: (prompt: string) => void;
    isGenerating: boolean;
    model: AIModel;
    setModel: (model: AIModel) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    generationCount: 1 | 2 | 4 | 6 | 8;
    setGenerationCount: (count: 1 | 2 | 4 | 6 | 8) => void;
}

const placeholders = [
    "Imagine something amazing...",
    "A futuristic city with neon lights...",
    "Portrait of a cosmic astronaut...",
    "Enchanted forest at twilight...",
];

const models: { id: AIModel; label: string; icon?: any; image?: string; emoji?: string; color: string }[] = [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5', image: '/assets/models/gemini.png', color: 'text-blue-400' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5', image: '/assets/models/gemini.png', color: 'text-purple-400' },
    { id: 'imagen-3', label: 'Imagen 3', image: '/assets/models/imagen.png', color: 'text-pink-400' },
    { id: 'dalle-3', label: 'DALL-E 3', image: '/assets/models/dalle.png', color: 'text-green-400' },
    { id: 'midjourney-v6', label: 'Midjourney V6', image: '/assets/models/midjourney.png', color: 'text-white' },
];

const generationCounts = [1, 2, 4, 6, 8] as const;

const PromptCapsule: React.FC<PromptCapsuleProps> = ({
    onGenerate,
    isGenerating,
    model,
    setModel,
    aspectRatio,
    setAspectRatio,
    generationCount,
    setGenerationCount,
}) => {
    const [prompt, setPrompt] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState<'ratio' | 'model' | 'count' | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Rotate placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (prompt.trim() && !isGenerating) {
            onGenerate(prompt);
            setPrompt('');
            setActiveDropdown(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const currentModel = models.find(m => m.id === model) || models[0];

    return (
        <div className="w-full max-w-3xl mx-auto z-50 relative" ref={containerRef}>
            {/* Static Border Wrapper - Dynamic Theme */}
            <div
                className="relative p-[1px] rounded-full transition-all duration-300 shadow-xl"
                style={{ backgroundColor: 'var(--lamp-glow)' }}
            >
                {/* Inner Container - Transparent Glass */}
                <div className="flex items-center bg-black/40 backdrop-blur-2xl rounded-full px-4 py-2 gap-3 border border-white/5 relative">

                    {/* 1. Settings Button (Aspect Ratio) - Left Corner */}
                    <div className="relative">
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'ratio' ? null : 'ratio')}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10",
                                activeDropdown === 'ratio' ? "bg-white/10 text-white" : "text-zinc-400"
                            )}
                            title="Prompt Settings"
                        >
                            <Settings2 size={18} />
                        </button>

                        {/* Ratio Dropdown */}
                        <AnimatePresence>
                            {activeDropdown === 'ratio' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-14 left-0 w-64 p-4 bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">Aspect Ratio</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ASPECT_RATIOS.map((ratio) => {
                                            const isSelected = aspectRatio === ratio.value;
                                            return (
                                                <button
                                                    key={ratio.value}
                                                    onClick={() => { setAspectRatio(ratio.value); setActiveDropdown(null); }}
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 p-2 rounded-lg transition-all border",
                                                        isSelected
                                                            ? "bg-white/10 border-white/20 text-white"
                                                            : "border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "border rounded-[2px]",
                                                            isSelected ? "border-white bg-white/20" : "border-zinc-600"
                                                        )}
                                                        style={{
                                                            width: `${ratio.width}px`,
                                                            height: `${ratio.height}px`
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-medium">{ratio.label.split(' ')[0]}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    {/* 2. Text Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isGenerating ? "Creating your vision..." : placeholders[placeholderIndex]}
                        disabled={isGenerating}
                        className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-base font-medium min-w-0"
                    />

                    {/* 3. Generation Count Selector - Small */}
                    <div className="relative hidden sm:block">
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'count' ? null : 'count')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                activeDropdown === 'count'
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                            )}
                            title="Number of Images"
                        >
                            <Layers size={14} className={generationCount > 1 ? "text-indigo-400" : "text-zinc-400"} />
                            <span>{generationCount}</span>
                            <ChevronDown size={12} className={cn("transition-transform", activeDropdown === 'count' && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {activeDropdown === 'count' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-14 right-0 w-32 p-1.5 bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {generationCounts.map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => { setGenerationCount(count); setActiveDropdown(null); }}
                                            className={cn(
                                                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-all",
                                                generationCount === count ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <span className="text-xs font-medium">{count} Image{count > 1 ? 's' : ''}</span>
                                            {generationCount === count && <Check size={12} className="text-indigo-400" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 4. Model Selector - Small */}
                    <div className="relative hidden sm:block">
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'model' ? null : 'model')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                activeDropdown === 'model'
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                            )}
                        >
                            {currentModel.image ? (
                                <img src={currentModel.image} alt={currentModel.label} className="w-4 h-4 rounded-sm" />
                            ) : (
                                <Zap size={12} className={currentModel.color} />
                            )}
                            <span className="max-w-[80px] truncate">{currentModel.label.replace('Gemini ', '')}</span>
                            <ChevronDown size={12} className={cn("transition-transform", activeDropdown === 'model' && "rotate-180")} />
                        </button>

                        {/* Model Dropdown */}
                        <AnimatePresence>
                            {activeDropdown === 'model' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-14 right-0 w-60 p-2 bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="flex flex-col gap-1">
                                        {models.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setModel(m.id); setActiveDropdown(null); }}
                                                className={cn(
                                                    "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-all",
                                                    model === m.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                                )}
                                            >
                                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/5">
                                                    {m.image ? (
                                                        <img src={m.image} alt={m.label} className="w-full h-full object-cover rounded-lg" />
                                                    ) : <Zap size={14} className={m.color} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold truncate">{m.label}</div>
                                                </div>
                                                {model === m.id && <Check size={14} className="text-emerald-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 5. Generate Button */}
                    <motion.button
                        onClick={() => handleSubmit()}
                        disabled={!prompt.trim() || isGenerating}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                        style={{
                            background: prompt.trim() && !isGenerating
                                ? `linear-gradient(135deg, var(--lamp-color) 0%, rgba(var(--lamp-color-rgb), 0.8) 50%, rgba(var(--lamp-color-rgb), 0.6) 100%)`
                                : 'rgba(255,255,255,0.05)',
                            color: prompt.trim() && !isGenerating ? 'white' : '#71717a',
                            boxShadow: prompt.trim() && !isGenerating ? '0 0 20px var(--lamp-glow)' : 'none'
                        }}
                        whileHover={prompt.trim() && !isGenerating ? { scale: 1.05 } : {}}
                        whileTap={prompt.trim() && !isGenerating ? { scale: 0.95 } : {}}
                    >
                        {isGenerating ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles size={16} />
                                <span className="hidden sm:inline">Generate</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default PromptCapsule;
