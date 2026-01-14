'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/data/products';

interface ProductGridProps {
    products: Product[];
    onProductClick: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-2xl">👕</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                <p className="text-sm text-zinc-500">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <ProductCard
                        product={product}
                        onQuickView={onProductClick}
                    />
                </motion.div>
            ))}
        </div>
    );
};
