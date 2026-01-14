'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SparklesCore } from '@/components/ui/sparkles';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { TheCloset } from './TheCloset';
import { TheMirror } from './TheMirror';
import { TheArtWall } from './TheArtWall';

interface TheFittingRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TheFittingRoomModal: React.FC<TheFittingRoomModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { lampColor } = useTheme();

    // Keyboard shortcut: Escape to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Modal Height Resize Logic (from bottom edge)
    const [modalHeight, setModalHeight] = useState(98); // Default 98vh
    const isResizingHeight = useRef(false);

    const handleHeightResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingHeight.current = true;
        document.body.style.cursor = 'ns-resize';

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isResizingHeight.current) return;
            // FittingRoom: Resize from BOTTOM edge
            const vh = (ev.clientY / window.innerHeight) * 100;
            const clamped = Math.min(Math.max(vh, 50), 99);
            setModalHeight(clamped);
        };

        const handleMouseUp = () => {
            isResizingHeight.current = false;
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, []);

    // Art Wall Resize Logic (Left edge of Right Panel)
    const [artWallWidth, setArtWallWidth] = useState(15); // Default 15%
    const isResizingArtWall = useRef(false);

    const handleArtWallResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingArtWall.current = true;
        document.body.style.cursor = 'col-resize';

        const startX = e.clientX;
        const startWidth = artWallWidth;

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isResizingArtWall.current) return;

            // Calculate delta as percentage of screen width
            // Moving LEFT (negative delta) means ArtWall (Right Panel) grows.
            const deltaPixels = ev.clientX - startX;
            const deltaPercent = (deltaPixels / window.innerWidth) * 100;

            // New Width = Start - Delta (minus because dragging left increases right width)
            const newWidth = startWidth - deltaPercent;

            // Clamp between 15% and 30%
            const clamped = Math.min(Math.max(newWidth, 15), 30);
            setArtWallWidth(clamped);
        };

        const handleMouseUp = () => {
            isResizingArtWall.current = false;
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [artWallWidth]);

    // Closet Resize Logic (Right edge of Left Panel)
    const [closetWidth, setClosetWidth] = useState(15); // Default 15%
    const isResizingCloset = useRef(false);

    const handleClosetResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingCloset.current = true;
        document.body.style.cursor = 'col-resize';

        const startX = e.clientX;
        const startWidth = closetWidth;

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isResizingCloset.current) return;

            // Moving RIGHT (positive delta) means Closet (Left Panel) grows.
            const deltaPixels = ev.clientX - startX;
            const deltaPercent = (deltaPixels / window.innerWidth) * 100;
            const newWidth = startWidth + deltaPercent;

            // Clamp between 15% (min) and 25% (max)
            const clamped = Math.min(Math.max(newWidth, 15), 25);
            setClosetWidth(clamped);
        };

        const handleMouseUp = () => {
            isResizingCloset.current = false;
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [closetWidth]);

    useGSAP(() => {
        if (isOpen) {
            // Reset modal position for animation (START ABOVE VIEWPORT)
            gsap.set(modalRef.current, { y: '-100%' });
            gsap.set(overlayRef.current, { opacity: 0 });
            gsap.set(contentRef.current, { opacity: 0, y: -20 });

            // Animate In (TOP → BOTTOM)
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            });

            gsap.to(modalRef.current, {
                y: '0%',
                duration: 2.0,
                ease: 'power4.out',
                delay: 0.1
            });

            gsap.to(contentRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: 0.4,
                ease: 'power2.out'
            });

        } else {
            // Animate Out (BOTTOM → TOP)
            if (!overlayRef.current) return;

            const tl = gsap.timeline();

            tl.to(contentRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.in'
            })
                .to(modalRef.current, {
                    y: '-100%',
                    duration: 0.5,
                    ease: 'power2.inOut'
                }, '-=0.2')
                .to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.3
                }, '-=0.3');
        }
    }, { dependencies: [isOpen] });

    return (
        <div
            className={cn(
                "fixed inset-0 z-[60] flex items-start justify-center pointer-events-none",
                isOpen ? "pointer-events-auto" : ""
            )}
        >
            {/* Backdrop Overlay */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
                onClick={onClose}
            />

            {/* Modal Container - Slides from TOP */}
            <div
                ref={modalRef}
                style={{ height: `${modalHeight}vh` }}
                className="relative w-full bg-[#09090b] rounded-b-[2rem] border-b border-white/10 shadow-2xl overflow-hidden -translate-y-full transition-[height] duration-75 ease-linear"
                role="dialog"
                aria-modal="true"
                aria-label="The Fitting Room"
            >
                {/* Drag Handle at BOTTOM */}
                <div
                    onMouseDown={handleHeightResizeStart}
                    className="absolute bottom-0 left-0 w-full h-4 z-[55] cursor-ns-resize hover:bg-white/10 transition-colors"
                />

                {/* Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="w-full h-full opacity-15">
                        <SparklesCore
                            id="fittingroom-modal-sparkles"
                            background="transparent"
                            minSize={0.4}
                            maxSize={1.0}
                            particleDensity={50}
                            className="w-full h-full"
                            particleColor="#FFFFFF"
                            hoverEffect="none"
                        />
                    </div>

                    {/* Top Lamp Glow (from top, since modal comes from top) */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[300px] blur-[180px] rounded-full mix-blend-screen pointer-events-none transition-colors duration-1000"
                        style={{
                            background: `radial-gradient(circle at 50% 0%, ${lampColor}40, transparent 70%)`
                        }}
                    />
                </div>

                {/* Content Wrapper */}
                <div
                    ref={contentRef}
                    className="relative z-10 w-full h-full flex flex-col opacity-0"
                >
                    {/* Close Button - Bottom Right (mirrored from Apparel) */}
                    <button
                        onClick={onClose}
                        className="absolute bottom-1 right-1 p-1 text-zinc-400 hover:text-white transition-colors z-[60] cursor-pointer"
                    >
                        <X size={20} />
                    </button>

                    {/* Three-Panel Layout Container */}
                    <div
                        className="flex-1 w-full h-full grid gap-0 p-4 pt-2 pb-8 transition-[grid-template-columns] duration-75 ease-linear"
                        style={{
                            gridTemplateColumns: `${closetWidth}% 1fr ${artWallWidth}%`
                        }}
                    >
                        {/* TheCloset - Left Panel (Resizable) */}
                        <div className="relative h-full rounded-l-2xl border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden group/closet">
                            <TheCloset />
                            {/* Resize Handle (Right Edge) */}
                            <div
                                onMouseDown={handleClosetResizeStart}
                                className="absolute top-0 bottom-0 right-0 w-1.5 z-50 cursor-col-resize hover:bg-[var(--lamp-color)]/50 transition-colors opacity-0 group-hover/closet:opacity-100"
                            />
                        </div>

                        {/* TheMirror - Center Panel (Flexible) */}
                        <div className="relative h-full border-y border-white/5 bg-black/10 overflow-hidden">
                            <TheMirror />
                        </div>

                        {/* TheArtWall - Right Panel (Resizable) */}
                        <div className="relative h-full rounded-r-2xl border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden group/artwall">
                            {/* Resize Handle */}
                            <div
                                onMouseDown={handleArtWallResizeStart}
                                className="absolute top-0 bottom-0 left-0 w-1.5 z-50 cursor-col-resize hover:bg-[var(--lamp-color)]/50 transition-colors opacity-0 group-hover/artwall:opacity-100"
                            />
                            <TheArtWall />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
