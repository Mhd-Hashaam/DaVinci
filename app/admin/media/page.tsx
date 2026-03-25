import React from 'react';
import MediaManager from '@/components/admin/media/MediaManager';

export const metadata = {
    title: 'Media Library | DaVinci ADC',
};

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
    // Initial fetch handled on client side for easy directory navigation
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
            <MediaManager />
        </div>
    );
}
