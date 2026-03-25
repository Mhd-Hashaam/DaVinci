import React from 'react';
import { getWardrobeItems } from '@/lib/api/admin-cms';
import ClosetManager from '@/components/admin/closet/ClosetManager';

export const metadata = {
    title: 'Manage The Closet | DaVinci ADC',
};

export const dynamic = 'force-dynamic';

export default async function ClosetPage() {
    const { data: wardrobeItems, error } = await getWardrobeItems(false);

    if (error) {
        return (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-6">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load wardrobe data</h2>
                <p className="text-zinc-400 font-mono text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <ClosetManager initialItems={wardrobeItems || []} />
        </div>
    );
}
