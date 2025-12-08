// Provider Registry - Maps model IDs to providers

import { AIProvider } from './base';
import { geminiProvider } from './gemini';
import { freepikProvider } from './freepik';
import { ProviderInfo } from '../types/generation';

/**
 * Provider Registry
 * 
 * This is the central registry for all AI providers.
 * To add a new provider:
 * 1. Create a new provider file (e.g., openai.ts)
 * 2. Import and add it to the providers array below
 * 
 * The registry handles:
 * - Model ID to provider mapping
 * - Provider availability checks
 * - Listing all providers and models
 */
class ProviderRegistry {
    private providers: AIProvider[] = [
        geminiProvider,
        freepikProvider,
        // Add new providers here:
        // openaiProvider,
        // stabilityProvider,
        // midjourneyProvider,
    ];

    /**
     * Get all registered providers
     */
    getProviders(): AIProvider[] {
        return this.providers;
    }

    /**
     * Find a provider by its ID
     */
    getProviderById(id: string): AIProvider | undefined {
        return this.providers.find(p => p.id === id);
    }

    /**
     * Find the provider that supports a given model ID
     */
    getProviderForModel(modelId: string): AIProvider | undefined {
        return this.providers.find(p => p.supportsModel(modelId));
    }

    /**
     * Get provider info with availability status for all providers
     */
    async getProvidersInfo(): Promise<ProviderInfo[]> {
        const infos: ProviderInfo[] = [];

        for (const provider of this.providers) {
            const available = await provider.isAvailable();
            infos.push({
                id: provider.id,
                name: provider.name,
                models: provider.models,
                available,
            });
        }

        return infos;
    }

    /**
     * Get a flat list of all available models across all providers
     */
    async getAvailableModels(): Promise<{ modelId: string; modelName: string; providerId: string; providerName: string }[]> {
        const models: { modelId: string; modelName: string; providerId: string; providerName: string }[] = [];

        for (const provider of this.providers) {
            const available = await provider.isAvailable();
            if (available) {
                for (const model of provider.models) {
                    models.push({
                        modelId: model.id,
                        modelName: model.name,
                        providerId: provider.id,
                        providerName: provider.name,
                    });
                }
            }
        }

        return models;
    }

    /**
     * Register a new provider at runtime
     * Useful for plugins or dynamic provider loading
     */
    registerProvider(provider: AIProvider): void {
        // Check if provider already exists
        const existing = this.providers.find(p => p.id === provider.id);
        if (existing) {
            console.warn(`Provider ${provider.id} already registered, skipping`);
            return;
        }
        this.providers.push(provider);
    }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
