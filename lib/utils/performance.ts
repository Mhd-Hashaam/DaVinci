/**
 * Performance & Memory Monitoring Utilities
 * 
 * READ-ONLY instrumentation — does NOT modify any rendering or asset logic.
 * All functions are passive observers that read browser/Three.js stats.
 */

// ---------- Formatting ----------

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ---------- JS Heap Memory ----------

interface MemoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
}

export function getJSHeapInfo(): MemoryInfo | null {
    const perf = performance as any;
    if (perf.memory) {
        return {
            jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
            totalJSHeapSize: perf.memory.totalJSHeapSize,
            usedJSHeapSize: perf.memory.usedJSHeapSize,
        };
    }
    return null;
}

// ---------- DOM Stats ----------

export function getDOMStats() {
    return {
        totalNodes: document.querySelectorAll('*').length,
        canvasElements: document.querySelectorAll('canvas').length,
        imageElements: document.querySelectorAll('img').length,
        videoElements: document.querySelectorAll('video').length,
    };
}

// ---------- Console Logger (prefixed) ----------

let logInterval: ReturnType<typeof setInterval> | null = null;

export function startMemoryLogging(intervalMs = 5000) {
    if (logInterval) return; // Already running

    console.log('[MEM] 📊 Memory logging started (interval: ' + intervalMs + 'ms)');

    logInterval = setInterval(() => {
        const heap = getJSHeapInfo();
        const dom = getDOMStats();

        if (heap) {
            console.log(
                `[MEM] Heap: ${formatBytes(heap.usedJSHeapSize)} / ${formatBytes(heap.totalJSHeapSize)} (limit: ${formatBytes(heap.jsHeapSizeLimit)}) | DOM: ${dom.totalNodes} nodes, ${dom.canvasElements} canvas, ${dom.imageElements} img`
            );
        } else {
            console.log(
                `[MEM] Heap: N/A (non-Chromium) | DOM: ${dom.totalNodes} nodes, ${dom.canvasElements} canvas, ${dom.imageElements} img`
            );
        }
    }, intervalMs);
}

export function stopMemoryLogging() {
    if (logInterval) {
        clearInterval(logInterval);
        logInterval = null;
        console.log('[MEM] 📊 Memory logging stopped');
    }
}

// ---------- Snapshot (one-time dump) ----------

export function takeMemorySnapshot(label?: string) {
    const heap = getJSHeapInfo();
    const dom = getDOMStats();
    const tag = label ? `[${label}]` : '';

    console.group(`[MEM] 📸 Snapshot ${tag}`);
    if (heap) {
        console.log(`Used Heap:  ${formatBytes(heap.usedJSHeapSize)}`);
        console.log(`Total Heap: ${formatBytes(heap.totalJSHeapSize)}`);
        console.log(`Heap Limit: ${formatBytes(heap.jsHeapSizeLimit)}`);
        const usage = ((heap.usedJSHeapSize / heap.jsHeapSizeLimit) * 100).toFixed(1);
        console.log(`Utilization: ${usage}%`);
    } else {
        console.log('Heap info not available (non-Chromium browser)');
    }
    console.log(`DOM Nodes:  ${dom.totalNodes}`);
    console.log(`Canvases:   ${dom.canvasElements}`);
    console.log(`Images:     ${dom.imageElements}`);
    console.log(`Videos:     ${dom.videoElements}`);
    console.groupEnd();
}
