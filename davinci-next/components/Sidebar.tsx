import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Compass, Image as ImageIcon, Archive, ChevronRight, Sliders, Zap, PanelLeft } from 'lucide-react';
import { gsap } from 'gsap';
import PromptEnhanceDropdown from './PromptEnhanceDropdown';
import { PromptEnhance, AIModel } from '../types/settings';

import BrandLogo from './BrandLogo';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    width: number;
    setWidth: (width: number) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    generationCount: number;
    setGenerationCount: (count: number) => void;
}

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const COLLAPSED_WIDTH = 80;


const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    width,
    setWidth,
    isCollapsed,
    setIsCollapsed,
    generationCount,
    setGenerationCount
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(true);

    // Generation settings state
    const [promptEnhance, setPromptEnhance] = useState<PromptEnhance>('Auto');

    const sidebarRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const navItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const footerRef = useRef<HTMLDivElement>(null);

    // GSAP animation for collapse/expand with sophisticated effects
    useEffect(() => {
        if (!sidebarRef.current) return;

        const targetWidth = isCollapsed ? COLLAPSED_WIDTH : width;

        if (isCollapsed) {
            // === COLLAPSING ANIMATION ===

            // 1. Sidebar width with smooth elastic
            gsap.to(sidebarRef.current, {
                width: targetWidth,
                duration: 0.7,
                ease: "power4.inOut",
            });

            // 2. Logo - slide out with rotation
            if (logoRef.current) {
                gsap.to(logoRef.current, {
                    opacity: 0,
                    x: -20,
                    scale: 0.8,
                    rotation: -5,
                    duration: 0.3,
                    ease: "power3.in",
                });
            }

            // 3. Nav items - staggered fade with scale
            navItemsRef.current.forEach((item, index) => {
                if (item) {
                    const icon = item.querySelector('div');
                    const label = item.querySelector('span');

                    // Scale down and fade label
                    if (label) {
                        gsap.to(label, {
                            opacity: 0,
                            x: -10,
                            duration: 0.25,
                            delay: index * 0.05,
                            ease: "power2.in",
                        });
                    }

                    // Subtle icon pulse
                    if (icon) {
                        gsap.to(icon, {
                            scale: 0.9,
                            duration: 0.2,
                            delay: index * 0.05,
                            ease: "power2.inOut",
                            onComplete: () => {
                                gsap.to(icon, {
                                    scale: 1,
                                    duration: 0.3,
                                    ease: "elastic.out(1, 0.5)",
                                });
                            }
                        });
                    }
                }
            });

            // 4. Settings panel - cascade fade
            if (settingsRef.current) {
                gsap.to(settingsRef.current, {
                    opacity: 0,
                    x: -15,
                    duration: 0.3,
                    ease: "power2.in",
                });
            }

            // 5. Footer - subtle fade
            if (footerRef.current) {
                const footerText = footerRef.current.querySelector('div');
                if (footerText) {
                    gsap.to(footerText, {
                        opacity: 0.6,
                        fontSize: '10px',
                        duration: 0.3,
                        ease: "power2.inOut",
                    });
                }
            }

        } else {
            // === EXPANDING ANIMATION ===

            // 1. Sidebar width with anticipation
            gsap.to(sidebarRef.current, {
                width: targetWidth * 0.95,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(sidebarRef.current, {
                        width: targetWidth,
                        duration: 0.4,
                        ease: "elastic.out(1, 0.6)",
                    });
                }
            });

            // 2. Logo - bounce in with rotation
            if (logoRef.current) {
                gsap.fromTo(logoRef.current,
                    {
                        opacity: 0,
                        x: -30,
                        scale: 0.7,
                        rotation: -10,
                    },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotation: 0,
                        duration: 0.6,
                        delay: 0.2,
                        ease: "back.out(1.7)",
                    }
                );
            }

            // 3. Nav items - staggered bounce in
            navItemsRef.current.forEach((item, index) => {
                if (item) {
                    const icon = item.querySelector('div');
                    const label = item.querySelector('span');

                    // Icon pop animation
                    if (icon) {
                        gsap.fromTo(icon,
                            { scale: 1 },
                            {
                                scale: 1.15,
                                duration: 0.2,
                                delay: 0.3 + index * 0.06,
                                ease: "power2.out",
                                onComplete: () => {
                                    gsap.to(icon, {
                                        scale: 1,
                                        duration: 0.4,
                                        ease: "elastic.out(1, 0.5)",
                                    });
                                }
                            }
                        );
                    }

                    // Label slide in
                    if (label) {
                        gsap.fromTo(label,
                            {
                                opacity: 0,
                                x: -15,
                            },
                            {
                                opacity: 1,
                                x: 0,
                                duration: 0.4,
                                delay: 0.35 + index * 0.06,
                                ease: "back.out(2)",
                            }
                        );
                    }
                }
            });

            // 4. Settings panel - slide up and fade in
            if (settingsRef.current) {
                gsap.fromTo(settingsRef.current,
                    {
                        opacity: 0,
                        y: 20,
                        x: -10,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        x: 0,
                        duration: 0.5,
                        delay: 0.5,
                        ease: "power3.out",
                    }
                );
            }

            // 5. Footer - fade in
            if (footerRef.current) {
                const footerText = footerRef.current.querySelector('div');
                if (footerText) {
                    gsap.to(footerText, {
                        opacity: 1,
                        fontSize: '12px',
                        duration: 0.4,
                        delay: 0.3,
                        ease: "power2.out",
                    });
                }
            }
        }
    }, [isCollapsed, width]);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = Math.min(Math.max(mouseMoveEvent.clientX, MIN_WIDTH), MAX_WIDTH);
                setWidth(newWidth);
                if (newWidth < MIN_WIDTH) {
                    setIsCollapsed(true);
                } else {
                    setIsCollapsed(false);
                }
            }
        },
        [isResizing, setWidth, setIsCollapsed]
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const menuItems = [
        { id: 'explore', icon: <Compass size={20} />, label: 'Explore' },
        { id: 'create', icon: <ImageIcon size={20} />, label: 'Create' },
        { id: 'bookmarks', icon: <Archive size={20} />, label: 'Bookmarks' },
    ];

    return (
        <>
            <div
                ref={sidebarRef}
                className="h-full bg-[#09090b] border-r border-white/5 flex flex-col z-50 select-none shadow-2xl"
                style={{ width: isCollapsed ? COLLAPSED_WIDTH : width }}
            >
                {/* Header with Collapse Button & Logo */}
                <div className={`h-16 flex items-center px-5 border-b border-white/5 shrink-0 bg-[#09090b] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div ref={logoRef} className="flex-1 min-w-0">
                            <BrandLogo />
                        </div>
                    )}

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <PanelLeft size={20} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#09090b]">
                    {/* Navigation */}
                    <nav className="p-3 space-y-1">
                        {menuItems.map((item, index) => (
                            <button
                                key={item.id}
                                ref={(el) => { if (el) navItemsRef.current[index] = el; }}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full group relative
                    ${activeTab === item.id
                                        ? 'bg-white/10 text-white shadow-sm'
                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                    }
                    ${isCollapsed ? 'justify-center' : ''}
                    `}
                            >
                                <div className={`${activeTab === item.id ? 'text-indigo-400' : ''}`}>{item.icon}</div>
                                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-14 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        ))}
                    </nav>

                    {!isCollapsed && (
                        <div ref={settingsRef}>
                            <div className="px-4 py-2">
                                <div className="h-px bg-white/5 w-full"></div>
                            </div>

                            {/* Studio Settings Panel */}
                            <div className="p-4 space-y-6">
                                <div
                                    className="flex items-center justify-between cursor-pointer text-zinc-400 hover:text-white transition-colors group"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                                        <Sliders size={12} />
                                        <span>Configuration</span>
                                    </div>
                                    <ChevronRight size={14} className={`transform transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} />
                                </div>

                                {showAdvanced && (
                                    <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">

                                        {/* Prompt Enhance */}
                                        <PromptEnhanceDropdown
                                            selected={promptEnhance}
                                            onChange={setPromptEnhance}
                                        />

                                        {/* Image Count */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-400">Number of Images</span>
                                                <span className="text-zinc-200 font-mono">{generationCount}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setGenerationCount(num)}
                                                        className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${generationCount === num
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Guidance Scale */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-400">Guidance Scale</span>
                                                <span className="text-zinc-500 font-mono">7.5</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                step="0.5"
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-indigo-400 hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                            />
                                        </div>

                                        {/* Reset Button */}
                                        <div className="pt-2">
                                            <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors">
                                                <Zap size={12} className="text-yellow-500" />
                                                Reset to Defaults
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div ref={footerRef} className="p-4 border-t border-white/5 bg-[#09090b]">
                    <div className={`text-xs text-zinc-500 ${isCollapsed ? 'text-center' : ''}`}>
                        {isCollapsed ? 'v1' : 'DaVinci Studio v1.0'}
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors z-50 group"
                    onMouseDown={startResizing}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-white/10 rounded-full group-hover:bg-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
            </div>

            {/* Resizing Overlay to prevent text selection/iframe capturing */}
            {isResizing && <div className="fixed inset-0 z-[100] cursor-col-resize" />}
        </>
    );
};

export default Sidebar;