// Image Generation API Route

import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers';
import { GenerationRequest, GenerationResponse } from '@/lib/types/generation';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate required fields
        const { prompt, model, aspectRatio } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        if (!model || typeof model !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Model is required' },
                { status: 400 }
            );
        }

        // Find the provider for this model
        const provider = providerRegistry.getProviderForModel(model);

        if (!provider) {
            return NextResponse.json(
                { success: false, error: `No provider found for model: ${model}` },
                { status: 400 }
            );
        }

        // Check if provider is available
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
            return NextResponse.json(
                { success: false, error: `Provider ${provider.name} is not available. Check API key configuration.` },
                { status: 503 }
            );
        }

        // Build the generation request
        const generationRequest: GenerationRequest = {
            prompt,
            model,
            aspectRatio: aspectRatio || '1:1',
            style: body.style,
            negativePrompt: body.negativePrompt,
        };

        // Generate the image
        console.log(`[Generate] Using ${provider.name} with model ${model}`);
        const response: GenerationResponse = await provider.generate(generationRequest);

        // Return the response
        if (response.success) {
            return NextResponse.json(response);
        } else {
            return NextResponse.json(response, { status: 500 });
        }

    } catch (error) {
        console.error('[Generate] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                success: false,
                error: message,
                provider: 'unknown',
                model: 'unknown',
                generatedAt: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

// Return allowed methods
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Allow': 'POST, OPTIONS',
        },
    });
}
