'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Heart, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import gsap from 'gsap';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import Image from 'next/image';

interface BentoGridProps {
    // Component now uses internal data for the artistic showcase as requested
}

// Modern gradient borders for glass effect - Unified to Lamp Purple
const cardStyle = {
    border: 'border-purple-400/40',
    shadow: 'shadow-purple-500/20',
    bg: 'from-purple-500/10'
};

const BENTO_CARDS = [
    {
        id: '1',
        title: 'Cyberpunk Oasis',
        subtitle: 'Cinematic Series',
        author: '@AuroraArtist',
        image: '/assets/cyber-oasis.png',
        aspectRatio: '22 / 10',
        colSpan: 2,
        rowSpan: 1,
        gridColumn: '1 / 3',
        gridRow: '1',
    },
    {
        id: '2',
        title: 'Anime Girl',
        subtitle: 'Anime',
        author: '@PixelMage',
        image: '/assets/Anime Purple Girl.webp',
        aspectRatio: '1 / 1',
        colSpan: 1,
        rowSpan: 1,
        gridColumn: '3',
        gridRow: '1',
    },
    {
        id: '3',
        title: 'Ethereal Queen',
        subtitle: 'Portrait Series',
        author: '@Visionary_AI',
        image: '/assets/ethereal-queen.png',
        aspectRatio: '3 / 4',
        colSpan: 1,
        rowSpan: 2,
        gridColumn: '4',
        gridRow: '1 / 2',
    },
    {
        id: '4',
        title: 'Earth Shake',
        subtitle: 'Art',
        author: '@AuroraArtist',
        image: '/assets/Earth Shake.jpg',
        aspectRatio: '1 / 1',
        colSpan: 1,
        rowSpan: 1,
        gridColumn: '1',
        gridRow: '2',
        className: '-mt-16',
    },
    {
        id: '5',
        title: 'Dream Like a Kitty',
        subtitle: 'Cute',
        author: '@PixelMage',
        image: '/assets/Kitty.webp',
        aspectRatio: '12 / 8',
        colSpan: 1,
        rowSpan: 1,
        gridColumn: '2',
        gridRow: '2',
        className: '-mt-16',
    },
    {
        id: '6',
        title: 'Mythical Dragon',
        subtitle: 'Creature Series',
        author: '@Visionary_AI',
        image: '/assets/Mythical Dragon.png',
        aspectRatio: '4 / 5',
        colSpan: 1,
        rowSpan: 2,
        gridColumn: '3',
        gridRow: '2 / 4',
        className: '-mt-16',
    },
    {
        id: '7',
        title: 'Illustration',
        subtitle: 'Vehicle Series',
        author: '@AuroraArtist',
        image: '/assets/Illustration.jpg',
        aspectRatio: '16 / 12',
        colSpan: 1,
        rowSpan: 1,
        gridColumn: '4',
        gridRow: '2',
    },
    {
        id: '8',
        title: 'Greek God',
        subtitle: 'Mythology',
        author: '@PixelMage',
        image: '/assets/Greek God.png',
        aspectRatio: '12 / 8',
        colSpan: 1,
        rowSpan: 1,
        gridColumn: '2',
        gridRow: '3',
        className: '-mt-35', // Pull up to close gap below shorter Sci-Fi card
    },
];

const PremiumCard = ({ card, index }: { card: typeof BENTO_CARDS[0], index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { designs, addDesign, removeDesign } = useFittingRoomStore();
    const [hoveredCheck, setHoveredCheck] = useState<string | null>(null);

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

    useEffect(() => {
        if (!cardRef.current || !containerRef.current) return;

        // 3D Tilt Effect
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const rect = containerRef.current!.getBoundingClientRect();

            const x = (clientX - rect.left) / rect.width - 0.5;
            const y = (clientY - rect.top) / rect.height - 0.5;

            gsap.to(cardRef.current, {
                rotateY: x * 10,
                rotateX: -y * 10,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 1000,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(cardRef.current, {
                rotateY: 0,
                rotateX: 0,
                duration: 1,
                ease: "elastic.out(1, 0.5)",
            });
        };

        containerRef.current.addEventListener('mousemove', handleMouseMove);
        containerRef.current.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('mousemove', handleMouseMove);
                containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    // Check if this is a wide card (12/8 or 16/12 aspect ratio) - info goes on the image
    const isWideCard = card.aspectRatio === '12 / 8' || card.aspectRatio === '16 / 12';

    return (
        <div
            ref={containerRef}
            className={cn("relative group", card.className)}
            style={{
                gridColumn: card.gridColumn,
                gridRow: card.gridRow
            }}
        >
            <div
                ref={cardRef}
                className={cn(
                    "glass-card w-full rounded-xl will-change-transform",
                    !isWideCard && "p-2 flex flex-col gap-2"
                )}
                style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden'
                }}
            >
                {/* Media Section */}
                <div
                    className={cn(
                        "relative w-full overflow-hidden isolate shadow-xl",
                        isWideCard ? "rounded-xl" : "rounded-lg"
                    )}
                    style={{
                        aspectRatio: card.aspectRatio,
                        transform: 'translateZ(20px)',
                        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    }}
                >
                    <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        quality={85}
                    />

                    {/* Gradient overlay for wide cards */}
                    {isWideCard && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    )}

                    {/* Info overlay for wide cards */}
                    {isWideCard && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
                            <span className="w-fit text-[6px] uppercase tracking-[0.15em] font-bold text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                {card.subtitle}
                            </span>
                            <div className="flex items-end justify-between gap-2">
                                <div>
                                    <h2 className="text-white text-sm font-bold tracking-tight drop-shadow-lg">
                                        {card.title}
                                    </h2>
                                    <p className="text-white/50 text-[8px]">{card.author}</p>
                                </div>
                                <Heart size={14} className="text-white/60 hover:text-pink-400 cursor-pointer transition-colors" />
                            </div>
                        </div>
                    )}

                    {/* Simple overlay for better depth on hover (non-wide cards) */}
                    {!isWideCard && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    )}
                </div>

                {/* Info Section - only for non-wide cards */}
                {!isWideCard && (
                    <div className="px-1 pb-0.5 flex flex-col gap-1" style={{ transform: 'translateZ(30px)' }}>
                        <span className="w-fit text-[6px] uppercase tracking-[0.15em] font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5">
                            {card.subtitle}
                        </span>

                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-white text-sm font-bold tracking-tight glow-text line-clamp-1">
                                {card.title}
                            </h2>

                            {/* ARTWALL BUTTON */}
                            <div className={cn(
                                "flex items-center bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 overflow-visible relative transition-all duration-300",
                                "h-9 pl-3 pr-1"
                            )}>
                                <button
                                    onClick={handleArtWallToggle}
                                    className="flex items-center gap-2 pl-1 pr-1 h-full hover:text-zinc-300 transition-colors cursor-pointer group/label"
                                >
                                    <span className="text-[10px] font-bold text-center uppercase tracking-widest leading-none mt-[1px] whitespace-nowrap">
                                        {isSelected ? 'ON ARTWALL' : 'ADD'}
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
                                <div className="w-[1px] h-4 bg-white/20 mx-2" />

                                {/* Checkbox Area */}
                                <div
                                    className="px-1 h-full flex items-center justify-center cursor-pointer relative group/checkbox"
                                    onMouseEnter={() => setHoveredCheck(card.id)}
                                    onMouseLeave={() => setHoveredCheck(null)}
                                    onClick={handleArtWallToggle}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border border-white/60 flex items-center justify-center transition-all",
                                        isSelected ? "bg-white border-white scale-110" : "hover:border-white hover:scale-110"
                                    )}>
                                        {isSelected && <IconCheck size={10} className="text-black" stroke={4} />}
                                    </div>

                                    {/* Tooltip */}
                                    <AnimatePresence>
                                        {hoveredCheck === card.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: -35 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-[4px] text-center shadow-xl border border-white/10 pointer-events-none z-50"
                                            >
                                                {isMaxReached && !isSelected
                                                    ? 'Max 10'
                                                    : 'Add to ArtWall'}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Background Glow - Unified Theme */}
            <div
                className="absolute -z-10 inset-4 blur-[50px] rounded-full scale-75 group-hover:scale-100 transition-all duration-700"
                style={{ backgroundColor: 'var(--lamp-glow)' }}
            />
        </div>
    );
};

const BentoGrid: React.FC<BentoGridProps> = () => {
    return (
        <div className="w-full max-w-5xl mx-auto px-2 py-1 overflow-visible">
            <div className="grid grid-cols-4 gap-2" style={{ gridAutoFlow: 'dense', alignItems: 'start' }}>
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
