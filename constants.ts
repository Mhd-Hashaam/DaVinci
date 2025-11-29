import { AspectRatio } from "./types";

export const MODEL_NAME = 'gemini-2.5-flash-image';

export const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '1:1', label: 'Square', icon: 'square' },
  { value: '16:9', label: 'Landscape', icon: 'rectangle-horizontal' },
  { value: '9:16', label: 'Portrait', icon: 'rectangle-vertical' },
  { value: '4:3', label: 'Standard', icon: 'monitor' },
  { value: '3:4', label: 'Mobile', icon: 'smartphone' },
];

export const MOCK_IMAGES = [
  {
    id: 'mock-1',
    url: 'https://picsum.photos/800/800?random=1',
    prompt: 'A futuristic city floating in the clouds, cyberpunk aesthetic, neon lights',
    aspectRatio: '1:1',
    timestamp: Date.now() - 100000,
    model: 'gemini-2.5-flash-image'
  },
  {
    id: 'mock-2',
    url: 'https://picsum.photos/1080/1920?random=2',
    prompt: 'Portrait of an astronaut on Mars, highly detailed, cinematic lighting',
    aspectRatio: '9:16',
    timestamp: Date.now() - 200000,
    model: 'gemini-2.5-flash-image'
  },
  {
    id: 'mock-3',
    url: 'https://picsum.photos/1920/1080?random=3',
    prompt: 'A serene lake at sunset with mountains in the background, oil painting style',
    aspectRatio: '16:9',
    timestamp: Date.now() - 300000,
    model: 'gemini-2.5-flash-image'
  },
  {
    id: 'mock-4',
    url: 'https://picsum.photos/800/1000?random=4',
    prompt: 'Cybernetic cat with glowing eyes, digital art',
    aspectRatio: '3:4',
    timestamp: Date.now() - 400000,
    model: 'gemini-2.5-flash-image'
  },
];
