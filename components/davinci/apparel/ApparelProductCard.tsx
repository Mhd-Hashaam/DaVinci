import React, { useState } from 'react';
import Image from 'next/image';
import { ApparelProduct } from '@/lib/apparelProducts';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';

interface ApparelProductCardProps {
    product: ApparelProduct;
}

export const ApparelProductCard: React.FC<ApparelProductCardProps> = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Connect to FittingRoom store for plain shirts
    const { selectedShirts, addShirt, removeShirt } = useFittingRoomStore();
    const isSelected = product.category === 'plain' && selectedShirts.some(s => s.id === product.id);
    const isMaxReached = selectedShirts.length >= 10;

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSelected) {
            removeShirt(product.id);
        } else {
            addShirt(product);
        }
    };

    return (
        <div
            className="flex flex-col cursor-pointer group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowTooltip(false);
            }}
        >
            {/* Product Image */}
            <div className="relative aspect-[3/4] w-full bg-zinc-900/10 rounded-lg overflow-hidden border border-white/[0.03] shadow-sm">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* --- HOVER OVERLAYS & INTERACTIONS --- */}
                <AnimatePresence>
                    {(isHovered || isSelected) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute inset-x-4 bottom-4 z-20 flex justify-center pointer-events-none"
                        >
                            {/* PRE-MADE: Add to Bag (Icon Only, Jiggle) */}
                            {product.category === 'premade' && isHovered && (
                                <motion.button
                                    animate={{
                                        rotate: [0, -10, 10, -10, 10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="w-12 h-12 flex items-center justify-center text-white drop-shadow-lg transition-transform cursor-pointer pointer-events-auto active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" />
                                        <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" />
                                        <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" />
                                        <path d="M10 10.75H12.5" />
                                    </svg>
                                </motion.button>
                            )}

                            {/* PLAIN: Select for Preview */}
                            {product.category === 'plain' && (
                                <div className={cn(
                                    "flex items-center bg-black/80 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg overflow-visible relative pointer-events-auto transition-all duration-300",
                                    "h-9" // EVEN MORE COMPACT
                                )}>

                                    <button className="pl-4 pr-1 text-[10px] font-medium hover:text-zinc-300 transition-colors cursor-pointer text-center uppercase tracking-wider">
                                        {isSelected ? 'SELECTED' : 'SELECT'}
                                    </button>

                                    {/* Divider */}
                                    <div className="w-[1px] h-3 bg-white/20 mx-2" />

                                    {/* Checkbox Area */}
                                    <div
                                        className="pr-3 h-full flex items-center justify-center cursor-pointer relative group/checkbox"
                                        onMouseEnter={() => setShowTooltip(true)}
                                        onMouseLeave={() => setShowTooltip(false)}
                                        onClick={handleCheckboxClick}
                                    >
                                        <div className={cn(
                                            "w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center transition-all",
                                            isSelected ? "bg-white border-white scale-110" : "hover:border-white hover:scale-110"
                                        )}>
                                            {isSelected && <IconCheck size={9} className="text-black" stroke={4} />}
                                        </div>

                                        {/* Tooltip */}
                                        <AnimatePresence>
                                            {showTooltip && isHovered && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: -40 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-[4px] text-center shadow-xl border border-white/10 pointer-events-none"
                                                >
                                                    {isMaxReached && !isSelected
                                                        ? 'Max 10 reached'
                                                        : 'Select up to 10 shirts'}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Product Info */}
            <div className="mt-2 space-y-0.5">
                <h3 className="text-xs font-semibold text-zinc-300 truncate">
                    {product.name}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                        Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                        <span className="text-[10px] text-zinc-500 line-through">
                            Rs. {product.originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Colors */}
                {product.colors && (
                    <div className="flex gap-1 mt-2">
                        {product.colors.map((color, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-full border border-white/20"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
