import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, Sparkles, Crop, Scissors, Undo2, Redo2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface EditModalProps {
    image: GeneratedImage | null;
    onClose: () => void;
    onSave?: (editedImage: GeneratedImage) => void;
    onApplyToMockup?: (editedImage: GeneratedImage) => void;
}

interface EditorState {
    scale: number;
    rotation: number;
    brightness: number;
    contrast: number;
    saturation: number;
    selectedFilter: string;
    selectedCrop: string;
    clipPath: string;
    customClipPath: string;
}

const EditModal: React.FC<EditModalProps> = ({ image, onClose, onSave, onApplyToMockup }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [scale, setScale] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [selectedFilter, setSelectedFilter] = useState('none');
    const [selectedCrop, setSelectedCrop] = useState('none');
    const [clipPath, setClipPath] = useState('none');
    const [customClipPath, setCustomClipPath] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');

    const [history, setHistory] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const filters = [
        { id: 'none', label: 'None', filter: '' },
        { id: 'grayscale', label: 'B&W', filter: 'grayscale(100%)' },
        { id: 'sepia', label: 'Sepia', filter: 'sepia(100%)' },
        { id: 'vintage', label: 'Vintage', filter: 'sepia(50%) contrast(110%)' },
        { id: 'cool', label: 'Cool', filter: 'hue-rotate(180deg) saturate(120%)' },
        { id: 'warm', label: 'Warm', filter: 'hue-rotate(-20deg) saturate(130%)' },
    ];

    // Print-optimized aspect ratios for clothing
    const cropOptions = [
        { id: 'none', label: 'None', aspect: 0 },
        { id: '8x10', label: '8x10"', aspect: 10 / 8 },
        { id: '11x14', label: '11x14"', aspect: 14 / 11 },
        { id: '12x16', label: '12x16"', aspect: 16 / 12 },
        { id: '16x20', label: '16x20"', aspect: 20 / 16 },
    ];

    const clipPathOptions = [
        { id: 'none', label: 'None', path: '' },
        { id: 'circle', label: 'Circle', path: 'circle(50% at 50% 50%)' },
        { id: 'ellipse', label: 'Ellipse', path: 'ellipse(40% 50% at 50% 50%)' },
        { id: 'triangle', label: 'Triangle', path: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
        { id: 'diamond', label: 'Diamond', path: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
        { id: 'hexagon', label: 'Hexagon', path: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
        { id: 'star', label: 'Star', path: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
    ];

    useEffect(() => {
        if (image) {
            setTimeout(() => setIsVisible(true), 10);
            // Initialize history with default state
            const initialState: EditorState = {
                scale: 100,
                rotation: 0,
                brightness: 100,
                contrast: 100,
                saturation: 100,
                selectedFilter: 'none',
                selectedCrop: 'none',
                clipPath: 'none',
                customClipPath: '',
            };
            setHistory([initialState]);
            setHistoryIndex(0);
        }
    }, [image]);

    // Keyboard shortcuts for Undo/Redo (must be before early return)
    useEffect(() => {
        if (!image) return; // Don't attach listeners if no image

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    handleRedo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [image, historyIndex, history]);

    // Record history when state changes (debounced)
    useEffect(() => {
        if (!image) return;

        // Skip recording during undo/redo to avoid adding duplicate entries
        // We can check if the current state matches the history at current index
        // But simpler is to just debounce and check equality

        const timeoutId = setTimeout(() => {
            const currentState: EditorState = {
                scale,
                rotation,
                brightness,
                contrast,
                saturation,
                selectedFilter,
                selectedCrop,
                clipPath,
                customClipPath,
            };

            // Don't record if no change from current history head
            if (historyIndex >= 0 && history[historyIndex] && JSON.stringify(currentState) === JSON.stringify(history[historyIndex])) {
                return;
            }

            // If we are not at the end of history (undid some steps), remove future steps
            // But wait, if we are just verifying, we shouldn't change history unless user changed something.
            // The dependency array ensures this only runs when state changes.
            // However, calling setScale (during undo) triggers this effect.
            // We need to distinguish between "user change" and "undo/redo change".
            // A common way is to use a ref to track if we are processing undo/redo.

            // For now, let's just record. The equality check handles the "no change" case.
            // But if I undo, state changes to previous. This effect runs. 
            // currentState == history[newIndex]. 
            // So it should be fine? 
            // Wait, if I undo, index moves to N-1. State becomes history[N-1].
            // Effect runs. currentState is history[N-1].
            // We check against history[historyIndex] which is history[N-1].
            // They are equal. So we return. Correct!

            // What if I undo, then change something?
            // Undo -> index=N-1. State=history[N-1]. Effect returns.
            // User changes scale. State becomes new.
            // Effect runs. currentState != history[N-1].
            // We slice history to N-1+1 = N. Push new state. Index becomes N.
            // Perfect.

            setHistory(prev => {
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(currentState);
                return newHistory;
            });
            setHistoryIndex(prev => prev + 1);

        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [scale, rotation, brightness, contrast, saturation, selectedFilter, selectedCrop, clipPath, customClipPath, image]);

    if (!image) return null;

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const getCurrentState = (): EditorState => ({
        scale,
        rotation,
        brightness,
        contrast,
        saturation,
        selectedFilter,
        selectedCrop,
        clipPath,
        customClipPath,
    });

    const applyState = (state: EditorState) => {
        setScale(state.scale);
        setRotation(state.rotation);
        setBrightness(state.brightness);
        setContrast(state.contrast);
        setSaturation(state.saturation);
        setSelectedFilter(state.selectedFilter);
        setSelectedCrop(state.selectedCrop);
        setClipPath(state.clipPath);
        setCustomClipPath(state.customClipPath);
    };

    const handleUndo = () => {
        if (!canUndo) return;

        const newIndex = historyIndex - 1;
        applyState(history[newIndex]);
        setHistoryIndex(newIndex);
    };

    const handleRedo = () => {
        if (!canRedo) return;

        const newIndex = historyIndex + 1;
        applyState(history[newIndex]);
        setHistoryIndex(newIndex);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 400);
    };

    const handleReset = () => {
        const defaultState: EditorState = {
            scale: 100,
            rotation: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            selectedFilter: 'none',
            selectedCrop: 'none',
            clipPath: 'none',
            customClipPath: '',
        };

        applyState(defaultState);
        setHistory([defaultState]);
        setHistoryIndex(0);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(image);
        }
        handleClose();
    };

    const handleApplyToMockupClick = () => {
        // Close the editor first
        handleClose();
        // Then trigger the mockup modal with the edited image
        if (onApplyToMockup) {
            // Small delay to ensure editor closes smoothly before mockup opens
            setTimeout(() => {
                onApplyToMockup(image);
            }, 100);
        }
    };

    const currentFilter = filters.find(f => f.id === selectedFilter);
    const currentCrop = cropOptions.find(c => c.id === selectedCrop);

    const getClipPathValue = () => {
        if (customClipPath && customClipPath.trim()) {
            return customClipPath;
        }
        const preset = clipPathOptions.find(cp => cp.id === clipPath);
        return preset?.path || 'none';
    };

    const getCropContainerStyle = () => {
        if (!currentCrop || currentCrop.aspect === 0) return {};

        return {
            aspectRatio: `${currentCrop.aspect}`,
            overflow: 'hidden',
            maxWidth: '600px',
            maxHeight: '800px',
        };
    };

    const imageStyle = {
        transform: `scale(${scale / 100}) rotate(${rotation}deg)`,
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${currentFilter?.filter || ''}`,
        clipPath: getClipPathValue(),
        transition: 'all 0.3s ease-out',
        width: '100%',
        height: '100%',
        objectFit: currentCrop && currentCrop.aspect !== 0 ? ('cover' as const) : ('contain' as const),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[5vh]">
            <div
                className={`absolute inset-0 bg-black/90 backdrop-blur-md transition-all duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            <div
                className={`relative w-full h-full max-w-[90vw] bg-[#09090b] rounded-2xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/10 shadow-2xl ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <Sparkles size={20} className="text-indigo-400" />
                        <h2 className="text-lg font-semibold text-white">AI Image Editor</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${canUndo
                                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                : 'text-zinc-600 cursor-not-allowed opacity-50'
                                }`}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 size={16} />
                            Undo
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${canRedo
                                ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                : 'text-zinc-600 cursor-not-allowed opacity-50'
                                }`}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 size={16} />
                            Redo
                        </button>

                        <div className="h-6 w-px bg-white/10" />

                        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                            <RefreshCw size={16} />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <Check size={16} />
                            Save Changes
                        </button>
                        <button
                            onClick={handleApplyToMockupClick}
                            className="px-6 py-2 rounded-lg text-sm font-semibold bg-transparent border-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600/10 transition-colors flex items-center gap-2"
                        >
                            <Check size={16} />
                            Apply on Mockup
                        </button>
                        <button onClick={handleClose} className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className={`flex-1 bg-[#0a0a0a] flex flex-col transition-all ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                        style={{ transitionDelay: '100ms', transitionDuration: '500ms' }}
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-center p-8 min-h-full">
                                <div className="relative w-full flex justify-center" style={getCropContainerStyle()}>
                                    <img src={image.url} alt={image.prompt} style={imageStyle} className="rounded-lg shadow-2xl" />
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 border-t border-white/10 bg-[#0a0a0a] p-6">
                            <div className="max-w-3xl mx-auto w-full">
                                <label className="text-sm font-medium text-zinc-300 mb-3 block flex items-center gap-2">
                                    <Sparkles size={16} className="text-indigo-400" />
                                    Edit with AI
                                </label>
                                <div className="flex gap-3">
                                    <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe changes (e.g., 'make it more vibrant', 'add sunset background')" className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                                    <button className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2 font-semibold text-sm shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                                        <Sparkles size={18} />
                                        Apply AI Edit
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2.5">Use AI to modify colors, style, backgrounds, or add elements</p>
                            </div>
                        </div>
                    </div>

                    <div className={`w-80 bg-[#09090b] border-l border-white/5 flex flex-col transition-all ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                        style={{ transitionDelay: '200ms', transitionDuration: '500ms' }}
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-zinc-300">Scale</label>
                                    <span className="text-xs font-mono text-zinc-500">{scale}%</span>
                                </div>
                                <input type="range" min="50" max="200" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-indigo-400 transition-all" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-zinc-300">Rotation</label>
                                    <span className="text-xs font-mono text-zinc-500">{rotation}°</span>
                                </div>
                                <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-indigo-400 transition-all" />
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Crop size={14} />
                                    Print Size
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {cropOptions.map((crop) => (
                                        <button key={crop.id} onClick={() => setSelectedCrop(crop.id)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedCrop === crop.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                            {crop.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Scissors size={14} />
                                    Clip Path Shape
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {clipPathOptions.map((cp) => (
                                        <button key={cp.id} onClick={() => { setClipPath(cp.id); if (cp.id !== 'custom') setCustomClipPath(''); }} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${clipPath === cp.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                            {cp.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2 mt-3">
                                    <label className="text-xs text-zinc-400">Custom Clip-Path</label>
                                    <input type="text" value={customClipPath} onChange={(e) => { setCustomClipPath(e.target.value); if (e.target.value) setClipPath('custom'); }} placeholder="polygon(50% 0%, 100% 50%, ...)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono" />
                                    <p className="text-[10px] text-zinc-600">Enter CSS clip-path value (e.g., polygon, circle, ellipse)</p>
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-zinc-300">Brightness</label>
                                    <span className="text-xs font-mono text-zinc-500">{brightness}%</span>
                                </div>
                                <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-indigo-400 transition-all" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-zinc-300">Contrast</label>
                                    <span className="text-xs font-mono text-zinc-500">{contrast}%</span>
                                    {filters.map((filter) => (
                                        <button key={filter.id} onClick={() => setSelectedFilter(filter.id)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedFilter === filter.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
