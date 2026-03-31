import type { GenerationRequest, GenerationResponse } from '../types/generation';

const API_BASE = '/api';

export const api = {
    /**
     * Generate an image via our secure AI pipeline (Gemini).
     * Handles authentication headers automatically via HttpOnly cookies by the browser.
     */
    async generate(request: GenerationRequest): Promise<GenerationResponse> {
        try {
            const response = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            // Parse standard JSON response
            const data: GenerationResponse = await response.json();
            
            // Note: Our API returns 200 for logical errors (Quota, Safety Blocked)
            // so `data.success` is the reliable indicator.
            // If there's a hard 500 error without JSON, we catch it here:
            if (!response.ok && !data) {
                return {
                    success: false,
                    error: {
                        code: 'SERVER_ERROR',
                        message: `HTTP Error ${response.status}: ${response.statusText}`
                    }
                };
            }

            return data;
        // Catch network level errors (CORS, offline, etc.)
        } catch (error: any) {
            return {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: error.message || 'Network request failed'
                }
            };
        }
    }
};

export const apiEndpoints = {
    generate: `${API_BASE}/generate`,
};
