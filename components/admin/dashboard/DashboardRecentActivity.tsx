'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ActivityLogItem {
    id: string;
    admin_id: string;
    action: string;
    object_type: string;
    object_id: string;
    details: any;
    created_at: string;
    profiles?: {
        username: string;
        avatar_url: string;
    };
}

interface DashboardRecentActivityProps {
    logs: ActivityLogItem[];
}

export function DashboardRecentActivity({ logs }: DashboardRecentActivityProps) {
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getActionText = (log: ActivityLogItem) => {
        const username = log.profiles?.username || 'Admin';
        const action = log.action.toLowerCase();
        const objectType = log.object_type.replace('cms_', '').replace('_', ' ');
        const name = log.details?.name || log.details?.title || log.details?.filename || 'an item';

        if (action === 'create' || action === 'insert') return <>{username} created <q>{name}</q></>;
        if (action === 'update') return <>{username} updated <q>{name}</q></>;
        if (action === 'delete') return <>{username} deleted <q>{name}</q></>;
        if (action === 'upload') return <>{username} uploaded <q>{name}</q></>;
        
        return <>{username} {action} {objectType}: {name}</>;
    };

    const getDotColor = (action: string) => {
        const a = action.toLowerCase();
        if (a === 'create' || a === 'insert' || a === 'upload') return 'var(--primary)';
        if (a === 'update') return '#8E7A5A';
        if (a === 'delete') return '#ef4444';
        return 'rgba(255,255,255,0.2)';
    };

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    return (
        <div>
            <h2 className="font-cormorant text-2xl font-light tracking-wide text-white/90 mb-4 px-1">Recent Activity</h2>
            <div className="space-y-0.5 px-1">
                {logs.length === 0 ? (
                    <p className="text-zinc-600 text-xs font-outfit uppercase tracking-widest py-4">No recent activity detected.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex items-center justify-between py-2.5 gap-6 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors px-2 -mx-2 rounded-lg group">
                            <div className="flex items-center gap-4 min-w-0">
                                <span 
                                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full shadow-[0_0_8px_currentColor] transition-transform duration-300 group-hover:scale-125" 
                                    style={{ color: getDotColor(log.action), backgroundColor: getDotColor(log.action) }} 
                                />
                                <p className="font-outfit text-[13px] text-white font-light truncate">
                                    {getActionText(log)}
                                </p>
                            </div>
                            <span className="font-outfit text-[10px] text-zinc-400 whitespace-nowrap flex-shrink-0 tracking-widest uppercase">
                                {mounted ? formatTime(log.created_at) : '...'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
