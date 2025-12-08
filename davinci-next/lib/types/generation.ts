// Shared types for AI image generation

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '4:5' | '5:4';

export type StylePreset =
    | 'Cinematic'
    | 'Creative'
    | 'Dynamic'
    | 'Fashion'
    | 'None'
    | 'Portrait'
    | 'Stock Photo'
    | 'Vibrant'
    | 'Photography'
    | '3D Render'
    | 'Anime'
    | 'Illustration';

// Request/Response types for generation
export interface GenerationRequest {
    prompt: string;
    model: string;
    aspectRatio: AspectRatio;
    style?: StylePreset;
    negativePrompt?: string;
}

export interface GenerationResponse {
    success: boolean;
    imageUrl?: string;
    error?: string;
    provider: string;
    model: string;
    generatedAt: string;
    metadata?: Record<string, unknown>;
}

// Model information
export interface ModelInfo {
    id: string;
    name: string;
    description?: string;
}

// Provider information
export interface ProviderInfo {
    id: string;
    name: string;
    models: ModelInfo[];
    available: boolean;
}

// API Response types
export interface ModelsResponse {
    providers: ProviderInfo[];
}

export interface HealthResponse {
    status: 'ok' | 'error';
    timestamp: string;
    providers: {
        id: string;
        available: boolean;
    }[];
}
