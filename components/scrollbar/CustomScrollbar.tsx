"use client";

/**
 * CustomScrollbar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified wrapper that:
 *   1. Exposes a single <CustomScrollbar> component that accepts a `type` prop
 *      ("thread" | "neural") so your Vibes panel can switch between them.
 *   2. Exports a useScrollbar() hook to access/set the active scrollbar type
 *      from anywhere in your app (e.g., the Appearance panel).
 *   3. Exports ScrollbarProvider to wrap your app with scrollbar state.
 *   4. Hides the native scrollbar on any container it's attached to via a
 *      tiny injected <style> tag (cross-browser, injected once).
 *
 * ─── File structure expected ──────────────────────────────────────────────────
 *
 *   src/
 *     components/
 *       scrollbar/
 *         ThreadScrollbar.tsx      ← the thread component
 *         NeuralScrollbar.tsx      ← the neural component
 *         CustomScrollbar.tsx      ← this file (unified wrapper + context)
 *
 * ─── Quick start ──────────────────────────────────────────────────────────────
 *
 * Step 1 — Wrap your app with ScrollbarProvider (e.g. in main.tsx / _app.tsx):
 *
 *   import { ScrollbarProvider } from "./components/scrollbar/CustomScrollbar";
 *
 *   <ScrollbarProvider defaultType="thread">
 *     <App />
 *   </ScrollbarProvider>
 *
 * Step 2 — Replace any scrollable container:
 *
 *   import { ScrollablePanel } from "./components/scrollbar/CustomScrollbar";
 *
 *   // Before:
 *   <div className="overflow-y-scroll">...</div>
 *
 *   // After:
 *   <ScrollablePanel>...</ScrollablePanel>
 *
 *   // Or if you need a ref / custom className:
 *   <ScrollablePanel className="flex-1" style={{ height: 400 }}>
 *     ...
 *   </ScrollablePanel>
 *
 * Step 3 — Add the toggle to your Appearance / Vibes panel:
 *
 *   import { useScrollbar } from "./components/scrollbar/CustomScrollbar";
 *
 *   function AppearancePanel() {
 *     const { type, setType } = useScrollbar();
 *     return (
 *       <div>
 *         <button onClick={() => setType("thread")}>Thread unraveling</button>
 *         <button onClick={() => setType("neural")}>Neural dendrite</button>
 *       </div>
 *     );
 *   }
 */

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
  CSSProperties,
} from "react";

import { ThreadScrollbar, DEFAULT_THREAD_CONFIG, ThreadScrollbarConfig } from "./ThreadScrollbar";
import { NeuralScrollbar, DEFAULT_NEURAL_CONFIG,  NeuralScrollbarConfig  } from "./NeuralScrollbar";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScrollbarType = "thread" | "neural";

interface ScrollbarContextValue {
  /** Currently active scrollbar style */
  type: ScrollbarType;
  /** Switch the scrollbar style app-wide */
  setType: (type: ScrollbarType) => void;
  /** Override thread config (merged with DEFAULT_THREAD_CONFIG) */
  threadConfig: Partial<ThreadScrollbarConfig>;
  setThreadConfig: (cfg: Partial<ThreadScrollbarConfig>) => void;
  /** Override neural config (merged with DEFAULT_NEURAL_CONFIG) */
  neuralConfig: Partial<NeuralScrollbarConfig>;
  setNeuralConfig: (cfg: Partial<NeuralScrollbarConfig>) => void;
  /** Global visibility flag (e.g. to hide when modals are open) */
  isVisible: boolean;
  setVisible: (v: boolean) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ScrollbarContext = createContext<ScrollbarContextValue>({
  type:            "thread",
  setType:         () => {},
  threadConfig:    {},
  setThreadConfig: () => {},
  neuralConfig:    {},
  setNeuralConfig: () => {},
  isVisible:       true,
  setVisible:      () => {},
});

// ─── Native scrollbar hider (injected once) ───────────────────────────────────

let hideStyleInjected = false;
function ensureHideStyle() {
  if (hideStyleInjected) return;
  hideStyleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    /* Hide native scrollbars but keep functionality */
    html:not(.admin-scrollbar), body:not(.admin-scrollbar), .csb-host {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      scroll-behavior: auto !important;
    }
    html:not(.admin-scrollbar)::-webkit-scrollbar, body:not(.admin-scrollbar)::-webkit-scrollbar, .csb-host::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ScrollbarProviderProps {
  children: ReactNode;
  /** Which scrollbar to show on first load. Default: "thread" */
  defaultType?: ScrollbarType;
  /** Optional: lock the thread config for the whole app */
  threadConfig?: Partial<ThreadScrollbarConfig>;
  /** Optional: lock the neural config for the whole app */
  neuralConfig?: Partial<NeuralScrollbarConfig>;
}

export function ScrollbarProvider({
  children,
  defaultType     = "thread",
  threadConfig:   initThread = {},
  neuralConfig:   initNeural = {},
}: ScrollbarProviderProps) {
  const [type,         setTypeState]    = useState<ScrollbarType>(defaultType);
  const [threadConfig, setThreadConfig] = useState<Partial<ThreadScrollbarConfig>>(initThread);
  const [neuralConfig, setNeuralConfig] = useState<Partial<NeuralScrollbarConfig>>(initNeural);
  const [isVisible,    setVisible]      = useState(true);

  // Load saved type from storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("davinci-scrollbar-type") as ScrollbarType;
      if (saved && (saved === "thread" || saved === "neural")) {
        setTypeState(saved);
      }
    } catch (e) {}
  }, []);

  const setType = useCallback((newType: ScrollbarType) => {
    setTypeState(newType);
    try {
      localStorage.setItem("davinci-scrollbar-type", newType);
    } catch (e) {}
  }, []);

  useEffect(() => { ensureHideStyle(); }, []);

  const value = useMemo(() => ({
    type, setType,
    threadConfig, setThreadConfig,
    neuralConfig, setNeuralConfig,
    isVisible, setVisible
  }), [type, setType, threadConfig, neuralConfig, isVisible]);

  return (
    <ScrollbarContext.Provider value={value}>
      {children}
    </ScrollbarContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useScrollbar()
 *
 * Access from your Vibes / Appearance panel to read or change the scrollbar.
 *
 * const { type, setType } = useScrollbar();
 */
export function useScrollbar(): ScrollbarContextValue {
  return useContext(ScrollbarContext);
}

// ─── CustomScrollbar (internal — used by ScrollablePanel) ────────────────────

interface CustomScrollbarProps {
  containerRef: React.RefObject<HTMLElement | null>;
  /** Optional: override global scrollbar config for this instance */
  config?: Partial<ThreadScrollbarConfig> | Partial<NeuralScrollbarConfig>;
}

export function CustomScrollbar({ containerRef, config }: CustomScrollbarProps) {
  const { type, threadConfig, neuralConfig, isVisible } = useScrollbar();

  if (!isVisible) return null;

  if (type === "neural") {
    return (
      <NeuralScrollbar
        containerRef={containerRef}
        config={{ ...neuralConfig, ...(config as Partial<NeuralScrollbarConfig>) }}
      />
    );
  }

  return (
    <ThreadScrollbar
      containerRef={containerRef}
      config={{ ...threadConfig, ...(config as Partial<ThreadScrollbarConfig>) }}
    />
  );
}

// ─── ScrollablePanel ─────────────────────────────────────────────────────────

/**
 * ScrollablePanel
 *
 * Drop-in replacement for any <div> with overflow-y scroll.
 * Automatically attaches the active custom scrollbar and hides the native one.
 *
 * Props:
 *   children   — your scrollable content
 *   className  — forwarded to the inner scroll div
 *   style      — forwarded to the inner scroll div
 *   innerRef   — optional: get a ref to the scroll element
 *   rightPad   — extra right padding to clear the scrollbar (default: auto)
 */
interface ScrollablePanelProps {
  children:   ReactNode;
  className?: string;
  style?:     CSSProperties;
  innerRef?:  React.RefObject<HTMLDivElement | null>;
  /** Optional: override global scrollbar config for this instance */
  config?:    Partial<ThreadScrollbarConfig> | Partial<NeuralScrollbarConfig>;
}

export function ScrollablePanel({
  children,
  className,
  style,
  innerRef,
  config,
}: ScrollablePanelProps) {
  const { type, threadConfig, neuralConfig, isVisible } = useScrollbar();

  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef   = (innerRef ?? internalRef) as React.RefObject<HTMLDivElement | null>;

  return (
    // Outer wrapper: carries the user's layout classes (flex, h-screen, etc.)
    <div
      className={className}
      style={{ position: "relative", ...style }}
    >
      {/* Inner scroll container: transparent, fills 100% of the outer wrapper */}
      <div
        ref={scrollRef}
        className="csb-host"
        style={{
          overflowY:    "scroll",
          overflowX:    "hidden",
          height:       "100%",
          width:        "100%",
          paddingRight: 0, 
        }}
      >
        {children}
      </div>
      <CustomScrollbar 
        containerRef={scrollRef as React.RefObject<HTMLElement | null>} 
        config={config}
      />
    </div>
  );
}

// ─── Vibes Panel Integration Example ─────────────────────────────────────────
//
// Copy this into your existing Appearance/Vibes panel component.
// It renders two option buttons just like your existing MAUVE / AURORA theme pills.
//
// import { useScrollbar, ScrollbarType } from "./components/scrollbar/CustomScrollbar";
//
// function ScrollbarSection() {
//   const { type, setType } = useScrollbar();
//
//   const options: { value: ScrollbarType; label: string; desc: string }[] = [
//     { value: "thread", label: "Thread",  desc: "Silk unraveling from a spool" },
//     { value: "neural", label: "Neural",  desc: "Synapses firing down an axon" },
//   ];
//
//   return (
//     <section>
//       <h3>SCROLLBAR STYLE</h3>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
//         {options.map(opt => (
//           <button
//             key={opt.value}
//             onClick={() => setType(opt.value)}
//             style={{
//               background:  type === opt.value ? "rgba(255,255,255,0.1)" : "transparent",
//               border:      `1px solid ${type === opt.value ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
//               borderRadius: 12,
//               padding:     "12px 16px",
//               cursor:      "pointer",
//               textAlign:   "left",
//             }}
//           >
//             <strong style={{ color: "white", fontSize: 13 }}>{opt.label}</strong>
//             <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "4px 0 0" }}>
//               {opt.desc}
//             </p>
//           </button>
//         ))}
//       </div>
//     </section>
//   );
// }
