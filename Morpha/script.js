// Shader code as strings
const vertexShader = `
    varying float vDistortion;
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uDensity;
    uniform float uStrength;

    //  Classic Perlin 3D Noise 
    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
    }
    vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }
    vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    }

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
        float distortion = noise(normal * uDensity) * uStrength;
        vec3 pos = position + (normal * distortion);
        float angle = sin(uv.y * uFrequency) * uAmplitude;
        pos = rotateY(pos, angle);
        vDistortion = distortion;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
`;

const fragmentShader = `
    uniform float uOpacity;
    uniform float uDeepPurple;
    varying float vDistortion;

    vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
        float distort = vDistortion * 3.;
        vec3 brightness = vec3(.1, .1, .9);
        vec3 contrast = vec3(.3, .3, .3);
        vec3 oscilation = vec3(.5, .5, .9);
        vec3 phase = vec3(.9, .1, .8);
        
        vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);
        gl_FragColor = vec4(color, vDistortion);
        gl_FragColor += vec4(min(uDeepPurple, 1.), 0., .5, min(uOpacity, 1.));
    }
`;

class ScrollStage {
    constructor() {
        this.element = document.querySelector('.scroll__content');
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.scroll = {
            height: 0,
            limit: 0,
            hard: 0,
            soft: 0,
            ease: 0.05,
            normalized: 0,
            running: false
        };
        this.mouse = {
            x: 0,
            y: 0,
            normalizedX: 0.5,  // Starting in the middle
            normalizedY: 0.5   // Starting in the middle
        };
        this.settings = {
            uFrequency: { start: 0, end: 4 },
            uAmplitude: { start: 4, end: 4 },
            uDensity: { start: 1, end: 1 },
            uStrength: { start: 0, end: 1.1 },
            uDeepPurple: { start: 1, end: 0 },
            uOpacity: { start: 0.33, end: 0.66 }
        };

        gsap.defaults({
            ease: 'power2.out',
            duration: 1.2,
            overwrite: 'auto'
        });

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.canvas = this.renderer.domElement;
        // Use OrthographicCamera instead of PerspectiveCamera to avoid perspective distortion
        const aspectRatio = this.viewport.width / this.viewport.height;
        const cameraSize = 2.5;
        this.camera = new THREE.OrthographicCamera(
            -cameraSize * aspectRatio, // left
            cameraSize * aspectRatio,  // right
            cameraSize,                // top
            -cameraSize,               // bottom
            0.1,                       // near
            10                         // far
        );

        this.setupStage();
        this.addMesh();
        this.addEvents();
        this.onResize();
        this.update();
    }

    onMouseMove(event) {
        // Update mouse position
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        // Normalize positions between 0 and 1
        this.mouse.normalizedX = this.mouse.x / this.viewport.width;
        this.mouse.normalizedY = this.mouse.y / this.viewport.height;
        
        requestAnimationFrame(() => this.updateMouseAnimations());
    }

    update() {
        const elapsedTime = performance.now() * 0.001;
        this.mesh.rotation.y = elapsedTime * 0.05;

        // No need for scroll animations here anymore
        
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.update());
    }

    setupStage() {
        this.canvas.classList.add('webgl');
        document.body.appendChild(this.canvas);
        this.camera.position.set(0, 0, 5); // Position further back for orthographic camera
        this.scene.add(this.camera);
    }

    addMesh() {
        this.geometry = new THREE.IcosahedronGeometry(1, 64);
        this.material = new THREE.ShaderMaterial({
            wireframe: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            vertexShader,
            fragmentShader,
            uniforms: {
                uFrequency: { value: this.settings.uFrequency.start },
                uAmplitude: { value: this.settings.uAmplitude.start },
                uDensity: { value: this.settings.uDensity.start },
                uStrength: { value: this.settings.uStrength.start },
                uDeepPurple: { value: this.settings.uDeepPurple.start },
                uOpacity: { value: this.settings.uOpacity.start }
            }
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        // Position the mesh on the left side of the screen
        this.mesh.position.set(-1.5, 0, 0);
        
        this.scene.add(this.mesh);
    }

    addEvents() {
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    updateMouseAnimations() {
        // Rotate based on mouse Y position
        gsap.to(this.mesh.rotation, {
            x: this.mouse.normalizedY * Math.PI,
            duration: 0.8
        });

        // Use mouse X position (left to right) for morphing 
        for (const key in this.settings) {
            if (this.settings[key].start !== this.settings[key].end) {
                gsap.to(this.mesh.material.uniforms[key], {
                    value: this.settings[key].start + 
                           this.mouse.normalizedX * 
                           (this.settings[key].end - this.settings[key].start),
                    duration: 0.8
                });
            }
        }
    }


    onResize() {
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    
        this.camera.aspect = this.viewport.width / this.viewport.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.viewport.width, this.viewport.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
        if (this.viewport.width < this.viewport.height) {
            this.mesh.scale.set(0.75, 0.75, 0.75);
        } else {
            this.mesh.scale.set(1, 1, 1);
        }
    
        // We don't need to set up scroll-related dimensions anymore
        // but keeping a minimum height for the body
        document.body.style.height = '100vh';
    }
    
}  // End of ScrollStage class

// Initialize
new ScrollStage();
