'use client';

import { OrbitControls } from '@react-three/drei';

interface ControlsProps {
    autoRotate?: boolean;
    enableZoom?: boolean;
    enableRotate?: boolean;
}

/**
 * Optimized OrbitControls for the DaVinci 3D Mockup Viewer
 * Handles camera movement, damping, and auto-rotation
 */
export function Controls({ 
    autoRotate = true, 
    enableZoom = true, 
    enableRotate = true 
}: ControlsProps) {
    return (
        <OrbitControls
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            enableZoom={enableZoom}
            enableRotate={enableRotate}
            minDistance={2}
            maxDistance={8}
            makeDefault
        />
    );
}
