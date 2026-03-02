'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, Cpu, HardDrive, Layers, Image as ImageIcon, Monitor } from 'lucide-react';
import {
    getJSHeapInfo,
    getDOMStats,
    formatBytes,
    startMemoryLogging,
    stopMemoryLogging,
    takeMemorySnapshot
} from '@/lib/utils/performance';

interface HeapSnapshot {
    used: number;
    total: number;
    limit: number;
}

interface DOMSnapshot {
    totalNodes: number;
    canvasElements: number;
    imageElements: number;
    videoElements: number;
}

/**
 * PerformanceOverlay — Toggle with Shift+M
 * 
 * READ-ONLY HUD that displays live memory metrics.
 * Does NOT modify any rendering, wrapping, texture, or shader logic.
 */
export const PerformanceOverlay: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isConsoleLogging, setIsConsoleLogging] = useState(false);
    const [heap, setHeap] = useState<HeapSnapshot | null>(null);
    const [dom, setDom] = useState<DOMSnapshot | null>(null);
    const [fps, setFps] = useState(0);
    const [heapHistory, setHeapHistory] = useState<number[]>([]);

    // FPS Counter
    const frameCountRef = useRef(0);
    const lastFpsTimeRef = useRef(performance.now());
    const rafRef = useRef<number>(0);

    const updateFps = useCallback(() => {
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastFpsTimeRef.current;

        if (elapsed >= 1000) {
            setFps(Math.round((frameCountRef.current * 1000) / elapsed));
            frameCountRef.current = 0;
            lastFpsTimeRef.current = now;
        }

        rafRef.current = requestAnimationFrame(updateFps);
    }, []);

    // Keyboard shortcut: Shift + M
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key === 'M') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Start FPS counting when visible
    useEffect(() => {
        if (isVisible) {
            rafRef.current = requestAnimationFrame(updateFps);
        } else {
            cancelAnimationFrame(rafRef.current);
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [isVisible, updateFps]);

    // Poll memory stats when visible
    useEffect(() => {
        if (!isVisible) return;

        const poll = () => {
            const heapInfo = getJSHeapInfo();
            const domInfo = getDOMStats();

            if (heapInfo) {
                setHeap({
                    used: heapInfo.usedJSHeapSize,
                    total: heapInfo.totalJSHeapSize,
                    limit: heapInfo.jsHeapSizeLimit,
                });
                setHeapHistory(prev => {
                    const next = [...prev, heapInfo.usedJSHeapSize];
                    return next.slice(-30); // Keep last 30 samples
                });
            }

            if (domInfo) {
                setDom(domInfo);
            }
        };

        poll(); // Immediate first read
        const interval = setInterval(poll, 2000);
        return () => clearInterval(interval);
    }, [isVisible]);

    // Console logging toggle
    const toggleConsoleLogging = () => {
        if (isConsoleLogging) {
            stopMemoryLogging();
        } else {
            startMemoryLogging(3000);
        }
        setIsConsoleLogging(!isConsoleLogging);
    };

    const heapPercent = heap ? ((heap.used / heap.limit) * 100) : 0;
    const heapColor = heapPercent > 80 ? 'text-red-400' : heapPercent > 50 ? 'text-yellow-400' : 'text-emerald-400';
    const barColor = heapPercent > 80 ? 'bg-red-500' : heapPercent > 50 ? 'bg-yellow-500' : 'bg-emerald-500';

    // Mini sparkline
    const maxHeap = Math.max(...(heapHistory.length ? heapHistory : [1]));
    const minHeap = Math.min(...(heapHistory.length ? heapHistory : [0]));
    const range = maxHeap - minHeap || 1;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-4 right-4 z-[9999] w-72 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Memory Debug
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`text-[10px] font-mono font-bold ${fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                {fps} FPS
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                                <X size={12} className="text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">

                        {/* JS Heap */}
                        {heap ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <HardDrive size={12} className="text-zinc-500" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">JS Heap</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-lg font-bold font-mono ${heapColor}`}>
                                        {formatBytes(heap.used)}
                                    </span>
                                    <span className="text-[10px] text-zinc-600">
                                        / {formatBytes(heap.limit)}
                                    </span>
                                </div>
                                {/* Bar */}
                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min(heapPercent, 100)}%` }}
                                    />
                                </div>
                                {/* Sparkline */}
                                {heapHistory.length > 1 && (
                                    <div className="flex items-end gap-px h-8">
                                        {heapHistory.map((val, i) => {
                                            const height = ((val - minHeap) / range) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex-1 ${barColor} rounded-t-sm opacity-60`}
                                                    style={{ height: `${Math.max(height, 5)}%` }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-[10px] text-zinc-600 italic">
                                Heap info unavailable (non-Chromium browser)
                            </div>
                        )}

                        {/* DOM Stats */}
                        {dom && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Layers size={12} className="text-zinc-500" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">DOM</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <div className="text-[9px] text-zinc-600 mb-0.5">Nodes</div>
                                        <div className={`text-sm font-bold font-mono ${dom.totalNodes > 3000 ? 'text-red-400' : dom.totalNodes > 1500 ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                            {dom.totalNodes.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <div className="text-[9px] text-zinc-600 mb-0.5">Canvas</div>
                                        <div className={`text-sm font-bold font-mono ${dom.canvasElements > 3 ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                            {dom.canvasElements}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <div className="text-[9px] text-zinc-600 mb-0.5">Images</div>
                                        <div className="text-sm font-bold font-mono text-zinc-300">
                                            {dom.imageElements}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <div className="text-[9px] text-zinc-600 mb-0.5">Videos</div>
                                        <div className="text-sm font-bold font-mono text-zinc-300">
                                            {dom.videoElements}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button
                                onClick={toggleConsoleLogging}
                                className={`flex-1 text-[9px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all ${isConsoleLogging
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                {isConsoleLogging ? '⏸ Stop Logging' : '▶ Console Log'}
                            </button>
                            <button
                                onClick={() => takeMemorySnapshot('Manual')}
                                className="flex-1 text-[9px] font-bold uppercase tracking-wider py-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
                            >
                                📸 Snapshot
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-white/5 text-center">
                        <span className="text-[8px] text-zinc-700 font-medium">
                            Press Shift+M to toggle
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
