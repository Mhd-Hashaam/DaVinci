'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

// Configuration Types
interface Point {
    id: number;
    threshold: number;
}

interface ScrollConfig {
    position: {
        right: string;
        top: string;
    };
    dimensions: {
        pointWidth: number;
        pointHeight: number;
        gap: number;
    };
    points: Point[];
}

const DEFAULT_CONFIG: ScrollConfig = {
    position: {
        right: '50px',
        top: '170px',
    },
    dimensions: {
        pointWidth: 24,
        pointHeight: 48,
        gap: 120,
    },
    points: [
        { id: 0, threshold: 0 },
        { id: 1, threshold: 0.9 }
    ]
};

export const CustomScrollbar = ({ rightOffset, mode = 'points' }: { rightOffset?: string, mode?: 'points' | 'continuous' }) => {
    const { scrollYProgress } = useScroll();
    const { lampColor } = useTheme();
    const [activePoint, setActivePoint] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState<ScrollConfig>(DEFAULT_CONFIG);
    const [totalHeight, setTotalHeight] = useState(320);

    // Initial load & ResizeObserver
    useEffect(() => {
        const updateConfig = (sectionHeight: number) => {
            // Determine number of points based on section height
            // Aggressively prefer 4 points as requested by user
            let numPoints = 2;
            if (sectionHeight > 600) numPoints = 4;
            else if (sectionHeight > 300) numPoints = 3;

            // Determine Target Widget Height based on FIXED Gap from Config
            // The user wants control over the gap (now 120px)
            const gap = DEFAULT_CONFIG.dimensions.gap;
            const pointHeight = 48;

            // Recalculate actual total height based on config gap
            const actualTotalHeight = (numPoints * pointHeight) + ((numPoints - 1) * gap);

            // Generate Points with thresholds
            const points: Point[] = [];
            for (let i = 0; i < numPoints; i++) {
                const t = i / (numPoints - 1);
                const threshold = i === numPoints - 1 ? 0.95 : parseFloat(t.toFixed(2));
                points.push({ id: i, threshold });
            }

            setConfig(prev => ({
                ...prev,
                dimensions: {
                    ...prev.dimensions,
                    gap: gap
                },
                points: points
            }));
            setTotalHeight(actualTotalHeight);
        };

        // Observer
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                updateConfig(entry.contentRect.height);
            }
        });

        const section = document.getElementById('generated-image-section');
        if (section) {
            observer.observe(section);
            // Initial call
            updateConfig(section.getBoundingClientRect().height);
        }

        // Hide default scrollbar logic
        const style = document.createElement('style');
        style.id = 'hide-scrollbar-style';
        style.innerHTML = `
            ::-webkit-scrollbar { width: 0px; background: transparent; }
            body { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
        setIsVisible(true);

        return () => {
            observer.disconnect();
            const existing = document.getElementById('hide-scrollbar-style');
            if (existing) document.head.removeChild(existing);
        }
    }, [mode]);

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100, damping: 30, restDelta: 0.001
    });

    const beamMaxHeight = Math.max(0, totalHeight - config.dimensions.pointHeight);
    const progressHeight = useTransform(smoothProgress, [0, 1], [0, beamMaxHeight]);

    // Continuous mode constants
    const TRACK_HEIGHT_VH = 60;
    const THUMB_HEIGHT = 80;
    const THUMB_WIDTH = 10;
    const TRACK_WIDTH = 4;
    const trackHeightPx = typeof window !== 'undefined' ? window.innerHeight * (TRACK_HEIGHT_VH / 100) : 400;
    const maxThumbY = Math.max(0, trackHeightPx - THUMB_HEIGHT);

    // Continuous mode transform (Always called - must be at top level)
    const continuousThumbY = useTransform(smoothProgress, [0, 1], [0, maxThumbY]);

    // Points mode logic
    useEffect(() => {
        if (mode === 'continuous') return;
        const unsubscribe = scrollYProgress.on('change', (value) => {
            if (value >= 0.95) {
                setActivePoint(config.points.length - 1);
                return;
            }
            let newActive = 0;
            for (let i = config.points.length - 1; i >= 0; i--) {
                if (value >= config.points[i].threshold) {
                    newActive = i;
                    break;
                }
            }
            setActivePoint(newActive);
        });
        return () => unsubscribe();
    }, [scrollYProgress, config.points, mode]);

    const scrollToPoint = (pointIndex: number) => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = config.points[pointIndex].threshold * maxScroll;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    };

    // Continuous Mode Logic
    // Allow dragging thumb to update scroll
    const handleDrag = (event: any, info: any) => {
        const trackHeight = window.innerHeight * 0.6; // We'll set track height to 60vh
        const thumbY = info.point.y - (window.innerHeight * 0.2); // adjusting for top offset
        // Simplified: use the y position relative to track
        // Wait, framer motion drag gives us delta or offset.
        // It's easier to use a validated approach:
        // Map thumb y (0 to trackHeight) to scroll (0 to maxScroll)
    };

    if (!isVisible) return null;

    // CONTINUOUS MODE UI
    if (mode === 'continuous') {
        // Handle drag with native mouse events to avoid conflict with useTransform
        const handleMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            const startY = e.clientY;
            const startScroll = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaY = moveEvent.clientY - startY;
                // Convert pixel delta to scroll delta based on track/scroll ratio
                const scrollRatio = maxScroll / maxThumbY;
                const newScroll = startScroll + (deltaY * scrollRatio);
                window.scrollTo(0, Math.max(0, Math.min(newScroll, maxScroll)));
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        return (
            <div
                className="fixed z-[9999]"
                style={{
                    right: rightOffset || '24px',
                    top: '20%',
                    height: `${TRACK_HEIGHT_VH}vh`,
                    width: `${THUMB_WIDTH + 10}px`,
                }}
            >
                {/* Track - the background line */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full cursor-pointer"
                    style={{
                        width: `${TRACK_WIDTH}px`,
                        height: '100%',
                        backgroundColor: `${lampColor}40`,
                    }}
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const percentage = y / rect.height;
                        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                        window.scrollTo({ top: percentage * maxScroll, behavior: 'smooth' });
                    }}
                />

                {/* Thumb - the draggable indicator */}
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full cursor-grab active:cursor-grabbing select-none"
                    style={{
                        width: THUMB_WIDTH,
                        height: THUMB_HEIGHT,
                        y: continuousThumbY,
                        backgroundColor: lampColor,
                        boxShadow: `0 0 20px 4px ${lampColor}`,
                    }}
                    onMouseDown={handleMouseDown}
                    whileHover={{ scale: 1.2 }}
                />
            </div>
        );
    }

    // POINTS MODE UI (Existing)
    return (
        <div
            className="fixed z-50 flex flex-col items-center"
            style={{
                right: rightOffset || config.position.right,
                top: config.position.top,
                height: totalHeight,
                width: config.dimensions.pointWidth,
                gap: config.dimensions.gap,
                transition: 'height 0.3s ease-out, gap 0.3s ease-out'
            }}
        >
            {/* Connecting Track Line */}
            <div className="absolute w-[1px] bg-white/10 -z-10"
                style={{
                    top: config.dimensions.pointHeight / 2,
                    bottom: config.dimensions.pointHeight / 2,
                    height: beamMaxHeight
                }}
            />

            {/* Progress Fill Line */}
            <motion.div
                className="absolute w-[1px] -z-10 origin-top"
                style={{
                    top: config.dimensions.pointHeight / 2,
                    height: progressHeight,
                    backgroundColor: lampColor,
                    boxShadow: `0 0 8px ${lampColor}`
                }}
            />

            {config.points.map((point, index) => (
                <ScrollPoint
                    key={point.id}
                    isActive={activePoint >= index}
                    isPrimary={activePoint === index}
                    lampColor={lampColor}
                    onClick={() => scrollToPoint(index)}
                    delay={index * 0.05}
                    width={config.dimensions.pointWidth}
                    height={config.dimensions.pointHeight}
                />
            ))}
        </div>
    );
};

interface ScrollPointProps {
    isActive: boolean;
    isPrimary: boolean;
    lampColor: string;
    onClick: () => void;
    delay: number;
    width: number;
    height: number;
}

const ScrollPoint: React.FC<ScrollPointProps> = ({ isActive, isPrimary, lampColor, onClick, delay, width, height }) => {
    return (
        <motion.button
            className="relative cursor-pointer group focus:outline-none"
            style={{ width, height }}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: 'easeOut' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
        >
            {/* SVG Container - overflow visible for glows */}
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                fill="none"
                className="relative z-10 overflow-visible"
            >
                {/* Active Glow (Behind) */}
                {isPrimary && (
                    <motion.g
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <defs>
                            <radialGradient id={`glow-${lampColor}-${Math.random()}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor={lampColor} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={lampColor} stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <circle cx={width / 2} cy={height / 2} r={Math.max(width, height) / 1.2} fill={`url(#glow-${lampColor}-${Math.random()})`} />
                    </motion.g>
                )}

                {/* Main Shard Body */}
                <motion.path
                    d={`M ${width / 2} 2 L ${width - 4} ${height * 0.25} L ${width - 4} ${height * 0.75} L ${width / 2} ${height - 2} L 4 ${height * 0.75} L 4 ${height * 0.25} Z`}
                    initial={false}
                    animate={{
                        fill: isActive ? lampColor : '#71717a',
                        fillOpacity: isActive ? 0.9 : 0.4,
                        stroke: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                        filter: isPrimary
                            ? `drop-shadow(0 0 8px ${lampColor})`
                            : 'none',
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    strokeWidth="1.5"
                />

                {/* Inner Glow Line */}
                <motion.rect
                    x={width / 2 - 2}
                    y={height * 0.3}
                    width="4"
                    height={height * 0.4}
                    rx="2"
                    initial={false}
                    animate={{
                        fill: isActive ? 'white' : 'white',
                        fillOpacity: isPrimary ? 0.9 : isActive ? 0.5 : 0.1,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
            </svg>

            {/* Pulse ring */}
            <AnimatePresence>
                {isPrimary && (
                    <motion.div
                        className="absolute inset-0 -m-2 border rounded-full pointer-events-none"
                        style={{ borderColor: lampColor }}
                        initial={{ opacity: 0.6, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeOut'
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
};
