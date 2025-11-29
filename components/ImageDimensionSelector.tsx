import React from 'react';
import { ImageDimension, ImageSize } from '../types/settings';

interface ImageDimensionSelectorProps {
    selectedDimension: ImageDimension;
    selectedSize: ImageSize;
    onDimensionChange: (dimension: ImageDimension) => void;
    onSizeChange: (size: ImageSize) => void;
}

const ImageDimensionSelector: React.FC<ImageDimensionSelectorProps> = ({
    selectedDimension,
    selectedSize,
    onDimensionChange,
    onSizeChange
}) => {
    const dimensions: { value: ImageDimension; icon: string }[] = [
        { value: '2:3', icon: 'h-6 w-4' },
        { value: '1:1', icon: 'h-5 w-5' },
        { value: '16:9', icon: 'h-3 w-6' },
        { value: 'Custom', icon: 'h-5 w-5' }
    ];

    const sizes: { value: ImageSize; pixels: string }[] = [
        { value: 'Small', pixels: '1024×1024' },
        { value: 'Medium', pixels: '1200×1200' },
        { value: 'Large', pixels: '1440×1440' }
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500 font-medium">Image Dimensions</label>
                <div className="w-3 h-3 rounded-full bg-zinc-700 flex items-center justify-center cursor-help group relative">
                    <span className="text-[8px] text-zinc-400">?</span>
                    <div className="absolute left-6 top-0 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl">
                        Choose aspect ratio & size
                    </div>
                </div>
            </div>

            {/* Aspect Ratios */}
            <div className="grid grid-cols-4 gap-2">
                {dimensions.map(dim => (
                    <button
                        key={dim.value}
                        onClick={() => onDimensionChange(dim.value)}
                        className={`
                            flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-lg border transition-all
                            ${selectedDimension === dim.value
                                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
                            }
                        `}
                    >
                        <div className={`${dim.icon} border-2 rounded ${selectedDimension === dim.value ? 'border-indigo-400' : 'border-zinc-500'}`}></div>
                        <span className="text-[10px] font-medium">{dim.value}</span>
                    </button>
                ))}
            </div>

            {/* Size Presets */}
            <div className="grid grid-cols-3 gap-2">
                {sizes.map(size => (
                    <button
                        key={size.value}
                        onClick={() => onSizeChange(size.value)}
                        className={`
                            flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg border transition-all
                            ${selectedSize === size.value
                                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
                            }
                        `}
                    >
                        <span className="text-xs font-semibold">{size.value}</span>
                        <span className="text-[9px] text-zinc-500">{size.pixels}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ImageDimensionSelector;
