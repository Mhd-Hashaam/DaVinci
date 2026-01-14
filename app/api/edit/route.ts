import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers';

interface EditRequest {
    imageUrl: string;
    prompt: string;
    model?: string;
}

/**
 * POST /api/edit
 * Apply AI edits to an existing image
 */
export async function POST(request: NextRequest) {
    try {
        const body: EditRequest = await request.json();
        const { imageUrl, prompt, model = 'gemini-2.5-flash' } = body;

        if (!imageUrl || !prompt) {
            return NextResponse.json(
                { error: 'Missing required fields: imageUrl and prompt' },
                { status: 400 }
            );
        }

        // Get the provider for the model
        const provider = providerRegistry.getProviderForModel(model);

        if (!provider) {
            return NextResponse.json(
                { error: `No provider available for model: ${model}` },
                { status: 400 }
            );
        }

        // Check if provider is available
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
            return NextResponse.json(
                { error: `Provider ${provider.name} is not available. Missing API key or service unreachable.` },
                { status: 503 }
            );
        }

        // For now, we'll use the generation endpoint with the original image as context
        // True AI editing (inpainting) requires specific API support
        // This is a placeholder that generates a new image based on the edit prompt

        const editPrompt = `Based on the following original concept, create an edited version: ${prompt}. Maintain the original style and composition.`;

        const result = await provider.generate({
            prompt: editPrompt,
            model: model,
            aspectRatio: '1:1' as const,
            style: 'Dynamic',
        });

        return NextResponse.json({
            success: true,
            editedImageUrl: result.imageUrl,
            originalImageUrl: imageUrl,
        });

    } catch (error) {
        console.error('Edit API error:', error);

        const message = error instanceof Error ? error.message : 'Edit failed';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
