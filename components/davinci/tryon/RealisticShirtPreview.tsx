'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';

// Custom Shader Material definition
const FabricShaderMaterial = {
    uniforms: {
        uShirtTex: { value: null },
        uDesignTex: { value: null },
        uDispMap: { value: null },
        uDispScale: { value: 0.2 },
        uDesignScale: { value: new THREE.Vector2(0.3, 0.3) },
        uDesignPos: { value: new THREE.Vector2(0.5, 0.5) },
    },
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D uShirtTex;
    uniform sampler2D uDesignTex;
    uniform sampler2D uDispMap;
    
    uniform vec2 uDesignScale;
    uniform vec2 uDesignPos;

    varying vec2 vUv;

    void main() {
      // 1. Base Shirt
      vec4 shirtColor = texture2D(uShirtTex, vUv);
      vec4 dispColor = texture2D(uDispMap, vUv);

      // 2. Design UV Calculation (Centered)
      vec2 designUv = (vUv - uDesignPos) / uDesignScale + 0.5;

      // 3. Fake Flow/Distortion based on height
      float height = dispColor.r;
      designUv += (height - 0.5) * 0.05;

      // 4. Sample Design
      vec4 designColor = vec4(0.0);
      if (designUv.x >= 0.0 && designUv.x <= 1.0 && designUv.y >= 0.0 && designUv.y <= 1.0) {
        designColor = texture2D(uDesignTex, designUv);
      }

      // 5. Lighting/Shadows
      float shadow = 1.0 - (dispColor.r * 0.4);

      // 6. Combine
      vec3 finalColor = shirtColor.rgb * shadow;

      if (designColor.a > 0.0) {
        // Multiply blend for "inked" look
        finalColor = mix(finalColor, finalColor * designColor.rgb, designColor.a * 0.9);
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const ShaderPlane = ({ shirtTex, designTex, dispMap, width, height }: any) => {
    // Memoize geometry
    const geometry = React.useMemo(() => new THREE.PlaneGeometry(width, height, 128, 128), [width, height]);

    return (
        <mesh geometry={geometry}>
            <shaderMaterial
                args={[FabricShaderMaterial]}
                uniforms-uShirtTex-value={shirtTex}
                uniforms-uDesignTex-value={designTex}
                uniforms-uDispMap-value={dispMap}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

const SceneContent = () => {
    const { activeShirtId, designs, activeDesignId, selectedShirts } = useFittingRoomStore();

    const activeDesign = designs.find(d => d.id === activeDesignId);

    // Load textures (Suspends here)
    const [shirtTex, dispMap] = useLoader(THREE.TextureLoader, [
        '/Apparel Media/Plain Shirts/Green Half Sleeve Tee Shirt.png',
        '/TryOn/Displacement Map/Green Half Sleeve Tee Shirt Displacement Map.png'
    ]);

    const designUrl = activeDesign ? (activeDesign.fullImage || activeDesign.thumbnail) : null;
    const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const designTex = useLoader(THREE.TextureLoader, designUrl || transparentPixel);

    // Aspect Ratio
    // @ts-ignore
    const aspect = (shirtTex as THREE.Texture).image.width / (shirtTex as THREE.Texture).image.height;
    const height = 14;
    const width = height * aspect;

    return (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

            <ShaderPlane
                shirtTex={shirtTex}
                designTex={designTex}
                dispMap={dispMap}
                width={width}
                height={height}
            />
            <OrbitControls minDistance={5} maxDistance={30} />
        </>
    );
};

const RealisticShirtPreview = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="w-full h-full bg-neutral-900 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                ✨ 3D SHADER PREVIEW
            </div>

            <Canvas shadows camera={{ position: [0, 0, 17], fov: 45 }}>
                <React.Suspense fallback={null}>
                    <SceneContent />
                </React.Suspense>
            </Canvas>
        </div>
    );
};

export default RealisticShirtPreview;
