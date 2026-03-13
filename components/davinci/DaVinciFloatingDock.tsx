'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Compass, Brush, LayoutGrid, FolderHeart, Settings, Bookmark, Sparkles, X, Palette, Magnet, Activity } from 'lucide-react';
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
    { id: 'create', icon: Brush, label: 'Create' },
    { id: 'fittingroom', icon: 'custom-fittingroom', label: 'FittingRoom' },
    { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
    { id: 'myworks', icon: FolderHeart, label: 'Profile' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'vibes', icon: Palette, label: 'Vibes' },
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

// --- DOCK CONFIGURATION ---
const DOCK_CONFIG = {
    sidebar: {
        top: "59%",          // User manual override
        minWidth: "104px",
        paddingY: "2.5rem",
        gap: "1.5rem",
        borderRadius: "0 3.5rem 3.5rem 0",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    modal: {
        bottom: "-17rem",
        paddingY: "1.5rem",
        gap: "2.5rem",
        borderRadius: "3.5rem",
        scale: 0.8,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
    },
    drawer: {
        leftOffset: "115px", // Space from dock to drawer
        top: "59%",          // Match sidebar.top for alignment
        minWidth: "320px",
    },
    // --- ANIMATION PARAMETERS ---
    animation: {
        dock: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            mass: 1.2
        } as const,
        icons: {
            duration: 0.5,
            ease: "easeInOut" as const
        },
        labels: {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.3 }
        }
    }
};

export const DaVinciFloatingDock: React.FC<FloatingDockProps> = ({
    activeTab,
    setActiveTab,
    isFittingRoomModalOpen = false,
    onOpenFittingRoom,
    onCloseFittingRoom
}) => {
    const { user, profile } = useAuth();
    const { openAuthModal, isAuthModalOpen, postLoginTab, setPostLoginTab } = useDaVinciUIStore();
    const { theme, setTheme, sparkleMode, toggleSparkleMode, hoverEffect, toggleHoverEffect } = useTheme();
    const [activeDrawer, setActiveDrawer] = useState<'vibes' | null>(null);

    // Active theme
    const activeTheme = themes.find(t => t.id === theme) || themes[0];
    const isSettingsOpen = activeDrawer !== null;
    const showLabels = !isFittingRoomModalOpen;

    // Handle persistent redirect after auth
    useEffect(() => {
        if (!isAuthModalOpen && user && postLoginTab) {
            setActiveTab(postLoginTab);
            setPostLoginTab(null);
        }
    }, [isAuthModalOpen, user, postLoginTab, setActiveTab, setPostLoginTab]);

    // Animation Variants
    const dockVariants = {
        sidebar: {
            left: 0,
            bottom: "auto",
            top: DOCK_CONFIG.sidebar.top,
            x: 0,
            y: "-50%",
            rotate: 0,
            scale: 1,
            borderRadius: DOCK_CONFIG.sidebar.borderRadius,
            borderLeftWidth: 0,
            backgroundColor: DOCK_CONFIG.sidebar.backgroundColor,
            borderColor: "rgba(255, 255, 255, 0.12)",
            minWidth: DOCK_CONFIG.sidebar.minWidth,
            paddingTop: DOCK_CONFIG.sidebar.paddingY,
            paddingBottom: DOCK_CONFIG.sidebar.paddingY,
            gap: DOCK_CONFIG.sidebar.gap,
        },
        modal: {
            left: "50%",
            bottom: DOCK_CONFIG.modal.bottom,
            top: "auto",
            x: "-50%",
            y: 0,
            rotate: -90,
            scale: DOCK_CONFIG.modal.scale,
            borderRadius: DOCK_CONFIG.modal.borderRadius,
            borderLeftWidth: "1px",
            backgroundColor: DOCK_CONFIG.modal.backgroundColor,
            borderColor: "rgba(255, 255, 255, 0.22)",
            minWidth: "96px",
            paddingTop: DOCK_CONFIG.modal.paddingY,
            paddingBottom: DOCK_CONFIG.modal.paddingY,
            gap: DOCK_CONFIG.modal.gap,
        }
    };

    return (
        <>
            <motion.aside
                initial={false}
                animate={isFittingRoomModalOpen ? "modal" : "sidebar"}
                variants={dockVariants}
                transition={DOCK_CONFIG.animation.dock}
                className="fixed z-[70] flex flex-col items-center justify-center backdrop-blur-3xl border shadow-[0_0_80px_rgba(0,0,0,0.7)]"
                style={{
                    borderColor: 'var(--lamp-glow)',
                    boxShadow: isFittingRoomModalOpen 
                        ? '0 30px 60px -12px rgba(0, 0, 0, 0.6)' 
                        : '0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 35px var(--lamp-glow)'
                }}
            >
                {/* Background Glow */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none transition-all duration-500",
                    isFittingRoomModalOpen ? "rounded-[3.5rem]" : "rounded-r-[3.5rem] rounded-l-none"
                )} />

                {/* Check Background Pattern */}
                <div className={cn(
                    "absolute inset-0 opacity-100 pointer-events-none overflow-hidden transition-all duration-500",
                    isFittingRoomModalOpen ? "rounded-[3.5rem]" : "rounded-r-[3.5rem] rounded-l-none"
                )}
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
                                        <motion.div 
                                            animate={{ rotate: isFittingRoomModalOpen ? 90 : 0 }}
                                            transition={DOCK_CONFIG.animation.icons}
                                            className="dock-icon"
                                        >
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
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            animate={{ rotate: isFittingRoomModalOpen ? 90 : 0 }}
                                            transition={DOCK_CONFIG.animation.icons}
                                            className="dock-icon"
                                        >
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
                                        </motion.div>
                                    )}

                                    {/* Inner Label (Text below icon) - Hidden when modal open */}
                                    <AnimatePresence mode="wait">
                                        {showLabels && (
                                            <motion.span 
                                                initial={DOCK_CONFIG.animation.labels.initial}
                                                animate={DOCK_CONFIG.animation.labels.animate}
                                                exit={DOCK_CONFIG.animation.labels.exit}
                                                transition={DOCK_CONFIG.animation.labels.transition}
                                                className={cn(
                                                    "nav-label-inner text-[10px] font-medium tracking-wide transition-colors duration-300 block",
                                                    isTabActive || isDrawerTriggerActive || isFittingRoomActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                                )}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

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
            </motion.aside>

            {/* Settings Drawer - Slides out to the right */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed flex flex-col p-6 rounded-[2rem] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl z-[65]"
                        style={{ 
                            left: DOCK_CONFIG.drawer.leftOffset,
                            top: DOCK_CONFIG.drawer.top,
                            transform: "translateY(-50%)",
                            minWidth: DOCK_CONFIG.drawer.minWidth
                        }}
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
