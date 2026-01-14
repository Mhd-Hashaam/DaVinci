// Frontend API Client
// Use this in components to call the backend API

import {
    GenerationRequest,
    GenerationResponse,
    ModelsResponse,
    HealthResponse
} from '../types/generation';

const API_BASE = '/api';

interface EditRequest {
    imageUrl: string;
    prompt: string;
    model?: string;
}

interface EditResponse {
    success: boolean;
    editedImageUrl?: string;
    originalImageUrl?: string;
    error?: string;
}

/**
 * API Client for DaVinci Studio
 * 
 * This client provides typed methods for calling the backend API.
 * All methods handle errors and return typed responses.
 */
export const api = {
    /**
     * Generate an image using the specified model
     */
    async generate(request: GenerationRequest): Promise<GenerationResponse> {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        const data = await response.json();
        return data as GenerationResponse;
    },

    /**
     * Edit an existing image using AI
     */
    async edit(request: EditRequest): Promise<EditResponse> {
        const response = await fetch(`${API_BASE}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        const data = await response.json();
        return data as EditResponse;
    },

    /**
     * Get all available providers and models
     */
    async getModels(): Promise<ModelsResponse> {
        const response = await fetch(`${API_BASE}/models`);
        const data = await response.json();
        return data as ModelsResponse;
    },

    /**
     * Check API health and provider availability
     */
    async getHealth(): Promise<HealthResponse> {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        return data as HealthResponse;
    },
};

/**
 * Hook-friendly version for use with React Query or SWR
 */
export const apiEndpoints = {
    generate: `${API_BASE}/generate`,
    edit: `${API_BASE}/edit`,
    models: `${API_BASE}/models`,
    health: `${API_BASE}/health`,
};

