'use client';

import { OrbitControls as DreiOrbitControls } from '@react-three/drei';

interface ControlsProps {
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
}

/**
 * Camera controls for 3D mockup interaction
 * Provides orbit, zoom, and optional auto-rotation
 */
export function Controls({
    enableZoom = true,
    enablePan = false,
    enableRotate = true,
    autoRotate = false,
    autoRotateSpeed = 2,
    minDistance = 1.5,
    maxDistance = 6,
    minPolarAngle = Math.PI * 0.25, // 45 degrees from top
    maxPolarAngle = Math.PI * 0.75, // 135 degrees from top
}: ControlsProps) {
    return (
        <DreiOrbitControls
            enableZoom={enableZoom}
            enablePan={enablePan}
            enableRotate={enableRotate}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            minDistance={minDistance}
            maxDistance={maxDistance}
            minPolarAngle={minPolarAngle}
            maxPolarAngle={maxPolarAngle}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
        />
    );
}

