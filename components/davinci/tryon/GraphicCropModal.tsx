'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Square, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to center the initial crop
function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 100, // Fit entirely by default on aspect snap
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

interface GraphicCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    onApply: (croppedImageUrl: string) => void;
}

export const GraphicCropModal: React.FC<GraphicCropModalProps> = ({
    isOpen,
    onClose,
    imageSrc,
    onApply
}) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const imgRef = useRef<HTMLImageElement>(null);

    // Reset crop when image changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setCrop(undefined);
            setAspect(undefined);
            setCompletedCrop(undefined);
        }
    }, [isOpen]);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        // Start with a full 100% free crop
        setCrop({
            unit: '%',
            width: 100,
            height: 100,
            x: 0,
            y: 0
        });
    };

    const handleAspectChange = (newAspect: number | undefined) => {
        setAspect(newAspect);
        if (newAspect && imgRef.current) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, newAspect));
        } else {
            // Restore a full free crop if clearing aspect
            setCrop({
                unit: '%',
                width: 100,
                height: 100,
                x: 0,
                y: 0
            });
        }
    };

    const getCroppedImg = useCallback(() => {
        if (!completedCrop || !imgRef.current) return;

        // If trying to crop a flat 100% selection or 0 width/height, handle safely
        if (completedCrop.width === 0 || completedCrop.height === 0) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        );

        return canvas.toDataURL('image/png');
    }, [completedCrop]);

    const handleApply = () => {
        const croppedUrl = getCroppedImg();
        if (croppedUrl) {
            onApply(croppedUrl);
            onClose();
        } else {
            // If crop conversion failed (e.g. 0 size), just apply original
            onApply(imageSrc);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen ? (
                <div key="crop-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                    />

                    {/* Auto-sizing Container with Right Sidebar */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative w-full max-w-6xl h-auto max-h-[90vh] flex bg-[#0c0b0a]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                    >
                        {/* Main Left Content: Header + Workspace */}
                        <div className="flex flex-col flex-1 min-w-0 border-r border-white/5 bg-[#0c0b0a]/40 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Crop Graphic</span>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A572] animate-pulse" />
                                    <span className="text-[8px] text-[#C5A572] font-bold tracking-widest uppercase">Precision Editor</span>
                                </div>
                            </div>

                            {/* Image Workspace - STRICT height constraint & centering */}
                            <div className="flex-1 relative flex items-center justify-center p-12 min-h-0 bg-black/40 overflow-auto">
                                <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={c => setCrop(c)}
                                        onComplete={c => setCompletedCrop(c)}
                                        aspect={aspect}
                                        className="max-w-full max-h-full drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]"
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imageSrc}
                                            crossOrigin="anonymous"
                                            alt="Crop preview"
                                            onLoad={onImageLoad}
                                            style={{ maxHeight: '60vh', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                                            className="block"
                                        />
                                    </ReactCrop>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Small, straight, vertical list */}
                        <div className="w-20 md:w-24 shrink-0 bg-[#0c0b0a]/80 flex flex-col items-center py-5 gap-6 border-l border-white/5">
                            
                            {/* Close Button top-rightish */}
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer active:scale-90"
                            >
                                <X size={18} />
                            </button>
                            
                            <div className="w-full h-[1px] bg-white/5" />

                            {/* Presets - Vertical Stack */}
                            <div className="flex flex-col items-center gap-4">
                                {[
                                    { label: 'Free', icon: Maximize2, val: undefined },
                                    { label: '1:1', icon: Square, val: 1 },
                                    { label: '4:5', icon: ImageIcon, val: 4/5 },
                                    { label: '3:2', icon: ImageIcon, val: 3/2 }
                                ].map((opt) => (
                                    <button
                                        key={opt.label || 'free'}
                                        onClick={() => handleAspectChange(opt.val)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-xl border transition-all active:scale-95 cursor-pointer",
                                            aspect === opt.val 
                                                ? "bg-[#C5A572] border-[#C5A572] text-black shadow-lg shadow-[#C5A572]/20 font-black" 
                                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                                        )}
                                    >
                                        <opt.icon size={16} className={cn(opt.label === '4:5' && "rotate-90")} />
                                        <span className="text-[8px] uppercase tracking-widest leading-none">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto w-full px-2 flex flex-col items-center gap-6">
                                {/* Resolution Stats */}
                                <div className="flex flex-col items-center gap-1 opacity-50">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Pixels</span>
                                    <span className="text-[9px] font-mono text-white leading-none">
                                        {completedCrop && completedCrop.width && completedCrop.height 
                                            ? `${Math.round(completedCrop.width)}x${Math.round(completedCrop.height)}` 
                                            : '---'}
                                    </span>
                                </div>

                                {/* Apply Button */}
                                <button
                                    onClick={handleApply}
                                    disabled={!completedCrop || completedCrop.width === 0}
                                    className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black hover:bg-[#C5A572] shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_30px_rgba(197,165,114,0.4)] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 cursor-pointer active:scale-90"
                                    title="Apply Crop"
                                >
                                    <Check size={22} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
};
