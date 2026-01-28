import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ArrowUpRight } from 'lucide-react';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/hooks/useSession';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { GeneratedImage } from '@/types';
import Image from 'next/image';

interface ExploreMasonryProps {
    images: GeneratedImage[];
}

export const ExploreMasonry: React.FC<ExploreMasonryProps> = ({ images }) => {
    const { isBookmarked, toggleBookmark } = useSession();
    const { designs, addDesign, removeDesign } = useFittingRoomStore();
    const [hoveredCheck, setHoveredCheck] = useState<string | null>(null);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-20">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {images.map((image, index) => {
                    const isLiked = isBookmarked(image.id);
                    const isSelected = designs.some(d => d.id === image.id);
                    const isMaxReached = designs.length >= 10;

                    const handleArtWallToggle = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isSelected) {
                            removeDesign(image.id);
                        } else {
                            addDesign({
                                id: image.id,
                                name: image.prompt,
                                thumbnail: image.url,
                                fullImage: image.url,
                                category: 'gallery'
                            });
                        }
                    };

                    return (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer"
                        >
                            {/* Image */}
                            <img
                                src={image.url}
                                alt={image.prompt}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ aspectRatio: image.aspectRatio === '1:1' ? undefined : image.aspectRatio.replace(':', '/') }}
                            />

                            {/* Overlay Heart Icon - Always Visible */}
                            <div className="absolute top-2 right-2 z-10">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleBookmark(image.id, image);
                                    }}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center transition-all hover:scale-110",
                                        isLiked ? "text-red-500" : "text-white/70 hover:text-white"
                                    )}
                                    title={isLiked ? "Remove from bookmarks" : "Save to bookmarks"}
                                >
                                    <Heart
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
                                            onMouseEnter={() => setHoveredCheck(image.id)}
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
                                                {hoveredCheck === image.id && (
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
                                    <h3 className="text-white text-sm font-bold truncate pr-8">{image.prompt}</h3>
                                    {/* Additional metadata can go here if needed */}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
