import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import NeuralOrb from './3d/NeuralOrb';

interface BrandLogoProps {
    className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
    className = ""
}) => {
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
        <div
            className={`relative ${className} overflow-hidden w-full`}
            style={{ height: '80px', padding: '12px' }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    {/* Text positioned to the left */}
                    <Html
                        position={[-3.5, 0.4, 0]}
                        center
                        transform
                        occlude={false}
                        style={{
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    >
                        <span className="font-semibold text-6xl tracking-tight text-zinc-100 whitespace-nowrap font-display">
                            DaVinci
                        </span>
                    </Html>

                    {/* Blob positioned to the right with gap */}
                    <group position={[1.5, 0, 0]}>
                        <NeuralOrb interactive={true} mousePosition={mousePosition} />
                    </group>
                </Suspense>
            </Canvas>
        </div>
    );
};

export default BrandLogo;
