import React from 'react';
import { Settings } from 'lucide-react';
import { getSettingsAction } from '../actions';
import SettingsManager from '@/components/admin/settings/SettingsManager';

export const metadata = {
    title: 'Settings | DaVinci ADC',
};

export default async function SettingsPage() {
    // Fetch initial settings from DB
    const res = await getSettingsAction();
    const settings = res.data || [];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-700">
            {/* Standard Module Header (h-16) */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Settings</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Global Configuration
                    </p>
                </div>
            </div>

            {/* Signature Golden Divider */}
            <div className="admin-divider flex-shrink-0" />

            {/* Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex justify-center">
                <SettingsManager initialSettings={settings} />
            </div>
        </div>
    );
}