'use client';

import React from 'react';
import { Compass, Brush, LayoutGrid, FolderHeart, Settings, Sparkles, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/uiStore';

interface FloatingDockProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const navItems = [
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'create', icon: Brush, label: 'Create' },
    { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
    { id: 'myworks', icon: FolderHeart, label: 'My Works' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

const generationOptions = [1, 2, 4, 6, 8];

const FloatingDock: React.FC<FloatingDockProps> = ({
    activeTab,
    setActiveTab,
}) => {
    const { user, profile } = useAuth();
    const { openAuthModal } = useUIStore();

    return (
        <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
            {/* Main Glass Capsule */}
            <nav
                className="relative flex flex-col gap-2 p-2 rounded-[1.75rem] bg-black/30 backdrop-blur-2xl border shadow-2xl transition-all duration-300 min-w-[72px]"
                style={{
                    borderColor: 'var(--lamp-glow)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px var(--lamp-glow)'
                }}
            >
                {/* Navigation Items */}
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <div key={item.id} className="relative group flex flex-col items-center justify-center">
                            <motion.button
                                onClick={() => {
                                    console.log('FloatingDock Click:', item.id, 'User:', user);
                                    if (item.id === 'myworks' && !user) {
                                        console.log('Opening Auth Modal');
                                        openAuthModal('signin');
                                        return;
                                    }
                                    setActiveTab(item.id);
                                }}
                                className={cn(
                                    "relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-white"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Special Case: My Works -> Avatar */}
                                {item.id === 'myworks' && user ? (
                                    <div className="relative w-8 h-8 mb-1 rounded-full overflow-hidden border border-white/20">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        {/* Crown/Status Icon overlay could go here specific to the mockup */}
                                    </div>
                                ) : (
                                    <Icon
                                        size={24}
                                        strokeWidth={1.5}
                                        className={cn(
                                            "transition-all duration-300 mb-1",
                                            isActive && "glow-icon"
                                        )}
                                        style={isActive ? {
                                            color: 'var(--lamp-color)',
                                            filter: 'drop-shadow(0 0 8px var(--lamp-color))'
                                        } : {}}
                                    />
                                )}

                                <span className={cn(
                                    "text-[10px] font-medium tracking-wide transition-colors duration-300",
                                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                )}>
                                    {item.label}
                                </span>

                                {/* Active Background Glow (Cards/Squircle shape) */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute inset-0 rounded-xl -z-10 bg-white/10"
                                        style={{
                                            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)',
                                            border: '1px solid var(--lamp-glow)'
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default FloatingDock;
