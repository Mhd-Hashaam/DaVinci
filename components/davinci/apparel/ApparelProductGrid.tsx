'use client';

import React from 'react';
import { ApparelProductCard } from './ApparelProductCard';
import { ApparelProduct } from '@/lib/apparelProducts';
import { cn } from '@/lib/utils';

interface ApparelProductGridProps {
    products: ApparelProduct[];
    layout: 1 | 2 | 3 | 4 | 5 | 6 | 'bento';
}

export const ApparelProductGrid: React.FC<ApparelProductGridProps> = ({ products, layout }) => {
    // Determine grid columns based on layout
    const getCols = () => {
        if (layout === 'bento') return 4;
        return typeof layout === 'number' ? layout : 4;
    };

    const getGridClass = () => {
        switch (layout) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            case 5: return 'grid-cols-5';
            case 6: return 'grid-cols-6';
            case 'bento': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
            default: return 'grid-cols-4';
        }
    };

    // For bento layout, we'll make some items span multiple cells
    const getBentoSpan = (index: number) => {
        if (layout !== 'bento') return '';
        // Create a pattern: every 5th item is larger
        if (index % 5 === 0) return 'md:col-span-2 md:row-span-2';
        return '';
    };

    const cols = getCols();

    return (
        <div className={cn(
            "grid",
            getGridClass()
        )}>
            {products.map((product, index) => {
                const isLastInRow = (index + 1) % cols === 0;
                const lastRowStartIndex = Math.floor((products.length - 1) / cols) * cols;
                const isLastRow = index >= lastRowStartIndex;

                return (
                    <div
                        key={product.id}
                        className={cn(
                            "bg-zinc-950 border-white/[0.15]",
                            !isLastInRow && "border-r",
                            !isLastRow && "border-b",
                            layout === 3 ? "p-6 md:p-10" : "p-2 md:p-4", // "Clever" gap using padding
                            getBentoSpan(index)
                        )}
                    >
                        <ApparelProductCard product={product} />
                    </div>
                );
            })}
        </div>
    );
};
