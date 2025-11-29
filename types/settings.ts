export type ImageDimension = '2:3' | '1:1' | '16:9' | 'Custom';
export type ImageSize = 'Small' | 'Medium' | 'Large';
export type PromptEnhance = 'Auto' | 'Manual' | 'Off';
export type StylePreset = 'Dynamic' | 'Cinematic' | 'Photography' | 'Illustration' | '3D Render' | 'Anime';
export type AIModel = 'Gemini 2.5 Flash' | 'Gemini 1.5 Pro' | 'Imagen 3';

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
