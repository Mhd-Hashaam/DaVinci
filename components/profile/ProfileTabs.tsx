'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Heart, Folder } from 'lucide-react';

interface ProfileTabsProps {
    activeTab: string;
    onChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
    const tabs = [
        { id: 'creations', label: 'Creations', icon: ImageIcon },
        { id: 'liked', label: 'Liked', icon: Heart },
        { id: 'collections', label: 'Collections', icon: Folder },
    ];

    return (
        <div className="border-b border-white/10 mb-8 w-full">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                "group relative py-4 px-1 flex items-center gap-2 font-medium text-sm transition-colors",
                                isActive
                                    ? "text-indigo-400"
                                    : "text-zinc-400 hover:text-zinc-300"
                            )}
                        >
                            <tab.icon size={16} className={cn(isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400")} />
                            <span>{tab.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
