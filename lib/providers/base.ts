// Base provider interface - all AI providers must implement this

import {
    GenerationRequest,
    GenerationResponse,
    ModelInfo
} from '../types/generation';

/**
 * Base interface that all AI providers must implement.
 * This ensures a consistent API across all providers (Gemini, Freepik, DALL-E, etc.)
 */
export interface AIProvider {
    /** Unique identifier for the provider (e.g., 'gemini', 'freepik') */
    readonly id: string;

    /** Display name for the provider */
    readonly name: string;

    /** List of models offered by this provider */
    readonly models: ModelInfo[];

    /**
     * Check if the provider is available (API key configured, service reachable)
     */
    isAvailable(): Promise<boolean>;

    /**
     * Generate an image based on the request
     * @param request - The generation request containing prompt, model, etc.
     * @returns Promise resolving to the generation response
     */
    generate(request: GenerationRequest): Promise<GenerationResponse>;

    /**
     * Check if this provider supports a specific model
     * @param modelId - The model ID to check
     */
    supportsModel(modelId: string): boolean;
}

/**
 * Base class with common functionality for providers.
 * Extend this to create new providers.
 */
export abstract class BaseProvider implements AIProvider {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly models: ModelInfo[];

    abstract isAvailable(): Promise<boolean>;
    abstract generate(request: GenerationRequest): Promise<GenerationResponse>;

    /**
     * Helper to create a successful response
     */
    protected createSuccessResponse(
        imageUrl: string,
        model: string,
        metadata?: Record<string, unknown>
    ): GenerationResponse {
        return {
            success: true,
            imageUrl,
            provider: this.id,
            model,
            generatedAt: new Date().toISOString(),
            metadata,
        };
    }

    /**
     * Helper to create an error response
     */
    protected createErrorResponse(
        error: string,
        model: string
    ): GenerationResponse {
        return {
            success: false,
            error,
            provider: this.id,
            model,
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Check if this provider supports a given model
     */
    supportsModel(modelId: string): boolean {
        return this.models.some(m => m.id === modelId);
    }
}
