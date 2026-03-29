'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DaVinciFloatingDock } from '@/components/davinci/DaVinciFloatingDock';
import { ScrollablePanel, useScrollbar } from '@/components/scrollbar/CustomScrollbar';
import PromptCapsule from '@/components/PromptCapsule';
import { LeVinCiBranding } from '@/components/branding/LeVinCiBranding';
import { DaVinciExplore } from '@/components/davinci/explore/DaVinciExplore';
import { DaVinciCommunity } from '@/components/davinci/community/DaVinciCommunity';
import BentoGrid from '@/components/BentoGrid';
import { SectionHeader } from '@/components/layout/SectionHeader';
import ImageGrid from '@/components/ImageGrid';
import { useTheme } from '@/components/ThemeProvider';
import { SpaceDust } from '@/components/ui/SpaceDust';
import { SmokeBackground } from '@/components/ui/SmokeBackground';
import { LampContainer } from '@/components/ui/lamp';
import ImageModal from '@/components/ImageModal';
import { TheFittingRoomModal } from '@/components/davinci/fittingroom/TheFittingRoomModal';
import { PerformanceOverlay } from '@/components/davinci/PerformanceOverlay';
import { DaVinciAuthModal } from '@/components/davinci/DaVinciAuthModal';
import { MyWorks } from '@/components/davinci/profile/MyWorks';
import { ProfileGallerySkeleton, ProfileSectionHeaderSkeleton } from '@/components/davinci/profile/DaVinciProfileSkeleton';
import { DaVinciProfileHero } from '@/components/davinci/profile/DaVinciProfileHero';
import { DaVinciProfileGallery } from '@/components/davinci/profile/DaVinciProfileGallery';
import { FeedSkeleton } from '@/components/layout/FeedSkeleton';
import { api } from '@/lib/api/client';
import { AspectRatio } from '@/types';
import type { GeneratedImage } from '@/types';
import { AIModel } from '@/types/settings';
import { useCMSData } from '@/lib/hooks/useCMSData';
import { useSession } from '@/lib/hooks/useSession';
import { useAuth } from '@/lib/hooks/useAuth';
import { getSettingsAction } from '@/app/admin/actions';
import { Footer } from '@/components/layout/Footer';
import { HelpCircle, Bookmark } from 'lucide-react';
import { TheVinciOrb } from '@/components/davinci/TheVinciOrb';
import { cn } from '@/lib/utils';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';

// Extracted from IIFE to fix react-hooks/rules-of-hooks
function StoreNavigationListener({ setActiveTab, openFittingRoomModal }: {
    setActiveTab: (tab: string) => void;
    openFittingRoomModal: () => void;
}) {
    const {
        shouldOpenGallery,
        shouldOpenCreate,
        resetArtWallNavigation,
        shouldOpenFittingRoom,
        resetFittingRoomViewRequest
    } = useFittingRoomStore();

    React.useEffect(() => {
        if (shouldOpenGallery) {
            setActiveTab('gallery');
            resetArtWallNavigation();
        }
        if (shouldOpenCreate) {
            setActiveTab('create');
            resetArtWallNavigation();
        }
        if (shouldOpenFittingRoom) {
            openFittingRoomModal();
            resetFittingRoomViewRequest();
        }
    }, [
        shouldOpenGallery,
        shouldOpenCreate,
        resetArtWallNavigation,
        shouldOpenFittingRoom,
        resetFittingRoomViewRequest,
        setActiveTab,
        openFittingRoomModal,
    ]);
    return null;
}

function DaVinciStudioContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // -- Hybrid State Management for Performance --
    // Use local state for immediate UI updates, sync with URL for persistence.
    // This avoids the expensive 1-2s lag caused by Next.js router.replace() triggering full tree re-renders.

    const [viewState, setViewState] = useState(searchParams.get('view') || 'create');
    const [modalState, setModalState] = useState<string | null>(searchParams.get('modal'));
    const { theme, lampColor, sparkleMode, backgroundMode, setBackgroundMode, hoverEffect } = useTheme();
    const { setVisible: setScrollbarVisible } = useScrollbar();

    // Sync scrollbar visibility with modal state
    useEffect(() => {
        setScrollbarVisible(!modalState);
    }, [modalState, setScrollbarVisible]);

    // Sync with URL when Browser Back/Forward is used
    useEffect(() => {
        const view = searchParams.get('view') || 'create';
        const modal = searchParams.get('modal');
        setViewState(view);
        setModalState(modal);
    }, [searchParams]);

    const activeTab = viewState;
    const isFittingRoomModalOpen = modalState === 'fittingroom';

    // Helper to update URL state silently
    const updateUrlState = (updates: { view?: string; modal?: string | null }) => {
        // 1. Immediate UI Update
        if (updates.view) setViewState(updates.view);

        let newModalState = modalState;
        if (updates.modal !== undefined) {
            setModalState(updates.modal); // null clears it
            newModalState = updates.modal;
        }

        // 2. Silent URL Update (No Re-render)
        const params = new URLSearchParams(window.location.search);

        if (updates.view) params.set('view', updates.view);

        if (updates.modal === null) {
            params.delete('modal');
        } else if (updates.modal) {
            params.set('modal', updates.modal);
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;

        // Use pushState for new modals (so back button works), replaceState for tabs/closing
        if (updates.modal && updates.modal !== modalState) {
            window.history.pushState(null, '', newUrl);
        } else {
            window.history.replaceState(null, '', newUrl);
        }
    };

    const setActiveTab = (tab: string) => {
        updateUrlState({ view: tab, modal: null });
    };

    const openFittingRoomModal = () => {
        updateUrlState({ modal: 'fittingroom' });
    };

    const closeModals = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('modal');

        // Logic: keep current view but just closing modal.

        setModalState(null);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
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
        isLoading: isSessionLoading,
    } = useSession();

    const { user, profile, signOut } = useAuth();

    // Fetch Global Gallery Render Mode
    const [galleryMode, setGalleryMode] = useState<string>('manual');
    useEffect(() => {
        async function fetchMode() {
            try {
                const res = await getSettingsAction(true);
                if (res.data) {
                    const modeSetting = res.data.find((s: any) => s.key === 'gallery_render_mode');
                    if (modeSetting?.value) setGalleryMode(modeSetting.value);
                }
            } catch (err) {
                console.error('Failed to fetch gallery mode setting:', err);
            }
        }
        fetchMode();
    }, []);

    // CMS Integration for Explore and Fallbacks
    const { data: allCmsImages, isLoading: isCMSLoading } = useCMSData<GeneratedImage & { categories: any[] }>(
        'cms_gallery',
        [],
        (row: any) => ({
            id: row.id,
            url: row.storage_url,
            prompt: row.title || row.alt_text || 'Untitled Design',
            aspectRatio: row.aspect_ratio || '1:1',
            timestamp: new Date(row.created_at).getTime(),
            model: 'DaVinci Core',
            categories: row.category_links?.map((link: any) => link.category) || []
        }),
        '*, category_links:cms_gallery_categories(category:cms_categories(*))',
        galleryMode
    );

    const topPicks = allCmsImages.filter(img => 
        img.categories?.some((cat: any) => cat.slug === 'top-picks')
    );

    const communityImages = allCmsImages.filter(img => 
        img.categories?.some((cat: any) => cat.slug === 'community')
    ).slice(0, 20);

    const [localImages, setLocalImages] = useState<GeneratedImage[]>([]);
    const combinedImages = [...localImages, ...sessionImages];
    const displayImages = combinedImages.length > 0 ? combinedImages : allCmsImages;

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
            {/* Starfield Background */}
            <div className="absolute inset-0 w-full h-full">
                {backgroundMode === 'stars' ? (
                    <SpaceDust
                        starColor={sparkleMode === 'theme' ? lampColor : '#ffffff'}
                        shootColor={sparkleMode === 'theme' ? lampColor : '#ffffff'}
                        className="w-full h-full"
                    />
                ) : (
                    <SmokeBackground
                        color={sparkleMode === 'theme' ? lampColor : '#ffffff'}
                        className="w-full h-full"
                        opacity={0.6}
                    />
                )}
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
                    setActiveTab(tab);
                }}
                isFittingRoomModalOpen={isFittingRoomModalOpen}
                onOpenFittingRoom={() => {
                    openFittingRoomModal();
                }}
                onCloseFittingRoom={() => {
                    closeModals();
                }}
            />

            {/* Store Navigation Listener */}
            <StoreNavigationListener
                setActiveTab={setActiveTab}
                openFittingRoomModal={openFittingRoomModal}
            />

            {/* TheVinci Orb - Top Left, Above Sidebar */}
            <div className="fixed top-0 left-0 z-50 pointer-events-none">
                <TheVinciOrb size={110} />
            </div>

            {/* Main Content Area */}
            <ScrollablePanel 
              className="relative z-[1] flex-1 flex flex-col h-screen transition-all duration-500 pl-28 pr-0"
              variant={activeTab === 'create' ? 'landing' : 'others'}
            >

                {/* Very Top Sticky Header (Auxiliary Items) */}
                <header className="sticky top-0 z-40 flex items-center justify-end px-8 pt-6 pb-2">
                    <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer backdrop-blur-md">
                        <HelpCircle size={18} />
                    </button>
                </header>

                {/* Hero Layout for Create Tab */}
                {activeTab === 'create' && (
                    <div className="w-full flex flex-col items-center justify-center pb-20 pt-4 z-30">
                        <LeVinCiBranding />
                        
                        <div className="w-full mt-4">
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

                        {/* Sections Area */}
                        <div className="w-full mt-24 space-y-32">
                            {/* Top Picks Section - Moved Left */}
                            <section className="animate-grid w-full max-w-[1400px] px-4 sm:px-8">
                                <SectionHeader 
                                    title="Top Picks" 
                                    viewMoreHref="/davinci?view=gallery&category=top-picks" 
                                />
                                {isCMSLoading ? (
                                    <FeedSkeleton count={5} />
                                ) : (
                                    <ImageGrid
                                        images={topPicks}
                                        columns={{ mobile: 1, sm: 2, lg: 5, xl: 5 }}
                                        onImageClick={setSelectedImage}
                                        onMockupClick={openFittingRoomModal}
                                        onBookmarkClick={(img) => toggleBookmark(img.id, img)}
                                    />
                                )}
                            </section>

                            {/* Community Section - Aligned with Top Picks */}
                            <section className="animate-grid w-full max-w-[1400px] px-4 sm:px-8">
                                <SectionHeader 
                                    title="Community's Creation" 
                                    viewMoreHref="/davinci?view=community"
                                />
                                {isCMSLoading ? (
                                    <FeedSkeleton count={5} />
                                ) : (
                                    <ImageGrid
                                        images={communityImages}
                                        columns={{ mobile: 1, sm: 2, lg: 5, xl: 5 }}
                                        onImageClick={setSelectedImage}
                                        onMockupClick={openFittingRoomModal}
                                        onBookmarkClick={(img) => toggleBookmark(img.id, img)}
                                    />
                                )}
                            </section>
                        </div>
                    </div>
                )}

                {/* Main Content Sections (Bento Grid, Gallery, Profile) */}
                <div id="generated-image-section" className={cn("flex-1", activeTab === 'create' ? "py-4" : "py-10")}>
                    {activeTab === 'myworks' ? (
                        <div className="w-full max-w-[1400px] mx-auto px-4">

                            {/* Phase 3: High Fidelity DaVinci Profile UI */}
                            <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000">

                                {/* 1. Holographic Hero */}
                                <DaVinciProfileHero profile={profile} user={user} />

                                {/* 3. Full Width Feed: Gallery + Bookmarks */}
                                <div className="flex flex-col gap-12">
                                    {/* Main Gallery Column - Now Full Width */}
                                    <div className="w-full">
                                        <div className="flex items-center mb-8">
                                            <div className="flex items-center gap-4 w-full">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                                                    Session_Resumption_Workstreams
                                                </h3>
                                                <div className="flex-1 h-px bg-white/5" />
                                            </div>
                                        </div>

                                        {/* SESSION RESUMPTION SECTION */}
                                        <div className="mb-12">
                                            <MyWorks />
                                        </div>

                                        {/* BOOKMARKS SECTION */}
                                        <div className="mb-12">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                    <Bookmark className="w-4 h-4 text-pink-500 fill-pink-500/50" />
                                                    Bookmarks_Collection
                                                </h3>
                                                <div className="flex-1 h-px bg-white/5" />
                                            </div>
                                            {isSessionLoading ? (
                                                <ProfileGallerySkeleton count={4} />
                                            ) : bookmarks.length > 0 ? (
                                                <DaVinciProfileGallery images={bookmarks} />
                                            ) : (
                                                <div className="w-full h-80 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                                    <Bookmark className="w-10 h-10 text-white/10 mb-4" />
                                                    <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">No Bookmarks Detected</div>
                                                    <div className="text-zinc-600 text-[10px] mt-2">Save generations to access them here</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* CREATIONS ARCHIVE SECTION */}
                                        <div className="mb-12">
                                            <div className="flex items-center gap-4 mb-8">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                                    Creations_Archive
                                                </h3>
                                                <div className="flex-1 h-px bg-white/5" />
                                                <div className="flex gap-2">
                                                    <button className="px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-tighter cursor-pointer">Photos</button>
                                                    <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter hover:text-white transition-colors cursor-pointer">Digital Art</button>
                                                </div>
                                            </div>

                                            {isSessionLoading ? (
                                                <ProfileGallerySkeleton count={8} />
                                            ) : (
                                                <DaVinciProfileGallery images={[...localImages, ...sessionImages]} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    ) : activeTab === 'gallery' ? (
                        <DaVinciExplore />
                    ) : activeTab === 'community' ? (
                        <DaVinciCommunity />
                    ) : (
                        null // BentoGrid hidden as requested
                    )}
                </div>

                {/* Footer Component */}
                {/* Footer hidden as requested */}
                {/* <Footer /> */}
            </ScrollablePanel>

            {/* Modals */}
            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
            <DaVinciAuthModal />
            <TheFittingRoomModal
                isOpen={isFittingRoomModalOpen}
                onClose={() => {
                    closeModals();
                }}
            />

            {/* Debug: Memory Performance Overlay (Shift+M to toggle) */}
            <PerformanceOverlay />
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
