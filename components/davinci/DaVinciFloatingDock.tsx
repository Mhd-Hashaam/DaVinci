'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Compass, Brush, LayoutGrid, FolderHeart, Settings, Users, Sparkles, X, Palette, Magnet, Activity, Cloud } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { useTheme, Theme } from '@/components/ThemeProvider';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useScrollbar, ScrollbarType } from '@/components/scrollbar/CustomScrollbar';
import CreditIndicator from './CreditIndicator';

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
    { id: 'community', icon: Users, label: 'Community' },
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

const THEME_SCROLLBAR_COLORS: Record<Theme, { lit: string; dim: string }> = {
    mauve:     { lit: "#af8d99", dim: "rgba(175, 141, 153, 0.18)" },
    aurora:    { lit: "#7c3aed", dim: "rgba(124, 58, 237, 0.18)" },
    crimson:   { lit: "#ef4444", dim: "rgba(239, 68, 68, 0.18)"  },
    silver:    { lit: "#94a3b8", dim: "rgba(148, 163, 184, 0.18)"},
    ember:     { lit: "#f97316", dim: "rgba(249, 115, 22, 0.18)" },
    champagne: { lit: "#fbbf24", dim: "rgba(251, 191, 36, 0.18)" },
    rose:      { lit: "#f472b6", dim: "rgba(244, 114, 182, 0.18)"},
    forest:    { lit: "#34d399", dim: "rgba(52, 211, 153, 0.18)" },
};

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
        top: "5%",          // Center vertically
        minWidth: "330px",
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
    const { 
        theme, setTheme, 
        sparkleMode, toggleSparkleMode, 
        hoverEffect, toggleHoverEffect,
        backgroundMode, setBackgroundMode 
    } = useTheme();
    const { type: scrollType, setType: setScrollType, setThreadConfig, setNeuralConfig } = useScrollbar();
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

    // Sync scrollbar colors with theme
    useEffect(() => {
        const colors = THEME_SCROLLBAR_COLORS[theme];
        if (!colors) return;
        
        const config = { 
            colorLit: colors.lit, 
            colorDim: colors.dim, 
            colorThumb: colors.lit 
        };
        
        setThreadConfig(config);
        setNeuralConfig(config);
    }, [theme, setThreadConfig, setNeuralConfig]);

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
                className={cn(
                    "fixed z-[60] flex flex-col items-center backdrop-blur-3xl border border-white/10 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]",
                    !isFittingRoomModalOpen ? "sidebar-capsule" : "modal-dock-capsule"
                )}
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

                {/* Custom Background Image */}
                <div className={cn(
                    "absolute inset-0 opacity-100 pointer-events-none overflow-hidden transition-all duration-500",
                    isFittingRoomModalOpen ? "rounded-[3.5rem]" : "rounded-r-[3.5rem] rounded-l-none"
                )}
                    style={{
                        backgroundImage: 'url("/Mockups/Background.webp")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                    }}
                >
                    {/* Subtle Dark Overlay to ensure readability */}
                    <div className="absolute inset-0 bg-black/40" />
                </div>

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
                                    if (item.id === 'fittingroom') {
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

                {/* Credit Indicator Widget */}
                <AnimatePresence>
                    {!isFittingRoomModalOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="w-full mt-auto pt-4 flex-shrink-0"
                        >
                            <CreditIndicator />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.aside>

            {/* Settings Drawer - Slides out to the right */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed flex flex-col p-6 rounded-[2rem] border border-white/10 shadow-2xl z-[65]"
                        style={{ 
                            left: DOCK_CONFIG.drawer.leftOffset,
                            top: DOCK_CONFIG.drawer.top,
                            transform: "translateY(-50%)",
                            minWidth: DOCK_CONFIG.drawer.minWidth,
                            backgroundImage: 'url("/Mockups/Background.webp")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            backgroundColor: '#000000',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Subtle Dark Overlay */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl -z-10" />
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

                            {/* Atmosphere Section */}
                            <div className="space-y-4 mb-8">
                                <h3 className="text-white font-black text-sm tracking-[0.2em] flex items-center gap-2 mb-4">
                                    <Cloud size={16} className="text-zinc-400" />
                                    ATMOSPHERE
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Atmosphere Style</span>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => setBackgroundMode('stars')}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-all",
                                                    backgroundMode === 'stars' 
                                                        ? "bg-white text-black shadow-lg" 
                                                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                Stars
                                            </button>
                                            <button
                                                onClick={() => setBackgroundMode('smoke')}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-all",
                                                    backgroundMode === 'smoke' 
                                                        ? "bg-white text-black shadow-lg" 
                                                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                Smoke
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Particle Effects Section */}
                            <div className="space-y-4 mb-8">
                                <h3 className="text-white font-black text-sm tracking-[0.2em] flex items-center gap-2 mb-4">
                                    <Sparkles size={16} className="text-zinc-400" />
                                    PARTICLE EFFECTS
                                </h3>

                                <button
                                    onClick={toggleSparkleMode}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 group cursor-pointer",
                                        sparkleMode === 'theme'
                                            ? "bg-white/10 border-white/20"
                                            : "bg-black/20 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                            sparkleMode === 'theme' ? "bg-white/10 text-yellow-400" : "bg-white/5 text-zinc-500"
                                        )}>
                                            <Sparkles size={14} className={cn(sparkleMode === 'theme' && "animate-pulse")} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase transition-colors tracking-wide",
                                                sparkleMode === 'theme' ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                            )}>Sync Starfield</span>
                                            <span className="text-[9px] text-zinc-600 mt-0.5">Match stars with theme color</span>
                                        </div>
                                    </div>
                                    
                                    {/* Pill Toggle Style */}
                                    <div className={cn(
                                        "w-10 h-5 rounded-full relative transition-colors duration-300 flex items-center shadow-inner",
                                        sparkleMode === 'theme' ? "bg-white" : "bg-black/50 border border-white/10"
                                    )}>
                                        <div className={cn(
                                            "absolute w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                                            sparkleMode === 'theme' 
                                                ? "left-[22px] bg-black" 
                                                : "left-[2px] bg-zinc-500"
                                        )} />
                                    </div>
                                </button>
                            </div>

                            {/* Scrollbar Style Section */}
                            <div className="pt-2">
                                <h3 className="text-white font-black text-sm tracking-[0.2em] flex items-center gap-2 mb-4">
                                    <LayoutGrid size={16} className="text-zinc-400" />
                                    SCROLLBAR STYLE
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'thread', label: 'Thread', desc: 'Silk unraveling' },
                                        { id: 'neural', label: 'Neural', desc: 'Synapses firing' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setScrollType(opt.id as ScrollbarType)}
                                            className={cn(
                                                "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all duration-300 group text-left cursor-pointer",
                                                scrollType === opt.id
                                                    ? "bg-white/10 border-white/20"
                                                    : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-2 h-2 rounded-full" 
                                                    style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 8px ${activeTheme.color}` }}
                                                />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase",
                                                    scrollType === opt.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                                )}>
                                                    {opt.label}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-zinc-600 line-clamp-1">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
