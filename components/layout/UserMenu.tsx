'use client';

import React from 'react';
import { UserCircle, User as UserIcon, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/uiStore';

import { useRouter } from 'next/navigation';

export function UserMenu() {
    const { user, profile, signOut } = useAuth();
    const { openAuthModal } = useUIStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);

    if (!user) {
        return (
            <button
                onClick={() => openAuthModal('signin')}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 cursor-pointer"
                aria-label="Sign In"
            >
                <UserCircle className="text-zinc-400" size={20} />
            </button>
        );
    }

    // Authenticated State (Dropdown)
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer"
            >
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                        {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-[#09090b] border border-white/10 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Creator'}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>

                        <button
                            onClick={() => { router.push('/profile'); setIsOpen(false); }}
                            className="w-full px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <UserIcon size={16} />
                            Your Profile
                        </button>

                        <button
                            onClick={() => { router.push('/settings'); setIsOpen(false); }}
                            className="w-full px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <SettingsIcon size={16} />
                            Settings
                        </button>

                        <div className="h-px bg-white/5 my-1" />

                        <button
                            onClick={() => { signOut(); setIsOpen(false); }}
                            className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
