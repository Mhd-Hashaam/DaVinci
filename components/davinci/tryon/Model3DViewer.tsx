'use client';

import React, { useRef, useEffect, Suspense, useMemo, useState, useCallback } from 'react';
import { Canvas, createPortal, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Decal, useTexture, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { RotateCw, Maximize, RotateCcw, Minus, Plus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSessionManager } from '@/lib/storage/SessionManager';
import { BasicTeeModel } from './BasicTeeModel';
import { FemaleTeeModel } from './FemaleTeeModel';
import { GraphicCropModal } from './GraphicCropModal';

// Fallback design texture
const FALLBACK_TEXTURE = '/assets/design-fallback.png';

// Expanded Color palette
const SHIRT_COLORS = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Charcoal', hex: '#1a1a1a' },
    { name: 'Dark Red', hex: '#7f1d1d' },
    { name: 'Navy Blue', hex: '#1e3a8a' },
    { name: 'Forest Green', hex: '#14532d' },
    { name: 'Mustard', hex: '#713f12' },
    { name: 'Deep Purple', hex: '#581c87' },
    { name: 'Burnt Orange', hex: '#9a3412' },
    { name: 'Silver', hex: '#94a3b8' },
    { name: 'Brown', hex: '#44403c' },
    { name: 'Pink', hex: '#9f1239' },
    { name: 'Beige', hex: '#a8a29e' },
    { name: 'Olive', hex: '#3f6212' },
];


// UUID Validation
const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface DecalState {
    pos: [number, number, number];
    scale: number;
    rot: number;
}

// ----------------------------------------------------------------------
// 0. Model Configurations
// ----------------------------------------------------------------------
interface ModelConfig {
    groupScale: number;
    groupPosition: [number, number, number];
    horizontalBias: number;
    defaultRotation: number;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
    dress: {
        groupScale: 0.007,
        groupPosition: [0, -4.0, 0],
        horizontalBias: 0.0,
        defaultRotation: 0,
    },
    female: {
        groupScale: 2.5,
        groupPosition: [0, -1.2, 0],
        horizontalBias: 0.0,
        defaultRotation: 0,
    },
    default: {
        groupScale: 3,
        groupPosition: [0, 0.2, 0],
        horizontalBias: 0.0,
        defaultRotation: 0,
    }
};

// ----------------------------------------------------------------------
// 1. Helper Components (Repeat Button & Number Control)
// ----------------------------------------------------------------------

type IconComponent = React.ComponentType<{ size?: number | string; className?: string }>;

const RepeatButton = ({
    onClick,
    icon: Icon,
    className
}: {
    onClick: () => void,
    icon: IconComponent,
    className?: string
}) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const stop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        intervalRef.current = null;
        timeoutRef.current = null;
    }, []);

    const start = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        onClick();

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                onClick();
            }, 50);
        }, 250);
    }, [onClick]);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    return (
        <button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            className={cn(
                "p-2 rounded-md bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors border border-white/5 text-white/80 hover:text-white flex items-center justify-center cursor-pointer",
                className
            )}
            type="button"
        >
            <Icon size={14} />
        </button>
    );
};


import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Sliders, ChevronLeft, ChevronRight, X } from 'lucide-react';


const ControlSlider = ({ 
    label, value, min, max, step, onChange, icon: Icon, formatFn 
}: { 
    label: string, value: number, min: number, max: number, step: number, 
    onChange: (v: number) => void, icon: any, formatFn?: (v: number) => string 
}) => {
    return (
        <div className="flex flex-col gap-1.5 group/slider transition-all duration-300">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-[8px] uppercase font-black tracking-[0.2em] text-zinc-500 group-hover/slider:text-zinc-400 transition-colors">
                    <Icon size={10} className="opacity-50 group-hover/slider:opacity-100 transition-opacity" />
                    <span>{label}</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-[#C5A572] drop-shadow-[0_0_8px_rgba(197,165,114,0.3)]">
                    {formatFn ? formatFn(value) : value.toFixed(2)}
                </span>
            </div>
            <div className="relative h-4 flex items-center">
                <div className="absolute inset-x-0 h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-[#C5A572] to-[#A38656] shadow-[0_0_10px_rgba(197,165,114,0.4)] transition-all duration-300"
                        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                    />
                </div>
                <input 
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                    className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.4)] border border-[#C5A572] pointer-events-none transition-transform duration-200 group-hover/slider:scale-125"
                    style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 5px)` }}
                />
            </div>
        </div>
    );
};

const DPadPosition = ({ 
    onMove 
}: { 
    onMove: (dir: 'up' | 'down' | 'left' | 'right') => void 
}) => {
    return (
        <div className="flex flex-col gap-3 py-1">
            <div className="flex items-center gap-2 px-1 text-[8px] uppercase font-black tracking-[0.2em] text-zinc-500">
                <Maximize size={10} className="rotate-45 opacity-50" />
                <span>Placement</span>
            </div>
            <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
                <div />
                <RepeatButton icon={ArrowUp} onClick={() => onMove('up')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#C5A572]/50 hover:bg-[#C5A572]/10 hover:text-[#C5A572] transition-all shadow-md" />
                <div />
                <RepeatButton icon={ArrowLeft} onClick={() => onMove('left')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#C5A572]/50 hover:bg-[#C5A572]/10 hover:text-[#C5A572] transition-all shadow-md" />
                <RepeatButton icon={ArrowDown} onClick={() => onMove('down')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#C5A572]/50 hover:bg-[#C5A572]/10 hover:text-[#C5A572] transition-all shadow-md" />
                <RepeatButton icon={ArrowRight} onClick={() => onMove('right')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#C5A572]/50 hover:bg-[#C5A572]/10 hover:text-[#C5A572] transition-all shadow-md" />
            </div>
        </div>
    );
};

const PanelToggle = ({ 
    isOpen, onClick, side, icon: Icon 
}: { 
    isOpen: boolean, onClick: () => void, side: 'left' | 'right', icon: any 
}) => {
    if (isOpen) return null;
    return (
        <button
            onClick={onClick}
            className={cn(
                "absolute top-4 z-30 w-10 h-10 flex items-center justify-center bg-[#0c0b0a]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:border-[#C5A572]/50 transition-all active:scale-95 cursor-pointer",
                side === 'left' ? "left-4" : "right-4"
            )}
        >
            <Icon size={18} className="text-white/60 hover:text-[#C5A572] transition-colors" />
        </button>
    );
};

const ShirtSettingsPanel = ({
    isOpen,
    onClose,
    onReset,
    onViewChange,
    status
}: {
    isOpen: boolean,
    onClose: () => void,
    onReset: () => void,
    onViewChange: (view: 'front' | 'back' | 'left' | 'right' | 'reset') => void,
    status: string
}) => {
    const { shirtColor, setShirtColor } = useFittingRoomStore();
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="absolute top-4 right-4 z-20 w-64 bg-[#0c0b0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 flex flex-col gap-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.6)] border-t-white/20"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Garment Studio</span>
                            <div className="flex items-center gap-1">
                                <div className={cn(
                                    "w-1 h-1 rounded-full",
                                    status === "Synced" || status === "Restored" ? "bg-[#C5A572] animate-pulse" : "bg-white/20"
                                )} />
                                <span className="text-[8px] text-zinc-500 font-bold tracking-tight uppercase">{status}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onReset} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group" title="Reset Camera">
                                <RotateCcw size={12} className="text-zinc-500 group-hover:text-white" />
                            </button>
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 flex items-center justify-center bg-[#C5A572]/10 border border-[#C5A572]/30 rounded-full transition-all text-[#C5A572] hover:bg-[#C5A572]/20 active:scale-90"
                                title="Close Panel"
                            >
                                <Settings2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Shirt Color */}
                    <div className="flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-black px-1">Shirt Color</span>
                        <div className="flex flex-wrap gap-2 px-1">
                            {SHIRT_COLORS.map((color) => (
                                <button
                                    key={color.hex}
                                    onClick={() => setShirtColor(color.hex)}
                                    className={cn(
                                        "w-6 h-4 rounded-full transition-all duration-300",
                                        shirtColor === color.hex ? "ring-1 ring-white ring-offset-1 ring-offset-black scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "opacity-40 hover:opacity-100 cursor-pointer border border-white/10"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* View Selector */}
                    <div className="flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-black px-1">Viewing Angle</span>
                        <div className="grid grid-cols-2 gap-2">
                            {['Front', 'Back', 'Left', 'Right'].map((label) => (
                                <button 
                                    key={label}
                                    onClick={() => onViewChange(label.toLowerCase() as any)} 
                                    className="py-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-[9px] font-black tracking-widest uppercase transition-all"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const GraphicSettingsPanel = ({
    isOpen,
    onClose,
    decalState,
    setDecalState,
    onOpenCrop,
    is3D = true
}: {
    isOpen: boolean,
    onClose: () => void,
    decalState: DecalState,
    setDecalState: (s: DecalState) => void,
    onOpenCrop: () => void,
    is3D?: boolean
}) => {
    const update = (field: keyof DecalState, value: any) => {
        setDecalState({ ...decalState, [field]: value });
    };

    const handleMove = (dir: 'up' | 'down' | 'left' | 'right') => {
        const step = 0.005;
        const newPos = [...decalState.pos] as [number, number, number];
        if (dir === 'up') newPos[1] += step;
        if (dir === 'down') newPos[1] -= step;
        if (dir === 'left') newPos[0] -= step;
        if (dir === 'right') newPos[0] += step;
        
        newPos[0] = Math.max(-1.5, Math.min(1.5, newPos[0]));
        newPos[1] = Math.max(-1.5, Math.min(1.5, newPos[1]));
        
        update('pos', newPos);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    className="absolute top-4 left-4 z-20 w-60 bg-[#0c0b0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.6)] border-t-white/20"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1">
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 flex items-center justify-center bg-[#C5A572]/10 border border-[#C5A572]/30 rounded-full transition-all text-[#C5A572] hover:bg-[#C5A572]/20 active:scale-90"
                            title="Close Panel"
                        >
                            <Sliders size={18} />
                        </button>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Graphic Engine</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <span className="text-[8px] text-zinc-500 font-bold tracking-tight uppercase">Active Layer</span>
                            </div>
                        </div>
                    </div>

                    {/* Transformation Sliders */}
                    <div className="flex flex-col gap-5 py-2 border-y border-white/5">
                        <ControlSlider
                            label="Size"
                            icon={Maximize}
                            value={decalState.scale}
                            min={0.05} max={3.0} step={0.01}
                            onChange={(v) => update('scale', v)}
                            formatFn={(v) => `${(v * 100).toFixed(0)}%`}
                        />
                        <ControlSlider
                            label="Rotation"
                            icon={RotateCw}
                            value={decalState.rot}
                            min={-Math.PI} max={Math.PI} step={0.01}
                            onChange={(v) => update('rot', v)}
                            formatFn={(v) => `${Math.round((v * 180) / Math.PI)}°`}
                        />
                    </div>

                    {/* Crop Utility */}
                    <div className="flex flex-col gap-3 px-1">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-black">Design Tools</span>
                        <button
                            onClick={onOpenCrop}
                            className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#C5A572]/50 hover:bg-[#C5A572]/5 transition-all text-white active:scale-95 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-[#C5A572]/10 rounded-lg text-[#C5A572] group-hover:bg-[#C5A572]/20 transition-colors">
                                    <Crop size={16} />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Crop Graphic</span>
                                    <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-tighter">Enter 2D Studio</span>
                                </div>
                            </div>
                            <Plus size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Position D-Pad */}
                    <div className="pb-1">
                        <DPadPosition onMove={handleMove} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// LoadingFallback is now below

const LoadingFallback = () => (
    <Html center>
        <div className="flex flex-col items-center gap-4 bg-black/60 backdrop-blur-2xl px-8 py-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-[#C5A572]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#C5A572] animate-spin" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-[12px] text-white font-black tracking-[0.4em] uppercase">DaVinci</span>
                <span className="text-[8px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Loading 3D Engine</span>
            </div>
        </div>
    </Html>
);

export const Model3DViewer = () => {
    const { 
        selected3DModelPath, 
        designs, 
        activeDesignId, 
        decalState: storeDecalState, 
        shouldOpenFromProgress, 
        setShouldOpenFromProgress, 
        setDecalState: setStoreDecalState, 
        shirtColor,
        updateActiveDesignImage
    } = useFittingRoomStore();
    const controlsRef = useRef<any>(null);
    const activeDesign = designs.find(d => d.id === activeDesignId);
    const designTexture = activeDesign ? (activeDesign.fullImage || activeDesign.thumbnail || FALLBACK_TEXTURE) : FALLBACK_TEXTURE;

    // UI Panels State
    const [isShirtPanelOpen, setIsShirtPanelOpen] = useState(true);
    const [isGraphicPanelOpen, setIsGraphicPanelOpen] = useState(true);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [isSelected, setIsSelected] = useState(false);


    const [decalState, setDecalState] = useState<DecalState>(() => {


        if (storeDecalState && shouldOpenFromProgress) return storeDecalState;
        return { pos: [0, 0, 0], scale: 0.3, rot: 0 };
    });

    const [viewerStatus, setViewerStatus] = useState("Initializing...");
    const [isRestoring, setIsRestoring] = useState(true);
    const lastActiveDesignId = useRef<string | null>(null);

    useEffect(() => {
        if (shouldOpenFromProgress) setShouldOpenFromProgress(false);
    }, [shouldOpenFromProgress, setShouldOpenFromProgress]);

    useEffect(() => {
        setStoreDecalState(decalState);
    }, [decalState, setStoreDecalState]);

    const resetToDefaults = useCallback(() => {
        console.log("[Model3DViewer] Resetting to defaults for path:", selected3DModelPath);
        const isDress = selected3DModelPath?.toLowerCase().includes('dress');
        const isFemaleTee = selected3DModelPath?.toLowerCase().includes('female') && !isDress;
        if (isDress) setDecalState({ pos: [0, 0.2, 0], scale: 0.4, rot: 0 });
        else if (isFemaleTee) setDecalState({ pos: [0, 0, 0], scale: 0.3, rot: 0 });
        else setDecalState({ pos: [0, 0, 0], scale: 0.35, rot: 0 });
    }, [selected3DModelPath]);

    const handleViewChange = (view: 'front' | 'back' | 'left' | 'right' | 'reset') => {
        if (!controlsRef.current) return;
        const ctrls = controlsRef.current;
        switch (view) {
            case 'front': ctrls.setAzimuthalAngle(0); ctrls.setPolarAngle(Math.PI / 2); break;
            case 'back': ctrls.setAzimuthalAngle(Math.PI); ctrls.setPolarAngle(Math.PI / 2); break;
            case 'left': ctrls.setAzimuthalAngle(Math.PI / 2); ctrls.setPolarAngle(Math.PI / 2); break;
            case 'right': ctrls.setAzimuthalAngle(-Math.PI / 2); ctrls.setPolarAngle(Math.PI / 2); break;
            case 'reset': ctrls.reset(); break;
        }
    };

    useEffect(() => {
        const syncPlacement = async () => {
            console.log("[Model3DViewer] Syncing placement for design:", activeDesignId, "Model:", selected3DModelPath);
            if (!activeDesignId) {
                resetToDefaults();
                setIsRestoring(false);
                lastActiveDesignId.current = null;
                return;
            }

            if (storeDecalState && lastActiveDesignId.current === null) {
                setViewerStatus("Restored");
                lastActiveDesignId.current = activeDesignId;
                setTimeout(() => setIsRestoring(false), 800);
                return;
            }

            setIsRestoring(true);
            setViewerStatus("Fetching...");
            try {
                const { supabase } = await import('@/lib/supabase/client');
                const { data } = await (supabase as any).from('images').select('metadata').eq('id', activeDesignId).single();
                const placement = (data?.metadata as any)?.placement;
                if (placement) {
                    setDecalState(placement);
                    setViewerStatus("Restored");
                } else {
                    setViewerStatus("Ready");
                }
            } catch (err) {
                console.error("Restoration failed:", err);
                resetToDefaults();
            } finally {
                lastActiveDesignId.current = activeDesignId;
                setTimeout(() => setIsRestoring(false), 800);
            }
        };
        syncPlacement();
    }, [activeDesignId, selected3DModelPath, resetToDefaults]);

    useEffect(() => {
        if (isRestoring || !activeDesignId) return;
        const timer = setTimeout(async () => {
            try {
                setViewerStatus("Syncing...");
                if (!isValidUUID(activeDesignId)) return;
                const manager = getSessionManager();
                await manager.savePlacement(activeDesignId, {
                    pos: decalState.pos,
                    scale: decalState.scale,
                    rot: decalState.rot
                });
                setViewerStatus("Synced");
            } catch (err) {
                console.error("Auto-sync failed:", err);
                setViewerStatus("Sync Error");
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [decalState, activeDesignId, isRestoring]);

    return (
        <div className="w-full h-full bg-transparent rounded-xl overflow-hidden relative">
            {/* Split Control Panels */}
            {/* Left Panel Toggle */}
            <PanelToggle 
                isOpen={isGraphicPanelOpen} 
                onClick={() => setIsGraphicPanelOpen(!isGraphicPanelOpen)} 
                side="left" 
                icon={Sliders} 
            />
            {/* Right Panel Toggle */}
            <PanelToggle 
                isOpen={isShirtPanelOpen} 
                onClick={() => setIsShirtPanelOpen(!isShirtPanelOpen)} 
                side="right" 
                icon={Settings2} 
            />

            <GraphicSettingsPanel 
                isOpen={isGraphicPanelOpen}
                onClose={() => setIsGraphicPanelOpen(false)}
                decalState={decalState}
                setDecalState={setDecalState}
                onOpenCrop={() => setIsCropModalOpen(true)}
            />

            <ShirtSettingsPanel 
                isOpen={isShirtPanelOpen}
                onClose={() => setIsShirtPanelOpen(false)}
                onReset={resetToDefaults}
                onViewChange={handleViewChange}
                status={viewerStatus}
            />

            <Canvas
                key={selected3DModelPath}
                dpr={[1, 1.5]}
                shadows={false}
                camera={{ position: [0, 0, 3.5], fov: 50 }}
                gl={{ 
                    preserveDrawingBuffer: true, 
                    antialias: true,
                    alpha: true 
                }}
            >
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />
                <pointLight position={[-10, -10, -10]} intensity={0.4} />
                <Suspense fallback={<LoadingFallback />}>
                    {selected3DModelPath?.toLowerCase().includes('basic') ? (
                        <BasicTeeModel
                            key={selected3DModelPath}
                            modelPath={selected3DModelPath}
                            shirtColor={shirtColor}
                            designTexture={designTexture}
                            decalState={decalState}
                            setDecalState={setDecalState}
                            onStatusChange={setViewerStatus}
                            isDragging={isDragging}
                            setIsDragging={setIsDragging}
                            isResizing={isResizing}
                            setIsResizing={setIsResizing}
                            isRotating={isRotating}
                            setIsRotating={setIsRotating}
                            isSelected={isSelected}
                            setIsSelected={setIsSelected}
                        />
                    ) : (
                        <FemaleTeeModel
                            key={selected3DModelPath}
                            modelPath={selected3DModelPath || '/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb'}
                            shirtColor={shirtColor}
                            designTexture={designTexture}
                            decalState={decalState}
                            setDecalState={setDecalState}
                            onStatusChange={setViewerStatus}
                            isDragging={isDragging}
                            setIsDragging={setIsDragging}
                            isResizing={isResizing}
                            setIsResizing={setIsResizing}
                            isRotating={isRotating}
                            setIsRotating={setIsRotating}
                            isSelected={isSelected}
                            setIsSelected={setIsSelected}
                        />
                    )}



                    <Environment preset="city" />
                </Suspense>
                <OrbitControls 
                    ref={controlsRef} 
                    enablePan={false} 
                    enableZoom={!isDragging && !isResizing} 
                    enableRotate={!isDragging && !isResizing}
                    minDistance={2} 
                    maxDistance={10} 
                    makeDefault 
                />
            </Canvas>

            {/* Premium Crop Modal */}
            <GraphicCropModal
                isOpen={isCropModalOpen}
                onClose={() => setIsCropModalOpen(false)}
                imageSrc={designTexture}
                onApply={(croppedUrl) => {
                    updateActiveDesignImage(croppedUrl);
                }}
            />

        </div>
    );
};

useGLTF.preload('/Apparel Media/Shirt 3D Models/basic_t-shirt.glb', true);
useGLTF.preload('/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb', true);
