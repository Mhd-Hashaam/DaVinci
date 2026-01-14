'use client';

import { useState, useCallback } from 'react';
import { Scene } from '@/components/canvas/Scene';
import { MockupModel } from '@/components/canvas/MockupModel';
import { Controls } from '@/components/canvas/Controls';
import {
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Sun,
    Contrast,
    Palette,
    Shirt,
    RefreshCw
} from 'lucide-react';

interface MockupViewerProps {
    imageUrl: string | null;
    className?: string;
}

type ModelType = 'tshirt' | 'hoodie' | 'longsleeve';

const MODEL_OPTIONS: { value: ModelType; label: string }[] = [
    { value: 'tshirt', label: 'T-Shirt' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'longsleeve', label: 'Long Sleeve' },
];

/**
 * Full 3D Mockup Viewer with interactive controls
 * Displays AI-generated design on clothing with adjustments
 */
export function MockupViewer({ imageUrl, className = '' }: MockupViewerProps) {
    const [modelType, setModelType] = useState<ModelType>('tshirt');
    const [brightness, setBrightness] = useState(1.0);
    const [contrast, setContrast] = useState(1.0);
    const [autoRotate, setAutoRotate] = useState(true);

    const handleReset = useCallback(() => {
        setBrightness(1.0);
        setContrast(1.0);
        setAutoRotate(true);
    }, []);

    return (
        <div className={`relative w-full h-full flex flex-col ${className}`}>
            {/* 3D Canvas */}
            <div className="flex-1 min-h-[300px] bg-gradient-to-b from-zinc-900/50 to-black rounded-2xl overflow-hidden">
                <Scene className="w-full h-full">
                    <MockupModel
                        textureUrl={imageUrl}
                        brightness={brightness}
                        contrast={contrast}
                        modelType={modelType}
                        autoRotate={autoRotate}
                    />
                    <Controls
                        autoRotate={autoRotate}
                        enableZoom={true}
                        enableRotate={true}
                    />
                </Scene>
            </div>

            {/* Controls Panel */}
            <div className="mt-4 space-y-4">
                {/* Model Type Selector */}
                <div className="flex items-center gap-2">
                    <Shirt size={16} className="text-zinc-500" />
                    <div className="flex gap-1 flex-1">
                        {MODEL_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setModelType(option.value)}
                                className={`
                  flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all
                  ${modelType === option.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                    }
                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brightness Slider */}
                <div className="flex items-center gap-3">
                    <Sun size={16} className="text-zinc-500 shrink-0" />
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={brightness}
                        onChange={(e) => setBrightness(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs text-zinc-500 w-10 text-right">
                        {Math.round(brightness * 100)}%
                    </span>
                </div>

                {/* Contrast Slider */}
                <div className="flex items-center gap-3">
                    <Contrast size={16} className="text-zinc-500 shrink-0" />
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={contrast}
                        onChange={(e) => setContrast(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs text-zinc-500 w-10 text-right">
                        {Math.round(contrast * 100)}%
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${autoRotate
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                            }
            `}
                    >
                        <RefreshCw size={16} className={autoRotate ? 'animate-spin' : ''} />
                        Auto-Rotate
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
