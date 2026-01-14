'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Compass, Brush, LayoutGrid, FolderHeart, Settings, Bookmark, Sparkles, X, Palette, Magnet, Activity, Shirt } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { useTheme, Theme } from '@/components/ThemeProvider';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface FloatingDockProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isApparelModalOpen?: boolean;
    isFittingRoomModalOpen?: boolean;
    onOpenFittingRoom?: () => void;
    onCloseFittingRoom?: () => void;
}

// ... Nav Items & Themes ...
// Custom image icon type
type NavIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }> | 'custom-fittingroom';

interface NavItem {
    id: string;
    icon: NavIcon;
    label: string;
}

const navItems: NavItem[] = [
    { id: 'apparel', icon: Shirt, label: 'Apparel' },
    { id: 'create', icon: Brush, label: 'Create' },
    { id: 'fittingroom', icon: 'custom-fittingroom', label: 'FittingRoom' },
    { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
    { id: 'myworks', icon: FolderHeart, label: 'Profile' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'vibes', icon: Palette, label: 'Vibes' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

const themes: { id: Theme; color: string; label: string }[] = [
    { id: 'mauve', color: '#af8d99', label: 'Mauve' },
    { id: 'aurora', color: '#7c3aed', label: 'Aurora' },
    { id: 'crimson', color: '#ef4444', label: 'Crimson' },
    { id: 'silver', color: '#94a3b8', label: 'Silver' },
    { id: 'ember', color: '#f97316', label: 'Ember' },
    { id: 'champagne', color: '#fbbf24', label: 'Champagne' },
    { id: 'rose', color: '#f472b6', label: 'Rose' },
    { id: 'forest', color: '#34d399', label: 'Forest' },
];

export const DaVinciFloatingDock: React.FC<FloatingDockProps> = ({
    activeTab,
    setActiveTab,
    isApparelModalOpen = false,
    isFittingRoomModalOpen = false,
    onOpenFittingRoom,
    onCloseFittingRoom
}) => {
    const { user, profile } = useAuth();
    const { openAuthModal, isAuthModalOpen, postLoginTab, setPostLoginTab } = useDaVinciUIStore();
    const { theme, setTheme, sparkleMode, toggleSparkleMode, hoverEffect, toggleHoverEffect } = useTheme();
    const [activeDrawer, setActiveDrawer] = useState<'vibes' | 'settings' | null>(null);
    const containerRef = useRef<HTMLElement>(null);
    const wasApparelOpen = useRef(isApparelModalOpen);
    const wasFittingRoomOpen = useRef(isFittingRoomModalOpen);

    // Active theme
    const activeTheme = themes.find(t => t.id === theme) || themes[0];
    const isSettingsOpen = activeDrawer !== null;

    // Handle persistent redirect after auth
    useEffect(() => {
        // If modal closed, user is logged in, and we have a pending redirect
        if (!isAuthModalOpen && user && postLoginTab) {
            setActiveTab(postLoginTab);
            setPostLoginTab(null);
        }
    }, [isAuthModalOpen, user, postLoginTab, setActiveTab, setPostLoginTab]);

    // Unified Animation Hook for transitioning between Sidebar, Apparel Modal, and FittingRoom Modal
    useGSAP(() => {
        const tl = gsap.timeline();

        // Kill any running animations to prevent conflicts (especially for labels and container)
        gsap.killTweensOf([containerRef.current, ".dock-icon", ".nav-label-inner"]);

        if (isApparelModalOpen) {
            // --- STATE: APPAREL MODAL (TOP) ---
            wasApparelOpen.current = true;
            wasFittingRoomOpen.current = false;

            // CRITICAL: Clear 'bottom' so 'top' positioning works correctly
            gsap.set(containerRef.current, { bottom: 'auto' });

            // 1. Fast Up to intermediate height (Launch)
            // We animate yPercent to -50 so the pivot point becomes the true center
            tl.to(containerRef.current, {
                top: '15%', // Intermediate height
                yPercent: -50, // Normalize center
                left: isFittingRoomModalOpen ? '50%' : '3.5%', // Keep centered if coming from FR
                xPercent: isFittingRoomModalOpen ? -50 : 0, // Keep centered if coming from FR
                y: 0,
                duration: 1.5,
                ease: 'power2.in'
            }, 0);

            // 2. Slow Drift to final top (Float) & Scale
            tl.to(containerRef.current, {
                top: '24px',
                yPercent: -50,
                scale: 0.75, // Minimalist Mode
                duration: 1.0,
                ease: 'power1.out'
            }, 1.5);

            // 3. Rotation & X-Axis (Starts early at 0.5s)
            // Moves to center while rotating.
            tl.to(containerRef.current, {
                left: '50%',
                xPercent: -50,
                rotation: 90, // User specified 90 (Clockwise)
                transformOrigin: 'center',
                duration: 2.0,
                ease: 'power1.out'
            }, 0.5);

            // 4. Counter-Rotate Icons (Sync with container rotation)
            gsap.to(".dock-icon", {
                rotation: -90, // Counter 90 so they stay upright
                duration: 2.0,
                delay: 0.5,
                ease: 'power1.out'
            });

            // 5. Hide inner labels COMPLETELY
            gsap.to(".nav-label-inner", {
                opacity: 0,
                height: 0,
                margin: 0,
                display: 'none',
                duration: 0.3,
                delay: 0.1, // Faster hide
                overwrite: true // Ensure this wins
            });

        } else if (isFittingRoomModalOpen) {
            // --- STATE: FITTING ROOM MODAL (BOTTOM) ---
            wasFittingRoomOpen.current = true;
            wasApparelOpen.current = false;

            // CRITICAL: Clear 'top' so 'bottom' positioning works correctly
            gsap.set(containerRef.current, { top: 'auto', y: 0 });

            // 1. Fast Down to intermediate height (Drop)
            tl.to(containerRef.current, {
                bottom: '15%', // Intermediate height
                yPercent: 50,
                left: isApparelModalOpen ? '50%' : '3.5%',
                xPercent: isApparelModalOpen ? -50 : 0,
                duration: 1.5,
                ease: 'power2.in'
            }, 0);

            // 2. Slow Drift to final bottom (Settle) & Scale
            tl.to(containerRef.current, {
                bottom: '24px', // Same distance as Apparel's top: 24px
                yPercent: 50,
                scale: 0.75, // Same scale as Apparel
                duration: 1.0,
                ease: 'power1.out'
            }, 1.5);

            // 3. Rotation & X-Axis (Starts early at 0.5s)
            tl.to(containerRef.current, {
                left: '50%',
                xPercent: -50,
                rotation: -90, // Counter-clockwise (opposite of Apparel's 90)
                transformOrigin: 'center',
                duration: 2.0,
                ease: 'power1.out'
            }, 0.5);

            // 4. Counter-Rotate Icons
            gsap.to(".dock-icon", {
                rotation: 90, // Counter the -90 so they stay upright
                duration: 2.0,
                delay: 0.5,
                ease: 'power1.out'
            });

            // 5. Hide inner labels
            gsap.to(".nav-label-inner", {
                opacity: 0,
                height: 0,
                margin: 0,
                display: 'none',
                duration: 0.3,
                delay: 0.1, // Faster hide
                overwrite: true
            });

        } else {
            // --- STATE: NEUTRAL (SIDEBAR) ---
            // Reverting to original position

            // Note: We animate 'top' to 50% as the safe neutral anchor
            // We ensure bottom is cleared if coming from FittingRoom

            tl.to(containerRef.current, {
                top: '50%',
                bottom: 'auto', // Clear bottom if set
                left: '3.5%',
                xPercent: 0,
                yPercent: -40, // Original offset
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 1.5,
                ease: hasInteracted.current ? 'power2.out' : 'power2.inOut' // Smooth reset
            }, 0);

            // Reset icons
            gsap.to(".dock-icon", {
                rotation: 0,
                duration: 1.5,
                ease: 'power2.out'
            });

            // Reset labels (Fade in smoothly AFTER landing)
            gsap.to(".nav-label-inner", {
                display: 'block',
                height: 'auto',
                margin: 'unset',
                opacity: 1,
                duration: 0.5,
                delay: 1.2
            });

            wasApparelOpen.current = false;
            wasFittingRoomOpen.current = false;
        }

    }, { dependencies: [isApparelModalOpen, isFittingRoomModalOpen] });

    // Track if any interaction has happened to smoothen initial render vs transitions
    const hasInteracted = useRef(false);
    useEffect(() => {
        if (isApparelModalOpen || isFittingRoomModalOpen) hasInteracted.current = true;
    }, [isApparelModalOpen, isFittingRoomModalOpen]);

    return (
        <>
            <aside
                ref={containerRef}
                className={cn(
                    "fixed z-[70] flex flex-col p-1 rounded-[1.75rem] bg-black/30 backdrop-blur-2xl border shadow-2xl min-w-[64px] items-center gap-2 will-change-transform",
                    // Base State (GSAP overrides these inline when active)
                    "top-1/2 -translate-y-[40%] left-[3.5%]"
                )}
                style={{
                    borderColor: 'var(--lamp-glow)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px var(--lamp-glow)'
                }}
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[1.75rem] pointer-events-none" />

                {/* Check Background Pattern */}
                <div className="absolute inset-0 opacity-100 rounded-[1.75rem] pointer-events-none overflow-hidden"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}
                />

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isFittingRoomActive = item.id === 'fittingroom' && isFittingRoomModalOpen;
                    // FIX: If FittingRoom modal is open, NO other tab should be active
                    const isTabActive = activeTab === item.id && item.id !== 'settings' && item.id !== 'vibes' && !isFittingRoomModalOpen;
                    const isDrawerTriggerActive = activeDrawer === item.id;

                    return (
                        <div key={item.id} className="relative group flex flex-col items-center justify-center">


                            <button
                                onClick={() => {
                                    if (item.id === 'bookmarks') setActiveTab('myworks');
                                    else if (item.id === 'fittingroom') {
                                        // Open FittingRoom modal
                                        if (onOpenFittingRoom) onOpenFittingRoom();
                                    }
                                    else if (item.id === 'myworks' && !user) {
                                        setPostLoginTab('myworks');
                                        openAuthModal('signin');
                                        return;
                                    }
                                    else if (item.id === 'settings' || item.id === 'vibes') setActiveDrawer(activeDrawer === item.id ? null : item.id as any);
                                    else setActiveTab(item.id);
                                }}
                                className={cn(
                                    "relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden dock-icon-wrapper",
                                    isTabActive || isDrawerTriggerActive || isFittingRoomActive ? "text-white" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                {item.id === 'myworks' && user ? (
                                    <div className="relative w-8 h-8 mb-1 rounded-full overflow-hidden border border-white/20">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                ) : item.icon === 'custom-fittingroom' ? (
                                    // Custom PNG icon for FittingRoom
                                    <div className="dock-icon">
                                        <Image
                                            src="/Icons/TheFittingRoomClapWhite.png"
                                            alt="FittingRoom"
                                            width={24}
                                            height={24}
                                            className={cn(
                                                "transition-all duration-300 mb-1",
                                                isFittingRoomActive && "glow-icon"
                                            )}
                                            style={isFittingRoomActive ? {
                                                filter: 'drop-shadow(0 0 8px var(--lamp-color))'
                                            } : { opacity: 0.6 }}
                                        />
                                    </div>
                                ) : (
                                    <div className="dock-icon">
                                        {typeof Icon !== 'string' && (
                                            <Icon
                                                size={24}
                                                strokeWidth={1.5}
                                                className={cn(
                                                    "transition-all duration-300 mb-1",
                                                    (isTabActive || isDrawerTriggerActive) && "glow-icon"
                                                )}
                                                style={(isTabActive || isDrawerTriggerActive) ? {
                                                    color: 'var(--lamp-color)',
                                                    filter: 'drop-shadow(0 0 8px var(--lamp-color))'
                                                } : {}}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Inner Label (Text below icon) - Hidden when modal open */}
                                <span className={cn(
                                    "nav-label-inner text-[10px] font-medium tracking-wide transition-colors duration-300 block",
                                    isTabActive || isDrawerTriggerActive || isFittingRoomActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                )}>
                                    {item.label}
                                </span>

                                {/* Active Background */}
                                {(isTabActive || isDrawerTriggerActive || isFittingRoomActive) && (
                                    <motion.div
                                        layoutId="activeDaVinciGlow"
                                        className="absolute inset-0 rounded-xl -z-10 bg-white/10"
                                        style={{ border: '1px solid var(--lamp-glow)' }}
                                    />
                                )}
                            </button>
                        </div>
                    );
                })}
            </aside>

            {/* Settings Drawer - Slides out to the right */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-[110px] top-1/2 -translate-y-1/2 flex flex-col p-6 rounded-[2rem] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl min-w-[320px] z-[65]"
                    >
                        {/* Header: APPEARANCE */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-black text-sm tracking-[0.2em] flex items-center gap-2">
                                <Palette size={16} className="text-zinc-400" />
                                APPEARANCE
                            </h3>
                            <button
                                onClick={() => setActiveDrawer(null)}
                                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Themes Section */}
                        <div className="space-y-4 mb-8">
                            {/* Active Theme Indicator Row */}
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Interface Theme</span>
                                <div
                                    className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500"
                                    style={{ backgroundColor: activeTheme.color }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {themes.map((t) => {
                                    const isThemeActive = theme === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group text-left cursor-pointer",
                                                isThemeActive
                                                    ? "bg-white/10 border-white/20"
                                                    : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-3 h-3 rounded-full transition-transform duration-500",
                                                    isThemeActive ? "scale-125 ring-2 ring-white/20" : "opacity-60 group-hover:opacity-100"
                                                )}
                                                style={{ backgroundColor: t.color, boxShadow: isThemeActive ? `0 0 10px ${t.color}` : 'none' }}
                                            />
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase",
                                                isThemeActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                            )}>
                                                {t.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ambiance Section */}
                        <div className="space-y-4">
                            <h3 className="text-white font-black text-sm tracking-[0.2em] flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-zinc-400" />
                                PARTICLE EFFECTS
                            </h3>

                            {/* Sparkles Card */}
                            <button
                                onClick={toggleSparkleMode}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group cursor-pointer",
                                    sparkleMode === 'theme'
                                        ? "bg-white/10 border-white/20"
                                        : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        sparkleMode === 'theme' ? "bg-white/10 text-yellow-400" : "bg-white/5 text-zinc-600"
                                    )}>
                                        <Sparkles size={14} className={cn(sparkleMode === 'theme' && "animate-pulse")} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase transition-colors",
                                            sparkleMode === 'theme' ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                        )}>Ambient Particles</span>
                                        <span className="text-[9px] text-zinc-600">Background stardust effect</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                                    sparkleMode === 'theme' ? "bg-white/20" : "bg-white/5"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300",
                                        sparkleMode === 'theme' ? "left-4.5" : "left-0.5"
                                    )} />
                                </div>
                            </button>

                            {/* Gravity Card */}
                            <button
                                onClick={() => hoverEffect !== 'grab' && toggleHoverEffect()}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group cursor-pointer mb-2",
                                    hoverEffect === 'grab'
                                        ? "bg-white/10 border-white/20"
                                        : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        hoverEffect === 'grab' ? "bg-white/10 text-indigo-400" : "bg-white/5 text-zinc-600"
                                    )}>
                                        <Magnet size={14} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase transition-colors",
                                            hoverEffect === 'grab' ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                        )}>Gravity</span>
                                        <span className="text-[9px] text-zinc-600">Attracts particles to cursor</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                                    hoverEffect === 'grab' ? "bg-white/20" : "bg-white/5"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300",
                                        hoverEffect === 'grab' ? "left-4.5" : "left-0.5"
                                    )} />
                                </div>
                            </button>

                            {/* Repulse Card */}
                            <button
                                onClick={() => hoverEffect !== 'repulse' && toggleHoverEffect()}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group cursor-pointer",
                                    hoverEffect === 'repulse'
                                        ? "bg-white/10 border-white/20"
                                        : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        hoverEffect === 'repulse' ? "bg-white/10 text-rose-400" : "bg-white/5 text-zinc-600"
                                    )}>
                                        <Activity size={14} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase transition-colors",
                                            hoverEffect === 'repulse' ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                        )}>Repulse</span>
                                        <span className="text-[9px] text-zinc-600">Pushes particles away</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                                    hoverEffect === 'repulse' ? "bg-white/20" : "bg-white/5"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300",
                                        hoverEffect === 'repulse' ? "left-4.5" : "left-0.5"
                                    )} />
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
