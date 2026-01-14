'use client';

import React, { useEffect, useRef } from 'react';
import { Heart, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import gsap from 'gsap';

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
        title: 'Floating Islands',
        subtitle: 'Dreamscape',
        author: '@PixelMage',
        image: '/assets/floating-islands.png',
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
        title: 'Abstract Geometry',
        subtitle: 'Minimalist',
        author: '@AuroraArtist',
        image: '/assets/abstract-geometry.png',
        aspectRatio: '1 / 1',
        colSpan: 1,
        rowSpan: 1,
        gridColumn: '1',
        gridRow: '2',
        className: '-mt-16',
    },
    {
        id: '5',
        title: 'Sci-Fi Generator',
        subtitle: 'Tech Series',
        author: '@PixelMage',
        image: '/assets/Skyline.png',
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
                    <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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

                            <button className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold text-white/90 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                VIEW
                                <ExternalLink size={9} className="text-white/40" />
                            </button>
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
