'use client';

import React, { useState } from 'react';
import { ResponsiveShell } from '@/components/layout/ResponsiveShell';
import Sidebar from '@/components/Sidebar';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { MyWorks } from '@/components/davinci/profile/MyWorks';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Layout State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [activeProfileTab, setActiveProfileTab] = useState('creations');
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Protected Route Check
    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    // Auto-open edit modal if profile is missing (New User)
    const { profile } = useAuth();
    React.useEffect(() => {
        if (!isLoading && user && !profile) {
            setIsEditOpen(true);
        }
    }, [isLoading, user, profile]);

    // Check for Post-Login Redirect (e.g. from Save Progress)
    const postLoginTab = useDaVinciUIStore(state => state.postLoginTab);
    const setPostLoginTab = useDaVinciUIStore(state => state.setPostLoginTab);

    React.useEffect(() => {
        if (postLoginTab) {
            setActiveProfileTab(postLoginTab);
            setPostLoginTab(null); // Clear after handling
        }
    }, [postLoginTab, setPostLoginTab]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    if (!user) return null; // Will redirect

    return (
        <ResponsiveShell
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebar={
                // Reuse Sidebar with minimal props to satisfy Type
                <Sidebar
                    isCollapsed={!sidebarOpen}
                    setIsCollapsed={(collapsed) => setSidebarOpen(!collapsed)}
                    width={sidebarWidth}
                    setWidth={setSidebarWidth}
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                        if (tab === 'create' || tab === 'explore' || tab === 'bookmarks') {
                            router.push(`/?tab=${tab}`);
                        } else {
                            setActiveTab(tab);
                        }
                    }}
                    generationCount={1}
                    setGenerationCount={() => { }}
                />
            }
        >
            <div className="min-h-screen bg-[#09090b] pb-20">
                <ProfileHero onEdit={() => setIsEditOpen(true)} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ProfileTabs activeTab={activeProfileTab} onChange={setActiveProfileTab} />

                    {/* Content Switcher */}
                    {activeProfileTab === 'creations' && (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-zinc-500">Your gallery is empty... for now.</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 text-indigo-400 hover:underline"
                            >
                                Start Creating
                            </button>
                        </div>
                    )}
                    {activeProfileTab === 'myworks' && (
                        <MyWorks />
                    )}
                    {activeProfileTab === 'liked' && (
                        <div className="text-center py-20">
                            <p className="text-zinc-500">No liked images yet.</p>
                        </div>
                    )}
                </div>

                <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

            </div>
        </ResponsiveShell>
    );
}
