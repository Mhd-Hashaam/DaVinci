'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ApparelMenuButton } from './ApparelMenuButton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ApparelProductGrid } from './ApparelProductGrid';
import { apparelProducts } from '@/lib/apparelProducts';
import {
    IconColumns1Filled,
    IconColumns2Filled,
    IconColumns3Filled,
    IconLayoutGridFilled,
    IconLayoutBoardFilled,
    IconGridDots,
    IconLayoutDashboardFilled,
    IconArrowLeft
} from '@tabler/icons-react';

type ViewType = 'hero' | 'plain' | 'premade';
type LayoutType = 1 | 2 | 3 | 4 | 5 | 6 | 'bento'; // Added 6

// Define props to accept a view change handler
interface ApparelPageProps {
    onViewChange?: (view: ViewType) => void;
}

export const ApparelPage: React.FC<ApparelPageProps> = ({ onViewChange }) => {
    const [currentView, setCurrentViewState] = useState<ViewType>('hero');
    const [hoveredSection, setHoveredSection] = useState<'plain' | 'premade' | null>(null);
    const [gridLayout, setGridLayout] = useState<LayoutType>(6);
    const [visibleCount, setVisibleCount] = useState(36); // Default 6*6

    // Wrapper to update local state and notify parent
    const setCurrentView = (view: ViewType) => {
        setCurrentViewState(view);
        if (onViewChange) onViewChange(view);
    };

    // Intelligent Load Logic: Update visible count when layout changes
    // We want to show 6 rows initially
    const handleLayoutChange = (layout: LayoutType) => {
        setGridLayout(layout);
        const cols = layout === 'bento' ? 4 : layout;
        const rows = 6;
        setVisibleCount(cols * rows);
    };

    const handlePlainClick = () => {
        setCurrentView('plain');
        setVisibleCount(36); // Reset to default 6 cols * 6 rows
        setGridLayout(6);
    };

    const handlePremadeClick = () => {
        setCurrentView('premade');
        setVisibleCount(36);
        setGridLayout(6);
    };

    const handleBackToHero = () => {
        setCurrentView('hero');
    };

    const handleLoadMore = () => {
        // Load reset of items. Since we have 50 items total, and max visible is ~36 (6*6),
        // loading "more" can just show everything or add another chunk.
        // User said "rest 4 should get visible". This implies showing ALL remaining.
        setVisibleCount(100); // Show all
    };

    // Filter products based on current view
    const filteredProducts = currentView === 'hero'
        ? apparelProducts
        : apparelProducts.filter(p => p.category === currentView);

    const productsToShow = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    // Layout buttons
    const layoutOptions: { layout: LayoutType; icon: React.ReactNode }[] = [
        { layout: 1, icon: <IconColumns1Filled size={16} /> },
        { layout: 2, icon: <IconColumns2Filled size={16} /> },
        { layout: 3, icon: <IconColumns3Filled size={16} /> },
        { layout: 4, icon: <IconLayoutGridFilled size={16} /> },
        { layout: 5, icon: <IconLayoutBoardFilled size={16} /> },
        { layout: 6, icon: <IconGridDots size={16} /> }, // 6 columns
        { layout: 'bento', icon: <IconLayoutDashboardFilled size={16} /> },
    ];

    return (
        <div className="w-full h-full max-w-[1920px] mx-auto relative bg-[#050505]">
            {/* Header / Logo - Absolute Top Center */}
            <motion.div
                className={cn(
                    "absolute left-0 right-0 z-50 flex pointer-events-none",
                    currentView === 'hero' ? "justify-center top-4" : "justify-start pl-10 -top-7"
                )}
                layout
            >
                <motion.h1
                    className={cn(
                        "font-black tracking-tight bg-clip-text text-transparent transform-gpu",
                        currentView === 'hero' ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"
                    )}
                    style={{
                        fontFamily: "'Fascinate', system-ui",
                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,180,0.9) 50%, rgba(120,120,120,0.8) 100%)'
                    }}
                    layout
                >
                    VinCi's Apparel!
                </motion.h1>
            </motion.div>

            {/* Explore Button & Layout Switchers (Collection View) */}
            {currentView !== 'hero' && (
                <>
                    {/* Explore Button - Centered Top */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-28 left-0 right-0 z-40 flex justify-center pointer-events-auto"
                    >
                        <button
                            onClick={currentView === 'plain' ? handlePremadeClick : handlePlainClick}
                            className="group relative px-6 py-2 text-xl md:text-2xl text-zinc-400 hover:text-white transition-colors duration-300 font-medium tracking-wide cursor-pointer"
                            style={{ fontFamily: "'Fascinate', system-ui" }}
                        >
                            <span className="relative z-10">
                                {currentView === 'plain' ? 'Explore Pre-made Collection' : 'Explore Plain Shirts Collection'}
                            </span>
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                        </button>
                    </motion.div>

                    {/* Layout Switchers - Positioned just below */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-36 right-8 z-40 flex items-center gap-2"
                    >
                        {layoutOptions.map(({ layout, icon }) => (
                            <button
                                key={layout}
                                onClick={() => handleLayoutChange(layout)}
                                className={cn(
                                    "p-2 rounded-md transition-colors cursor-pointer",
                                    gridLayout === layout
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                {icon}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}

            <AnimatePresence mode="wait">
                {/* HERO VIEW */}
                {currentView === 'hero' && (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full h-[75vh] overflow-hidden rounded-[2rem] border border-white/5 mx-auto max-w-[95%] mt-24"
                    >
                        {/* --- LEFT SECTION: PLAIN --- */}
                        <motion.div
                            className="absolute inset-0 w-full h-full z-10 cursor-pointer overflow-hidden"
                            style={{ clipPath: 'polygon(0 0, 55% 0, 45% 100%, 0% 100%)' }}
                            onMouseEnter={() => setHoveredSection('plain')}
                            onMouseLeave={() => setHoveredSection(null)}
                            onClick={handlePlainClick}
                            animate={{
                                filter: hoveredSection === 'premade' ? 'grayscale(100%) brightness(50%)' : 'grayscale(0%) brightness(100%)'
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <div className="w-[55%] h-full flex">
                                <div className="relative w-1/2 h-full border-r border-white/10 overflow-hidden">
                                    <motion.div
                                        className="w-full h-full"
                                        animate={{ scale: hoveredSection === 'plain' ? 1.05 : 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        <Image
                                            src="/Apparel Media/Female Model Plain Shirt.avif"
                                            alt="Female Plain"
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </div>
                                <div className="relative w-1/2 h-full overflow-hidden">
                                    <motion.div
                                        className="w-full h-full"
                                        animate={{ scale: hoveredSection === 'plain' ? 1.05 : 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        <Image
                                            src="/Apparel Media/Male Model Plain Shirt.avif"
                                            alt="Male Plain"
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-20 left-[22%] -translate-x-1/2 z-20">
                                <h2
                                    className="text-7xl font-black uppercase tracking-tighter drop-shadow-2xl bg-clip-text text-transparent"
                                    style={{
                                        fontFamily: "'Fascinate', serif",
                                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,180,0.9) 50%, rgba(120,120,120,0.8) 100%)'
                                    }}
                                >
                                    Plain
                                    <span className="block text-2xl font-medium tracking-widest text-zinc-300 mt-2">Explore Plain Shirts Collection</span>
                                </h2>
                            </div>
                        </motion.div>

                        {/* --- RIGHT SECTION: PRE-MADE --- */}
                        <motion.div
                            className="absolute inset-0 w-full h-full z-10 cursor-pointer overflow-hidden"
                            style={{ clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 45% 100%)' }}
                            onMouseEnter={() => setHoveredSection('premade')}
                            onMouseLeave={() => setHoveredSection(null)}
                            onClick={handlePremadeClick}
                            animate={{
                                filter: hoveredSection === 'plain' ? 'grayscale(100%) brightness(50%)' : 'grayscale(0%) brightness(100%)'
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <div className="w-[55%] h-full flex ml-auto">
                                <div className="relative w-1/2 h-full border-r border-white/10 overflow-hidden">
                                    <motion.div
                                        className="w-full h-full"
                                        animate={{ scale: hoveredSection === 'premade' ? 1.05 : 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        <Image
                                            src="/Apparel Media/FemaleGraphicHero.webp"
                                            alt="Female Graphic"
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </div>
                                <div className="relative w-1/2 h-full overflow-hidden">
                                    <motion.div
                                        className="w-full h-full"
                                        animate={{ scale: hoveredSection === 'premade' ? 1.05 : 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        <Image
                                            src="/Apparel Media/Male Hero image for Graphic Shirts.jpg"
                                            alt="Male Graphic"
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-20 left-[75%] -translate-x-1/2 z-20 text-right">
                                <h2
                                    className="text-7xl font-black uppercase tracking-tighter drop-shadow-2xl bg-clip-text text-transparent"
                                    style={{
                                        fontFamily: "'Fascinate', serif",
                                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,180,180,0.9) 50%, rgba(120,120,120,0.8) 100%)'
                                    }}
                                >
                                    Pre-Made
                                    <span className="block text-2xl font-medium tracking-widest text-zinc-300 mt-2">Explore Pre-Made Collection</span>
                                </h2>
                            </div>
                        </motion.div>

                        {/* Divider Line */}
                        <div className="absolute inset-0 pointer-events-none z-30">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="55" y1="0" x2="45" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" />
                            </svg>
                        </div>
                    </motion.div>
                )}

                {/* COLLECTION VIEW */}
                {currentView !== 'hero' && (
                    <motion.div
                        key="collection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4 }}
                        className={cn(
                            "pb-20 transition-all duration-500 mx-auto",
                            // Added spacing for nav bar + switchers
                            "pt-44",
                            gridLayout === 1 ? "max-w-xl" : "w-full",
                            gridLayout === 3 ? "px-12 md:px-32 lg:px-20" : "px-6"
                        )}
                    >
                        <ApparelProductGrid
                            products={productsToShow}
                            layout={gridLayout}
                        />

                        {hasMore && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all active:scale-95"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
