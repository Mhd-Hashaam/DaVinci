/**
 * NeuralScrollbar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A custom vertical scrollbar that renders as an animated "neural dendrite"
 * SVG graphic. A zigzagging organic spine with branching side nodes that light
 * up as you scroll past them — like synapses firing down an axon.
 *
 * Usage:
 *   <div style={{ position: "relative" }}>
 *     <div ref={scrollRef} style={{ overflowY: "scroll", scrollbarWidth: "none" }}>
 *       {content}
 *     </div>
 *     <NeuralScrollbar containerRef={scrollRef} />
 *   </div>
 *
 * To use a custom config, pass a partial config object:
 *   <NeuralScrollbar containerRef={scrollRef} config={{ nodeCount: 10 }} />
 */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";

// ─── Pulse keyframe (injected once into <head>) ───────────────────────────────

let pulseStyleInjected = false;
function ensurePulseStyle() {
  if (pulseStyleInjected) return;
  pulseStyleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes nsb-pulse {
      0%   { opacity: 0.55; transform: scale(1);   }
      70%  { opacity: 0;    transform: scale(1.9); }
      100% { opacity: 0;    transform: scale(1.9); }
    }
    .nsb-pulse-ring {
      animation: nsb-pulse 2s ease-out infinite;
      transform-box: fill-box;
    }
  `;
  document.head.appendChild(style);
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface NeuralScrollbarConfig {
  /** Width of the scrollbar column in pixels */
  width: number;
  /** Top and bottom padding inside the rail in pixels */
  padding: number;
  /**
   * Number of branch nodes along the spine.
   * Each node alternates left/right. Recommended: 5–12.
   */
  nodeCount: number;
  /**
   * How far each branch extends sideways from the spine in pixels.
   * Recommended: 3–10.
   */
  branchLength: number;
  /**
   * Amplitude of the spine's zigzag oscillation in pixels.
   * 0 = straight line, 2.5 = default gentle sway, 8 = dramatic.
   */
  zigAmplitude: number;
  /**
   * Frequency of the spine's oscillation (full cycles across the rail).
   * Lower = fewer bends, higher = more serpentine. Recommended: 3–8.
   */
  zigFrequency: number;
  /** Radius of the thumb circle in pixels */
  thumbRadius: number;
  /** Show a pulsing glow ring around the thumb */
  pulseRing: boolean;
  /** Color of the active (lit) spine and nodes */
  colorLit: string;
  /** Color of the inactive (dim) spine and nodes below thumb */
  colorDim: string;
  /** Stroke + fill color of the thumb circle */
  colorThumb: string;
  /** Fill color of the thumb interior (should match your bg) */
  colorBg: string;
  /** Color of the animated pulse ring (can be rgba for transparency) */
  colorPulse: string;
  /** Offset from the right edge in pixels */
  right: number;
  /** Offset from the top edge in pixels */
  top: number;
  /** Offset from the bottom edge in pixels */
  bottom: number;
}

/**
 * DEFAULT_NEURAL_CONFIG
 * Tweak these values to match your app's vibe.
 */
export const DEFAULT_NEURAL_CONFIG: NeuralScrollbarConfig = {
  width:        6,
  padding:      120,
  nodeCount:    7,
  branchLength: 5,
  zigAmplitude: 2.5,
  zigFrequency: 5,
  thumbRadius:  6,
  pulseRing:    true,
  colorLit:     "#C5A572",               // Luxury Gold (active spine/nodes)
  colorDim:     "rgba(197,165,114,0.15)", // faint inactive spine/nodes
  colorThumb:   "#C5A572",               // thumb ring + dot
  colorBg:      "#0c0b0a",               // thumb interior
  colorPulse:   "rgba(197,165,114,0.3)",  // pulse ring glow
  right:        40,                      // Balanced default offset
  top:          0,
  bottom:       0,
};

// ─── SVG Builder ─────────────────────────────────────────────────────────────

function buildSVG(
  progress: number,
  H: number,
  cfg: NeuralScrollbarConfig,
  branches: { t: number; side: number }[]
): string {
  const {
    width: W, padding: pad, zigAmplitude, zigFrequency,
    colorLit, colorDim, colorThumb, colorBg, colorPulse,
    thumbRadius: TR, branchLength, pulseRing,
  } = cfg;

  const drawH = H - pad * 2;
  const ty    = pad + progress * drawH;
  const CX    = W / 2;
  const STEPS = 60;

  const spineX = (t: number) =>
    CX + zigAmplitude * Math.sin(t * Math.PI * zigFrequency);

  // Build lit (above thumb) and dim (below thumb) spine paths
  let litD = "", dimD = "", dimStarted = false;
  for (let i = 0; i <= STEPS; i++) {
    const t  = i / STEPS;
    const y  = pad + t * drawH;
    const x  = spineX(t).toFixed(2);
    const yf = y.toFixed(2);
    if (y <= ty) {
      litD += (i === 0 ? "M" : "L") + ` ${x} ${yf} `;
    } else {
      if (!dimStarted) { dimD = `M ${x} ${yf} `; dimStarted = true; }
      else               dimD += `L ${x} ${yf} `;
    }
  }

  // Branch nodes — lit if above thumb, dim below
  let branchHTML = "";
  for (const br of branches) {
    const y     = pad + br.t * drawH;
    const spX   = spineX(br.t);
    const isLit = y <= ty;
    const bx2   = (spX + br.side * branchLength).toFixed(2);
    const color = isLit ? colorLit : colorDim;
    const r     = isLit ? 2.5 : 1.8;
    branchHTML += `
      <line x1="${spX.toFixed(2)}" y1="${y.toFixed(2)}"
            x2="${bx2}" y2="${y.toFixed(2)}"
            stroke="${color}" stroke-width="${isLit ? 0.9 : 0.5}"/>
      <circle cx="${bx2}" cy="${y.toFixed(2)}" r="${r}" fill="${color}"/>`;
  }

  const tx  = spineX(progress).toFixed(2);
  const tyf = ty.toFixed(2);

  // CSS animation on the pulse ring — transform-origin must be set inline
  const pulse = pulseRing
    ? `<circle class="nsb-pulse-ring"
               cx="${tx}" cy="${tyf}" r="${TR + 6}"
               fill="none" stroke="${colorPulse}" stroke-width="1.5"
               opacity="0.45"
               style="transform-origin:${tx}px ${tyf}px"/>`
    : "";

  return `
    ${branchHTML}
    ${pulse}
    <path d="${litD}" fill="none" stroke="${colorLit}"
          stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${dimD}" fill="none" stroke="${colorDim}"
          stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${tx}" cy="${tyf}" r="${TR + 3}"
            fill="${colorBg}" opacity="0.55"/>
    <circle cx="${tx}" cy="${tyf}" r="${TR}"
            fill="${colorBg}" stroke="${colorThumb}" stroke-width="1.5"/>
    <circle cx="${tx}" cy="${tyf}" r="${(TR * 0.42).toFixed(2)}"
            fill="${colorThumb}"/>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NeuralScrollbarProps {
  /** Ref to the scrollable container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Partial config — any omitted keys fall back to DEFAULT_NEURAL_CONFIG */
  config?: Partial<NeuralScrollbarConfig>;
}

export function NeuralScrollbar({ containerRef, config = {} }: NeuralScrollbarProps) {
  const cfg = { ...DEFAULT_NEURAL_CONFIG, ...config };

  // Pre-compute branch positions (stable, based only on nodeCount)
  const branches = useMemo(() => Array.from({ length: cfg.nodeCount }, (_, i) => ({
    t:    (i + 1) / (cfg.nodeCount + 1),
    side: i % 2 === 0 ? -1 : 1,
  })), [cfg.nodeCount]);

  const railRef          = useRef<HTMLDivElement>(null);
  const litPathRef       = useRef<SVGPathElement>(null);
  const dimPathRef       = useRef<SVGPathElement>(null);
  const thumbGroupRef    = useRef<SVGGElement>(null);
  const branchLinesRef   = useRef<(SVGLineElement | null)[]>([]);
  const branchCirclesRef = useRef<(SVGCircleElement | null)[]>([]);

  const dragging    = useRef(false);
  const progressRef = useRef(0);
  const railHRef    = useRef(300);
  const rafRef      = useRef<number | null>(null);

  // Inject pulse CSS animation once
  useEffect(() => { if (cfg.pulseRing) ensurePulseStyle(); }, [cfg.pulseRing]);

  // ── High-performance manual DOM update
  const updateVisuals = useCallback(() => {
    if (!litPathRef.current || !dimPathRef.current || !thumbGroupRef.current) return;

    const p = progressRef.current;
    const h = railHRef.current;
    const {
      width: W, padding: pad, zigAmplitude, zigFrequency,
      colorLit, colorDim
    } = cfg;

    const drawH = h - pad * 2;
    const ty = pad + p * drawH;
    const CX = W / 2;
    const STEPS = 60;
    const piFreq = Math.PI * zigFrequency;

    const spineX = (t: number) => CX + zigAmplitude * Math.sin(t * piFreq);

    // Build lit (above thumb) and dim (below thumb) spine paths
    let litPoints = "";
    let dimPoints = "";
    let dimStarted = false;
    
    for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const y = pad + t * drawH;
        const x = spineX(t).toFixed(2);
        const yf = y.toFixed(2);
        
        if (y <= ty) {
            litPoints += (i === 0 ? "M" : "L") + ` ${x} ${yf} `;
        } else {
            if (!dimStarted) {
                dimPoints = `M ${x} ${yf} `;
                dimStarted = true;
            } else {
                dimPoints += `L ${x} ${yf} `;
            }
        }
    }

    const tx = spineX(p).toFixed(2);
    const tyf = ty.toFixed(2);

    litPathRef.current.setAttribute("d", litPoints);
    dimPathRef.current.setAttribute("d", dimPoints);
    thumbGroupRef.current.setAttribute("transform", `translate(${tx}, ${tyf})`);

    // Update branch colors & sizes
    for (let j = 0; j < branches.length; j++) {
        const br = branches[j];
        const y = pad + br.t * drawH;
        const isLit = y <= ty;
        
        const circleEl = branchCirclesRef.current[j];
        if (circleEl) {
            circleEl.setAttribute("fill", isLit ? colorLit : colorDim);
            circleEl.setAttribute("r", isLit ? "2.5" : "1.8");
            circleEl.setAttribute("cy", y.toFixed(2));
        }

        const lineEl = branchLinesRef.current[j];
        if (lineEl) {
            const spXNode = spineX(br.t);
            const bx2 = (spXNode + br.side * branchLength).toFixed(2);
            lineEl.setAttribute("stroke", isLit ? colorLit : colorDim);
            lineEl.setAttribute("stroke-width", isLit ? "0.9" : "0.5");
            lineEl.setAttribute("x1", spXNode.toFixed(2));
            lineEl.setAttribute("y1", y.toFixed(2));
            lineEl.setAttribute("x2", bx2);
            lineEl.setAttribute("y2", y.toFixed(2));
        }
    }
  }, [cfg, branches]);

  // Request Animation Frame wrapper to throttle heavy updates
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      updateVisuals();
      rafRef.current = null;
    });
  }, [updateVisuals]);

  // ── Sync scroll position → progress
  const syncFromScroll = useCallback(() => {
    if (dragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    progressRef.current = max > 0 ? el.scrollTop / max : 0;
    scheduleUpdate();
  }, [containerRef, scheduleUpdate]);

  // ── Convert clientY inside rail → 0–1 progress
  const getProgress = useCallback((clientY: number): number => {
    const rail = railRef.current;
    if (!rail) return 0;
    const { padding: pad } = cfg;
    const r = rail.getBoundingClientRect();
    const h = r.height;
    
    // Map the mouse position within the active "draw" area (pad to h-pad)
    // to the 0-1 scroll range.
    const relativeY = clientY - r.top;
    const drawH = h - pad * 2;
    if (drawH <= 0) return 0;
    
    return Math.min(1, Math.max(0, (relativeY - pad) / drawH));
  }, [cfg]);

  // ── Scroll the container to match a given 0–1 progress
  const applyProgress = useCallback((p: number) => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTop = p * max;
    progressRef.current = p;
    scheduleUpdate();
  }, [containerRef, scheduleUpdate]);

  // ── Attach scroll listener + ResizeObserver
  useEffect(() => {
    const el   = containerRef.current;
    const rail = railRef.current;
    if (!el || !rail) return;

    el.addEventListener("scroll", syncFromScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      railHRef.current = rail.offsetHeight;
      syncFromScroll();
    });
    ro.observe(el);
    ro.observe(rail);
    
    // Initial paint
    railHRef.current = rail.offsetHeight;
    syncFromScroll();

    return () => {
      el.removeEventListener("scroll", syncFromScroll);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, syncFromScroll]);

  // ── Global mouse/touch drag handlers
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      applyProgress(getProgress(clientY));
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("touchmove",  onMove as EventListener, { passive: false });
    window.addEventListener("touchend",   onUp);
    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("touchmove",  onMove as EventListener);
      window.removeEventListener("touchend",   onUp);
    };
  }, [applyProgress, getProgress]);

  const {
    width: W, padding: pad, zigAmplitude, zigFrequency,
    colorLit, colorDim, colorThumb, colorBg, colorPulse,
    thumbRadius: TR, branchLength, pulseRing,
  } = cfg;

  return (
    <div
      ref={railRef}
      style={{
        position:    "absolute",
        top:         `${cfg.top}px`,
        bottom:      `${cfg.bottom}px`,
        right:       `${cfg.right}px`,
        width:       cfg.width,
        height:      cfg.top === 0 && cfg.bottom === 0 ? "100%" : `calc(100% - ${cfg.top + cfg.bottom}px)`,
        cursor:      "pointer",
        userSelect:  "none",
        zIndex:      9999,
        flexShrink:  0,
        touchAction: "none",
      }}
      onMouseDown={e => {
        dragging.current = true;
        applyProgress(getProgress(e.clientY));
      }}
      onTouchStart={e => {
        dragging.current = true;
        applyProgress(getProgress(e.touches[0].clientY));
        e.preventDefault();
      }}
      onClick={e => applyProgress(getProgress(e.clientY))}
    >
      <svg
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset:    0,
          width:    "100%",
          height:   "100%",
          overflow: "visible",
          display:  "block",
        }}
      >
        {/* Branch nodes (static positions, dynamic colors via refs) */}
        {branches.map((br: { t: number; side: number }, idx: number) => {
          const CX = W / 2;
          const spX = CX + zigAmplitude * Math.sin(br.t * Math.PI * zigFrequency);
          const bx2 = spX + br.side * branchLength;
          // Initial y will be calculated in SVG coordinates, but since railH varies, 
          // we use CSS percentage or just pre-calculate an initial state.
          // Wait, railHRef starts at 300, which is just a default. The real positions
          // are computed exactly in updateVisuals!
          // But SVG lines need initial x1/y1 attributes.
          // Since updateVisuals runs immediately on mount, we can leave y as 0 or
          // a rough estimate.
          const initialY = pad + br.t * (300 - pad * 2);
          return (
            <g key={idx}>
              <line 
                ref={el => { branchLinesRef.current[idx] = el; }}
                x1={spX} y1={initialY} 
                x2={bx2} y2={initialY} 
                stroke={colorDim} strokeWidth={0.5} 
              />
              <circle 
                ref={el => { branchCirclesRef.current[idx] = el; }}
                cx={bx2} cy={initialY} r={1.8} fill={colorDim} 
              />
            </g>
          );
        })}

        {/* Spine Paths */}
        <path ref={litPathRef} fill="none" stroke={colorLit} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={dimPathRef} fill="none" stroke={colorDim} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Thumb Group */}
        <g ref={thumbGroupRef}>
            {pulseRing && (
              <circle 
                className="nsb-pulse-ring"
                cx="0" cy="0" r={TR + 6}
                fill="none" stroke={colorPulse} strokeWidth="1.5"
                opacity="0.45"
              />
            )}
            <circle cx="0" cy="0" r={TR + 3} fill={colorBg} opacity="0.55" />
            <circle cx="0" cy="0" r={TR} fill={colorBg} stroke={colorThumb} strokeWidth="1.5" />
            <circle cx="0" cy="0" r={TR * 0.42} fill={colorThumb} />
        </g>
      </svg>
    </div>
  );
}

export default NeuralScrollbar;
