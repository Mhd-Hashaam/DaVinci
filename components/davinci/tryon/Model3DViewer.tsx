'use client';

import React, { useRef, useEffect, Suspense, useMemo, useState, useCallback } from 'react';
import { Canvas, createPortal } from '@react-three/fiber';
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
        e.preventDefault();
        e.stopPropagation();
        onClick();
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                onClick();
            }, 50);
        }, 300);
    }, [onClick]);

    useEffect(() => stop, [stop]);

    return (
        <button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            className={cn(
                "p-2 rounded-md bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors border border-white/5 text-white/80 hover:text-white flex items-center justify-center",
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

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <Icon size={12} />
                <span>{label}</span>
            </div>

            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                <RepeatButton icon={Minus} onClick={() => handleStep(-1)} className="h-7 w-7" />
                <input
                    type="text"
                    value={tempValue}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-transparent text-center font-mono text-white text-[10px] font-medium outline-none border-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                />
                <RepeatButton icon={Plus} onClick={() => handleStep(1)} className="h-7 w-7" />
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
const TShirtModel = ({
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
    const texture = useTexture(designTexture || FALLBACK_TEXTURE);

    const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const [aspectRatio, setAspectRatio] = useState(1);
    const [allMeshes, setAllMeshes] = useState<THREE.Mesh[]>([]);
    const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);

    // SURFACE SNAPPING STATE (Stored in World Space)
    const [worldComputedPos, setWorldComputedPos] = useState<THREE.Vector3>(new THREE.Vector3());
    const [worldComputedQuat, setWorldComputedQuat] = useState<THREE.Quaternion>(new THREE.Quaternion());

    // Texture Settings
    useEffect(() => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = 16;
        texture.needsUpdate = true;
        if (texture.image && 'width' in (texture.image as any)) {
            const img = texture.image as HTMLImageElement;
            setAspectRatio(img.width / img.height);
        }
    }, [texture]);

    // Mesh Setup & Initial Color
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
                if (mat && mat.color) {
                    mat.color.set(shirtColor);
                    mat.metalness = 0.0;
                    mat.roughness = 0.8;
                    mat.side = THREE.DoubleSide;
                    mat.needsUpdate = true;
                }
            }
        });
        setAllMeshes(meshes);
        setTargetMesh(largest);
    }, [scene, shirtColor]);

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
                onStatusChange("Surface Snapped");
            }
        } else {
            onStatusChange("Searching...");
        }
    }, [decalState.pos, targetMesh, onStatusChange]);

    const isDress = selected3DModelPath?.toLowerCase().includes('dress');
    const isFemaleTee = selected3DModelPath?.toLowerCase().includes('female') && !isDress;

    const groupScale = isDress ? 0.007 : (isFemaleTee ? 2.5 : 3);
    const groupPosition: [number, number, number] = isDress ? [0, -4.0, 0] : (isFemaleTee ? [0, -1.2, 0] : [0, 0.2, 0]);
    const groupRotation: [number, number, number] = [0, -Math.PI / 2, 0];

    const showDecal = designTexture && designTexture !== FALLBACK_TEXTURE && targetMesh;

    return (
        <group scale={groupScale} position={groupPosition} rotation={groupRotation}>
            <primitive object={scene} />
            {showDecal && allMeshes.map((mesh, i) => {
                const meshWorldQuat = new THREE.Quaternion();
                const meshWorldScale = new THREE.Vector3();
                mesh.getWorldQuaternion(meshWorldQuat);
                mesh.getWorldScale(meshWorldScale);

                // SMART DEPTH & OFFSET for Anti-Bleed + Extreme Wrapping
                const safeInternalDepth = 0.15; // Shallow penetration to avoid back-side ghosting
                const totalDepth = Math.max(1.5, decalState.scale * 4.0); // Large depth for extreme curvature coverage
                const outwardOffset = (totalDepth / 2) - safeInternalDepth; // Center offset to hug front surface

                const directionVector = new THREE.Vector3(0, 0, 1).applyQuaternion(worldComputedQuat);
                const offsetPosWorld = worldComputedPos.clone().add(directionVector.multiplyScalar(outwardOffset));

                const localPos = mesh.worldToLocal(offsetPosWorld);
                const localQuat = worldComputedQuat.clone().premultiply(meshWorldQuat.invert());
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
                            polygonOffsetFactor={-50}
                            depthTest={true}
                            roughness={0.4}
                            metalness={0.0}
                            toneMapped={false}
                            emissiveMap={texture}
                            emissiveIntensity={1.2}
                            emissive={new THREE.Color(0xffffff)}
                            color={new THREE.Color(0xffffff)}
                        />
                    </Decal>,
                    mesh
                );
            })}
        </group>
    );
};

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
