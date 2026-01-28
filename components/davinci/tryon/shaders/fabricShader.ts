/**
 * Custom Fabric Shader for PixiJS
 * 
 * This shader makes a design look "inked" onto fabric by:
 * 1. Displacing pixels based on height map (wrinkle following)
 * 2. Calculating normals from height map for lighting
 * 3. Applying directional lighting that affects the design
 * 4. Blending fabric texture through the design
 */

export const fabricVertexShader = `
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    uniform mat3 projectionMatrix;
    
    varying vec2 vTextureCoord;
    
    void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
`;

export const fabricFragmentShader = `
    precision mediump float;
    
    varying vec2 vTextureCoord;
    
    uniform sampler2D uSampler;          // The design texture
    uniform sampler2D uHeightMap;        // Displacement/height map (grayscale)
    uniform sampler2D uFabricTexture;    // Optional fabric texture overlay
    
    uniform vec2 uTextureSize;           // Size of height map for offset calculation
    uniform float uDisplacementScale;    // How much to displace (0-100)
    uniform float uLightIntensity;       // Light strength (0-2)
    uniform vec2 uLightDirection;        // Normalized light direction
    uniform float uFabricBlend;          // How much fabric shows through (0-1)
    uniform float uAmbientLight;         // Base ambient light (0-1)
    
    // Calculate normal from height map using Sobel operator
    vec3 calculateNormal(vec2 uv) {
        vec2 texelSize = 1.0 / uTextureSize;
        
        // Sample 3x3 neighborhood
        float tl = texture2D(uHeightMap, uv + texelSize * vec2(-1.0, -1.0)).r;
        float t  = texture2D(uHeightMap, uv + texelSize * vec2( 0.0, -1.0)).r;
        float tr = texture2D(uHeightMap, uv + texelSize * vec2( 1.0, -1.0)).r;
        float l  = texture2D(uHeightMap, uv + texelSize * vec2(-1.0,  0.0)).r;
        float r  = texture2D(uHeightMap, uv + texelSize * vec2( 1.0,  0.0)).r;
        float bl = texture2D(uHeightMap, uv + texelSize * vec2(-1.0,  1.0)).r;
        float b  = texture2D(uHeightMap, uv + texelSize * vec2( 0.0,  1.0)).r;
        float br = texture2D(uHeightMap, uv + texelSize * vec2( 1.0,  1.0)).r;
        
        // Sobel operator for gradient
        float dX = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        float dY = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);
        
        // Create normal vector (pointing outward from surface)
        return normalize(vec3(-dX * 2.0, -dY * 2.0, 1.0));
    }
    
    void main(void) {
        // Step 1: Sample height map for displacement
        float height = texture2D(uHeightMap, vTextureCoord).r;
        
        // Step 2: Calculate displacement offset (centered at 0.5 gray)
        vec2 displacement = (height - 0.5) * uDisplacementScale / uTextureSize;
        
        // Step 3: Sample design with displaced coordinates
        vec2 displacedUV = vTextureCoord + displacement;
        vec4 designColor = texture2D(uSampler, displacedUV);
        
        // Step 4: Calculate surface normal for lighting
        vec3 normal = calculateNormal(vTextureCoord);
        
        // Step 5: Calculate diffuse lighting (Lambert)
        vec3 lightDir = normalize(vec3(uLightDirection, 0.5));
        float diffuse = max(dot(normal, lightDir), 0.0);
        
        // Combine ambient + diffuse lighting
        float lighting = uAmbientLight + diffuse * uLightIntensity;
        
        // Step 6: Apply lighting to design
        vec3 litDesign = designColor.rgb * lighting;
        
        // Step 7: Optional fabric texture blend
        vec4 fabricColor = texture2D(uFabricTexture, vTextureCoord);
        vec3 finalColor = mix(litDesign, litDesign * fabricColor.rgb, uFabricBlend);
        
        // Step 8: Height-based shadow boost (SUBTLE - darker in valleys)
        float shadowBoost = mix(0.92, 1.0, height);  // Much more subtle range
        finalColor *= shadowBoost;
        
        gl_FragColor = vec4(finalColor, designColor.a);
    }
`;

// Default uniform values - BRIGHTENED for visibility
export const fabricShaderDefaults = {
    uDisplacementScale: 30.0,
    uLightIntensity: 0.4,        // Reduced from 0.8 - less dramatic lighting
    uLightDirection: [0.5, -0.5],
    uFabricBlend: 0.05,          // Reduced from 0.15 - subtle fabric overlay
    uAmbientLight: 0.95,         // Increased from 0.6 - much brighter base
};
