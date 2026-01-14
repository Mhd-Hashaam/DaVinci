'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SparklesCore } from '@/components/ui/sparkles';
import { cn } from '@/lib/utils';
import { ApparelPage } from './ApparelPage';

import { useTheme } from '@/components/ThemeProvider';

interface ApparelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApparelModal: React.FC<ApparelModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { lampColor } = useTheme();

    // Resize Logic
    const [modalHeight, setModalHeight] = useState(98); // Default 98vh
    const isDragging = useRef(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent text selection
        isDragging.current = true;
        document.body.style.cursor = 'ns-resize';

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isDragging.current) return;
            // Calculate height as percentage of window height
            // We are resizing from top, so height = window.innerHeight - clientY
            // Converted to vh:
            const vh = ((window.innerHeight - ev.clientY) / window.innerHeight) * 100;
            // Clamp between 50vh and 99vh
            const clamped = Math.min(Math.max(vh, 50), 99);
            setModalHeight(clamped);
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, []);

    useGSAP(() => {
        if (isOpen) {
            // Reset modal position for animation
            gsap.set(modalRef.current, { y: '100%' });
            gsap.set(overlayRef.current, { opacity: 0 });
            gsap.set(contentRef.current, { opacity: 0, y: 20 });

            // Animate In
            // 1. Overlay fade in
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            });

            // 2. Modal slide up
            gsap.to(modalRef.current, {
                y: '0%',
                duration: 2.0,
                ease: "power4.out",
                delay: 0.1
            });

            // 3. Content fade in slightly later
            gsap.to(contentRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: 0.4,
                ease: 'power2.out'
            });

        } else {
            // Animate Out
            if (!overlayRef.current) return; // Guard for unmount

            const tl = gsap.timeline();

            tl.to(contentRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: 'power2.in'
            })
                .to(modalRef.current, {
                    y: '100%',
                    duration: 0.5,
                    ease: 'power2.inOut'
                }, "-=0.2")
                .to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.3
                }, "-=0.3");
        }
    }, { dependencies: [isOpen] });

    // Don't render anything if not open (but keep it mounted for exit animation? 
    // Usually easier to keep mounted and control visibility with pointer-events/z-index, 
    // OR use AnimatePresence-like logic. 
    // Since we are using GSAP manually, let's keep it mounted but hidden when closed to allow exit anims, 
    // OR use a state to unmount after animation.
    // Let's use simple pointer-events logic for now for performance.)

    // Better approach for React: only render when isOpen or animating out.
    // However, simpler for now: Always render, toggle pointer-events and visibility.

    // State to track the current view inside ApparelPage
    const [currentView, setCurrentView] = useState<'hero' | 'plain' | 'premade'>('hero');

    return (
        <div
            className={cn(
                "fixed inset-0 z-[60] flex items-end justify-center pointer-events-none",
                isOpen ? "pointer-events-auto" : ""
            )}
        >
            {/* Backdrop Overlay */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                style={{ height: `${modalHeight}vh` }}
                className="relative w-full bg-[#09090b] rounded-t-[2rem] border-t border-white/10 shadow-2xl overflow-hidden translate-y-full transition-[height] duration-75 ease-linear"
            >
                {/* Drag Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="absolute top-0 left-0 w-full h-4 z-[55] cursor-ns-resize hover:bg-white/10 transition-colors"
                />
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {/* 1. Static Sparkles (Low Opacity) */}
                    <div className="w-full h-full opacity-15">
                        <SparklesCore
                            id="apparel-modal-sparkles"
                            background="transparent"
                            minSize={0.4}
                            maxSize={1.0}
                            particleDensity={50}
                            className="w-full h-full"
                            particleColor="#FFFFFF"
                            hoverEffect="none"
                        />
                    </div>

                    {/* 2. Bottom Lamp Glow (Inverted) */}
                    {/* 2. Bottom Lamp Glow (Inverted) - Dynamic Ambient */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[300px] blur-[180px] rounded-full mix-blend-screen pointer-events-none transition-colors duration-1000"
                        style={{
                            background: `radial-gradient(circle at 50% 100%, ${lampColor}40, transparent 70%)` // 40 is hex opacity ~25% - adjusted for visibility with blur
                        }}
                    />
                </div>

                {/* Content Wrapper */}
                <div
                    ref={contentRef}
                    className="relative z-10 w-full h-full flex flex-col opacity-0"
                >
                    {/* Close Button - More corner, smaller, transparent */}
                    <button
                        onClick={onClose}
                        className="absolute top-1 right-1 p-1 text-zinc-400 hover:text-white transition-colors z-[60] cursor-pointer"
                    >
                        <X size={20} />
                    </button>

                    {/* Top Right Controls: Shopping Bag (CONDITIONAL - ONLY PREMADE) */}
                    {currentView === 'premade' && (
                        <div className="absolute top-6 right-12 z-50 flex items-center gap-3">
                            {/* Shopping Bag Icon */}
                            <button className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" />
                                    <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" />
                                    <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" />
                                    <path d="M10 10.75H12.5" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide pt-14">
                        {/* Mount ApparelPage and listen to view changes */}
                        <ApparelPage onViewChange={setCurrentView} />
                    </div>
                </div>
            </div>
        </div>
    );
};