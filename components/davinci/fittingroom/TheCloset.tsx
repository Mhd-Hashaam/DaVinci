'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconGhost2Filled } from '@tabler/icons-react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Shirt, Scissors, PersonStanding, Sparkles } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import { Suspense } from 'react';

// Mini 3D Model Preview Component for Closet Cards
const ModelPreviewMesh = ({ modelPath }: { modelPath: string }) => {
    const gltf = useGLTF(modelPath);

    // Clone to prevent scene sharing & Suppress texture errors
    const clonedScene = React.useMemo(() => {
        const clone = gltf.scene.clone();

        // Traverse and handle materials to prevent texture errors
        clone.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as any;
                if (mesh.material) {
                    // Force update to handle potential missing texture issues gracefully
                    mesh.material.needsUpdate = true;
                    // Optional: could set map to null if we suspect it's broken, but usually needsUpdate is enough
                }
            }
        });

        return clone;
    }, [gltf.scene]);

    // Determine scale based on model type (Dress needs huge reduction)
    const isDress = modelPath.toLowerCase().includes('dress');

    // Scale: Dress = 0.003 (Card size), Others = 1.6
    const scale = isDress ? 0.003 : 1.6;
    const position: [number, number, number] = isDress ? [0, -2.5, 0] : [0, -1.2, 0];
    const rotation: [number, number, number] = isDress ? [0, 0, 0] : [-0.1, 0, 0];

    return (
        <Center>
            <primitive
                object={clonedScene}
                scale={scale}
                position={position}
                rotation={rotation}
            />
        </Center>
    );
};

const ModelPreviewCard = ({ modelPath }: { modelPath: string }) => {
    return (
        <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={1.2} />
                <directionalLight position={[2, 5, 2]} intensity={1.5} />
                <Suspense fallback={null}>
                    <ModelPreviewMesh modelPath={modelPath} />
                </Suspense>
            </Canvas>
        </div>
    );
};

const AVAILABLE_3D_MODELS = [
    { name: 'Basic Tee', path: '/Apparel Media/Shirt 3D Models/basic_t-shirt.glb', icon: <Shirt size={24} /> },
    // { name: 'Long Sleeve', path: '/Apparel Media/Shirt 3D Models/long_sleeve_t-_shirt.glb', icon: <Shirt size={24} className="scale-x-110" /> },
    // { name: 'Oversized', path: '/Apparel Media/Shirt 3D Models/oversized_t-shirt.glb', icon: <Shirt size={28} /> },
    { name: 'Female Tee', path: '/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb', icon: <PersonStanding size={24} /> },
    // { name: 'Sweater', path: '/Apparel Media/Shirt 3D Models/sweater_pack.glb', icon: <Scissors size={24} /> },
    // { name: 'Dress', path: '/Apparel Media/Shirt 3D Models/nycfashion_t-_shirt_dress female.glb', icon: <Sparkles size={24} /> },
];

export const TheCloset: React.FC = () => {
    const {
        selectedShirts,
        activeShirtId,
        setActiveShirt,
        removeShirt,
        closetMode,
        toggleClosetMode,
        triggerApparelView,
        // 3D Mode State
        viewMode,
        selected3DModelPath,
        set3DModel
    } = useFittingRoomStore();

    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

    // Show minimum 5 cards (empty placeholders if needed)
    const minCards = 5;
    const cardCount = Math.max(selectedShirts.length, minCards);
    const emptyCount = cardCount - selectedShirts.length;

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 relative z-50 flex items-center justify-between px-4 h-[50px] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-zinc-500 tracking-widest">
                        Closet
                    </span>
                    <div className="relative w-7 h-7 opacity-50">
                        <Image
                            src="/Icons/ClosetColored.png"
                            alt="Closet Icon"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600">
                        {selectedShirts.length}/10
                    </span>
                    <button
                        onClick={toggleClosetMode}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        {closetMode === 'stacked' ? <Plus size={12} /> : <Minus size={12} />}
                    </button>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    className={cn(
                        "absolute top-0 bottom-0 left-0 right-3 p-4 transition-all duration-500",
                        closetMode === 'expanded'
                            ? "overflow-y-auto container-scroll"
                            : "flex items-center justify-center overflow-hidden"
                    )}
                >
                    <div className={cn(
                        "w-full transition-all duration-500",
                        closetMode === 'expanded' ? "flex flex-col gap-4" : "relative h-full flex items-center justify-center"
                    )}>
                        <AnimatePresence mode="popLayout">
                            {/* UNIFIED LIST: Render fixed slots. 2D vs 3D Mode Switching */}
                            {viewMode === '3d' ? (
                                // 3D MODE: Show Fixed List of Available Models
                                AVAILABLE_3D_MODELS.map((model, i) => {
                                    const isActive = selected3DModelPath === model.path;
                                    const isHovered = hoveredIdx === i;
                                    const showGrayscale = closetMode === 'stacked' && hoveredIdx !== null && hoveredIdx !== i;

                                    // Stack Logic for 3D Models
                                    const boxIndex = i; // Simple stack order
                                    const totalItems = AVAILABLE_3D_MODELS.length;
                                    const isFrontCard = boxIndex === totalItems - 1; // Last item on top? Or first?
                                    // Let's reverse for visual stack like shirts (First item at bottom)
                                    // Actually, let's keep it simple: Index 0 at back.
                                    var stackIndex = i;

                                    const yPos = (stackIndex * 45) - (totalItems * 20); // Adjust to center
                                    const effectiveScale = 1 - (totalItems - 1 - stackIndex) * 0.02;

                                    return (
                                        <motion.div
                                            key={model.path}
                                            layout="position"
                                            className={cn(
                                                "rounded-lg overflow-hidden cursor-pointer group shadow-xl transition-all duration-300 relative",
                                                "aspect-[3/4] bg-zinc-900 border border-white/10",
                                                isActive && "ring-2 ring-inset ring-white/90 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] z-10 scale-[0.97]"
                                            )}
                                            style={{
                                                position: closetMode === 'stacked' ? 'absolute' : 'relative',
                                                width: closetMode === 'stacked' ? '75%' : '100%',
                                                zIndex: closetMode === 'stacked' ? stackIndex + (isHovered ? 100 : 0) : undefined,
                                            }}
                                            animate={closetMode === 'stacked' ? {
                                                y: (isHovered) ? yPos - 20 : yPos,
                                                scale: (isHovered) ? 1.02 : effectiveScale,
                                            } : {
                                                y: 0,
                                                scale: isActive ? 0.97 : 1,
                                            }}
                                            onClick={() => set3DModel(model.path)}
                                            onMouseEnter={() => setHoveredIdx(i)}
                                            onMouseLeave={() => setHoveredIdx(null)}
                                        >
                                            {/* 3D Model Preview */}
                                            <ModelPreviewCard modelPath={model.path} />

                                            {/* Model Name Overlay */}
                                            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                                                <span className="text-[10px] font-bold text-white uppercase text-center px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                                                    {model.name}
                                                </span>
                                            </div>

                                            {/* Active Indicator */}
                                            {isActive && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                            )}
                                        </motion.div>
                                    );
                                })
                            ) : (
                                // 2D MODE: Real Shirts + Empty Slots
                                Array.from({ length: Math.max(selectedShirts.length + emptyCount, 6) }).map((_, i) => { // Increased min count to 6 for even grid
                                    const shirt = selectedShirts[i];
                                    const isRealShirt = !!shirt;

                                    // Common Props
                                    const isActive = isRealShirt && shirt.id === activeShirtId;
                                    const isHovered = hoveredIdx === i;
                                    const showGrayscale = closetMode === 'stacked' && hoveredIdx !== null && hoveredIdx !== i;

                                    // Calculate visual position in stack
                                    const boxIndex = isRealShirt
                                        ? emptyCount + i
                                        : (i - selectedShirts.length);

                                    const totalItems = selectedShirts.length + emptyCount;
                                    const isFrontCard = boxIndex === totalItems - 1;
                                    // More vertical offset so ~30% of back cards are visible
                                    const yPos = (boxIndex * 45) - 130;
                                    const effectiveScale = 1 - (totalItems - 1 - boxIndex) * 0.02;

                                    const key = isRealShirt ? shirt.id : `empty-slot-${i}`;

                                    return (
                                        <motion.div
                                            key={key}
                                            layout="position"
                                            className={cn(
                                                "rounded-lg overflow-hidden cursor-pointer group shadow-xl transition-all duration-300 relative",
                                                "aspect-[3/4]",
                                                isRealShirt
                                                    ? "bg-zinc-900 border border-white/10"
                                                    : "bg-zinc-900 border border-white/10",
                                                // Enhanced Active Indicator: Glow + Border (INSET to avoid clipping)
                                                isActive && "ring-2 ring-inset ring-white/90 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] z-10 scale-[0.97]"
                                            )}
                                            style={{
                                                position: closetMode === 'stacked' ? 'absolute' : 'relative',
                                                width: closetMode === 'stacked' ? '75%' : '100%',
                                                zIndex: closetMode === 'stacked' ? boxIndex + (isHovered ? 100 : 0) : undefined,
                                            }}
                                            animate={closetMode === 'stacked' ? {
                                                y: (!isFrontCard && isHovered) ? yPos - 20 : yPos,
                                                scale: (!isFrontCard && isHovered) ? 1.02 : effectiveScale,
                                            } : {
                                                y: 0,
                                                // Active card scales down slightly in expanded mode
                                                scale: isActive ? 0.97 : 1,
                                            }}
                                            transition={{
                                                layout: { duration: 0.5, type: 'spring', bounce: 0.15 },
                                                default: { duration: 0.4 }
                                            }}
                                            onMouseEnter={() => {
                                                setHoveredIdx(i);
                                                // Trigger Select on Hover for real shirts
                                                if (isRealShirt) {
                                                    setActiveShirt(shirt.id);
                                                }
                                            }}
                                            onMouseLeave={() => setHoveredIdx(null)}
                                        // onClick removed for selection, kept for simple interaction if needed (none for now)
                                        >
                                            {isRealShirt ? (
                                                <>
                                                    <Image
                                                        src={shirt.image}
                                                        alt={shirt.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                    <div className="absolute bottom-3 left-3 right-3">
                                                        <span className={cn(
                                                            "font-bold text-white uppercase tracking-wide",
                                                            "text-[9px]"
                                                        )}>
                                                            {shirt.name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeShirt(shirt.id);
                                                        }}
                                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    >
                                                        <Trash2 size={10} className="text-white/70 hover:text-white" />
                                                    </button>
                                                </>
                                            ) : (
                                                // Empty Slot Content - Styled like a Product Card
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerApparelView();
                                                    }}
                                                    className="flex flex-col items-center justify-center h-full opacity-30 group-hover:opacity-100 transition-all duration-300 pointer-events-auto"
                                                >
                                                    <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Plus className="w-3 h-3 text-white/50 group-hover:text-white" />
                                                    </div>
                                                    <span className="text-[8px] text-zinc-600 group-hover:text-zinc-400 font-bold uppercase tracking-widest">
                                                        {i === selectedShirts.length ? "Add" : "Empty"}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                }))
                            }
                        </AnimatePresence>

                        {/* Empty State Text for Expanded Mode */}
                        {closetMode === 'expanded' && selectedShirts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                                <IconGhost2Filled className="w-8 h-8 text-zinc-600" />
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                                    No Shirts Selected
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};