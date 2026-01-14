// Models API Route - List all available models

import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers';
import { ModelsResponse } from '@/lib/types/generation';

export async function GET() {
    try {
        const providers = await providerRegistry.getProvidersInfo();

        const response: ModelsResponse = {
            providers,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('[Models] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
