'use client';

import React, { useRef, useEffect, Suspense, useMemo, useState, useCallback } from 'react';
import { Canvas, createPortal, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Decal, useTexture, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { RotateCw, Maximize, RotateCcw, Minus, Plus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSessionManager } from '@/lib/storage/SessionManager';
import { BasicTeeModel } from './BasicTeeModel';
import { FemaleTeeModel } from './FemaleTeeModel';

// Fallback design texture
const FALLBACK_TEXTURE = '/assets/design-fallback.png';

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

const NumberControl = ({
    label,
    icon: Icon,
    value,
    step,
    min,
    max,
    onChange,
    formatFn = (v: number) => v.toFixed(3)
}: {
    label: string,
    icon: IconComponent,
    value: number,
    step: number,
    min?: number,
    max?: number,
    onChange: (val: number) => void,
    formatFn?: (v: number) => string
}) => {
    const [tempValue, setTempValue] = useState(formatFn(value));
    const [isFocused, setIsFocused] = useState(false);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const scrubStartRef = useRef<{ x: number; val: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasDraggedRef = useRef(false);

    useEffect(() => {
        if (!isFocused) setTempValue(formatFn(value));
    }, [value, isFocused, formatFn]);

    const handleStep = (direction: 1 | -1) => {
        let next = value + (step * direction);
        if (min !== undefined) next = Math.max(min, next);
        if (max !== undefined) next = Math.min(max, next);
        const precision = step.toString().split('.')[1]?.length || 0;
        next = parseFloat(next.toFixed(precision + 1));
        onChange(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempValue(e.target.value);
    };

    const handleBlur = () => {
        setIsFocused(false);
        const parsed = parseFloat(tempValue);
        if (!isNaN(parsed)) {
            let next = parsed;
            if (min !== undefined) next = Math.max(min, next);
            if (max !== undefined) next = Math.min(max, next);
            onChange(next);
        } else {
            setTempValue(formatFn(value));
        }
    };

    const handleScrubDown = (e: React.PointerEvent) => {
        if (e.button !== 0 || isFocused) return;

        hasDraggedRef.current = false;
        setIsScrubbing(true);
        scrubStartRef.current = { x: e.clientX, val: value };

        const handleScrubMove = (moveEvent: PointerEvent) => {
            if (!scrubStartRef.current) return;
            const delta = moveEvent.clientX - scrubStartRef.current.x;
            if (Math.abs(delta) > 3) hasDraggedRef.current = true;

            let multiplier = 1;
            if (moveEvent.shiftKey) multiplier = 10;
            if (moveEvent.altKey || moveEvent.metaKey) multiplier = 0.1;
            const sensitivity = step < 0.01 ? 2 : 1;

            let next = scrubStartRef.current.val + (delta * step * multiplier * sensitivity);
            if (min !== undefined) next = Math.max(min, next);
            if (max !== undefined) next = Math.min(max, next);

            const precision = step.toString().split('.')[1]?.length || 0;
            onChange(parseFloat(next.toFixed(precision + 1)));
        };

        const handleScrubUp = () => {
            setIsScrubbing(false);
            scrubStartRef.current = null;
            window.removeEventListener('pointermove', handleScrubMove);
            window.removeEventListener('pointerup', handleScrubUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            if (!hasDraggedRef.current) {
                inputRef.current?.focus();
            }
        };

        window.addEventListener('pointermove', handleScrubMove);
        window.addEventListener('pointerup', handleScrubUp);
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        let defaultValue = 0;
        if (label === "Scale") defaultValue = 0.7;
        if (label === "Pos Y") defaultValue = 0.05;
        onChange(defaultValue);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.15em] mb-1 select-none text-zinc-500">
                <Icon size={12} />
                <span>{label}</span>
            </div>

            <div
                onPointerDown={handleScrubDown}
                onDoubleClick={handleDoubleClick}
                className={cn(
                    "flex items-center gap-2 bg-black/40 rounded-lg p-1 border transition-all duration-300 group cursor-ew-resize relative",
                    isScrubbing
                        ? "border-cyan-500 bg-black/80 ring-1 ring-cyan-500/20 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        : "border-white/5 hover:border-white/20 hover:bg-black/60",
                    isFocused && "border-white/40 bg-zinc-900 cursor-text"
                )}
                title="Drag to Scrub / Double-Click to Reset"
            >
                <RepeatButton
                    icon={Minus}
                    onClick={() => handleStep(-1)}
                    className={cn(
                        "h-7 w-7 transition-all z-10",
                        !isScrubbing && "group-hover:scale-110",
                        isFocused && "opacity-0 scale-50 pointer-events-none"
                    )}
                />

                <div className="flex-1 relative h-7 flex items-center justify-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={tempValue}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur}
                        onChange={handleInputChange}
                        className={cn(
                            "w-full bg-transparent text-center font-mono text-white text-[10px] font-bold outline-none border-none transition-colors",
                            isScrubbing ? "text-cyan-400" : "text-white",
                            !isFocused && "pointer-events-none select-none"
                        )}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    />
                </div>

                <RepeatButton
                    icon={Plus}
                    onClick={() => handleStep(1)}
                    className={cn(
                        "h-7 w-7 transition-all z-10",
                        !isScrubbing && "group-hover:scale-110",
                        isFocused && "opacity-0 scale-50 pointer-events-none"
                    )}
                />

                {!isScrubbing && !isFocused && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-[7px] text-cyan-500 font-bold uppercase tracking-tighter bg-cyan-500/10 px-1 rounded">Double Click to Reset</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. Controls Component (Right Panel)
// ----------------------------------------------------------------------
const ViewerControls = ({
    decalState,
    setDecalState,
    onReset,
    onViewChange,
    status
}: {
    decalState: DecalState,
    setDecalState: (s: DecalState) => void,
    onReset: () => void,
    onViewChange: (view: 'front' | 'back' | 'left' | 'right' | 'reset') => void,
    status: string
}) => {
    const update = (field: keyof DecalState, value: any) => {
        setDecalState({ ...decalState, [field]: value });
    };

    const updatePos = (idx: number, val: number) => {
        const newPos = [...decalState.pos] as [number, number, number];
        newPos[idx] = val;
        update('pos', newPos);
    };

    return (
        <div className="absolute top-4 right-4 z-20 w-64 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col gap-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Design Studio</span>
                    <span className="text-[8px] text-zinc-600 font-mono tracking-tighter">{status}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onReset} className="p-1.5 hover:bg-white/10 rounded-md transition-colors group cursor-pointer" title="Reset Design">
                        <RotateCcw size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Camera Views</span>
                <div className="grid grid-cols-5 gap-1.5">
                    <button onClick={() => onViewChange('front')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer" title="Front">
                        <ArrowDown size={12} className="rotate-180" />
                        <span>FRT</span>
                    </button>
                    <button onClick={() => onViewChange('back')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer" title="Back">
                        <ArrowUp size={12} className="rotate-180" />
                        <span>BCK</span>
                    </button>
                    <button onClick={() => onViewChange('left')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer" title="Left">
                        <ArrowLeft size={12} />
                        <span>LFT</span>
                    </button>
                    <button onClick={() => onViewChange('right')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer" title="Right">
                        <ArrowRight size={12} />
                        <span>RGT</span>
                    </button>
                    <button onClick={() => onViewChange('reset')} className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer" title="Reset View">
                        <RotateCcw size={12} />
                        <span>RST</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <NumberControl
                    label="Scale"
                    icon={Maximize}
                    value={decalState.scale}
                    step={0.01} min={0.05}
                    onChange={(v) => update('scale', v)}
                />
                <NumberControl
                    label="Rotation"
                    icon={RotateCw}
                    value={decalState.rot}
                    step={Math.PI / 36}
                    min={-Math.PI * 2} max={Math.PI * 2}
                    onChange={(v) => update('rot', v)}
                    formatFn={(v) => `${Math.round((v * 180) / Math.PI)}°`}
                />
                <div className="h-px bg-white/5 my-1" />
                <div className="grid grid-cols-2 gap-3">
                    <NumberControl
                        label="Pos X" icon={ArrowRight} value={decalState.pos[0]}
                        step={0.005} min={-1.5} max={1.5}
                        onChange={(v) => updatePos(0, v)}
                    />
                    <NumberControl
                        label="Pos Y" icon={ArrowUp} value={decalState.pos[1]}
                        step={0.005} min={-1.5} max={1.5}
                        onChange={(v) => updatePos(1, v)}
                    />
                </div>
            </div>
            <div className="text-[9px] text-zinc-600 text-center font-medium italic">
                Cylindrical Wrap Powered by DaVinci
            </div>
        </div>
    );
};

// FemaleTeeModel and BasicTeeModel are now standalone components in their own files.

const LoadingFallback = () => (
    <Html center>
        <div className="flex flex-col items-center gap-3 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase whitespace-nowrap">Loading...</span>
        </div>
    </Html>
);

export const Model3DViewer = () => {
    const { selected3DModelPath, designs, activeDesignId, decalState: storeDecalState, shouldOpenFromProgress, setShouldOpenFromProgress, setDecalState: setStoreDecalState, shirtColor } = useFittingRoomStore();
    const controlsRef = useRef<any>(null);
    const activeDesign = designs.find(d => d.id === activeDesignId);
    const designTexture = activeDesign ? (activeDesign.fullImage || activeDesign.thumbnail || FALLBACK_TEXTURE) : FALLBACK_TEXTURE;

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
        <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black rounded-xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">🧊 3D MODEL</div>
            <ViewerControls decalState={decalState} setDecalState={setDecalState} onReset={resetToDefaults} onViewChange={handleViewChange} status={viewerStatus} />
            <Canvas
                key={selected3DModelPath}
                dpr={[1, 1.5]}
                shadows={false}
                camera={{ position: [0, 0, 3.5], fov: 50 }}
                gl={{ preserveDrawingBuffer: true, antialias: false }}
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
                            onStatusChange={setViewerStatus}
                        />
                    ) : (
                        <FemaleTeeModel
                            key={selected3DModelPath}
                            modelPath={selected3DModelPath || '/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb'}
                            shirtColor={shirtColor}
                            designTexture={designTexture}
                            decalState={decalState}
                            onStatusChange={setViewerStatus}
                        />
                    )}
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} minDistance={2} maxDistance={10} makeDefault />
            </Canvas>
        </div>
    );
};

useGLTF.preload('/Apparel Media/Shirt 3D Models/basic_t-shirt.glb', true);
useGLTF.preload('/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb', true);
