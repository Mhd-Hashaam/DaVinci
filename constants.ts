import { AspectRatio, GeneratedImage } from "./types";

export const MODEL_NAME = "gemini-2.0-flash-exp";

export const ASPECT_RATIOS: { value: AspectRatio; label: string; width: number; height: number }[] = [
  { value: '3:4', label: 'Standard Front', width: 12, height: 16 },
  { value: '4:5', label: 'Art Print', width: 16, height: 20 },
  { value: '1:1', label: 'Square', width: 12, height: 12 },
  { value: '2:3', label: 'Poster', width: 24, height: 36 },
  { value: '5:7', label: 'Photo', width: 5, height: 7 },
  { value: '16:9', label: 'Landscape', width: 16, height: 9 },
];

export const MOCK_IMAGES: GeneratedImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1709884735626-63e92727d8b6?q=80&w=2128&auto=format&fit=crop',
    prompt: 'A futuristic cyberpunk city with neon lights and flying cars in the rain',
    aspectRatio: '16:9',
    timestamp: Date.now(),
    model: 'Gemini 2.5 Flash'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1709884732294-90379fee354c?q=80&w=2128&auto=format&fit=crop',
    prompt: 'Portrait of an astronaut floating in a nebula, digital art style',
    aspectRatio: '2:3',
    timestamp: Date.now() - 100000,
    model: 'Gemini 1.5 Pro'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    prompt: 'Minimalist geometric abstract composition with pastel colors',
    aspectRatio: '1:1',
    timestamp: Date.now() - 200000,
    model: 'Imagen 3'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1709884735017-114f4a31f944?q=80&w=2129&auto=format&fit=crop',
    prompt: 'A cozy cottage in a magical forest with glowing mushrooms',
    aspectRatio: '16:9',
    timestamp: Date.now() - 300000,
    model: 'Gemini 2.5 Flash'
  }
];

export const EXPLORE_IMAGES: GeneratedImage[] = [
  ...MOCK_IMAGES,
  {
    id: 'e1',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop',
    prompt: 'Cyberpunk street food vendor in Tokyo, neon lights, rain, detailed',
    aspectRatio: '2:3',
    timestamp: Date.now() - 400000,
    model: 'Gemini 1.5 Pro'
  },
  {
    id: 'e2',
    url: 'https://images.unsplash.com/photo-1633213336209-66d4d1222851?q=80&w=1974&auto=format&fit=crop',
    prompt: 'Abstract 3D render of glass shapes, iridescent colors, studio lighting',
    aspectRatio: '1:1',
    timestamp: Date.now() - 500000,
    model: 'Imagen 3'
  },
  {
    id: 'e3',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    prompt: 'Synthwave sunset over a grid landscape, retro 80s style',
    aspectRatio: '16:9',
    timestamp: Date.now() - 600000,
    model: 'Gemini 2.5 Flash'
  },
  {
    id: 'e4',
    url: 'https://images.unsplash.com/photo-1614726365723-49cfae96c6b4?q=80&w=1974&auto=format&fit=crop',
    prompt: 'Macro photography of a soap bubble, colorful interference patterns',
    aspectRatio: '1:1',
    timestamp: Date.now() - 700000,
    model: 'Gemini 1.5 Pro'
  },
  {
    id: 'e5',
    url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=1964&auto=format&fit=crop',
    prompt: 'Oil painting of a stormy ocean, dramatic lighting, classical style',
    aspectRatio: '2:3',
    timestamp: Date.now() - 800000,
    model: 'Imagen 3'
  },
  {
    id: 'e6',
    url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2064&auto=format&fit=crop',
    prompt: 'Isometric 3D room design, cozy gamer setup, purple lighting',
    aspectRatio: '1:1',
    timestamp: Date.now() - 900000,
    model: 'Gemini 2.5 Flash'
  },
  {
    id: 'e7',
    url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1974&auto=format&fit=crop',
    prompt: 'Double exposure portrait of a woman and a forest, surreal art',
    aspectRatio: '2:3',
    timestamp: Date.now() - 1000000,
    model: 'Gemini 1.5 Pro'
  },
  {
    id: 'e8',
    url: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1976&auto=format&fit=crop',
    prompt: 'Low poly landscape of mountains at sunrise, vibrant colors',
    aspectRatio: '16:9',
    timestamp: Date.now() - 1100000,
    model: 'Imagen 3'
  }
];
