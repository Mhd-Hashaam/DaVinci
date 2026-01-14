'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DaVinciFloatingDock } from '@/components/davinci/DaVinciFloatingDock';
import { CustomScrollbar } from '@/components/CustomScrollbar';
import PromptCapsule from '@/components/PromptCapsule';
import { DaVinciExplore } from '@/components/davinci/explore/DaVinciExplore';
import BentoGrid from '@/components/BentoGrid';
import { useTheme } from '@/components/ThemeProvider';
import { SparklesCore } from '@/components/ui/sparkles';
import { LampContainer } from '@/components/ui/lamp';
import ImageModal from '@/components/ImageModal';
import { ApparelModal } from '@/components/davinci/apparel/ApparelModal';
import { TheFittingRoomModal } from '@/components/davinci/fittingroom/TheFittingRoomModal';
import { DaVinciAuthModal } from '@/components/davinci/DaVinciAuthModal';
import { DaVinciProfileHero } from '@/components/davinci/profile/DaVinciProfileHero';
import { DaVinciProfileStats } from '@/components/davinci/profile/DaVinciProfileStats';
import { DaVinciProfileGallery } from '@/components/davinci/profile/DaVinciProfileGallery';
import { DaVinciProfileTimeline } from '@/components/davinci/profile/DaVinciProfileTimeline';
import { api } from '@/lib/api/client';
import { AspectRatio } from '@/types';
import type { GeneratedImage } from '@/types';
import { AIModel } from '@/types/settings';
import { EXPLORE_IMAGES } from '@/constants';
import { useSession } from '@/lib/hooks/useSession';
import { useAuth } from '@/lib/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import { HelpCircle, Bookmark } from 'lucide-react';
import { TheVinciOrb } from '@/components/davinci/TheVinciOrb';
import { cn } from '@/lib/utils';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';

function DaVinciStudioContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // -- URL State Management --
    // Extract state from URL or fallback to default
    const activeTab = searchParams.get('view') || 'create';
    const activeModal = searchParams.get('modal');

    const isApparelModalOpen = activeModal === 'apparel';
    const isFittingRoomModalOpen = activeModal === 'fittingroom';

    // Helper to update URL state
    const updateUrlState = (updates: { view?: string; modal?: string | null }) => {
        const params = new URLSearchParams(searchParams.toString());

        if (updates.view) {
            params.set('view', updates.view);
        }

        if (updates.modal === null) {
            params.delete('modal');
        } else if (updates.modal) {
            params.set('modal', updates.modal);
        }

        // Determine if we should push (history entry) or replace
        // For modals, we often want 'push' so back button works
        // For tabs, 'replace' is usually better to avoid history spam, but user preference varies.
        // Let's use 'push' for modals, 'replace' for views to keep history clean but navigable.
        if (updates.modal && updates.modal !== activeModal) {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        } else {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    const setActiveTab = (tab: string) => {
        // When switching tabs, we generally close modals unless specified
        updateUrlState({ view: tab, modal: null });
    };

    const openApparelModal = () => {
        updateUrlState({ view: 'apparel', modal: 'apparel' });
    };

    const openFittingRoomModal = () => {
        updateUrlState({ modal: 'fittingroom' });
    };

    const closeModals = () => {
        // If we were in apparel modal and apparel tab, maybe go back to previous tab? 
        // For now, simpler: just remove modal param.
        // However, if view was 'apparel', checking logic below:
        const params = new URLSearchParams(searchParams.toString());
        params.delete('modal');

        // If we are closing apparel modal, and we are on apparel view, do we switch view?
        // Original logic: setPreviousTab(activeTab); if (activeTab === 'apparel') setActiveTab(previousTab);
        // We need to replicate 'previousTab' logic or just default to 'create' or 'gallery'
        if (activeTab === 'apparel' && isApparelModalOpen) {
            // Revert to 'create' or previous if we tracked it.
            // Simplified: Go to 'create' if closing apparel modal
            // Or better: Let's track previous tab in a ref if needed, or just default to create.
            params.set('view', 'create');
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [generationCount, setGenerationCount] = useState<1 | 2 | 4 | 6 | 8>(8);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [model, setModel] = useState<AIModel>('gemini-2.5-flash');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

    // We don't strictly need previousTab state for URL routing unless we want to go 'back' intelligently
    // Implementing simple 'back to create' logic for apparel close for now.

    // Session data
    const {
        images: sessionImages,
        bookmarks,
        toggleBookmark,
        saveImage: saveToSession,
    } = useSession();

    const { user, profile, signOut } = useAuth();

    // Local images state
    const [localImages, setLocalImages] = useState<GeneratedImage[]>([]);
    const combinedImages = [...localImages, ...sessionImages];
    const displayImages = combinedImages.length > 0 ? combinedImages : EXPLORE_IMAGES;

    const { theme, lampColor, sparkleMode, hoverEffect } = useTheme();

    const handleGenerate = async (prompt: string) => {
        setIsGenerating(true);

        try {
            const newImages: GeneratedImage[] = [];

            for (let i = 0; i < generationCount; i++) {
                const response = await api.generate({
                    prompt,
                    aspectRatio, // Use state
                    model,
                });

                if (response.success && response.imageUrl) {
                    const img: GeneratedImage = {
                        id: crypto.randomUUID(),
                        url: response.imageUrl,
                        prompt,
                        aspectRatio: '1:1',
                        timestamp: Date.now(),
                        model,
                    };
                    newImages.push(img);
                }
            }

            setLocalImages((prev) => [...newImages, ...prev]);
            for (const img of newImages) {
                await saveToSession(img);
            }
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-black selection:bg-purple-500/30">
            <CustomScrollbar
                rightOffset={activeTab === 'myworks' ? '10px' : undefined}
                mode={activeTab === 'gallery' ? 'continuous' : 'points'}
            />
            {/* Sparkles Background */}
            <div className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-500",
                activeTab === 'apparel' && "opacity-30"
            )}>
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor={sparkleMode === 'theme' ? lampColor : '#FFFFFF'}
                    hoverEffect={hoverEffect}
                />
            </div>

            {/* Aurora Gradient Overlay (Subtle) */}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-1000 fixed"
                style={{
                    background: `radial-gradient(circle at 50% -20%, var(--lamp-glow), transparent 70%)`
                }}
            />

            {/* Aceternity Lamp Effect - Positioned High */}
            <div className="absolute top-[-350px] left-0 w-full flex justify-center pointer-events-none z-0 h-[800px]">
                <LampContainer className="bg-transparent w-full max-w-7xl min-h-[850px]" />
            </div>

            {/* Floating Dock (Left) */}
            <DaVinciFloatingDock
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    if (tab === 'apparel') {
                        openApparelModal();
                    } else {
                        setActiveTab(tab);
                    }
                }}
                isApparelModalOpen={isApparelModalOpen}
                isFittingRoomModalOpen={isFittingRoomModalOpen}
                onOpenFittingRoom={() => {
                    openFittingRoomModal();
                }}
                onCloseFittingRoom={() => {
                    closeModals();
                }}
            />

            {/* Store Navigation Listener */}
            {(() => {
                const {
                    shouldOpenApparel,
                    resetApparelViewRequest,
                    shouldOpenGallery,
                    shouldOpenCreate,
                    resetArtWallNavigation
                } = useFittingRoomStore();

                React.useEffect(() => {
                    if (shouldOpenApparel) {
                        openApparelModal();
                        resetApparelViewRequest();
                    }
                    if (shouldOpenGallery) {
                        setActiveTab('gallery');
                        resetArtWallNavigation();
                    }
                    if (shouldOpenCreate) {
                        setActiveTab('create');
                        resetArtWallNavigation();
                    }
                }, [
                    shouldOpenApparel,
                    shouldOpenGallery,
                    shouldOpenCreate,
                    resetApparelViewRequest,
                    resetArtWallNavigation,
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                ]);
                return null;
            })()}

            {/* TheVinci Orb - Top Left, Above Sidebar - Hidden in Apparel */}
            {activeTab !== 'apparel' && (
                <div className="fixed top-0 left-0 z-50 pointer-events-none">
                    <TheVinciOrb size={160} />
                </div>
            )}

            {/* Main Content Area */}
            <main className={cn(
                "relative z-10 flex-1 flex flex-col min-h-screen transition-all duration-500 pr-6",
                activeTab === 'apparel' ? "pl-20" : "pl-28"
            )}>

                {/* Top Section: Prompt + User - Only visible in Create mode */}
                {activeTab === 'create' && (
                    <header className="sticky top-0 z-40 flex items-center justify-center gap-6 pt-6 pb-4 transition-all duration-300">
                        {/* Prompt Capsule (Centered) */}
                        <div className="flex-1 max-w-2xl mx-auto">
                            <PromptCapsule
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                                model={model}
                                setModel={setModel}
                                aspectRatio={aspectRatio}
                                setAspectRatio={setAspectRatio}
                                generationCount={generationCount}
                                setGenerationCount={setGenerationCount}
                            />
                        </div>

                        {/* Right: Theme + Help + User Menu - Absolutely Positioned to avoid push */}
                        <div className="absolute right-0 flex items-center gap-4 flex-shrink-0 pr-6">
                            <div className="flex items-center gap-3">
                                <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer">
                                    <HelpCircle size={18} />
                                </button>
                            </div>
                        </div>
                    </header>
                )}


                {/* Bento Grid (Compact, window scroll) */}
                <div id="generated-image-section" className="flex-1 py-10">
                    {activeTab === 'myworks' ? (
                        <div className="w-full max-w-[1400px] mx-auto px-4">

                            {/* Phase 3: High Fidelity DaVinci Profile UI */}
                            <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000">

                                {/* 1. Holographic Hero */}
                                <DaVinciProfileHero profile={profile} user={user} />

                                {/* 2. Glass Stats Row */}
                                <DaVinciProfileStats />

                                {/* 3. Split Feed: Gallery + Timeline */}
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Main Gallery Column (8/12) */}
                                    <div className="lg:w-8/12">

                                        {/* BOOKMARKS SECTION */}
                                        <div className="mb-12">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                    <Bookmark className="w-4 h-4 text-pink-500 fill-pink-500/50" />
                                                    Bookmarks_Collection
                                                </h3>
                                                <div className="flex-1 h-px bg-white/5" />
                                            </div>
                                            {bookmarks.length > 0 ? (
                                                <DaVinciProfileGallery images={bookmarks} />
                                            ) : (
                                                <div className="w-full h-130 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                                    <Bookmark className="w-10 h-10 text-white/10 mb-4" />
                                                    <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">No Bookmarks Detected</div>
                                                    <div className="text-zinc-600 text-[10px] mt-2">Save generations to access them here</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 mb-8">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                                Creations_Archive
                                            </h3>
                                            <div className="flex-1 h-px bg-white/5" />
                                            <div className="flex gap-2">
                                                <button className="px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-tighter">Photos</button>
                                                <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter hover:text-white transition-colors">Digital Art</button>
                                            </div>
                                        </div>

                                        <DaVinciProfileGallery images={[...localImages, ...sessionImages]} />
                                    </div>

                                    {/* Activity Timeline Sidebar (4/12) */}
                                    <aside className="lg:w-4/12 h-fit sticky top-24">
                                        <DaVinciProfileTimeline />

                                        {/* Optional Session Logout / Account Control in Sidebar Area */}
                                        <div className="mt-8 p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-red-500/5 to-transparent">
                                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-4 tracking-widest">Session Control</h4>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await signOut();
                                                    } catch (e) {
                                                        console.error("Logout failed:", e);
                                                    } finally {
                                                        setActiveTab('explore');
                                                    }
                                                }}
                                                className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                            >
                                                Terminate Protocol (Log Out)
                                            </button>
                                        </div>
                                    </aside>
                                </div>
                            </section>

                        </div>
                    ) : activeTab === 'gallery' ? (
                        <DaVinciExplore />
                    ) : (
                        <BentoGrid />
                    )}
                </div>

                {/* Footer Component */}
                <Footer />
            </main>

            {/* Modals */}
            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
            <DaVinciAuthModal />
            <ApparelModal
                isOpen={isApparelModalOpen}
                onClose={() => {
                    closeModals();
                }}
            />
            <TheFittingRoomModal
                isOpen={isFittingRoomModalOpen}
                onClose={() => {
                    closeModals();
                }}
            />
        </div>
    );
}

export default function DaVinciStudio() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="text-white animate-pulse">Initializing DaVinci OS...</div>
            </div>
        }>
            <DaVinciStudioContent />
        </Suspense>
    );
}
