import React from 'react';
import { getSiteContent } from '@/lib/api/admin-cms';
import ContentManager from '@/components/admin/content/ContentManager';

export const metadata = {
    title: 'Manage Site Content | DaVinci ADC',
};

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
    const { data: contentRows, error } = await getSiteContent();

    if (error) {
        return (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-6">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load content</h2>
                <p className="text-zinc-400 font-mono text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <ContentManager initialItems={contentRows || []} />
        </div>
    );
}
