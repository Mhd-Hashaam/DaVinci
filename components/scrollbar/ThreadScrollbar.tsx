/**
 * ThreadScrollbar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A custom vertical scrollbar that renders as an animated "thread unraveling"
 * SVG graphic. Above the thumb: thread is taut and straight. Below: it loosens
 * into a sinuous wave, as if silk unspooling from a spool knot.
 *
 * Usage:
 *   <div style={{ position: "relative" }}>
 *     <div ref={scrollRef} style={{ overflowY: "scroll", scrollbarWidth: "none" }}>
 *       {content}
 *     </div>
 *     <ThreadScrollbar containerRef={scrollRef} />
 *   </div>
 *
 * To use a custom config, pass a partial config object:
 *   <ThreadScrollbar containerRef={scrollRef} config={{ waviness: 2 }} />
 */

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface ThreadScrollbarConfig {
  /** Width of the scrollbar column in pixels */
  width: number;
  /** Top and bottom padding inside the rail in pixels */
  padding: number;
  /**
   * How dramatically the thread fans out below the thumb.
   * 0.1 = barely moves, 1 = default, 2 = wild and loose, 3 = chaotic
   */
  waviness: number;
  /** Radius of the thumb circle in pixels */
  thumbRadius: number;
  /** Show the cross (+) spool-knot lines on the thumb */
  spoolLines: boolean;
  /** Color of the taut thread above the thumb */
  colorLit: string;
  /** Color of the loose thread below the thumb */
  colorDim: string;
  /** Stroke + fill color of the thumb circle */
  colorThumb: string;
  /** Fill color of the thumb interior (should match your bg) */
  colorBg: string;
  /** Offset from the right edge in pixels */
  right: number;
  /** Offset from the top edge in pixels */
  top: number;
  /** Offset from the bottom edge in pixels */
  bottom: number;
}

/**
 * DEFAULT_THREAD_CONFIG
 * Tweak these values to match your app's vibe.
 */
export const DEFAULT_THREAD_CONFIG: ThreadScrollbarConfig = {
  width:       20,
  padding:     160,
  waviness:    2,
  thumbRadius: 10,
  spoolLines:  true,
  colorLit:    "#C5A572",              // Luxury Gold (lit thread)
  colorDim:    "rgba(197,165,114,0.18)", // faint, loose thread below thumb
  colorThumb:  "#C5A572",              // thumb ring + dot
  colorBg:     "#0c0b0a",              // thumb interior — match admin-bg
  right:      4,                     // Balanced default offset
  top:         0,
  bottom:      0,
};

// ─── SVG Builder ─────────────────────────────────────────────────────────────

function buildSVG(
  progress: number,
  H: number,
  cfg: ThreadScrollbarConfig
): string {
  const { width: W, padding: pad, waviness, colorLit, colorDim,
          colorThumb, colorBg, thumbRadius: TR, spoolLines } = cfg;

  const drawH = H - pad * 2;
  const ty    = pad + progress * drawH;
  const CX    = W / 2;
  const STEPS = 80;

  let litD = "", dimD = "", dimStarted = false;

  for (let i = 0; i <= STEPS; i++) {
    const t   = i / STEPS;
    const y   = pad + t * drawH;
    // Taut above thumb (small fixed amplitude), loose and widening below
    const amp = y <= ty
      ? 1.2
      : 1.2 + (t - progress) * 14 * waviness;
    const x   = (CX + amp * Math.sin(t * Math.PI * 6)).toFixed(2);
    const yf  = y.toFixed(2);

    if (y <= ty) {
      litD += (i === 0 ? "M" : "L") + ` ${x} ${yf} `;
    } else {
      if (!dimStarted) { dimD = `M ${x} ${yf} `; dimStarted = true; }
      else               dimD += `L ${x} ${yf} `;
    }
  }

  // Thumb sits exactly on the thread path
  const tx  = (CX + 1.2 * Math.sin(progress * Math.PI * 6)).toFixed(2);
  const tyf = ty.toFixed(2);

  const cross = spoolLines ? `
    <line x1="${(+tx - TR + 2).toFixed(2)}" y1="${tyf}"
          x2="${(+tx + TR - 2).toFixed(2)}" y2="${tyf}"
          stroke="${colorBg}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="${tx}" y1="${(ty - TR + 3).toFixed(2)}"
          x2="${tx}" y2="${(ty + TR - 3).toFixed(2)}"
          stroke="${colorBg}" stroke-width="1.2" stroke-linecap="round"/>` : "";

  return `
    <path d="${litD}" fill="none" stroke="${colorLit}"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${dimD}" fill="none" stroke="${colorDim}"
          stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${tx}" cy="${tyf}" r="${TR + 4}"
            fill="${colorBg}" opacity="0.5"/>
    <circle cx="${tx}" cy="${tyf}" r="${TR}"
            fill="${colorBg}" stroke="${colorThumb}" stroke-width="1.5"/>
    <circle cx="${tx}" cy="${tyf}" r="${(TR * 0.42).toFixed(2)}"
            fill="${colorThumb}"/>
    ${cross}
    <circle cx="${tx}" cy="${tyf}" r="${TR + 6}"
            fill="none" stroke="${colorThumb}" stroke-width="0.5" opacity="0.18"/>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ThreadScrollbarProps {
  /** Ref to the scrollable container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Partial config — any omitted keys fall back to DEFAULT_THREAD_CONFIG */
  config?: Partial<ThreadScrollbarConfig>;
}

export function ThreadScrollbar({ containerRef, config = {} }: ThreadScrollbarProps) {
  const cfg = { ...DEFAULT_THREAD_CONFIG, ...config };
  
  const railRef       = useRef<HTMLDivElement>(null);
  const litPathRef    = useRef<SVGPathElement>(null);
  const dimPathRef    = useRef<SVGPathElement>(null);
  const thumbGroupRef = useRef<SVGGElement>(null);
  
  const dragging    = useRef(false);
  const progressRef = useRef(0);
  const railHRef    = useRef(300);
  const rafRef      = useRef<number | null>(null);

  // ── High-performance manual DOM update 
  const updateVisuals = useCallback(() => {
    if (!litPathRef.current || !dimPathRef.current || !thumbGroupRef.current) return;
    
    const p = progressRef.current;
    const h = railHRef.current;
    const { width: W, padding: pad, waviness } = cfg;
    
    const drawH = h - pad * 2;
    const ty = pad + p * drawH;
    const CX = W / 2;
    const STEPS = 80;
    const pi6 = Math.PI * 6;

    let litPoints = "";
    let dimPoints = "";
    let dimStarted = false;

    for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const y = pad + t * drawH;
        const isLit = y <= ty;
        const amp = isLit ? 1.2 : 1.2 + (t - p) * 14 * waviness;
        const x = (CX + amp * Math.sin(t * pi6)).toFixed(2);
        const yf = y.toFixed(2);

        if (isLit) {
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

    const tx = (CX + 1.2 * Math.sin(p * pi6)).toFixed(2);
    const tyf = ty.toFixed(2);

    litPathRef.current.setAttribute("d", litPoints);
    dimPathRef.current.setAttribute("d", dimPoints);
    thumbGroupRef.current.setAttribute("transform", `translate(${tx}, ${tyf})`);
  }, [cfg]);

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
    const drawH = h - pad * 2;
    if (drawH <= 0) return 0;
    
    const relativeY = clientY - r.top;
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

  const { colorLit, colorDim, colorThumb, colorBg, thumbRadius: TR, spoolLines } = cfg;

  return (
    <div
      ref={railRef}
      style={{
        position:      "absolute",
        top:           `${cfg.top}px`,
        bottom:        `${cfg.bottom}px`,
        right:         `${cfg.right}px`,
        width:         cfg.width,
        height:        cfg.top === 0 && cfg.bottom === 0 ? "100%" : `calc(100% - ${cfg.top + cfg.bottom}px)`,
        cursor:        "pointer",
        userSelect:    "none",
        zIndex:        9999,
        flexShrink:    0,
        touchAction:   "none",
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
        <path ref={litPathRef} fill="none" stroke={colorLit} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={dimPathRef} fill="none" stroke={colorDim} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Thumb Group */}
        <g ref={thumbGroupRef}>
            {/* Background / Outline */}
            <circle cx="0" cy="0" r={TR + 4} fill={colorBg} opacity="0.5" />
            <circle cx="0" cy="0" r={TR} fill={colorBg} stroke={colorThumb} strokeWidth="1.5" />
            <circle cx="0" cy="0" r={TR * 0.42} fill={colorThumb} />
            
            {/* Spool Lines (+) */}
            {spoolLines && (
              <>
                <line x1={-TR + 2} y1="0" x2={TR - 2} y2="0" stroke={colorBg} strokeWidth="1.2" strokeLinecap="round" />
                <line x1="0" y1={-TR + 3} x2="0" y2={TR - 3} stroke={colorBg} strokeWidth="1.2" strokeLinecap="round" />
              </>
            )}
            
            {/* Outer Glow Ring */}
            <circle cx="0" cy="0" r={TR + 6} fill="none" stroke={colorThumb} strokeWidth="0.5" opacity="0.18" />
        </g>
      </svg>
    </div>
  );
}

export default ThreadScrollbar;
