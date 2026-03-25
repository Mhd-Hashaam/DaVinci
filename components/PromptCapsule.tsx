'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Settings2, ChevronDown, Check, Zap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIModel } from '@/types/settings';
import { AspectRatio } from '@/types';
import { cn } from '@/lib/utils';

const ASPECT_RATIOS: { value: AspectRatio; label: string; width: number; height: number }[] = [
  { value: '3:4', label: 'Standard Front', width: 15, height: 20 },
  { value: '4:5', label: 'Art Print', width: 16, height: 20 },
  { value: '1:1', label: 'Square', width: 18, height: 18 },
  { value: '2:3', label: 'Poster', width: 14, height: 21 },
  { value: '5:7', label: 'Photo', width: 15, height: 21 },
  { value: '16:9', label: 'Landscape', width: 24, height: 14 },
];

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
    const [activeDropdown, setActiveDropdown] = useState<'ratio' | 'model' | 'count' | 'enhance' | null>(null);
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
        <div className="w-full max-w-5xl mx-auto z-50 relative" ref={containerRef}>
            {/* Main Prompt Bar - Rectangular Leonardo Style */}
            <div 
                className="relative flex items-center px-5 py-4 gap-3 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-white/20"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 15, 20, 0.4), rgba(15, 15, 20, 0.6)), url('/Mockups/Background.webp')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                }}
            >
                {/* 1. Settings Button (Aspect Ratio) - Left Corner */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setActiveDropdown(activeDropdown === 'ratio' ? null : 'ratio')}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 cursor-pointer",
                            activeDropdown === 'ratio' ? "bg-white/10 text-white" : "text-zinc-400"
                        )}
                        title="Prompt Settings"
                    >
                        <Settings2 size={20} />
                    </button>

                    {/* Ratio Dropdown */}
                    <AnimatePresence>
                        {activeDropdown === 'ratio' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full mt-3 left-0 w-64 p-4 border border-white/20 backdrop-blur-3xl rounded-xl shadow-2xl z-50 overflow-hidden"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(15, 15, 20, 0.6), rgba(15, 15, 20, 0.8)), url('/Mockups/Background.webp')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center center',
                                }}
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

                {/* 2. Text Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isGenerating ? "Creating your vision..." : placeholders[placeholderIndex]}
                    disabled={isGenerating}
                    className="flex-1 bg-transparent text-white placeholder-zinc-400 outline-none text-lg font-medium min-w-0 px-2"
                />

                {/* 3. Sparkles Enhance Button */}
                <div className="relative shrink-0 flex items-center">
                    <button
                        onClick={() => setActiveDropdown(activeDropdown === 'enhance' ? null : 'enhance')}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 cursor-pointer",
                            activeDropdown === 'enhance' ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                        )}
                        title="Prompt Features"
                    >
                        <Sparkles size={20} />
                    </button>

                    {/* Enhance Prompt Dropdown */}
                    <AnimatePresence>
                        {activeDropdown === 'enhance' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-3 w-72 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-3xl"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(15, 15, 20, 0.6), rgba(15, 15, 20, 0.8)), url('/Mockups/Background.webp')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center center',
                                }}
                            >
                                <div className="flex flex-col p-2 gap-1">
                                    <button className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                                        <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white">New Random Prompt</span>
                                            <span className="text-xs text-zinc-500">Generate a random prompt with AI.</span>
                                        </div>
                                    </button>

                                    <button className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                                        <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                                            <Sparkles size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white">Improve Prompt</span>
                                            <span className="text-xs text-zinc-500">Improve your current prompt.</span>
                                        </div>
                                    </button>

                                    <button className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                                        <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2z"></path><path d="M8 18h1"></path><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z"></path></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white">Edit With AI</span>
                                            <span className="text-xs text-zinc-500">Use AI to make quick changes to your prompt.</span>
                                        </div>
                                    </button>

                                    <button className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                                        <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m16 13-3.5 3.5c-.7.7-1.5 1-2.5 1C8.3 17.5 7 16 7 14s1.5-3.5 3-3.5c1 0 1.8.3 2.5 1L16 15"></path></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white">Describe With AI</span>
                                            <span className="text-xs text-zinc-500">Upload an image and generate its description.</span>
                                        </div>
                                    </button>
                                </div>
                                <div className="border-t border-white/5 bg-white/5 px-4 py-2 text-center">
                                    <span className="text-xs font-semibold text-zinc-400">100 Prompts</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Generate Button */}
                <button
                    onClick={() => handleSubmit()}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center justify-center px-8 py-3 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    style={{
                        background: prompt.trim() && !isGenerating 
                            ? 'linear-gradient(to right, #6366f1, #a855f7)' 
                            : 'rgba(255,255,255,0.08)',
                        color: prompt.trim() && !isGenerating ? 'white' : '#71717a',
                        border: prompt.trim() && !isGenerating 
                            ? '1px solid rgba(168,85,247,0.5)' 
                            : '1px solid transparent',
                        boxShadow: prompt.trim() && !isGenerating 
                            ? '0 0 20px rgba(99,102,241,0.4)' 
                            : 'none'
                    }}
                >
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span>Generate</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PromptCapsule;
