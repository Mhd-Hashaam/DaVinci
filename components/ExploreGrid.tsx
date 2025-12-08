import React from 'react';
import { Heart, Eye, Download, Share2, User } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ExploreGridProps {
    images: GeneratedImage[];
    onImageClick: (image: GeneratedImage) => void;
    onLoadMore: () => void;
    hasMore: boolean;
}

const ExploreGrid: React.FC<ExploreGridProps> = ({ images, onImageClick, onLoadMore, hasMore }) => {
    return (
        <div className="w-full">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className="break-inside-avoid relative group rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                        onClick={() => onImageClick(image)}
                    >
                        {/* Image */}
                        <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

                            {/* Top Actions */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 group-hover:translate-x-0 transition-transform duration-300">
                                <button className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white hover:text-black transition-colors" title="Save">
                                    <Heart size={16} />
                                </button>
                                <button className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white hover:text-black transition-colors" title="Download">
                                    <Download size={16} />
                                </button>
                            </div>

                            {/* Bottom Info */}
                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-sm font-medium text-white line-clamp-2 mb-2">{image.prompt}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                                            <User size={12} />
                                        </div>
                                        <span className="text-xs text-zinc-300">@artist</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Heart size={12} className="text-rose-500 fill-rose-500" />
                                            {Math.floor(Math.random() * 1000) + 50}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} />
                                            {(Math.random() * 10 + 1).toFixed(1)}k
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={onLoadMore}
                        className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all font-medium text-sm flex items-center gap-2"
                    >
                        Load More Inspiration
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExploreGrid;
