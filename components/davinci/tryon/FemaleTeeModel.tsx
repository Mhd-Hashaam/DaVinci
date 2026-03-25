'use client';

import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';


import { createPortal, useThree } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { InteractionOverlay } from './InteractionOverlay';


interface DecalState {
    pos: [number, number, number];
    scale: number;
    rot: number;
}

const FALLBACK_TEXTURE = '/assets/design-fallback.png';

// Configuration specifically for the female model
const FEMALE_CONFIG = {
    groupScale: 2.5,
    groupPosition: [0, -1.2, 0] as [number, number, number],
    defaultRotation: 0,
    groupRotation: [0, -Math.PI / 2, 0] as [number, number, number],
};

export const FemaleTeeModel = React.memo(({
    modelPath,
    shirtColor,
    designTexture,
    decalState,
    setDecalState,
    onStatusChange,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    isRotating,
    setIsRotating,
    isSelected,
    setIsSelected
}: {
    modelPath: string,
    shirtColor: string,
    designTexture: string,
    decalState: DecalState,
    setDecalState: (s: DecalState) => void,
    onStatusChange: (s: string) => void,
    isDragging: boolean,
    setIsDragging: (v: boolean) => void,
    isResizing: boolean,
    setIsResizing: (v: boolean) => void,
    isRotating: boolean,
    setIsRotating: (v: boolean) => void,
    isSelected: boolean,
    setIsSelected: (v: boolean) => void
}) => {



    console.log("[FemaleTeeModel] Rendering for path:", modelPath);
    const gltf = useGLTF(modelPath, true);
    
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
        }, undefined, (err) => {
            console.error("[FemaleTeeModel] Texture load failed:", err);
        });

        return () => {
            isSubscribed = false;
        };
    }, [designTexture]);

    useEffect(() => {
        return () => {
            if (texture) texture.dispose();
        };
    }, []);

    const scene = useMemo(() => {
        return gltf.scene.clone();
    }, [gltf.scene]);

    const [allMeshes, setAllMeshes] = useState<THREE.Mesh[]>([]);
    const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);

    const [worldComputedPos, setWorldComputedPos] = useState<THREE.Vector3 | null>(null);
    const [worldComputedQuat, setWorldComputedQuat] = useState<THREE.Quaternion | null>(null);
    const [hitUV, setHitUV] = useState<THREE.Vector2 | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Refs for interaction tracking
    const dragStartUV = useRef<THREE.Vector2 | null>(null);
    const initialDecalPos = useRef<[number, number, number]>([0,0,0]);
    const initialScale = useRef<number>(0.3);
    const initialRotation = useRef<number>(0);


    // Check if mouse is over the decal and where exactly
    const getDecalInteractionType = useCallback((uv: THREE.Vector2) => {
        if (!hitUV) return { hit: false, type: 'none' };
        
        // Decal Center in UV space
        const center = hitUV.clone().add(new THREE.Vector2(decalState.pos[0], decalState.pos[1]));
        const delta = uv.clone().sub(center);

        // Standard fract wrapping
        delta.x = ((delta.x + 0.5) % 1 + 1) % 1 - 0.5;

        // Apply inverse rotation
        const cosR = Math.cos(-decalState.rot);
        const sinR = Math.sin(-decalState.rot);
        const rd = new THREE.Vector2(
            delta.x * cosR - delta.y * sinR,
            delta.x * sinR + delta.y * cosR
        );

        const u = 0.5 + rd.x / (decalState.scale * aspectRatio);
        const v = 0.5 + rd.y / decalState.scale;

        const hit = u >= 0 && u <= 1 && v >= 0 && v <= 1;
        if (!hit) {
            // Check for rotation handle (top-middle, offset)
            const isRotateHandle = Math.abs(u - 0.5) < 0.2 && v < -0.1 && v > -0.4;
            if (isRotateHandle) return { hit: true, type: 'rotate' };
            return { hit: false, type: 'none' };
        }

        // Corner detection for resizing (bottom-right area)
        if (u > 0.8 && v > 0.8) return { hit: true, type: 'resize' };
        return { hit: true, type: 'move' };
    }, [hitUV, decalState, aspectRatio]);


    const handlePointerDown = (e: any) => {
        if (!e.uv) return;
        const { hit, type } = getDecalInteractionType(e.uv);
        if (hit) {
            e.stopPropagation();
            setIsSelected(true);
            if (type === 'resize') {
                setIsResizing(true);
            } else if (type === 'rotate') {
                setIsRotating(true);
            } else {
                setIsDragging(true);
            }
            dragStartUV.current = e.uv.clone();
            initialDecalPos.current = [...decalState.pos] as [number, number, number];
            initialScale.current = decalState.scale;
            initialRotation.current = decalState.rot;
        } else {

            setIsSelected(false);
        }
    };


    const handlePointerMove = (e: any) => {
        if (!e.uv) return;
        
        if (isDragging && dragStartUV.current) {
            e.stopPropagation();
            const delta = e.uv.clone().sub(dragStartUV.current);
            setDecalState({
                ...decalState,
                pos: [
                    initialDecalPos.current[0] + delta.x,
                    initialDecalPos.current[1] + delta.y,
                    0
                ]
            });
            return;
        }

        if (isResizing && dragStartUV.current) {
            e.stopPropagation();
            const delta = e.uv.clone().sub(dragStartUV.current);
            // Simple scale logic based on horizontal movement
            const scaleDelta = delta.x * 2; 
            const newScale = Math.max(0.05, Math.min(1.0, initialScale.current + scaleDelta));
            setDecalState({ ...decalState, scale: newScale });
            return;
        }

        if (isRotating && dragStartUV.current && hitUV) {
            e.stopPropagation();
            const center = hitUV.clone().add(new THREE.Vector2(decalState.pos[0], decalState.pos[1]));
            const initialAngle = Math.atan2(dragStartUV.current.y - center.y, dragStartUV.current.x - center.x);
            const currentAngle = Math.atan2(e.uv.y - center.y, e.uv.x - center.x);
            const deltaAngle = currentAngle - initialAngle;
            setDecalState({ ...decalState, rot: initialRotation.current + deltaAngle });
            return;
        }

        const { hit, type } = getDecalInteractionType(e.uv);
        setIsHovered(hit);
        if (hit) {
            if (type === 'resize') document.body.style.cursor = 'nwse-resize';
            else if (type === 'rotate') document.body.style.cursor = 'alias';
            else document.body.style.cursor = 'grab';
        } else {
            document.body.style.cursor = 'auto';
        }
    };


    const handlePointerUp = (e: any) => {
        setIsDragging(false);
        setIsResizing(false);
        setIsRotating(false);
        document.body.style.cursor = 'auto';
    };



    // Identical to the original TShirtModel logic
    useEffect(() => {
        if (!scene) return;
        scene.traverse((child: any) => {
            if (child.isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat && mat.color) mat.color.set(shirtColor);
            }
        });
    }, [scene, shirtColor]);

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
    }, [scene]);

    useEffect(() => {
        if (!targetMesh) return;
        const runRaycast = () => {
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
                    const dummy = new THREE.Object3D();
                    const normal = hit.face.normal.clone().applyQuaternion(meshQuat);
                    const lookAtPos = hit.point.clone().add(normal);
                    const worldUp = new THREE.Vector3(0, 1, 0);
                    const matrix = new THREE.Matrix4().lookAt(hit.point, lookAtPos, worldUp);
                    dummy.quaternion.setFromRotationMatrix(matrix);
                    setWorldComputedPos(hit.point.clone());
                    setWorldComputedQuat(dummy.quaternion.clone());
                    if (hit.uv) setHitUV(hit.uv.clone());
                    onStatusChange("Ready");
                }
            } else {
                setWorldComputedPos(null);
                setWorldComputedQuat(null);
                onStatusChange("Out of bounds");
            }
        };
        const timer = setTimeout(runRaycast, 60);
        return () => clearTimeout(timer);
    }, [decalState.pos, targetMesh, onStatusChange]);

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
                uHovered: { value: 0.0 },
                uSelected: { value: 0.0 },
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
                uniform float uHovered;
                varying vec2 vUv;

                void main() {
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
                    gl_FragColor.rgb *= 1.1; 
                }




            `
        });
    }, []);

    useEffect(() => {
        if (UVMappingShaderMaterial) {
            UVMappingShaderMaterial.uniforms.uTexture.value = texture;
            UVMappingShaderMaterial.uniforms.uHitUV.value = hitUV || new THREE.Vector2(0.5, 0.5);
            UVMappingShaderMaterial.uniforms.uDecalScale.value = decalState.scale;
            UVMappingShaderMaterial.uniforms.uAspect.value = aspectRatio;
            UVMappingShaderMaterial.uniforms.uRotation.value = decalState.rot + FEMALE_CONFIG.defaultRotation;
            UVMappingShaderMaterial.uniforms.uHovered.value = isHovered || isDragging ? 1.0 : 0.0;
            UVMappingShaderMaterial.uniforms.uSelected.value = isSelected ? 1.0 : 0.0;
            UVMappingShaderMaterial.uniforms.uOffset.value.set(decalState.pos[0], decalState.pos[1]);
        }
    }, [texture, hitUV, decalState, aspectRatio, UVMappingShaderMaterial, isHovered, isDragging, isSelected]);



    useEffect(() => {
        return () => { UVMappingShaderMaterial.dispose(); };
    }, [UVMappingShaderMaterial]);

    const showDecal = texture && targetMesh && worldComputedPos && worldComputedQuat;

    return (
        <Center position={[0, -0.2, 0]}>
            <group scale={FEMALE_CONFIG.groupScale} position={FEMALE_CONFIG.groupPosition} rotation={FEMALE_CONFIG.groupRotation}>
                <primitive 
                    object={scene} 
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }}
                />
                {showDecal && allMeshes.map((mesh, i) => (

                    <React.Fragment key={i}>
                        {createPortal(
                            <mesh geometry={mesh.geometry} material={UVMappingShaderMaterial} />,
                            mesh.parent!
                        )}
                    </React.Fragment>
                ))}

                {/* High-Precision Figma Overlay */}
                {showDecal && (
                    <InteractionOverlay 
                        position={worldComputedPos!}
                        quaternion={worldComputedQuat!}
                        scale={decalState.scale}
                        aspectRatio={aspectRatio}
                        isSelected={isSelected}
                        isHovered={isHovered}
                    />
                )}
            </group>

        </Center>
    );
});

FemaleTeeModel.displayName = 'FemaleTeeModel';
