import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/hooks/useSession';
import { GeneratedImage } from '@/types';

interface ExploreMasonryProps {
    images: GeneratedImage[];
}

export const ExploreMasonry: React.FC<ExploreMasonryProps> = ({ images }) => {
    const { isBookmarked, toggleBookmark } = useSession();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-20">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {images.map((image, index) => {
                    const isLiked = isBookmarked(image.id);

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
