'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { createPortal, useThree } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

interface DecalState {
    pos: [number, number, number];
    scale: number;
    rot: number;
}

const FALLBACK_TEXTURE = '/assets/design-fallback.png';

// Explicit configuration for the Basic Tee model
const BASIC_TEE_CONFIG = {
    groupScale: 3.1,
    groupPosition: [0, 0.2, 0] as [number, number, number],
    groupRotation: [0, 0, 0] as [number, number, number], // 0 is front-facing for this GLB
    uvRotation: 0, // Set to 0 to align with standard UV mapping
    meshTargetName: 'Object_2', // Corrected Case: Capital 'O'
};

export const BasicTeeModel = React.memo(({
    modelPath,
    shirtColor,
    designTexture,
    decalState,
    onStatusChange
}: {
    modelPath: string,
    shirtColor: string,
    designTexture: string,
    decalState: DecalState,
    onStatusChange: (s: string) => void
}) => {
    console.log("[BasicTeeModel] Loading model:", modelPath);
    const gltf = useGLTF(modelPath, true);
    
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [aspectRatio, setAspectRatio] = useState(1);

    // Load Design Texture
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
            console.log("[BasicTeeModel] Design Texture Loaded");
        }, undefined, (err) => {
            console.error("[BasicTeeModel] Texture load failed:", err);
        });

        return () => {
            isSubscribed = false;
        };
    }, [designTexture]);

    // Cleanup texture on unmount
    useEffect(() => {
        return () => {
            if (texture) texture.dispose();
        };
    }, []);

    // Clone scene to avoid shared state mutations
    const scene = useMemo(() => {
        return gltf.scene.clone();
    }, [gltf.scene]);

    const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);
    const [hitUV, setHitUV] = useState<THREE.Vector2 | null>(null);

    // Apply color and identify target mesh
    useEffect(() => {
        if (!scene) return;
        
        let foundBody = false;

        scene.traverse((child: any) => {
            if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                
                // Set shirt color
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat && mat.color) {
                    mat.color.set(shirtColor);
                }

                // Identify the main body mesh
                if (mesh.name === BASIC_TEE_CONFIG.meshTargetName) {
                    setTargetMesh(mesh);
                    foundBody = true;
                }
                
                if (mat) {
                    mat.metalness = 0.0;
                    mat.roughness = 0.8;
                    mat.side = THREE.DoubleSide;
                    mat.needsUpdate = true;
                }
            }
        });

        if (!foundBody) {
             // Fallback logic
             let largestMesh: any = null;
             let maxVertices = 0;
             scene.traverse((child: any) => {
                if (child.isMesh) {
                    const count = child.geometry.attributes.position.count;
                    if (count > maxVertices) {
                        maxVertices = count;
                        largestMesh = child;
                    }
                }
             });
             if (largestMesh) {
                setTargetMesh(largestMesh as THREE.Mesh);
             }
        }
    }, [scene, shirtColor]);

    // Use raycasting for dynamic UV anchor (like TShirtModel)
    useEffect(() => {
        if (!targetMesh) return;
        const runRaycast = () => {
            const raycaster = new THREE.Raycaster();
            
            // Get the precise world center of the mesh
            const box = new THREE.Box3().setFromObject(targetMesh);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            // Chest-center raycasting logic
            const angle = (decalState.pos[0] / 1.5) * Math.PI;
            const sourceDistance = 10;
            const worldX = center.x + Math.sin(angle) * sourceDistance;
            const worldZ = center.z + Math.cos(angle) * sourceDistance;
            
            // SHOOT AT THE GEOMETRIC CENTER + OFFSET
            const worldY = center.y + decalState.pos[1];
            
            const worldSource = new THREE.Vector3(worldX, worldY, worldZ);
            
            // Target slightly behind the shirt to ensure piercing
            const worldTarget = new THREE.Vector3(center.x, worldY, center.z - 2); 
            const worldDir = worldTarget.clone().sub(worldSource).normalize();
            
            raycaster.set(worldSource, worldDir);
            const intersects = raycaster.intersectObject(targetMesh);

            if (intersects.length > 0) {
                const hit = intersects[0];
                if (hit.uv) {
                    setHitUV(hit.uv.clone());
                    onStatusChange("Ready");
                }
            } else {
                onStatusChange("Out of bounds");
            }
        };
        const timer = setTimeout(runRaycast, 60);
        return () => clearTimeout(timer);
    }, [decalState.pos, targetMesh, onStatusChange]);

    // Standard UV Mapping Shader (Stable)
    const UVMappingShaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
            side: THREE.FrontSide,
            uniforms: {
                uTexture: { value: null },
                uHitUV: { value: new THREE.Vector2(0.5, 0.5) },
                uDecalScale: { value: 0.3 },
                uAspect: { value: 1.0 },
                uRotation: { value: 0 },
                uOffset: { value: new THREE.Vector2(0, 0) },
                uOpacity: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform vec2 uHitUV;
                uniform float uDecalScale;
                uniform float uAspect;
                uniform float uRotation;
                uniform vec2 uOffset;
                varying vec2 vUv;
                void main() {
                    // Standard UV mapping with fract wrapping
                    vec2 d = vUv - uHitUV - uOffset;
                    d.x = fract(d.x + 0.5) - 0.5; 
                    
                    float cosR = cos(uRotation);
                    float sinR = sin(uRotation);
                    vec2 rd = vec2(d.x * cosR - d.y * sinR, d.x * sinR + d.y * cosR);
                    
                    float u = 0.5 + rd.x / (uDecalScale * uAspect);
                    float v = 0.5 + rd.y / uDecalScale;
                    
                    if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) discard;
                    
                    vec4 texColor = texture2D(uTexture, vec2(u, v));
                    if (texColor.a < 0.05) discard;
                    
                    gl_FragColor = texColor;
                    gl_FragColor.rgb *= 1.2; 
                }
            `
        });
    }, []);

    // Update Uniforms
    useEffect(() => {
        if (UVMappingShaderMaterial) {
            UVMappingShaderMaterial.uniforms.uTexture.value = texture;
            UVMappingShaderMaterial.uniforms.uHitUV.value = hitUV || new THREE.Vector2(0.5, 0.5);
            UVMappingShaderMaterial.uniforms.uDecalScale.value = decalState.scale;
            UVMappingShaderMaterial.uniforms.uAspect.value = aspectRatio;
            
            // Use config rotation
            UVMappingShaderMaterial.uniforms.uRotation.value = decalState.rot + BASIC_TEE_CONFIG.uvRotation;
            
            UVMappingShaderMaterial.uniforms.uOffset.value.set(decalState.pos[0], decalState.pos[1]);
        }
    }, [texture, hitUV, decalState, aspectRatio, UVMappingShaderMaterial]);

    // Cleanup shader
    useEffect(() => {
        return () => { UVMappingShaderMaterial.dispose(); };
    }, [UVMappingShaderMaterial]);

    const showDecal = texture && targetMesh && hitUV;

    return (
        <Center position={[0, -0.2, 0]}>
            <group 
                scale={BASIC_TEE_CONFIG.groupScale} 
                position={BASIC_TEE_CONFIG.groupPosition} 
                rotation={BASIC_TEE_CONFIG.groupRotation} 
            >
                <primitive object={scene} />
                {showDecal && createPortal(
                    <mesh 
                        geometry={targetMesh.geometry} 
                        material={UVMappingShaderMaterial} 
                        position={targetMesh.position}
                        rotation={targetMesh.rotation}
                        scale={targetMesh.scale}
                    />,
                    targetMesh.parent || scene
                )}
            </group>
        </Center>
    );
});

BasicTeeModel.displayName = 'BasicTeeModel';
