'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Decal, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';

// The 3D T-shirt model component
const TShirtModel = () => {
    const { shirtColor, designs, activeDesignId, selected3DModelPath } = useFittingRoomStore();

    // Load model dynamically
    const modelPath = selected3DModelPath || '/Apparel Media/Shirt 3D Models/basic_t-shirt.glb';
    const gltf = useGLTF(modelPath);
    const scene = gltf.scene;

    // State to hold the main mesh for attaching the decal
    const [mainMesh, setMainMesh] = React.useState<THREE.Mesh | null>(null);

    // Initial setup: Process the scene once when model changes
    React.useLayoutEffect(() => {
        if (!scene) return;

        let largestMesh: THREE.Mesh | null = null;
        let maxCount = 0;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                // Enable shadows
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // Check size to find "Body" for Decal
                if (mesh.geometry) {
                    const count = mesh.geometry.attributes.position.count;
                    if (count > maxCount) {
                        maxCount = count;
                        largestMesh = mesh;
                    }
                }
            }
        });

        setMainMesh(largestMesh);
    }, [scene]);

    // Apply Material/Color updates to ENTIRE scene
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const mat = mesh.material as THREE.MeshStandardMaterial;
                    if (mat) {
                        mat.color.set(shirtColor);
                        mat.metalness = 0.0;
                        mat.roughness = 1.0;
                        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                        mat.side = THREE.DoubleSide;
                        mat.needsUpdate = true;
                    }
                }
            });
        }
    }, [scene, shirtColor]);

    // Get active design texture
    const activeDesign = designs.find(d => d.id === activeDesignId);
    const designUrl = activeDesign ? (activeDesign.fullImage || activeDesign.thumbnail) : null;

    // Use a transparent 1x1 pixel as fallback
    const fallbackUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const designTexture = useTexture(designUrl || fallbackUrl);

    // Manual Scale/Position Logic
    const isDress = selected3DModelPath?.toLowerCase().includes('dress');
    const isFemaleTee = selected3DModelPath?.toLowerCase().includes('female') && !isDress;

    // Default Scale (user tuned values)
    let modelScale = 3;
    let modelPosition: [number, number, number] = [0, 2.2, 0];

    if (isDress) {
        modelScale = 0.007;
        modelPosition = [0, -4.4, 0];
    } else if (isFemaleTee) {
        modelScale = 2.5;
        modelPosition = [0, -1.5, 0];
    }

    // Decal settings - adjusted per model type
    // PROJECTING ONTO CHEST:
    // Z is forward/back relative to the mesh. 0 is center. Positive Z is "front".
    // Y is up/down. Positive Y is "up" towards neck.
    // X is left/right. 0 is center.

    // Default position (Standard Shirts) - Adjusted depth
    // FIXED: Projection box must include the mesh.
    // Z=0.2 (In front), Scale Z=0.5 (Deep enough to hit Z=0.1)
    let decalPosition: [number, number, number] = [0, 0.25, 0.2];
    let decalRotation: [number, number, number] = [0, 0, 0];
    let decalScale: [number, number, number] = [0.25, 0.25, 0.5];

    if (isDress) {
        // Dress
        decalPosition = [0, 20, 15];
        decalRotation = [0, 0, 0];
        decalScale = [30, 30, 20];
    } else if (isFemaleTee) {
        // Female Tee
        decalPosition = [0, 0.15, 0.2];
        decalRotation = [0, 0, 0];
        decalScale = [0.2, 0.2, 0.5];
    }

    return (
        <Center>
            {/* Render the ENTIRE scene so we see all parts (sleeves, body, trims) */}
            <group scale={modelScale} position={modelPosition} rotation={[0, -Math.PI / 2, 0]}>
                <primitive object={scene} />
            </group>

            {/* Design Decal - Rendered separately on the main mesh */}
            {mainMesh && designUrl && (
                <group scale={modelScale} position={modelPosition} rotation={[0, -Math.PI / 2, 0]}>
                    <mesh
                        geometry={mainMesh.geometry}
                        position={mainMesh.position}
                        rotation={mainMesh.rotation}
                        scale={mainMesh.scale}
                    >
                        {/* Invisible base material */}
                        <meshBasicMaterial transparent opacity={0} />

                        {/* The actual Decal */}
                        <Decal
                            position={decalPosition}
                            rotation={decalRotation}
                            scale={decalScale}
                        >
                            <meshStandardMaterial
                                map={designTexture}
                                transparent
                                polygonOffset
                                polygonOffsetFactor={-10}
                                depthTest={true}
                                depthWrite={false}
                                roughness={0.8}
                            />
                        </Decal>
                    </mesh>
                </group>
            )}
        </Center>
    );
};

// Loading fallback
const LoadingFallback = () => (
    <Html center>
        <div className="flex flex-col items-center gap-3 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase whitespace-nowrap">
                Loading Model...
            </span>
        </div>
    </Html>
);

export const Model3DViewer = () => {
    const { selected3DModelPath } = useFittingRoomStore();

    return (
        <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black rounded-xl overflow-hidden relative">
            {/* 3D Label */}
            <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                🧊 3D MODEL
            </div>

            <Canvas
                shadows
                camera={{ position: [0, 0, 3.5], fov: 50 }}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
                {/* STUDIO LIGHTING SETUP */}
                <ambientLight intensity={1.5} />
                {/* Front Light */}
                <directionalLight position={[0, 5, 10]} intensity={1.5} castShadow />
                {/* Back Light (Rim) */}
                <directionalLight position={[0, 5, -10]} intensity={1.0} />
                {/* Fill Lights */}
                <pointLight position={[-10, 0, 0]} intensity={0.5} />
                <pointLight position={[10, 0, 0]} intensity={0.5} />

                {/* Model - Key forces remount on path change */}
                <Suspense fallback={<LoadingFallback />}>
                    <TShirtModel key={selected3DModelPath} />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={6}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    rotateSpeed={0.5}
                    makeDefault
                />
            </Canvas>
        </div>
    );
};

// Preload all models for smoother switching
// Preload only the active model for the prototype
useGLTF.preload('/Apparel Media/Shirt 3D Models/basic_t-shirt.glb');
// useGLTF.preload('/Apparel Media/Shirt 3D Models/long_sleeve_t-_shirt.glb');
// useGLTF.preload('/Apparel Media/Shirt 3D Models/oversized_t-shirt.glb');
// useGLTF.preload('/Apparel Media/Shirt 3D Models/t-shirt_for_female.glb');
// useGLTF.preload('/Apparel Media/Shirt 3D Models/sweater_pack.glb');
// useGLTF.preload('/Apparel Media/Shirt 3D Models/nycfashion_t-_shirt_dress female.glb');
