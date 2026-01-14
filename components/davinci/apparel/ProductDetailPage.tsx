'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, ShoppingBag, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '@/lib/data/products';
import { cn } from '@/lib/utils';

interface ProductDetailPageProps {
    product: Product | null;
    onClose: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onClose }) => {
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Gallery */}
                        <div className="relative">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 relative">
                                <motion.img
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={product.images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Image Navigation */}
                                {product.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </>
                                )}

                                {/* Image Dots */}
                                {product.images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {product.images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentImageIndex(i)}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-colors",
                                                    i === currentImageIndex ? "bg-white" : "bg-white/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Strip */}
                            {product.images.length > 1 && (
                                <div className="flex gap-3 mt-4">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImageIndex(i)}
                                            className={cn(
                                                "w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                                                i === currentImageIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            {/* Badges */}
                            <div className="flex gap-2 mb-4">
                                {product.isNew && (
                                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        New Arrival
                                    </span>
                                )}
                                {product.isFeatured && (
                                    <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        Featured
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {product.name}
                            </h1>

                            <p className="text-3xl font-bold text-white mb-6">
                                ${product.price.toFixed(2)}
                            </p>

                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Color Selection */}
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                    Color: <span className="text-white">{product.colors[selectedColor].name}</span>
                                </h3>
                                <div className="flex gap-3">
                                    {product.colors.map((color, i) => (
                                        <button
                                            key={color.hex}
                                            onClick={() => setSelectedColor(i)}
                                            className={cn(
                                                "w-10 h-10 rounded-full border-2 transition-all",
                                                i === selectedColor ? "border-white scale-110" : "border-transparent"
                                            )}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                    Size
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                                selectedSize === size
                                                    ? "bg-white text-black border-white"
                                                    : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                    Quantity
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-medium text-white w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart / Wishlist */}
                            <div className="flex gap-3 mb-8">
                                <button className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                                    <ShoppingBag size={18} />
                                    Add to Cart
                                </button>
                                <button className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>

                            {/* Product Details */}
                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                                    Details
                                </h3>
                                <div className="space-y-3 text-sm text-zinc-400">
                                    <p><span className="text-zinc-600">Material:</span> {product.material}</p>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Truck size={16} />
                                    <span className="text-xs">Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <RotateCcw size={16} />
                                    <span className="text-xs">30-Day Returns</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Shield size={16} />
                                    <span className="text-xs">Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
