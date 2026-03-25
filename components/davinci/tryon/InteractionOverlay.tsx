'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface InteractionOverlayProps {
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    scale: number;
    aspectRatio: number;
    isSelected: boolean;
    isHovered: boolean;
}

/**
 * High-precision HTML overlay for 3D graphic manipulation.
 * Mirrors Figma's selection UI with perfectly sharp borders and corner handles.
 * Anchored to the 3D hit point and rotated to match the surface normal.
 */
export const InteractionOverlay: React.FC<InteractionOverlayProps> = ({
    position,
    quaternion,
    scale,
    aspectRatio,
    isSelected,
    isHovered
}) => {
    // Slight offset along the normal to prevent Z-fighting with the garment mesh
    const normalOffset = new THREE.Vector3(0, 0, 0.01).applyQuaternion(quaternion);
    const finalPos = position.clone().add(normalOffset);

    // Safety guard for aspect ratio to prevent layout spills
    const safeAspectRatio = isNaN(aspectRatio) || aspectRatio <= 0 ? 1 : Math.min(aspectRatio, 5);
    
    // Render the HTML internally at a very high resolution (1000px) so it's perfectly crisp.
    const heightPixels = 1000;
    const widthPixels = 1000 * safeAspectRatio;
    
    // The decal effectively covers roughly `scale * 1.35` local 3D units in height.
    const decalHeightUnits = scale * 1.35; 
    
    // Convert the 1000 CSS pixels down to the correct 3D world size.
    const pixelScale = decalHeightUnits / heightPixels;

    const borderWidth = isSelected ? 8 : 6;
    const handleSize = 40;
    const offset = -(handleSize / 2);

    if (!isSelected && !isHovered) return null;

    const handleStyle = (v: 'top' | 'bottom', h: 'left' | 'right'): React.CSSProperties => ({
        position: 'absolute',
        width: `${handleSize}px`,
        height: `${handleSize}px`,
        backgroundColor: 'white',
        border: `${borderWidth}px solid #18A0FB`,
        borderRadius: '2px',
        [v]: `${offset}px`,
        [h]: `${offset}px`,
        boxSizing: 'border-box',
    });

    return (
        <group position={finalPos} quaternion={quaternion} scale={[pixelScale, pixelScale, 1]}>
            <Html
                transform
                occlude={false}
                pointerEvents="none"
                center
                style={{
                    width: `${widthPixels}px`,
                    height: `${heightPixels}px`,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'visible', // Contain the handles
                }}
            >
                <div 
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        border: `${borderWidth}px solid #18A0FB`,
                        opacity: isSelected ? 1 : 0.6,
                        boxSizing: 'border-box',
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                >
                    {/* Figma-style handles (only on selection) */}
                    {isSelected && (
                        <>
                            {/* Rotation Handle */}
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                top: '-60px',
                                width: `${borderWidth}px`,
                                height: '60px',
                                backgroundColor: '#18A0FB',
                                transform: 'translateX(-50%)',
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                top: '-100px',
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'white',
                                border: `${borderWidth}px solid #18A0FB`,
                                borderRadius: '50%',
                                transform: 'translateX(-50%)',
                                cursor: 'alias',
                            }} />

                            <div style={handleStyle('top', 'left')} />
                            <div style={handleStyle('top', 'right')} />
                            <div style={handleStyle('bottom', 'left')} />
                            <div style={handleStyle('bottom', 'right')} />
                        </>
                    )}
                </div>
            </Html>
        </group>
    );
};

