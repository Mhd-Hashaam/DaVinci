'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SmokeBackgroundProps {
    className?: string;
    opacity?: number;
    color?: string; // Optional color tint
    particleCount?: number;
}

const SMOKE_CONFIG = {
    particleCount: 28,
    // Movement
    baseSpeed: 0.5,      // Global multiplier - Slowed down from 0.7
    driftX: 0.35,      // Horizontal drift (positive = right)
    riseY: -0.8,       // Vertical rise (negative = up)
    jitter: 0.4,       // Random vibration/variance
    
    // Lifecycle
    fadeRate: 0.0008,  // How fast smoke disappears (Slower fade)
    growthRate: 0.25,  // How fast particles expand
    rotationRate: 0.002, // Base rotation speed
    
    // Appearance
    minRadius: 250,
    maxRadius: 650,
    thickness: 0.4,    // Voluminous feel (Opacity multiplier)
    
    // Spawn
    sourceX: 0.25,     // Center point (0.25 = 25% from left)
    width: 450,        // Horizontal spread width at base
};

class Particle {
    x: number;
    y: number;
    xVelocity: number;
    yVelocity: number;
    currentOpacity: number;
    radius: number;
    rotation: number;
    image: HTMLImageElement;
    canvasWidth: number;
    canvasHeight: number;

    constructor(context: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, image: HTMLImageElement) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.image = image;
        
        // Initial setup
        this.x = 0;
        this.y = 0;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.currentOpacity = 0;
        this.radius = 0;
        this.rotation = 0;

        this.reset();
        // Randomize initial opacity to prevent "burst" effect on start
        this.currentOpacity = Math.random();
    }

    reset() {
        // Positioned between middle and left corner
        this.x = this.canvasWidth * SMOKE_CONFIG.sourceX + (Math.random() * SMOKE_CONFIG.width - SMOKE_CONFIG.width / 2); 
        this.y = this.canvasHeight + 200; 
        
        // Slower, more atmospheric drift
        this.xVelocity = (SMOKE_CONFIG.driftX + Math.random() * SMOKE_CONFIG.jitter) * SMOKE_CONFIG.baseSpeed; 
        this.yVelocity = (SMOKE_CONFIG.riseY - Math.random() * SMOKE_CONFIG.jitter) * SMOKE_CONFIG.baseSpeed; 
        
        this.currentOpacity = 1;
        this.radius = SMOKE_CONFIG.minRadius + Math.random() * (SMOKE_CONFIG.maxRadius - SMOKE_CONFIG.minRadius);
        this.rotation = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        
        // Rhythmic rotation
        this.rotation += SMOKE_CONFIG.rotationRate + (Math.random() * 0.002); 
        
        // Subtle fade and growth
        this.currentOpacity -= SMOKE_CONFIG.fadeRate; 
        this.radius += SMOKE_CONFIG.growthRate; 

        // Reset when lifecycle ends
        if (this.currentOpacity <= 0 || this.y < -SMOKE_CONFIG.maxRadius || this.x > this.canvasWidth + SMOKE_CONFIG.maxRadius) {
            this.reset();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.image.complete) return;

        const offset = this.radius / -2;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = Math.max(0, this.currentOpacity * SMOKE_CONFIG.thickness);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.image, offset, offset, this.radius, this.radius);
        ctx.restore();
    }
}

export const SmokeBackground: React.FC<SmokeBackgroundProps> = ({ 
    className, 
    opacity = 0.5,
    color = '#ffffff',
    particleCount = SMOKE_CONFIG.particleCount
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const smokeImageRef = useRef<HTMLImageElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        // Load the smoke image
        const img = new Image();
        img.src = "https://i.imgur.com/95DrEMD.png";
        img.onload = () => {
            smokeImageRef.current = img;
            initParticles();
        };

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            if (!smokeImageRef.current || !canvas) return;
            const newParticles = [];
            for (let i = 0; i < particleCount; i++) {
                const p = new Particle(ctx, canvas.width, canvas.height, smokeImageRef.current);
                
                // Pre-warm so it starts in "steady state" across the screen
                p.y = Math.random() * (canvas.height + SMOKE_CONFIG.maxRadius);
                p.x = (canvas.width * SMOKE_CONFIG.sourceX) + (Math.random() * canvas.width * 0.7);
                p.currentOpacity = Math.random();
                p.radius = SMOKE_CONFIG.minRadius + Math.random() * (SMOKE_CONFIG.maxRadius - SMOKE_CONFIG.minRadius);
                newParticles.push(p);
            }
            particlesRef.current = newParticles;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'screen'; 
            
            particlesRef.current.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particleCount]);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                "fixed inset-0 pointer-events-none z-0",
                className
            )}
            style={{ 
                opacity,
                filter: color !== '#ffffff' ? `drop-shadow(0 0 0 ${color}) contrast(1.1) brightness(1.2)` : 'none'
            }}
        />
    );
};
