'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';
import { Environment } from './Environment';

interface SceneProps {
    children: ReactNode;
    className?: string;
}

/**
 * Main Three.js Canvas wrapper with optimized defaults
 * Provides camera, lighting, and controls setup
 */
export function Scene({ children, className }: SceneProps) {
    return (
        <div className={className}>
            <Canvas
                camera={{ position: [0, 0, 3], fov: 45 }}
                gl={{
                    preserveDrawingBuffer: true, // Enables screenshots
                    antialias: true,
                    alpha: true,
                }}
                dpr={[1, 2]} // Pixel ratio limits for performance
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <Environment />
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
}
