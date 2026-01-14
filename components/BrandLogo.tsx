'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import NeuralOrb from './3d/NeuralOrb';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

interface BrandLogoProps {
    className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
    className = ""
}) => {
    // Determine opacity based on interactivity (optional, keeping it simple)
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const x = event.clientX / window.innerWidth;
            const y = event.clientY / window.innerHeight;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className={`flex items-center gap-4 px-3 ${className}`} style={{ height: '64px' }}>
            {/* 1. Brand Name (Always Visible) */}
            <span className="font-semibold text-3xl tracking-tight text-zinc-100 font-display select-none">
                DaVinci
            </span>

            {/* 2. Neural Orb (WebGL with Error Boundary) */}
            <div className="relative w-16 h-16 shrink-0">
                <WebGLErrorBoundary
                    fallback={
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-sm opacity-80 animate-pulse" />
                        </div>
                    }
                >
                    <Canvas
                        camera={{ position: [0, 0, 3.5], fov: 45 }}
                        gl={{
                            alpha: true,
                            antialias: true,
                            powerPreference: 'default',
                            failIfMajorPerformanceCaveat: false
                        }}
                        dpr={[1, 2]}
                        style={{ background: 'transparent' }}
                    >
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />

                        <Suspense fallback={null}>
                            {/* Centered Orb */}
                            <group position={[0, 0, 0]}>
                                <NeuralOrb interactive={true} mousePosition={mousePosition} />
                            </group>
                        </Suspense>
                    </Canvas>
                </WebGLErrorBoundary>

                {/* Background glow layer */}
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl -z-10" />
            </div>
        </div>
    );
};

export default BrandLogo;
