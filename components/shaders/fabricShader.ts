/**
 * Custom GLSL Fabric Shader for realistic clothing mockup visualization
 * Handles texture mapping with lighting, adjustable brightness/contrast
 */

export const fabricVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fabricFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uSaturation;
  uniform vec3 uTintColor;
  uniform float uTintStrength;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Adjusts saturation of a color
  vec3 adjustSaturation(vec3 color, float saturation) {
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(gray), color, saturation);
  }

  void main() {
    // Sample the AI-generated texture
    vec4 texColor = texture2D(uTexture, vUv);
    vec3 color = texColor.rgb;
    
    // Apply brightness
    color *= uBrightness;
    
    // Apply contrast
    color = (color - 0.5) * uContrast + 0.5;
    
    // Apply saturation
    color = adjustSaturation(color, uSaturation);
    
    // Apply tint
    color = mix(color, color * uTintColor, uTintStrength);
    
    // Simple diffuse lighting based on normal
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // Ambient + diffuse lighting
    float ambient = 0.4;
    float lighting = ambient + (1.0 - ambient) * diff;
    color *= lighting;
    
    // Subtle rim lighting for edge definition
    vec3 viewDir = normalize(vViewPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 3.0) * 0.15;
    color += rim;
    
    // Clamp to valid range
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, texColor.a);
  }
`;

// Default uniform values
export const fabricShaderDefaults = {
    uBrightness: 1.0,
    uContrast: 1.0,
    uSaturation: 1.0,
    uTintColor: [1.0, 1.0, 1.0] as [number, number, number],
    uTintStrength: 0.0,
};

// TypeScript types for shader uniforms
export interface FabricShaderUniforms {
    uTexture: { value: THREE.Texture | null };
    uBrightness: { value: number };
    uContrast: { value: number };
    uSaturation: { value: number };
    uTintColor: { value: THREE.Color };
    uTintStrength: { value: number };
}

import * as THREE from 'three';

export function createFabricMaterial(texture: THREE.Texture | null): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: texture },
            uBrightness: { value: fabricShaderDefaults.uBrightness },
            uContrast: { value: fabricShaderDefaults.uContrast },
            uSaturation: { value: fabricShaderDefaults.uSaturation },
            uTintColor: { value: new THREE.Color(...fabricShaderDefaults.uTintColor) },
            uTintStrength: { value: fabricShaderDefaults.uTintStrength },
        },
        vertexShader: fabricVertexShader,
        fragmentShader: fabricFragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
    });
}
