export type ImageDimension = '2:3' | '1:1' | '16:9' | '3:4' | '4:3' | '9:16' | '4:5' | '5:7' | 'Custom';
export type ImageSize = 'Small' | 'Medium' | 'Large';
export type PromptEnhance = 'Auto' | 'Manual' | 'Off';
export type StylePreset = 'Cinematic' | 'Creative' | 'Dynamic' | 'Fashion' | 'None' | 'Portrait' | 'Stock Photo' | 'Vibrant' | 'Photography' | '3D Render' | 'Anime' | 'Illustration';
export type AIModel = 'Gemini 2.5 Flash' | 'Gemini 1.5 Pro' | 'Gemini 3 Pro Nano Banana' | 'Imagen 3' | 'DALL-E 3' | 'Midjourney V6' | 'Stable Diffusion XL' | 'Flux Pro';

export interface GenerationSettings {
    imageDimension: ImageDimension;
    imageSize: ImageSize;
    promptEnhance: PromptEnhance;
    style: StylePreset;
    model: AIModel;
    negativePrompt?: string;
    guidanceScale?: number;
    steps?: number;
}
