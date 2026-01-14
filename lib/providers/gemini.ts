// Gemini AI Provider

import { GoogleGenAI } from '@google/genai';
import { BaseProvider } from './base';
import { GenerationRequest, GenerationResponse, ModelInfo } from '../types/generation';

export class GeminiProvider extends BaseProvider {
    readonly id = 'gemini';
    readonly name = 'Google Gemini';
    readonly models: ModelInfo[] = [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High quality output' },
        { id: 'gemini-nano-banana', name: 'Gemini 3 Pro Nano Banana 🍌', description: 'Experimental model' },
    ];

    private client: GoogleGenAI | null = null;

    private getClient(): GoogleGenAI {
        if (!this.client) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is not configured');
            }
            this.client = new GoogleGenAI({ apiKey });
        }
        return this.client;
    }

    async isAvailable(): Promise<boolean> {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            return !!apiKey && apiKey.length > 0;
        } catch {
            return false;
        }
    }

    async generate(request: GenerationRequest): Promise<GenerationResponse> {
        try {
            const client = this.getClient();

            // Map model ID to actual Gemini model name
            const modelMap: Record<string, string> = {
                'gemini-2.5-flash': 'gemini-2.0-flash-exp',
                'gemini-1.5-pro': 'gemini-1.5-pro',
                'gemini-nano-banana': 'gemini-2.0-flash-exp', // Maps to same model for now
            };

            const modelName = modelMap[request.model] || 'gemini-2.0-flash-exp';

            // Build the prompt with style if provided
            let fullPrompt = request.prompt;
            if (request.style && request.style !== 'None') {
                fullPrompt = `${request.style} style: ${request.prompt}`;
            }

            const response = await client.models.generateContent({
                model: modelName,
                contents: {
                    parts: [{ text: fullPrompt }],
                },
                config: {
                    systemInstruction: 'You are an expert AI artist. Generate high-quality images based on user prompts. ALWAYS generate an image.',
                    responseModalities: ['IMAGE', 'TEXT'],
                },
            });

            // Extract image from response
            const candidate = response.candidates?.[0];
            if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        const base64Data = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        const imageUrl = `data:${mimeType};base64,${base64Data}`;

                        return this.createSuccessResponse(imageUrl, request.model, {
                            aspectRatio: request.aspectRatio,
                            style: request.style,
                        });
                    }
                }
            }

            // Check for text response (error message from model)
            const textPart = candidate?.content?.parts?.find(p => p.text)?.text;
            if (textPart) {
                return this.createErrorResponse(textPart, request.model);
            }

            return this.createErrorResponse('No image generated', request.model);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('[GeminiProvider] Generation error:', message);
            return this.createErrorResponse(message, request.model);
        }
    }
}

// Singleton instance
export const geminiProvider = new GeminiProvider();
