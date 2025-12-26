'use client';

import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { WebGLErrorBoundary } from '@/components/WebGLErrorBoundary';

// Custom Shader Material - TheVinci Style (Deep Mauve/Purple Palette)
const TheVinciMaterial = shaderMaterial(
    {
        uTime: 0,
        uFrequency: 1.2,
        uAmplitude: 4.0,
        uDensity: 1.0,
        uStrength: 0.33,
        uDeepPurple: 0.7,
        uOpacity: 0.43,
    },
    // Vertex Shader
    `precision mediump float;
    varying float vDistortion;
    uniform float uTime;
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uDensity;
    uniform float uStrength;
    
    // Classic Perlin 3D Noise 
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

    float noise(vec3 P) {
        vec3 i0 = mod289(floor(P));
        vec3 i1 = mod289(i0 + vec3(1.0));
        vec3 f0 = fract(P);
        vec3 f1 = f0 - vec3(1.0);
        vec3 f = fade(f0);
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x);
        vec4 iy = vec4(i0.yy, i1.yy);
        vec4 iz0 = i0.zzzz;
        vec4 iz1 = i1.zzzz;
        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);
        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;
        float n000 = dot(g000, f0);
        float n100 = dot(g100, vec3(f1.x, f0.yz));
        float n010 = dot(g010, vec3(f0.x, f1.y, f0.z));
        float n110 = dot(g110, vec3(f1.xy, f0.z));
        float n001 = dot(g001, vec3(f0.xy, f1.z));
        float n101 = dot(g101, vec3(f1.x, f0.y, f1.z));
        float n011 = dot(g011, vec3(f0.x, f1.yz));
        float n111 = dot(g111, f1);
        vec3 fade_xyz = fade(f0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
        return 2.2 * n_xyz;
    }

    vec3 rotateY(vec3 v, float angle) {
        float cosY = cos(angle);
        float sinY = sin(angle);
        return vec3(v.x * cosY + v.z * sinY, v.y, -v.x * sinY + v.z * cosY);
    }

    void main() {
        float distortion = noise(normal * uDensity + uTime * 0.1) * uStrength;
        vec3 pos = position + (normal * distortion);
        float angle = sin(uv.y * uFrequency + uTime * 0.2) * uAmplitude;
        pos = rotateY(pos, angle);
        vDistortion = distortion;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
  `,
    // Fragment Shader - EXTREME: Pure Purple/Magenta ONLY (Zero Green)
    `precision mediump float;
    uniform float uOpacity;
    uniform float uDeepPurple;
    varying float vDistortion;

    void main() {
        // Simple gradient: Deep Purple -> Magenta -> Violet
        // ZERO GREEN CHANNEL - no possibility of white
        float t = abs(vDistortion) * 3.0;
        
        // Purple base (R: 0.4-0.8, G: 0.0, B: 0.6-1.0)
        float r = 0.4 + sin(t * 2.0) * 0.4;  // 0.0 to 0.8
        float g = 0.0;                        // ALWAYS ZERO - no white!
        float b = 0.6 + cos(t * 1.5) * 0.4;  // 0.2 to 1.0
        
        // Shift toward magenta based on uniform
        r = mix(r, 0.7, uDeepPurple * 0.5);
        b = mix(b, 0.9, uDeepPurple * 0.3);
        
        // Clamp everything to safe ranges
        r = clamp(r, 0.1, 0.75);
        g = 0.0;  // FORCE ZERO
        b = clamp(b, 0.3, 0.95);
        
        // Alpha
        float alpha = clamp(abs(vDistortion) * 2.5 + uOpacity, 0.3, 0.9);
        
        gl_FragColor = vec4(r, g, b, alpha);
    }
  `
);

extend({ TheVinciMaterial });

// Inner Orb Mesh Component
const OrbMesh: React.FC<{ mousePosition: { x: number; y: number } }> = ({ mousePosition }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    useFrame((state, delta) => {
        // Continuous Y rotation
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05;
        }

        // Animate shader time
        if (materialRef.current) {
            materialRef.current.uTime += delta;
        }

        // Mouse interactivity
        if (materialRef.current) {
            const mouseX = mousePosition.x;
            const mouseY = mousePosition.y;

            materialRef.current.uFrequency = THREE.MathUtils.lerp(
                materialRef.current.uFrequency,
                1.2 + mouseX * 2.8,
                0.1
            );

            materialRef.current.uStrength = THREE.MathUtils.lerp(
                materialRef.current.uStrength,
                0.33 + mouseX * 0.77,
                0.1
            );

            materialRef.current.uOpacity = THREE.MathUtils.lerp(
                materialRef.current.uOpacity,
                0.43 + mouseX * 0.23,
                0.1
            );

            materialRef.current.uDeepPurple = THREE.MathUtils.lerp(
                materialRef.current.uDeepPurple,
                0.7 - mouseX * 0.7,
                0.1
            );

            // Rotate based on mouse Y
            if (meshRef.current) {
                const targetRotationX = mouseY * Math.PI;
                meshRef.current.rotation.x = THREE.MathUtils.lerp(
                    meshRef.current.rotation.x,
                    targetRotationX,
                    0.1
                );
            }
        }
    });

    return (
        <mesh ref={meshRef} scale={0.9}>
            <icosahedronGeometry args={[1, 64]} />
            {/* @ts-ignore */}
            <theVinciMaterial
                ref={materialRef}
                transparent={true}
                wireframe={true}
                blending={THREE.NormalBlending}
            />
        </mesh>
    );
};

interface TheVinciOrbProps {
    size?: number;
    className?: string;
}

export const TheVinciOrb: React.FC<TheVinciOrbProps> = ({
    size = 120,
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
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            <WebGLErrorBoundary
                fallback={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-md opacity-60 animate-pulse" />
                    </div>
                }
            >
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
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
                        <OrbMesh mousePosition={mousePosition} />
                    </Suspense>
                </Canvas>
            </WebGLErrorBoundary>

            {/* Background glow */}
            <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl -z-10" />
        </div>
    );
};

export default TheVinciOrb;
