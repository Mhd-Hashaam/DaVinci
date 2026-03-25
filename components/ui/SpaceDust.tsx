"use client";

import React, { useRef, useEffect } from "react";

// ─── Configuration types ────────────────────────────────────────────────────

export interface SpaceDustConfig {
  /** Total number of background stars */
  starCount?: number;
  /** Min star radius in px */
  starMinSize?: number;
  /** Max star radius in px */
  starMaxSize?: number;
  /** Drift speed range — px per frame (very small values) */
  driftSpeed?: number;
  /** Star twinkle speed (higher = faster pulsing) */
  twinkleSpeed?: number;
  /** Shooting star interval range in ms [min, max] */
  shootInterval?: [number, number];
  /** Shooting star trail length in px */
  shootLength?: number;
  /** Shooting star glow color (defaults to white) */
  shootColor?: string;
  /** Base star tint color in hex */
  starColor?: string;
  className?: string;
}

// ─── Internal types ─────────────────────────────────────────────────────────

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;       // current twinkle phase
  twinkleSpd: number;  // radians per frame
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  length: number;
  opacity: number;
  fadeSpeed: number;
  lineWidth: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3
    ? h.split("").map(c => c + c).join("")
    : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

// ─── Component ────────────────────────────────────────────────────────────────

export function SpaceDust({
  starCount     = 220,
  starMinSize   = 0.2,        // Smaller for "itty bitty" look
  starMaxSize   = 1.5,        // Reduced from 1.8
  driftSpeed    = 0.85,       // Noticeable drift
  twinkleSpeed  = 0.008,
  shootInterval = [4000, 10000],
  shootLength   = 220,
  shootColor    = "#ffffff",
  starColor     = "#ffffff",
  className     = "",
}: SpaceDustConfig) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const starsRef   = useRef<Star[]>([]);
  const shootsRef  = useRef<ShootingStar[]>([]);
  const rafRef     = useRef<number | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    // ── Spawn helpers ────────────────────────────────────────────────────────

    function spawnStar(w: number, h: number): Star {
      // Unified drift direction: towards upper-right (e.g., -45 degrees)
      const angle = rand(-50, -30) * (Math.PI / 180);
      const spd   = rand(0.5, driftSpeed * 2.5); // Much faster base drift
      return {
        x: rand(0, w),
        y: rand(0, h),
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r:  rand(starMinSize, starMaxSize),
        phase:      rand(0, Math.PI * 2),
        twinkleSpd: rand(twinkleSpeed * 0.5, twinkleSpeed * 1.8),
      };
    }

    function spawnShoot(): ShootingStar {
      // Shooting stars from Right to Left (Grok's specific right-to-left feel)
      // Heading mostly Left/Down-Left (angle 150-210 degrees)
      const x = rand(W * 0.7, W + 100);
      const y = rand(-100, H * 0.5);
      const angle = rand(155, 195) * (Math.PI / 180);
      const spd = rand(12, 24);
      return {
        x, y,
        vx:        Math.cos(angle) * spd,
        vy:        Math.sin(angle) * spd,
        speed:     spd,
        length:    rand(shootLength * 0.8, shootLength * 1.5),
        opacity:   1,
        fadeSpeed: rand(0.015, 0.025),
        lineWidth: rand(1.2, 2.8),
      };
    }

    // ── Resize ────────────────────────────────────────────────────────────────

    function resize() {
      if (!canvas) return;
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      starsRef.current  = Array.from({ length: starCount }, () => spawnStar(W, H));
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ── Shooting star timer ───────────────────────────────────────────────────

    function scheduleShoot() {
      const delay = rand(shootInterval[0], shootInterval[1]);
      timerRef.current = setTimeout(() => {
        shootsRef.current.push(spawnShoot());
        scheduleShoot();
      }, delay);
    }
    scheduleShoot();

    // ── Star colors ───────────────────────────────────────────────────────────

    const [sr, sg, sb] = hexToRgb(starColor);
    const [hr, hg, hb] = hexToRgb(shootColor);

    // ── Animation loop ────────────────────────────────────────────────────────

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const MARGIN = 20; // larger wrap margin for smoother transitions

      // ── Stars
      for (const s of starsRef.current) {
        // Move
        s.x += s.vx;
        s.y += s.vy;
        s.phase += s.twinkleSpd;

        // Unified wrap (always coming from bottom/left since they move top-right)
        if (s.x < -MARGIN)  s.x = W + MARGIN;
        if (s.x > W + MARGIN) s.x = -MARGIN;
        if (s.y < -MARGIN)  s.y = H + MARGIN;
        if (s.y > H + MARGIN) s.y = -MARGIN;

        // Opacity via smooth sine
        const alpha = lerp(0.1, 0.85, (Math.sin(s.phase) + 1) * 0.5);

        // Simple, single subtle radial gradient (one layer as requested)
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.2);
        g.addColorStop(0,   `rgba(${sr},${sg},${sb},${alpha})`);
        g.addColorStop(0.5, `rgba(${sr},${sg},${sb},${alpha * 0.4})`);
        g.addColorStop(1,   `rgba(${sr},${sg},${sb},0)`);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // ── Shooting Stars
      for (let i = shootsRef.current.length - 1; i >= 0; i--) {
        const s = shootsRef.current[i];

        if (s.opacity > 0) {
          const norm  = s.speed;
          const nx    = s.vx / norm;
          const ny    = s.vy / norm;
          const tailX = s.x - nx * s.length;
          const tailY = s.y - ny * s.length;

          // ── Glowing head
          ctx.save();
          ctx.shadowBlur  = 15;
          ctx.shadowColor = `rgba(${hr},${hg},${hb},${s.opacity})`;
          ctx.fillStyle   = `rgba(${hr},${hg},${hb},${s.opacity})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.lineWidth, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // ── Gradient tail
          const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          grad.addColorStop(0,    `rgba(${hr},${hg},${hb},${s.opacity})`);
          grad.addColorStop(0.2,  `rgba(${hr},${hg},${hb},${s.opacity * 0.5})`);
          grad.addColorStop(1,    `rgba(${hr},${hg},${hb},0)`);

          ctx.save();
          ctx.shadowBlur  = 8;
          ctx.shadowColor = `rgba(${hr},${hg},${hb},${s.opacity * 0.3})`;
          ctx.strokeStyle = grad;
          ctx.lineWidth   = s.lineWidth;
          ctx.lineCap     = "round";
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          ctx.restore();
        }

        // Advance
        s.x += s.vx;
        s.y += s.vy;
        s.opacity -= s.fadeSpeed;

        // Remove when faded or out of bounds (larger range for tail clearance)
        if (s.opacity <= 0 || s.x < -400 || s.x > W + 400 || s.y > H + 400) {
          shootsRef.current.splice(i, 1);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      if (rafRef.current)  cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starCount, starMinSize, starMaxSize, driftSpeed, twinkleSpeed,
      shootInterval[0], shootInterval[1], shootLength, shootColor, starColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

export default SpaceDust;
