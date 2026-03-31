'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { upsertSettingAction } from '@/app/admin/actions';
import { Save, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CMSSettingsRow } from '@/types/cms';

interface SettingsManagerProps {
    initialSettings: CMSSettingsRow[];
}

export default function SettingsManager({ initialSettings }: SettingsManagerProps) {
    const defaultLimit = initialSettings.find(s => s.key === 'daily_generation_limit')?.value || 5;
    const [dailyLimit, setDailyLimit] = useState<number>(Number(defaultLimit));
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveAI = async () => {
        setIsSaving(true);
        try {
            const res = await upsertSettingAction({
                key: 'daily_generation_limit',
                value: dailyLimit.toString(),
                description: 'Max AI image generations allowed per user per day.',
                is_public: true
            });
            if (res.error) throw res.error;
            toast.success('AI generation limit updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl max-w-[800px] w-full">
            {/* AI Configurations */}
            <div className="admin-panel rounded-2xl overflow-hidden border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="border-b border-white/5 bg-white/[0.02] px-8 py-5 flex items-center gap-3">
                    <Zap className="text-[var(--primary)] shrink-0" size={18} />
                    <div>
                        <h2 className="font-cormorant text-xl tracking-wide text-white">AI Generation Settings</h2>
                        <p className="font-outfit text-[11px] uppercase tracking-widest text-zinc-500 mt-1">Manage platform-wide token limits safely</p>
                    </div>
                </div>

                <div className="p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-outfit text-[12px] uppercase tracking-[0.1em] text-zinc-400">
                            Daily Generation Limit (Per User)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={dailyLimit}
                                onChange={(e) => setDailyLimit(Number(e.target.value))}
                                className="w-32 rounded-lg border border-white/10 bg-black/40 px-4 py-3 font-outfit text-white placeholder-zinc-600 focus:border-[var(--primary)]/50 focus:outline-none transition-colors"
                            />
                            <button
                                onClick={handleSaveAI}
                                disabled={isSaving}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-6 py-3 font-outfit text-[11px] uppercase tracking-widest transition-all cursor-pointer",
                                    isSaving 
                                        ? "bg-white/5 text-zinc-500 border border-white/5" 
                                        : "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                                )}
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {isSaving ? 'Saving...' : 'Save Limit'}
                            </button>
                        </div>
                        <p className="text-[11px] font-outfit text-zinc-500 mt-1 max-w-md leading-relaxed">
                            This controls how many images an authenticated user can generate in a given 24 hour window. Raising this increases Vercel and Gemini API consumption.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Future settings panels will go here */}
        </div>
    );
}
