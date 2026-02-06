'use client';

import React, { useRef, useEffect, Suspense, useMemo, useState, useCallback } from 'react';
import { Canvas, createPortal, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Decal, useTexture, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { RotateCw, Maximize, RotateCcw, Minus, Plus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSessionManager } from '@/lib/storage/SessionManager';

// Fallback design texture
const FALLBACK_TEXTURE = '/assets/design-fallback.png';

interface DecalState {
    pos: [number, number, number];
    scale: number;
    rot: number;
}

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
        if (e.button !== 0) return; // Only left click
        e.preventDefault();
        e.stopPropagation();
        onClick();

        // Faster response: 250ms initial wait, then 50ms pulse
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

    // SCRUBBER LOGIC
    const handleScrubDown = (e: React.PointerEvent) => {
        if (e.button !== 0 || isFocused) return; // Left click and not focused

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

            // If we didn't drag, treat as a click to focus
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

                {/* Reset Hint on hover */}
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
                    <button onClick={onReset} className="p-1.5 hover:bg-white/10 rounded-md transition-colors group" title="Reset Design">
                        <RotateCcw size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>

            {/* View Presets */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Camera Views</span>
                <div className="grid grid-cols-5 gap-1.5">
                    <button onClick={() => onViewChange('front')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1" title="Front">
                        <ArrowDown size={12} className="rotate-180" />
                        <span>FRT</span>
                    </button>
                    <button onClick={() => onViewChange('back')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1" title="Back">
                        <ArrowUp size={12} className="rotate-180" />
                        <span>BCK</span>
                    </button>
                    <button onClick={() => onViewChange('left')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1" title="Left">
                        <ArrowLeft size={12} />
                        <span>LFT</span>
                    </button>
                    <button onClick={() => onViewChange('right')} className="p-2 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold flex flex-col items-center gap-1" title="Right">
                        <ArrowRight size={12} />
                        <span>RGT</span>
                    </button>
                    <button onClick={() => onViewChange('reset')} className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex flex-col items-center gap-1" title="Reset View">
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

// ----------------------------------------------------------------------
// 3. T-Shirt Model Component
// ----------------------------------------------------------------------
const TShirtModel = React.memo(({
    designTexture,
    decalState,
    setDecalState,
    onStatusChange
}: {
    designTexture: string,
    decalState: DecalState,
    setDecalState: (s: DecalState) => void,
    onStatusChange: (s: string) => void
}) => {
    const { shirtColor, selected3DModelPath } = useFittingRoomStore();
    const modelPath = selected3DModelPath || '/Apparel Media/Shirt 3D Models/basic_t-shirt.glb';

    const gltf = useGLTF(modelPath);
    const { camera } = useThree();

    // MANUAL TEXTURE MANAGEMENT
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [aspectRatio, setAspectRatio] = useState(1);

    useEffect(() => {
        if (!designTexture || designTexture === FALLBACK_TEXTURE) {
            setTexture(null);
            return;
        }

        let isSubscribed = true;
        const loader = new THREE.TextureLoader();

        loader.load(designTexture, (newTex) => {
            if (!isSubscribed) {
                newTex.dispose();
                return;
            }

            newTex.colorSpace = THREE.SRGBColorSpace;
            newTex.anisotropy = 16;
            newTex.needsUpdate = true;

            if (newTex.image) {
                const img = newTex.image as HTMLImageElement;
                setAspectRatio(img.width / img.height);
            }

            setTexture(prev => {
                if (prev) prev.dispose();
                return newTex;
            });
            console.log("3D Texture Loaded & Optimized");
        });

        return () => {
            isSubscribed = false;
        };
    }, [designTexture]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (texture) texture.dispose();
        };
    }, []);

    const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const [allMeshes, setAllMeshes] = useState<THREE.Mesh[]>([]);
    const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);

    // SURFACE SNAPPING STATE
    const [worldComputedPos, setWorldComputedPos] = useState<THREE.Vector3 | null>(null);
    const [worldComputedQuat, setWorldComputedQuat] = useState<THREE.Quaternion | null>(null);

    // UNIFORMS
    const uniforms = useMemo(() => ({
        uProjectorDir: { value: new THREE.Vector3(0, 0, 1) },
        uHitPoint: { value: new THREE.Vector3(0, 0, 0) }
    }), []);

    const isDress = selected3DModelPath?.toLowerCase().includes('dress');
    const isFemaleTee = selected3DModelPath?.toLowerCase().includes('female') && !isDress;

    const groupScale = isDress ? 0.007 : (isFemaleTee ? 2.5 : 3);
    const groupPosition: [number, number, number] = isDress ? [0, -4.0, 0] : (isFemaleTee ? [0, -1.2, 0] : [0, 0.2, 0]);
    const groupRotation: [number, number, number] = [0, -Math.PI / 2, 0];


    // Update uniforms when snapping changes
    const [uniformsReady, setUniformsReady] = useState(false);

    useEffect(() => {
        if (worldComputedPos && worldComputedQuat) {
            // Projector direction = outward surface normal at hit point
            const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(worldComputedQuat).normalize();
            uniforms.uProjectorDir.value.copy(dir);
            uniforms.uHitPoint.value.copy(worldComputedPos);

            // Just being ready is enough if we have coords
            setUniformsReady(true);
        } else {
            setUniformsReady(false);
        }
    }, [worldComputedPos, worldComputedQuat, uniforms]);

    // Mesh Color Update (Lightweight)
    useEffect(() => {
        if (!scene) return;
        scene.traverse((child: any) => {
            if (child.isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat && mat.color) {
                    mat.color.set(shirtColor);
                }
            }
        });
    }, [scene, shirtColor]);

    // Mesh Extraction & Disposal (Heavyweight)
    useEffect(() => {
        if (!scene) return;
        const meshes: THREE.Mesh[] = [];
        let largest: THREE.Mesh | null = null;
        let maxCount = 0;

        scene.traverse((child: any) => {
            if (child.isMesh && child.visible) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                meshes.push(mesh);

                if (mesh.geometry) {
                    const count = mesh.geometry.attributes.position?.count || 0;
                    if (count > maxCount) {
                        maxCount = count;
                        largest = mesh;
                    }
                }
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat) {
                    mat.metalness = 0.0;
                    mat.roughness = 0.8;
                    mat.side = THREE.DoubleSide;
                    mat.needsUpdate = true;
                }
            }
        });
        setAllMeshes(meshes);
        setTargetMesh(largest);

        return () => {
            // We only dispose of the scene children if we are actually switching models or unmounting.
            // This Effect ONLY fires when 'scene' (the clone) changes.
            scene.traverse((child: any) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m: any) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        };
    }, [scene]);

    // CYLINDRICAL SURFACE SNAPPING
    useEffect(() => {
        if (!targetMesh) return;

        const raycaster = new THREE.Raycaster();
        const meshWorldPos = new THREE.Vector3();
        targetMesh.getWorldPosition(meshWorldPos);

        const angle = (decalState.pos[0] / 1.5) * Math.PI;
        const sourceDistance = 10;

        const worldX = meshWorldPos.x + Math.sin(angle) * sourceDistance;
        const worldZ = meshWorldPos.z + Math.cos(angle) * sourceDistance;
        const worldY = meshWorldPos.y + decalState.pos[1];

        const worldSource = new THREE.Vector3(worldX, worldY, worldZ);
        const worldTarget = new THREE.Vector3(meshWorldPos.x, worldY, meshWorldPos.z);
        const worldDir = worldTarget.clone().sub(worldSource).normalize();

        raycaster.set(worldSource, worldDir);
        const intersects = raycaster.intersectObject(targetMesh);

        if (intersects.length > 0) {
            const hit = intersects[0];
            if (hit.face) {
                const meshQuat = new THREE.Quaternion();
                targetMesh.getWorldQuaternion(meshQuat);
                const normal = hit.face.normal.clone().applyQuaternion(meshQuat);

                const dummy = new THREE.Object3D();
                const lookAtPos = hit.point.clone().add(normal);
                const worldUp = new THREE.Vector3(0, 1, 0);
                const matrix = new THREE.Matrix4().lookAt(hit.point, lookAtPos, worldUp);
                dummy.quaternion.setFromRotationMatrix(matrix);

                setWorldComputedPos(hit.point.clone());
                setWorldComputedQuat(dummy.quaternion.clone());
                onStatusChange("Ready");
            }
        } else {
            setWorldComputedPos(null);
            setWorldComputedQuat(null);
            onStatusChange("Searching...");
        }
    }, [decalState.pos, targetMesh, onStatusChange]);


    // Decal only shows when texture is loaded AND snapping is successful AND uniforms are ready.
    const showDecal = texture && targetMesh && worldComputedPos && worldComputedQuat && uniformsReady;

    return (
        <group scale={groupScale} position={groupPosition} rotation={groupRotation}>
            <primitive object={scene} />
            {showDecal && allMeshes.map((mesh, i) => {
                const meshWorldQuat = new THREE.Quaternion();
                const meshWorldScale = new THREE.Vector3();
                mesh.getWorldQuaternion(meshWorldQuat);
                mesh.getWorldScale(meshWorldScale);

                // SCALE-AWARE DEPTH (Capped at 0.5 units to prevent back-bleed)
                // The depth scales with the decal size to allow larger designs to wrap,
                // but is capped at 50cm to ensure it never reaches the back of the shirt.
                const totalDepth = Math.min(0.5, decalState.scale * 0.5);

                const localPos = mesh.worldToLocal(worldComputedPos!.clone());
                const localQuat = worldComputedQuat!.clone().premultiply(meshWorldQuat.invert());
                const localRot = new THREE.Euler().setFromQuaternion(localQuat);

                const finalScale: [number, number, number] = [
                    (decalState.scale * aspectRatio) / meshWorldScale.x,
                    decalState.scale / meshWorldScale.y,
                    totalDepth / meshWorldScale.z
                ];

                return createPortal(
                    <Decal
                        key={i}
                        position={localPos}
                        rotation={[localRot.x, localRot.y, localRot.z + decalState.rot]}
                        scale={finalScale}
                    >
                        <meshStandardMaterial
                            map={texture}
                            transparent
                            polygonOffset
                            polygonOffsetFactor={-10}
                            depthTest={true}
                            depthWrite={false}
                            side={THREE.FrontSide}
                            roughness={0.4}
                            metalness={0.0}
                            toneMapped={false}
                            emissiveMap={texture}
                            emissiveIntensity={1.2}
                            emissive={new THREE.Color(0xffffff)}
                            color={new THREE.Color(0xffffff)}
                        // Custom shader culling removed for stability. 
                        // Thin projection depth (20cm) handles back-bleed naturally.
                        />
                    </Decal>,
                    mesh
                );
            })}
        </group>
    );
});

TShirtModel.displayName = 'TShirtModel';

const LoadingFallback = () => (
    <Html center>
        <div className="flex flex-col items-center gap-3 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase whitespace-nowrap">Loading...</span>
        </div>
    </Html>
);

export const Model3DViewer = () => {
    const { selected3DModelPath, designs, activeDesignId } = useFittingRoomStore();
    const controlsRef = useRef<any>(null);
    const activeDesign = designs.find(d => d.id === activeDesignId);
    const designTexture = activeDesign ? (activeDesign.fullImage || activeDesign.thumbnail || FALLBACK_TEXTURE) : FALLBACK_TEXTURE;

    const [decalState, setDecalState] = useState<DecalState>({ pos: [0, 0.25, 0.12], scale: 0.7, rot: 0 });
    const [viewerStatus, setViewerStatus] = useState("Initializing...");
    const [isRestoring, setIsRestoring] = useState(true);
    const lastActiveDesignId = useRef<string | null>(null);

    const resetToDefaults = useCallback(() => {
        const isDress = selected3DModelPath?.toLowerCase().includes('dress');
        const isFemaleTee = selected3DModelPath?.toLowerCase().includes('female') && !isDress;
        if (isDress) setDecalState({ pos: [0, 8, 15], scale: 30, rot: 0 });
        else if (isFemaleTee) setDecalState({ pos: [0, 0, 0.15], scale: 0.6, rot: 0 });
        else setDecalState({ pos: [0, 0.05, 0.12], scale: 0.7, rot: 0 });
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

    // RESTORE logic
    useEffect(() => {
        if (activeDesignId === lastActiveDesignId.current) return;

        const syncPlacement = async () => {
            if (!activeDesignId) {
                resetToDefaults();
                setIsRestoring(false);
                lastActiveDesignId.current = null;
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
                    resetToDefaults();
                    setViewerStatus("Default View");
                }
            } catch (err) {
                console.error("Restoration failed:", err);
                resetToDefaults();
            } finally {
                lastActiveDesignId.current = activeDesignId;
                // Add a small buffer to prevent auto-save from overriding with restoration defaults
                setTimeout(() => setIsRestoring(false), 800);
            }
        };
        syncPlacement();
    }, [activeDesignId, resetToDefaults]);

    // AUTO-SAVE logic
    useEffect(() => {
        if (isRestoring || !activeDesignId) return;
        const timer = setTimeout(async () => {
            try {
                setViewerStatus("Syncing...");
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
            <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 50 }} gl={{ preserveDrawingBuffer: true, antialias: true }}>
                <ambientLight intensity={0.9} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Suspense fallback={<LoadingFallback />}>
                    <Center position={[0, -0.2, 0]}>
                        <TShirtModel
                            key={selected3DModelPath}
                            designTexture={designTexture}
                            decalState={decalState}
                            setDecalState={setDecalState}
                            onStatusChange={setViewerStatus}
                        />
                    </Center>
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} minDistance={2} maxDistance={10} makeDefault />
            </Canvas>
        </div>
    );
};

useGLTF.preload('/Apparel Media/Shirt 3D Models/basic_t-shirt.glb');
useGLTF.preload('/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb');
