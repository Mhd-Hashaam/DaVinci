'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFabricMaterial } from '../shaders/fabricShader';

interface MockupModelProps {
    textureUrl: string | null;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    tintColor?: string;
    tintStrength?: number;
    modelType?: 'tshirt' | 'hoodie' | 'longsleeve';
    autoRotate?: boolean;
}

/**
 * 3D Clothing Mockup Model
 * Displays a simple geometry with AI-generated texture applied via custom shader
 * 
 * For MVP, we use a deformed plane/box to represent clothing
 * Can be upgraded to full 3D GLB models later
 */
export function MockupModel({
    textureUrl,
    brightness = 1.0,
    contrast = 1.0,
    saturation = 1.0,
    tintColor = '#ffffff',
    tintStrength = 0.0,
    modelType = 'tshirt',
    autoRotate = false,
}: MockupModelProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);

    // Load texture when URL changes
    const texture = useMemo(() => {
        if (!textureUrl) return null;
        const loader = new THREE.TextureLoader();
        const tex = loader.load(textureUrl);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = true;
        return tex;
    }, [textureUrl]);

    // Create shader material
    const material = useMemo(() => {
        const mat = createFabricMaterial(texture);
        materialRef.current = mat;
        return mat;
    }, [texture]);

    // Update uniforms when props change
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uBrightness.value = brightness;
            materialRef.current.uniforms.uContrast.value = contrast;
            materialRef.current.uniforms.uSaturation.value = saturation;
            materialRef.current.uniforms.uTintColor.value = new THREE.Color(tintColor);
            materialRef.current.uniforms.uTintStrength.value = tintStrength;
        }
    }, [brightness, contrast, saturation, tintColor, tintStrength]);

    // Update texture when it changes
    useEffect(() => {
        if (materialRef.current && texture) {
            materialRef.current.uniforms.uTexture.value = texture;
        }
    }, [texture]);

    // Auto-rotation animation
    useFrame((_, delta) => {
        if (autoRotate && meshRef.current) {
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    // Geometry based on model type
    const geometry = useMemo(() => {
        switch (modelType) {
            case 'hoodie':
                // Slightly larger for hoodie
                return new THREE.BoxGeometry(1.4, 1.6, 0.5, 32, 32, 1);
            case 'longsleeve':
                return new THREE.BoxGeometry(1.5, 1.5, 0.4, 32, 32, 1);
            case 'tshirt':
            default:
                // T-shirt shape - slightly rounded box
                return new THREE.BoxGeometry(1.2, 1.4, 0.4, 32, 32, 1);
        }
    }, [modelType]);

    if (!textureUrl) {
        // Placeholder when no texture
        return (
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <boxGeometry args={[1.2, 1.4, 0.4, 8, 8, 1]} />
                <meshStandardMaterial
                    color="#333333"
                    wireframe
                    transparent
                    opacity={0.5}
                />
            </mesh>
        );
    }

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            material={material}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
        />
    );
}
