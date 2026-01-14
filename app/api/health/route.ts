// Health Check API Route

import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers';
import { HealthResponse } from '@/lib/types/generation';

export async function GET() {
    try {
        const providers = providerRegistry.getProviders();
        const providerStatuses = await Promise.all(
            providers.map(async (provider) => ({
                id: provider.id,
                available: await provider.isAvailable(),
            }))
        );

        const response: HealthResponse = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            providers: providerStatuses,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('[Health] Error:', error);
        return NextResponse.json(
            { status: 'error', timestamp: new Date().toISOString(), providers: [] },
            { status: 500 }
        );
    }
}
