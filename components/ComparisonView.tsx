'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Grid,
    Layers,
    Bookmark,
    Trash2,
    Download,
    Link2
} from 'lucide-react';
import type { GeneratedImage } from '@/types';

interface ComparisonViewProps {
    images: GeneratedImage[];
    onClose: () => void;
    onBookmark?: (image: GeneratedImage) => void;
    onDelete?: (image: GeneratedImage) => void;
    onMockup?: (image: GeneratedImage) => void;
}

type ViewMode = 'grid' | 'slider';

/**
 * Side-by-side image comparison view
 * Supports synchronized zoom/pan across all images
 */
export function ComparisonView({
    images,
    onClose,
    onBookmark,
    onDelete,
    onMockup
}: ComparisonViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [zoom, setZoom] = useState(1);
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
    }, []);

    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPosition(Number(e.target.value));
    }, []);

    const handleDownload = useCallback(async (image: GeneratedImage) => {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `davinci-${image.id}.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }, []);

    // Limit to 3 images for comparison
    const displayImages = images.slice(0, 3);

    if (images.length < 2) {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
                <div className="relative bg-[#09090b] rounded-2xl p-8 text-center border border-white/10">
                    <p className="text-zinc-400 mb-4">Select at least 2 images to compare</p>
                    <button onClick={handleClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[#09090b] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Layers size={20} className="text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Compare Designs</h2>
                    <span className="text-sm text-zinc-500">({displayImages.length} images)</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Grid size={16} />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('slider')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'slider' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Layers size={16} />
                            Slider
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1">
                        <button onClick={handleZoomOut} className="p-1 text-zinc-400 hover:text-white transition-colors">
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-sm text-zinc-300 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-1 text-zinc-400 hover:text-white transition-colors">
                            <ZoomIn size={18} />
                        </button>
                        <button onClick={handleReset} className="p-1 text-zinc-400 hover:text-white transition-colors ml-1">
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Sync Toggle */}
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={syncEnabled}
                            onChange={(e) => setSyncEnabled(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-zinc-400">Sync</span>
                    </label>

                    <button onClick={handleClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div ref={containerRef} className="flex-1 overflow-hidden">
                {viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="h-full grid gap-4 p-6" style={{
                        gridTemplateColumns: `repeat(${displayImages.length}, 1fr)`
                    }}>
                        {displayImages.map((image, index) => (
                            <div
                                key={image.id}
                                className={`relative bg-zinc-900 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-indigo-500' : 'border-white/10 hover:border-white/20'
                                    }`}
                                onClick={() => setSelectedImageIndex(index)}
                            >
                                {/* Image */}
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={image.url}
                                        alt={image.prompt}
                                        className="transition-transform duration-200"
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                </div>

                                {/* Overlay Info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <p className="text-xs text-zinc-300 line-clamp-2">{image.prompt}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-zinc-500">{image.aspectRatio}</span>
                                        <span className="text-xs text-zinc-500">•</span>
                                        <span className="text-xs text-zinc-500">{image.model || 'Unknown'}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onBookmark && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onBookmark(image); }}
                                            className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                                        >
                                            <Bookmark size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownload(image); }}
                                        className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Slider View (Before/After comparison) */
                    <div className="h-full relative">
                        {displayImages.length >= 2 && (
                            <div className="absolute inset-0">
                                {/* Right Image (After) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                        src={displayImages[1].url}
                                        alt={displayImages[1].prompt}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                </div>

                                {/* Left Image (Before) - Clipped */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                >
                                    <img
                                        src={displayImages[0].url}
                                        alt={displayImages[0].prompt}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                </div>

                                {/* Slider Handle */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                                    style={{ left: `${sliderPosition}%` }}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <div className="flex gap-0.5">
                                            <div className="w-0.5 h-3 bg-zinc-400 rounded-full" />
                                            <div className="w-0.5 h-3 bg-zinc-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Slider Input (Invisible, for interaction) */}
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderPosition}
                                    onChange={handleSliderChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                                />

                                {/* Labels */}
                                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-xs text-white">
                                    Before
                                </div>
                                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded-full text-xs text-white">
                                    After
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Quick Actions */}
            <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-white/10">
                <p className="text-sm text-zinc-500">
                    {viewMode === 'grid'
                        ? 'Click an image to select, or use zoom controls to compare details'
                        : 'Drag the slider to compare before/after'
                    }
                </p>
            </div>
        </div>
    );
}
