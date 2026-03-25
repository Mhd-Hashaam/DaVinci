import React from 'react';
import { getAuditLog } from '@/lib/api/admin-cms';
import ActivityTimeline from '@/components/admin/activity/ActivityTimeline';

export const metadata = {
    title: 'Audit Log & Activity | DaVinci ADC',
};

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
    const { data: logs, error } = await getAuditLog({ limit: 50 });

    if (error) {
        return (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-6">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load activity log</h2>
                <p className="text-zinc-400 font-mono text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
            <ActivityTimeline initialLogs={logs || []} />
        </div>
    );
}
