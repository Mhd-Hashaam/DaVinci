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

            {/* 2. Brand Orb Fallback (High Fidelity Gradient) */}
            <div className="relative w-12 h-12 shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-[2px] opacity-80 animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
                </div>
                {/* Background glow layer */}
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl -z-10" />
            </div>
        </div>
    );
};

export default BrandLogo;
