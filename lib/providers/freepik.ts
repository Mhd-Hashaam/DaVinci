// Freepik AI Provider

import { BaseProvider } from './base';
import { GenerationRequest, GenerationResponse, ModelInfo } from '../types/generation';

export class FreepikProvider extends BaseProvider {
    readonly id = 'freepik';
    readonly name = 'Freepik AI';
    readonly models: ModelInfo[] = [
        { id: 'freepik-mystic', name: 'Mystic', description: 'Artistic and mystical style' },
        { id: 'freepik-flux-realism', name: 'Flux Realism', description: 'Photorealistic images' },
        { id: 'freepik-flux-1.1', name: 'Flux 1.1', description: 'Latest Flux model' },
    ];

    private readonly baseUrl = 'https://api.freepik.com/v1';

    async isAvailable(): Promise<boolean> {
        try {
            const apiKey = process.env.FREEPIK_API_KEY;
            return !!apiKey && apiKey.length > 0;
        } catch {
            return false;
        }
    }

    async generate(request: GenerationRequest): Promise<GenerationResponse> {
        try {
            const apiKey = process.env.FREEPIK_API_KEY;
            if (!apiKey) {
                return this.createErrorResponse('FREEPIK_API_KEY is not configured', request.model);
            }

            // Map model ID to Freepik engine
            const engineMap: Record<string, string> = {
                'freepik-mystic': 'mystic',
                'freepik-flux-realism': 'flux-realism',
                'freepik-flux-1.1': 'flux-1.1',
            };

            const engine = engineMap[request.model] || 'mystic';

            // Build the prompt with style if provided
            let fullPrompt = request.prompt;
            if (request.style && request.style !== 'None') {
                fullPrompt = `${request.style} style: ${request.prompt}`;
            }

            // Parse aspect ratio to width/height
            const [w, h] = request.aspectRatio.split(':').map(Number);
            const baseSize = 1024;
            const width = Math.round(baseSize * (w / Math.max(w, h)));
            const height = Math.round(baseSize * (h / Math.max(w, h)));

            const response = await fetch(`${this.baseUrl}/ai/text-to-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-freepik-api-key': apiKey,
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    negative_prompt: request.negativePrompt || '',
                    guidance_scale: 7.5,
                    num_inference_steps: 30,
                    image: {
                        size: { width, height },
                    },
                    styling: {
                        style: 'photo', // Can be customized based on style preset
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP ${response.status}`;
                return this.createErrorResponse(errorMessage, request.model);
            }

            const data = await response.json();

            // Freepik returns images in data array
            if (data.data && data.data.length > 0) {
                const imageUrl = data.data[0].base64
                    ? `data:image/png;base64,${data.data[0].base64}`
                    : data.data[0].url;

                return this.createSuccessResponse(imageUrl, request.model, {
                    aspectRatio: request.aspectRatio,
                    style: request.style,
                    engine,
                });
            }

            return this.createErrorResponse('No image in response', request.model);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('[FreepikProvider] Generation error:', message);
            return this.createErrorResponse(message, request.model);
        }
    }
}

// Singleton instance
export const freepikProvider = new FreepikProvider();
