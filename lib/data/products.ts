// Mock product data for DaVinci Apparel

export interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: 'tshirt' | 'hoodie' | 'tank' | 'longsleeve';
    colors: { name: string; hex: string }[];
    sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL')[];
    description: string;
    material: string;
    isNew?: boolean;
    isFeatured?: boolean;
}

export const PRODUCTS: Product[] = [
    {
        id: 'tee-001',
        name: 'Essential Black Tee',
        price: 29.99,
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
        ],
        category: 'tshirt',
        colors: [
            { name: 'Black', hex: '#0a0a0a' },
            { name: 'White', hex: '#ffffff' },
            { name: 'Navy', hex: '#1e3a5f' },
        ],
        sizes: ['S', 'M', 'L', 'XL', '2XL'],
        description: 'Premium cotton essential tee with a relaxed fit. Perfect for everyday wear.',
        material: '100% Organic Cotton',
        isFeatured: true,
    },
    {
        id: 'tee-002',
        name: 'Minimalist Logo Tee',
        price: 34.99,
        images: [
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
        ],
        category: 'tshirt',
        colors: [
            { name: 'White', hex: '#ffffff' },
            { name: 'Cream', hex: '#f5f5dc' },
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description: 'Clean minimal design with subtle DaVinci branding.',
        material: '100% Cotton',
        isNew: true,
    },
    {
        id: 'hoodie-001',
        name: 'Classic Pullover Hoodie',
        price: 59.99,
        images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
        ],
        category: 'hoodie',
        colors: [
            { name: 'Charcoal', hex: '#36454f' },
            { name: 'Black', hex: '#0a0a0a' },
            { name: 'Heather Grey', hex: '#9ca3af' },
        ],
        sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        description: 'Cozy heavyweight hoodie with kangaroo pocket. Premium fleece lining.',
        material: '80% Cotton, 20% Polyester',
        isFeatured: true,
    },
    {
        id: 'tee-003',
        name: 'Oversized Drop Tee',
        price: 39.99,
        images: [
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
        ],
        category: 'tshirt',
        colors: [
            { name: 'Sage', hex: '#9caf88' },
            { name: 'Sand', hex: '#c2b280' },
            { name: 'Stone', hex: '#8b8680' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Relaxed oversized fit with dropped shoulders. Street-ready style.',
        material: '100% Cotton Jersey',
        isNew: true,
    },
    {
        id: 'tank-001',
        name: 'Performance Tank',
        price: 24.99,
        images: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
        ],
        category: 'tank',
        colors: [
            { name: 'Black', hex: '#0a0a0a' },
            { name: 'White', hex: '#ffffff' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Lightweight breathable tank for active lifestyles.',
        material: '92% Polyester, 8% Spandex',
    },
    {
        id: 'longsleeve-001',
        name: 'Waffle Knit Long Sleeve',
        price: 44.99,
        images: [
            'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&q=80',
        ],
        category: 'longsleeve',
        colors: [
            { name: 'Oatmeal', hex: '#f3e5d0' },
            { name: 'Black', hex: '#0a0a0a' },
        ],
        sizes: ['S', 'M', 'L', 'XL', '2XL'],
        description: 'Textured waffle knit with a cozy feel. Perfect layering piece.',
        material: '60% Cotton, 40% Polyester',
        isFeatured: true,
    },
    {
        id: 'hoodie-002',
        name: 'Zip-Up Lightweight Hoodie',
        price: 54.99,
        images: [
            'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=80',
        ],
        category: 'hoodie',
        colors: [
            { name: 'Navy', hex: '#1e3a5f' },
            { name: 'Burgundy', hex: '#722f37' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Versatile zip-up hoodie with a modern slim fit.',
        material: '70% Cotton, 30% Polyester',
        isNew: true,
    },
    {
        id: 'tee-004',
        name: 'Vintage Wash Tee',
        price: 32.99,
        images: [
            'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd0?w=600&q=80',
        ],
        category: 'tshirt',
        colors: [
            { name: 'Faded Black', hex: '#2d2d2d' },
            { name: 'Washed Blue', hex: '#6b7f99' },
        ],
        sizes: ['S', 'M', 'L', 'XL', '2XL'],
        description: 'Pre-washed for a vintage feel. Soft hand and broken-in comfort.',
        material: '100% Cotton',
    },
];

export const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'tshirt', label: 'T-Shirts' },
    { id: 'hoodie', label: 'Hoodies' },
    { id: 'tank', label: 'Tanks' },
    { id: 'longsleeve', label: 'Long Sleeves' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
