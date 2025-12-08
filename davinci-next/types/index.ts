import { AIModel } from './settings';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '4:5' | '5:4';

export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    aspectRatio: AspectRatio;
    timestamp: number;
    model: AIModel | string;
}
