import { GoogleGenAI } from '@google/genai';
import type { AspectRatio } from '../types/generation';

// Ensure this only runs on Node.js runtime (not Edge) due to Buffer sizes and crypto limits
export const runtime = 'nodejs';

export interface GeminiImageOptions {
    prompt: string;
    aspectRatio?: AspectRatio;
}

export interface GeminiImageResult {
    base64Image: string;
    mimeType: string;
}

export class GeminiGenerationError extends Error {
    public readonly code: string;
    
    constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = 'GeminiGenerationError';
    }
}

/**
 * Generates an image using Google's Gemini native image generation.
 * 
 * Per official docs (https://ai.google.dev/gemini-api/docs/image-generation):
 * - Uses `@google/genai` SDK with `ai.models.generateContent()`
 * - Model: `gemini-2.5-flash-image` (Nano Banana — optimized for speed)
 * - Response contains `parts` with `inlineData.data` for base64 image bytes
 * 
 * Includes a strict 45 second timeout for serverless environments.
 */
export async function generateImageWithGemini(options: GeminiImageOptions): Promise<GeminiImageResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new GeminiGenerationError('Missing GEMINI_API_KEY in environment', 'SERVER_ERROR');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Timeout guard for serverless environments (Vercel, etc.)
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new GeminiGenerationError('Image generation timed out after 45 seconds', 'SERVER_ERROR'));
        }, 45000);
    });

    const generatePromise = async (): Promise<GeminiImageResult> => {
        try {
            // Using gemini-2.5-flash-image (Nano Banana)
            // Free tier: ~500 images/day (requires billing account linked for Tier 1)
            // Nano Banana 2 (gemini-3.1-flash-image-preview) is paid-only — NO free tier
            const MODEL = 'gemini-2.5-flash-image';
            
            console.log(`[Gemini/SDK] Calling ${MODEL} for: "${options.prompt.substring(0, 60)}..."`);
            console.time('[Gemini/SDK] Generation Duration');

            // Official API pattern — matches Google's code examples exactly
            const response = await ai.models.generateContent({
                model: MODEL,
                contents: options.prompt,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {
                        aspectRatio: options.aspectRatio || '1:1',
                    },
                },
            });

            console.timeEnd('[Gemini/SDK] Generation Duration');

            // Parse response — iterate over parts to find the image
            const candidates = response.candidates;
            if (!candidates || candidates.length === 0) {
                console.error('[Gemini/SDK] No candidates in response');
                throw new GeminiGenerationError('No candidates returned from Gemini', 'SERVER_ERROR');
            }

            const parts = candidates[0].content?.parts;
            if (!parts || parts.length === 0) {
                console.error('[Gemini/SDK] No parts in response');
                throw new GeminiGenerationError('No content parts returned from Gemini', 'SERVER_ERROR');
            }

            // Find the image part in the response (skip thought parts)
            for (const part of parts) {
                // Skip thinking/interim images (Gemini 3 models use "thinking" mode)
                if ((part as any).thought) continue;

                if (part.text) {
                    console.log(`[Gemini/SDK] Text response: "${part.text.substring(0, 100)}"`);
                }
                if (part.inlineData) {
                    console.log(`[Gemini/SDK] ✅ Image received! MIME: ${part.inlineData.mimeType}, Size: ${part.inlineData.data?.length || 0} chars`);
                    
                    if (!part.inlineData.data) {
                        throw new GeminiGenerationError('Image data is empty in response', 'SERVER_ERROR');
                    }

                    return {
                        base64Image: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png',
                    };
                }
            }

            // If we got here, no image part was found
            console.error('[Gemini/SDK] Response had parts but none contained image data:', 
                JSON.stringify(parts.map(p => ({ hasText: !!p.text, hasInlineData: !!p.inlineData, isThought: !!(p as any).thought })))
            );
            throw new GeminiGenerationError('Gemini returned a response but no image was generated. Try a different prompt.', 'SERVER_ERROR');

        } catch (e: any) {
            const errString = e.message || String(e);
            
            // Re-throw our own errors
            if (e instanceof GeminiGenerationError) throw e;

            // 429 Rate Limit — extract retry delay and give user a clear message
            if (e.status === 429 || errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED') || errString.includes('quota')) {
                // Try to extract retry delay from the error
                let retryDelay = '60 seconds';
                const retryMatch = errString.match(/retry\s*(?:in\s*)?(\d+\.?\d*)\s*s/i);
                if (retryMatch) retryDelay = `${Math.ceil(parseFloat(retryMatch[1]))} seconds`;
                
                // Check if this is a limit:0 situation (billing not enabled)
                const isZeroLimit = errString.includes('limit: 0') || errString.includes('limit:0');
                
                if (isZeroLimit) {
                    console.error('[Gemini/SDK] ❌ ZERO QUOTA — Billing must be enabled for image generation');
                    throw new GeminiGenerationError(
                        'Image generation requires a paid API tier. Please enable billing in Google AI Studio to unlock image generation.',
                        'BILLING_REQUIRED'
                    );
                }

                console.error(`[Gemini/SDK] ⏳ Rate limited — retry in ${retryDelay}`);
                throw new GeminiGenerationError(
                    `Rate limit reached. Please try again in ${retryDelay}.`,
                    'RATE_LIMIT_EXCEEDED'
                );
            }

            // AbortError / Timeout
            if (e.name === 'AbortError' || errString.includes('aborted')) {
                throw new GeminiGenerationError('Image generation timed out', 'SERVER_ERROR');
            }

            // Google Safety catch
            if (
                errString.toUpperCase().includes('SAFETY') || 
                errString.toLowerCase().includes('blocked') || 
                errString.toLowerCase().includes('violates') ||
                errString.toLowerCase().includes('policy') ||
                errString.toLowerCase().includes('prohibited')
            ) {
                throw new GeminiGenerationError('Prompt was blocked by safety filters', 'SAFETY_BLOCKED');
            }

            console.error('[Gemini/SDK] Raw Generation Error:', e);
            throw new GeminiGenerationError(`Gemini generation failed: ${errString}`, 'SERVER_ERROR');
        }
    };

    // Race the generation against the timeout
    try {
        const result = await Promise.race([generatePromise(), timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}

