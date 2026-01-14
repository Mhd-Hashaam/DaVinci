/**
 * Price Calculator for LiBass AI Studio
 * Calculates order pricing based on size, quantity, and discounts
 */

export interface PricingConfig {
    basePrice: number;
    currency: string;
    sizeMultipliers: Record<string, number>;
    quantityDiscounts: { min: number; discount: number }[];
}

// Default pricing configuration (PKR)
export const DEFAULT_PRICING: PricingConfig = {
    basePrice: 5000, // Rs. 5,000 base price
    currency: 'Rs.',
    sizeMultipliers: {
        'S': 1.0,
        'M': 1.0,
        'L': 1.0,
        'XL': 1.1,  // 10% extra for XL
        '2XL': 1.2, // 20% extra for 2XL
        '3XL': 1.3, // 30% extra for 3XL
    },
    quantityDiscounts: [
        { min: 5, discount: 0.05 },   // 5% off for 5+
        { min: 10, discount: 0.10 },  // 10% off for 10+
        { min: 20, discount: 0.15 },  // 15% off for 20+
        { min: 50, discount: 0.20 },  // 20% off for 50+
    ],
};

export interface PriceBreakdown {
    unitPrice: number;
    sizeMultiplier: number;
    adjustedUnitPrice: number;
    quantity: number;
    subtotal: number;
    discount: number;
    discountAmount: number;
    total: number;
    currency: string;
}

/**
 * Calculate price for an order
 */
export function calculatePrice(
    size: string,
    quantity: number,
    config: PricingConfig = DEFAULT_PRICING
): PriceBreakdown {
    const sizeMultiplier = config.sizeMultipliers[size] || 1.0;
    const adjustedUnitPrice = Math.round(config.basePrice * sizeMultiplier);

    // Find applicable quantity discount
    let discount = 0;
    for (const tier of config.quantityDiscounts) {
        if (quantity >= tier.min) {
            discount = tier.discount;
        }
    }

    const subtotal = adjustedUnitPrice * quantity;
    const discountAmount = Math.round(subtotal * discount);
    const total = subtotal - discountAmount;

    return {
        unitPrice: config.basePrice,
        sizeMultiplier,
        adjustedUnitPrice,
        quantity,
        subtotal,
        discount,
        discountAmount,
        total,
        currency: config.currency,
    };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'Rs.'): string {
    return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Get discount label for quantity
 */
export function getDiscountLabel(quantity: number, config: PricingConfig = DEFAULT_PRICING): string | null {
    for (const tier of [...config.quantityDiscounts].reverse()) {
        if (quantity >= tier.min) {
            return `${Math.round(tier.discount * 100)}% off`;
        }
    }
    return null;
}
