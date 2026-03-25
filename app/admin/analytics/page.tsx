import React from 'react';
import { Activity } from 'lucide-react';

export const metadata = {
    title: 'Analytics | DaVinci ADC',
};

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-700">
            {/* Standard Module Header (h-16) */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Analytics</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Insight Hub
                    </p>
                </div>
            </div>

            {/* Signature Golden Divider */}
            <div className="admin-divider flex-shrink-0" />

            {/* Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="rounded-2xl admin-panel p-20 text-center flex flex-col items-center justify-center">
                <Activity className="h-16 w-16 text-zinc-600 mb-6 opacity-20" strokeWidth={1} />
                <h3 className="font-cormorant text-2xl text-white">Insight Engine</h3>
                <p className="mt-2 font-outfit text-sm font-light text-zinc-500">Real-time data processing is in final stage of integration.</p>
                </div>
            </div>
        </div>
    );
}
