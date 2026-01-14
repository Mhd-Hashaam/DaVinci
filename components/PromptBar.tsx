import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, ChevronDown, Zap, Sparkles, Palette, Crop, Wand2, Film, Aperture, Box, Heart, Brush, Check, RectangleHorizontal } from 'lucide-react';
import { AspectRatio } from '../types';
import { AIModel, StylePreset } from '../types/settings';
import { ASPECT_RATIOS } from '../constants';

interface PromptBarProps {
    onGenerate: (prompt: string, aspectRatio: AspectRatio | AspectRatio[]) => void;
    isGenerating: boolean;
    model: AIModel;
    setModel: (model: AIModel) => void;
    aspectRatio: AspectRatio | AspectRatio[];
    setAspectRatio: (ratio: AspectRatio | AspectRatio[]) => void;
    style: StylePreset;
    setStyle: (style: StylePreset) => void;
}

const PromptBar: React.FC<PromptBarProps> = ({
    onGenerate,
    isGenerating,
    model,
    setModel,
    aspectRatio,
    setAspectRatio,
    style,
    setStyle
}) => {
    const [prompt, setPrompt] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<'model' | 'ratio' | 'style' | null>(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const placeholders = [
        "A futuristic cyberpunk city with neon lights and flying cars...",
        "Portrait of an astronaut floating in a colorful nebula...",
        "Minimalist geometric abstract composition with pastel gradients...",
        "A cozy cottage in a magical forest with glowing mushrooms at twilight...",
        "Synthwave sunset over a neon grid landscape, retro 80s style..."
    ];

    // Rotate placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [placeholders.length]);


    const models: { id: AIModel; label: string; icon?: any; image?: string; emoji?: string; color: string }[] = [
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', image: '/assets/models/gemini.png', color: 'text-blue-400' },
        { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', image: '/assets/models/gemini.png', color: 'text-purple-400' },
        { id: 'gemini-nano-banana', label: 'Gemini 3 Pro Nano Banana', image: '/assets/models/gemini.png', emoji: '🍌', color: 'text-yellow-400' },
        { id: 'freepik-mystic', label: 'Freepik Mystic', emoji: '🔮', color: 'text-indigo-400' },
        { id: 'freepik-flux-realism', label: 'Flux Realism (Freepik)', emoji: '📸', color: 'text-blue-400' },
        { id: 'freepik-flux-1.1', label: 'Flux 1.1 (Freepik)', emoji: '🚀', color: 'text-purple-400' },
        { id: 'imagen-3', label: 'Imagen 3', image: '/assets/models/imagen.png', color: 'text-pink-400' },
        { id: 'dalle-3', label: 'DALL-E 3', image: '/assets/models/dalle.png', color: 'text-green-400' },
        { id: 'midjourney-v6', label: 'Midjourney V6', image: '/assets/models/midjourney.png', color: 'text-white' },
        { id: 'stable-diffusion-xl', label: 'Stable Diffusion XL', image: '/assets/models/stablediffusion.png', color: 'text-orange-400' },
        { id: 'flux-pro', label: 'Flux Pro', image: '/assets/models/flux.png', color: 'text-cyan-400' },
    ];

    const styles: { id: StylePreset; label: string; emoji?: string; image?: string; color: string }[] = [
        { id: 'Cinematic', label: 'Cinematic', emoji: '🎬', color: 'text-purple-400' },
        { id: 'Creative', label: 'Creative', emoji: '✨', color: 'text-yellow-400' },
        { id: 'Dynamic', label: 'Dynamic', emoji: '⚡', color: 'text-blue-400' },
        { id: 'Fashion', label: 'Fashion', emoji: '👗', color: 'text-pink-400' },
        { id: 'None', label: 'None', emoji: '⭕', color: 'text-gray-400' },
        { id: 'Portrait', label: 'Portrait', emoji: '🖼️', color: 'text-amber-400' },
        { id: 'Stock Photo', label: 'Stock Photo', emoji: '️', color: 'text-green-400' },
        { id: 'Vibrant', label: 'Vibrant', emoji: '🌈', color: 'text-rose-400' },
        { id: 'Photography', label: 'Photography', emoji: '📷', color: 'text-emerald-400' },
        { id: '3D Render', label: '3D Render', emoji: '🎲', color: 'text-red-400' },
        { id: 'Anime', label: 'Anime', emoji: '💫', color: 'text-fuchsia-400' },
        { id: 'Illustration', label: 'Illustration', image: '/assets/Illustration.jpg', color: 'text-orange-400' },
    ];

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (prompt.trim() && !isGenerating) {
            onGenerate(prompt, aspectRatio);
            setPrompt('');
            setActiveDropdown(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [prompt]);

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

    const toggleDropdown = (dropdown: 'model' | 'ratio' | 'style') => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const handleRatioSelect = (ratioValue: AspectRatio) => {
        if (isMultiSelectMode) {
            const currentRatios = Array.isArray(aspectRatio) ? aspectRatio : [aspectRatio];
            const isSelected = currentRatios.includes(ratioValue);

            if (isSelected) {
                // Remove if already selected, but prevent empty selection
                if (currentRatios.length > 1) {
                    setAspectRatio(currentRatios.filter(r => r !== ratioValue));
                }
            } else {
                // Add if not selected, limit to 4
                if (currentRatios.length < 4) {
                    setAspectRatio([...currentRatios, ratioValue]);
                }
            }
        } else {
            // Single select mode
            setAspectRatio(ratioValue);
            setActiveDropdown(null);
        }
    };

    const getAspectRatioLabel = () => {
        if (Array.isArray(aspectRatio)) {
            if (aspectRatio.length === 0) return 'Ratio';
            if (aspectRatio.length === 1) return aspectRatio[0];
            return `${aspectRatio.length} Selected`;
        }
        return aspectRatio;
    };

    const getCurrentModelIcon = () => {
        const currentModel = models.find(m => m.id === model);
        if (currentModel) {
            if (currentModel.image) {
                return <img src={currentModel.image} alt={currentModel.label} className="w-5 h-5 rounded" />;
            }
            if (currentModel.icon) {
                const Icon = currentModel.icon;
                return <Icon size={16} className={currentModel.color} />;
            }
        }
        return <Zap size={16} className="text-yellow-400" />;
    };

    const getCurrentStyleIcon = () => {
        const currentStyle = styles.find(s => s.id === style);
        if (currentStyle) {
            if (currentStyle.image) {
                return <img src={currentStyle.image} alt={currentStyle.label} className="w-5 h-5 rounded" />;
            }
            return <span className="text-sm leading-none">{currentStyle.emoji}</span>;
        }
        return <span className="text-sm leading-none">🎨</span>;
    };

    return (
        <div className="w-full relative z-30" ref={containerRef} data-tutorial-target="prompt-bar">

            {/* Prompt Capsule with Glowing Border */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <div className="relative bg-[#0a0a0f]/95 backdrop-blur-xl rounded-full overflow-visible flex flex-col">

                    {/* Textarea Section */}
                    <div className="px-4 pt-3 pb-1 flex-1">
                        <textarea
                            ref={inputRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isGenerating ? "Generating your masterpiece..." : placeholders[placeholderIndex]}
                            disabled={isGenerating}
                            className="w-full bg-transparent text-white placeholder-zinc-500/70 resize-none outline-none text-[15px] leading-relaxed scrollbar-hide min-h-[24px] transition-all font-normal"
                            rows={1}
                            style={{ maxHeight: '120px' }}
                        />
                    </div>

                    {/* Controls Bar - at bottom */}
                    <div className="px-3 py-1 flex items-center justify-between gap-2">

                        {/* Left: Option Buttons */}
                        <div className="flex items-center gap-1.5">

                            {/* Model Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('model')}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                >
                                    {getCurrentModelIcon()}
                                    <span className="hidden sm:inline">{models.find(m => m.id === model)?.label || 'Model'}</span>
                                    <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'model' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'model' && (
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f0f12] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto custom-scrollbar">
                                        <div className="p-1.5">
                                            {models.map((m) => {
                                                return (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => { setModel(m.id); setActiveDropdown(null); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${model === m.id
                                                            ? 'bg-white/[0.12] text-white'
                                                            : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                                                            }`}
                                                    >
                                                        <div className="p-1.5 rounded-md bg-white/[0.06] flex-shrink-0">
                                                            {m.image ? (
                                                                <img src={m.image} alt={m.label} className="w-5 h-5 rounded" />
                                                            ) : m.icon ? (
                                                                <m.icon size={20} className={m.color} />
                                                            ) : null}
                                                        </div>
                                                        <span className="font-medium flex-1 text-left">{m.label}</span>
                                                        {m.emoji && <span className="text-base">{m.emoji}</span>}
                                                        {model === m.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Aspect Ratio Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('ratio')}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                >
                                    <img src="/assets/Gold.png" alt="Aspect Ratio" className="w-4 h-4" />
                                    <span>{getAspectRatioLabel()}</span>
                                    <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'ratio' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'ratio' && (
                                    <div className="absolute top-full left-0 mt-2 w-80 bg-[#0f0f12] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">

                                        {/* Multi-Select Toggle */}
                                        <div className="p-2 border-b border-white/5">
                                            <button
                                                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isMultiSelectMode
                                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {isMultiSelectMode ? (
                                                    <>
                                                        <Check size={14} />
                                                        <span>Multi-Select Active (Max 4)</span>
                                                    </>
                                                ) : (
                                                    <span>Choose Multiple Options</span>
                                                )}
                                            </button>
                                        </div>

                                        <div className="p-3 grid grid-cols-2 gap-3">
                                            {ASPECT_RATIOS.map((ratio) => {
                                                const isSelected = Array.isArray(aspectRatio)
                                                    ? aspectRatio.includes(ratio.value)
                                                    : aspectRatio === ratio.value;

                                                return (
                                                    <button
                                                        key={ratio.value}
                                                        onClick={() => handleRatioSelect(ratio.value)}
                                                        className={`relative flex flex-col items-center gap-2.5 p-3 rounded-lg transition-all group ${isSelected
                                                            ? 'bg-white/10 text-white ring-1 ring-white/20'
                                                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        {/* Checkbox for Multi-Select */}
                                                        {isMultiSelectMode && (
                                                            <div className={`absolute top-2 right-2 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                                                ? 'bg-indigo-500 border-indigo-500'
                                                                : 'border-zinc-600 group-hover:border-zinc-400'
                                                                }`}>
                                                                {isSelected && <Check size={10} className="text-white" />}
                                                            </div>
                                                        )}

                                                        {/* Visual aspect ratio box */}
                                                        <div
                                                            className={`border-2 rounded-sm transition-colors ${isSelected ? 'border-white bg-white/10' : 'border-zinc-700 bg-zinc-900/50 group-hover:border-zinc-500'}`}
                                                            style={{
                                                                width: `${ratio.width * 3}px`,
                                                                height: `${ratio.height * 3}px`
                                                            }}
                                                        />

                                                        {/* Label */}
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="font-semibold text-white text-xs">{ratio.label}</span>
                                                            <span className="text-[10px] font-medium text-zinc-500">{ratio.value}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Style Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('style')}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                >
                                    {getCurrentStyleIcon()}
                                    <span className="hidden sm:inline">{style}</span>
                                    <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'style' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'style' && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f0f12] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto custom-scrollbar">
                                        <div className="p-1.5 grid grid-cols-2 gap-1">
                                            {styles.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => { setStyle(s.id); setActiveDropdown(null); }}
                                                    title={s.label}
                                                    className={`flex items-center ${s.id === '3D Render' ? 'gap-1.5' : 'gap-2'} px-3 py-2.5 rounded-lg text-sm transition-all border ${style === s.id
                                                        ? 'bg-white/10 text-white border-white/20'
                                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white border-white/5 hover:border-white/10'
                                                        }`}
                                                >
                                                    {s.image ? (
                                                        <img src={s.image} alt={s.label} className="w-6 h-6 rounded flex-shrink-0" />
                                                    ) : (
                                                        <span className="text-lg flex-shrink-0">{s.emoji}</span>
                                                    )}
                                                    <span className={`truncate ${s.id === '3D Render' ? 'whitespace-nowrap' : ''}`}>{s.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div >

                        {/* Right: Generate Button */}
                        <button
                            onClick={() => handleSubmit()}
                            disabled={!prompt.trim() || isGenerating}
                            className={`
                            h-10 px-7 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 font-semibold text-sm shadow-lg
                            ${prompt.trim() && !isGenerating
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-white/[0.06] text-zinc-600 cursor-not-allowed border border-white/[0.08]'
                                }
                        `}
                        >
                            {
                                isGenerating ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Generate</span>
                                        <Send size={16} />
                                    </>
                                )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptBar;
