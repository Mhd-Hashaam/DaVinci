'use client';

import React, { useState } from 'react';
import { IconCheck } from '@tabler/icons-react'; // Match other grids
import { Heart as HeartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { useSession } from '@/lib/hooks/useSession';
import Image from 'next/image';

const BENTO_CARDS = [
    {
        id: '1',
        title: 'Cyberpunk Oasis',
        subtitle: 'Cinematic Series',
        author: '@AuroraArtist',
        image: '/assets/cyber-oasis.png',
        aspectRatio: '16/9',
    },
    {
        id: '2',
        title: 'Anime Girl',
        subtitle: 'Anime',
        author: '@PixelMage',
        image: '/assets/Anime Purple Girl.webp',
        aspectRatio: '1/1',
    },
    {
        id: '3',
        title: 'Ethereal Queen',
        subtitle: 'Portrait Series',
        author: '@Visionary_AI',
        image: '/assets/ethereal-queen.png',
        aspectRatio: '3/4',
    },
    {
        id: '4',
        title: 'Earth Shake',
        subtitle: 'Art',
        author: '@AuroraArtist',
        image: '/assets/Earth Shake.jpg',
        aspectRatio: '1/1',
    },
    {
        id: '5',
        title: 'Dream Like a Kitty',
        subtitle: 'Cute',
        author: '@PixelMage',
        image: '/assets/Kitty.webp',
        aspectRatio: '3/2',
    },
    {
        id: '6',
        title: 'Mythical Dragon',
        subtitle: 'Creature Series',
        author: '@Visionary_AI',
        image: '/assets/Mythical Dragon.png',
        aspectRatio: '4/5',
    },
    {
        id: '7',
        title: 'Illustration',
        subtitle: 'Vehicle Series',
        author: '@AuroraArtist',
        image: '/assets/Illustration.jpg',
        aspectRatio: '4/3',
    },
    {
        id: '8',
        title: 'Greek God',
        subtitle: 'Mythology',
        author: '@PixelMage',
        image: '/assets/Greek God.png',
        aspectRatio: '3/2',
    },
];

const PremiumCard = ({ card, index }: { card: typeof BENTO_CARDS[0], index: number }) => {
    const { isBookmarked, toggleBookmark } = useSession();
    const { designs, addDesign, removeDesign } = useFittingRoomStore();
    const [hoveredCheck, setHoveredCheck] = useState<string | null>(null);

    const isLiked = isBookmarked(card.id);
    const isSelected = designs.some(d => d.id === card.id);
    const isMaxReached = designs.length >= 10;

    const handleArtWallToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelected) {
            removeDesign(card.id);
        } else {
            addDesign({
                id: card.id,
                name: card.title,
                thumbnail: card.image,
                fullImage: card.image,
                category: 'showcase'
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer mb-4"
        >
            {/* Image */}
            <div style={{ aspectRatio: card.aspectRatio }}>
                <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Overlay Heart Icon - Top Right */}
            <div className="absolute top-2 right-2 z-10">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(card.id, {
                            id: card.id,
                            url: card.image,
                            prompt: card.title,
                            aspectRatio: '1:1',
                            timestamp: Date.now(),
                            model: 'DaVinci Core'
                        } as any);
                    }}
                    className={cn(
                        "w-8 h-8 flex items-center justify-center transition-all hover:scale-110",
                        isLiked ? "text-red-500" : "text-white/70 hover:text-white"
                    )}
                >
                    <HeartIcon
                        size={20}
                        fill={isLiked ? "currentColor" : "none"}
                        className="drop-shadow-md"
                    />
                </button>
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                {/* ARTWALL BUTTON */}
                <div className="mb-4 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    <div className={cn(
                        "flex items-center bg-black/90 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg overflow-visible relative pointer-events-auto transition-all duration-300",
                        "h-9 pl-1 pr-1"
                    )}>
                        <button
                            onClick={handleArtWallToggle}
                            className="flex items-center gap-1 pl-3 pr-1 h-full hover:text-zinc-300 transition-colors cursor-pointer group/label"
                        >
                            <span className="text-[10px] font-bold text-center uppercase tracking-widest leading-none mt-[1px] whitespace-nowrap">
                                {isSelected ? 'ON ARTWALL' : 'ADD TO ARTWALL'}
                            </span>
                            <motion.div
                                className="relative w-5 h-5 opacity-90 group-hover/label:opacity-100 transition-opacity"
                                animate={{
                                    rotate: [0, -15, 15, -15, 15, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: "easeInOut"
                                }}
                            >
                                <Image
                                    src="/Icons/ArtWall.png"
                                    alt="ArtWall"
                                    fill
                                    className="object-contain"
                                />
                            </motion.div>
                        </button>

                        {/* Divider */}
                        <div className="w-[1px] h-3 bg-white/20 mx-1" />

                        {/* Checkbox Area */}
                        <div
                            className="px-2 h-full flex items-center justify-center cursor-pointer relative group/checkbox"
                            onMouseEnter={() => setHoveredCheck(card.id)}
                            onMouseLeave={() => setHoveredCheck(null)}
                            onClick={handleArtWallToggle}
                        >
                            <div className={cn(
                                "w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center transition-all",
                                isSelected ? "bg-white border-white scale-110" : "hover:border-white hover:scale-110"
                            )}>
                                {isSelected && <IconCheck size={9} className="text-black" stroke={4} />}
                            </div>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {hoveredCheck === card.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: -40 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-[4px] text-center shadow-xl border border-white/10 pointer-events-none"
                                    >
                                        {isMaxReached && !isSelected
                                            ? 'Max 10 reached'
                                            : 'Select up to 10 designs'}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[8px] text-[var(--primary)] uppercase tracking-widest font-bold mb-1">{card.subtitle}</p>
                    <h3 className="text-white text-sm font-bold truncate pr-8">{card.title}</h3>
                </div>
            </div>
        </motion.div>
    );
};

const BentoGrid = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-20">
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {BENTO_CARDS.map((card, index) => (
                    <PremiumCard
                        key={card.id}
                        card={card}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default BentoGrid;
