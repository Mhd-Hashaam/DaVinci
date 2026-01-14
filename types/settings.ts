export type ImageDimension = '2:3' | '1:1' | '16:9' | '3:4' | '4:3' | '9:16' | '4:5' | '5:7' | 'Custom';
export type ImageSize = 'Small' | 'Medium' | 'Large';
export type PromptEnhance = 'Auto' | 'Manual' | 'Off';
export type StylePreset = 'Cinematic' | 'Creative' | 'Dynamic' | 'Fashion' | 'None' | 'Portrait' | 'Stock Photo' | 'Vibrant' | 'Photography' | '3D Render' | 'Anime' | 'Illustration';
export type AIModel = 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gemini-nano-banana' | 'imagen-3' | 'dalle-3' | 'midjourney-v6' | 'stable-diffusion-xl' | 'flux-pro' | 'freepik-mystic' | 'freepik-flux-realism' | 'freepik-flux-1.1';

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
