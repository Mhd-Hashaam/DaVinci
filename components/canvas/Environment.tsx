'use client';

import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Studio lighting environment for 3D mockup visualization
 * Provides 3-point lighting setup for realistic fabric rendering
 */
export function Environment() {
    const lightRef = useRef<THREE.DirectionalLight>(null);

    return (
        <>
            {/* Ambient fill light */}
            <ambientLight intensity={0.4} color="#ffffff" />

            {/* Key light (main) - warm tone */}
            <directionalLight
                ref={lightRef}
                position={[5, 8, 5]}
                intensity={1.2}
                color="#fff5e6"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />

            {/* Fill light - cool tone */}
            <directionalLight
                position={[-5, 3, -2]}
                intensity={0.6}
                color="#e6f0ff"
            />

            {/* Rim/back light - for edge definition */}
            <directionalLight
                position={[0, 2, -6]}
                intensity={0.8}
                color="#ffffff"
            />

            {/* Soft bottom bounce light */}
            <pointLight
                position={[0, -3, 0]}
                intensity={0.3}
                color="#f0f0ff"
                distance={10}
                decay={2}
            />
        </>
    );
}
