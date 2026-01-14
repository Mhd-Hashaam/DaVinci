'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import PromptBar from '@/components/PromptBar';
import ImageGrid from '@/components/ImageGrid';
import ImageModal from '@/components/ImageModal';
import MockupModal from '@/components/MockupModal';
import EditModal from '@/components/EditModal';
import InteractiveTutorial from '@/components/Tutorial';
import ExploreGrid from '@/components/ExploreGrid';
import ExploreFilters from '@/components/ExploreFilters';
import { ComparisonView } from '@/components/ComparisonView';
import { api } from '@/lib/api/client';
import { AspectRatio } from '@/types';
import type { GeneratedImage } from '@/types';
import { AIModel, ImageDimension, ImageSize, PromptEnhance, StylePreset } from '@/types/settings';
import { MOCK_IMAGES, EXPLORE_IMAGES } from '@/constants';
import { Sparkles, Layers, Search, Archive, HelpCircle } from 'lucide-react';

import { ResponsiveShell } from '@/components/layout/ResponsiveShell';
import { PromptInputLayout } from '@/components/layout/PromptInputLayout';
import { UserMenu } from '@/components/layout/UserMenu';
import { useSession } from '@/lib/hooks/useSession';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import gsap from 'gsap';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Standard useEffect for reliable execution
  useEffect(() => {
    console.log("ANIMATION: Effect fired!");

    // Explicitly target elements
    const targets = [
      ".animate-shell",
      ".animate-header",
      ".animate-prompt",
      ".animate-section-header",
      ".animate-grid"
    ];

    // Check if found
    const found = document.querySelectorAll(targets.join(","));
    console.log(`ANIMATION: Found ${found.length} elements`);

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(targets, { opacity: 0, visibility: "visible" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".animate-shell", { opacity: 1, duration: 0.5 })
        .fromTo(".animate-header",
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 }, "-=0.2")
        .fromTo(".animate-prompt",
          { y: -20, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8 }, "-=0.6")
        .fromTo(".animate-section-header",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .fromTo(".animate-grid",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.6");

    }, containerRef); // Scope to containerRef

    return () => ctx.revert();
  }, []);

  const [activeTab, setActiveTab] = useState('create');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [mockupImage, setMockupImage] = useState<GeneratedImage | null>(null);
  const [editImage, setEditImage] = useState<GeneratedImage | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(1);
  const [model, setModel] = useState<AIModel>('gemini-2.5-flash');

  /* Comparison Mode State */
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<GeneratedImage[]>([]);
  const [showComparisonView, setShowComparisonView] = useState(false);

  // Load session data (images, bookmarks, settings)
  const {
    images: generatedImages,
    bookmarks: bookmarkedImages,
    toggleBookmark,
    isBookmarked,
    isLoading: isSessionLoading,
    saveImage: saveToSession
  } = useSession();

  // Local images state (combines session + newly generated)
  const [localImages, setLocalImages] = useState<GeneratedImage[]>([]);
  const combinedImages = [...localImages, ...generatedImages];
  const images = (!isSessionLoading && combinedImages.length > 0) ? combinedImages : MOCK_IMAGES;

  // Explore State
  const [exploreImages, setExploreImages] = useState<GeneratedImage[]>([]);
  const [exploreFilter, setExploreFilter] = useState('trending');
  const [exploreTimeframe, setExploreTimeframe] = useState('This Week');
  const [explorePage, setExplorePage] = useState(1);

  // Generation Settings State (Lifted from Sidebar)
  const [imageDimension, setImageDimension] = useState<AspectRatio | AspectRatio[]>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('Medium');
  const [promptEnhance, setPromptEnhance] = useState<PromptEnhance>('Auto');
  const [style, setStyle] = useState<StylePreset>('Dynamic');

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true); // Renamed from isSidebarCollapsed for clarity
  const [sidebarWidth, setSidebarWidth] = useState(210);

  // Load explore images (mock data)
  useEffect(() => {
    setExploreImages(EXPLORE_IMAGES);
  }, []);

  const handleGenerate = async (prompt: string, aspectRatio: AspectRatio | AspectRatio[]) => {
    setIsGenerating(true);
    setLoadingPrompt(prompt);

    // Scroll to top to see new creation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const ratiosToGenerate = Array.isArray(aspectRatio) ? aspectRatio : [aspectRatio];

      // Generate for each selected aspect ratio
      const generationPromises = ratiosToGenerate.flatMap(async (ratio) => {
        // Run generation N times based on count
        const batchPromises = Array.from({ length: generationCount }).map(async () => {
          const response = await api.generate({
            prompt,
            aspectRatio: ratio,
            model,
            style: style !== 'None' ? style : undefined,
          });

          if (!response.success || !response.imageUrl) {
            throw new Error(response.error || 'Generation failed');
          }

          return {
            id: crypto.randomUUID(),
            url: response.imageUrl,
            prompt: prompt,
            aspectRatio: ratio,
            timestamp: Date.now(),
            model: model,
          } as GeneratedImage;
        });

        return Promise.all(batchPromises);
      });

      const results = await Promise.all(generationPromises);
      const newImages = results.flat();

      // Add to local state
      setLocalImages((prev) => [...newImages, ...prev]);

      // Save each image to Supabase
      for (const img of newImages) {
        await saveToSession(img);
      }
    } catch (error: any) {
      console.error("Failed to generate:", error);
      let message = error instanceof Error ? error.message : "Failed to generate image. Please try again.";

      // Truncate overly long error messages
      if (message.length > 300) {
        message = message.substring(0, 300) + "... (Check console for full details)";
      }

      alert(message);
    } finally {
      setIsGenerating(false);
      setLoadingPrompt(null);
    }
  };

  const handleBookmark = async (image: GeneratedImage) => {
    await toggleBookmark(image.id);
  };

  const loadMoreExplore = () => {
    // Simulate loading more images
    const moreImages = EXPLORE_IMAGES.map(img => ({
      ...img,
      id: crypto.randomUUID(), // New IDs to avoid key conflicts
      timestamp: Date.now() - Math.random() * 10000000
    }));
    setExploreImages(prev => [...prev, ...moreImages]);
    setExplorePage(prev => prev + 1);
  };

  const displayedImages = (() => {
    switch (activeTab) {
      case 'create': return images;
      case 'explore': return [...MOCK_IMAGES].reverse();
      case 'bookmarks': return bookmarkedImages;
      default: return images;
    }
  })();

  const handleMockup = (image: GeneratedImage) => {
    setMockupImage(image);
  };

  const toggleSelection = (image: GeneratedImage) => {
    if (selectedForComparison.some(img => img.id === image.id)) {
      setSelectedForComparison(prev => prev.filter(img => img.id !== image.id));
    } else {
      if (selectedForComparison.length >= 3) {
        alert("You can compare up to 3 images at a time.");
        return;
      }
      setSelectedForComparison(prev => [...prev, image]);
    }
  };

  const deleteImage = async (imageId: string) => {
    // Placeholder for delete logic
    console.log(`Deleting image with ID: ${imageId}`);
    // In a real app, you'd call an API to delete and then update state
    setLocalImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <ResponsiveShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebar={
        <Sidebar
          isCollapsed={!sidebarOpen}
          setIsCollapsed={(collapsed) => setSidebarOpen(!collapsed)}
          width={sidebarWidth}
          setWidth={setSidebarWidth}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          generationCount={generationCount}
          setGenerationCount={setGenerationCount}
        />
      }
    >
      <div ref={containerRef} className="min-h-screen bg-background text-white selection:bg-indigo-500/30 font-sans pb-24 lg:pb-0"> {/* Padding bottom for mobile prompt input */}

        {/* Prompt Input Area - Adaptive */}
        <PromptInputLayout>
          <div className="animate-prompt w-full">
            {activeTab === 'create' ? (
              <PromptBar
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                model={model}
                setModel={setModel}
                aspectRatio={imageDimension}
                setAspectRatio={(ratio: any) => setImageDimension(ratio)}
                style={style}
                setStyle={setStyle}
              />
            ) : (
              <div className="bg-white/5 border border-white/5 rounded-2xl h-12 flex items-center px-4 text-zinc-500 w-full max-w-2xl mx-auto backdrop-blur-md">
                <Search size={18} className="mr-3" />
                <span>Search the community...</span>
              </div>
            )}
          </div>
        </PromptInputLayout>

        {/* Header Stats (Desktop Only - separate from prompt bar now) */}
        <div className="animate-header hidden lg:flex absolute top-6 right-10 z-30 items-center gap-4 text-zinc-400">
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all group"
            title="Help & Tutorial"
          >
            <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <UserMenu />
        </div>


        {/* Content Area */}
        <div className="w-full p-4 md:p-10 relative z-0 mt-4 lg:mt-6">
          {/* Section Header */}
          <div className="animate-section-header mb-8 max-w-[2400px] mx-auto flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {activeTab === 'create' ? 'Your Creations' : activeTab === 'bookmarks' ? 'Saved Collection' : 'Explore Community'}
              </h1>
              <p className="text-zinc-400 mt-2 flex items-center gap-2 text-sm">
                {activeTab === 'bookmarks' ? <Archive size={14} className="text-indigo-400" /> : <Sparkles size={14} className="text-indigo-400" />}
                {activeTab === 'create' ? `Generated by ${model} Image` : activeTab === 'bookmarks' ? 'Your curated favorites' : 'Curated masterpieces'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {activeTab !== 'explore' && displayedImages.length > 0 && (
                <button
                  onClick={() => {
                    setIsComparisonMode(!isComparisonMode);
                    setSelectedForComparison([]);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${isComparisonMode
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                >
                  <Layers size={14} />
                  {isComparisonMode ? 'Cancel Compare' : 'Compare'}
                </button>
              )}
              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-medium border border-white/10 px-3 py-1.5 rounded-full bg-white/5">
                <Layers size={12} />
                {displayedImages.length} items
              </div>
            </div>
          </div>

          {/* Loading State Overlay */}
          {isGenerating && activeTab === 'create' && (
            <div className="w-full mb-12 max-w-[2400px] mx-auto animate-pulse">
              <div className="aspect-square md:aspect-video w-full max-w-sm bg-white/5 rounded-2xl border border-indigo-500/20 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ring-1 ring-indigo-500/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_2s_infinite]"></div>
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-indigo-400 font-medium text-sm animate-pulse">Dreaming up your image...</p>
                <p className="text-zinc-500 text-xs mt-2 line-clamp-1 italic max-w-[80%]">"{loadingPrompt}"</p>
              </div>
            </div>
          )}

          {activeTab === 'explore' ? (
            <>
              <ExploreFilters
                activeFilter={exploreFilter}
                onFilterChange={setExploreFilter}
                timeframe={exploreTimeframe}
                onTimeframeChange={setExploreTimeframe}
              />
              <div className="animate-grid w-full"> {/* Wrapper opacity-0 */}
                <ExploreGrid
                  images={exploreImages}
                  onImageClick={setSelectedImage}
                  onLoadMore={loadMoreExplore}
                  hasMore={true}
                />
              </div>
            </>
          ) : (
            <div className="animate-grid w-full">
              <ImageGrid
                images={displayedImages}
                onImageClick={setSelectedImage}
                onMockupClick={handleMockup}
                onBookmarkClick={handleBookmark}
                onEditClick={setEditImage}
                selectionMode={isComparisonMode}
                isSelected={(img) => selectedForComparison.some(i => i.id === img.id)}
                onSelect={(img) => toggleSelection(img)}
              />
            </div>
          )}

          {/* Empty States */}
          {displayedImages.length === 0 && !isGenerating && activeTab !== 'explore' && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-600">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 rotate-12">
                {activeTab === 'bookmarks' ? <Archive size={32} className="opacity-50" /> : <Sparkles size={32} className="opacity-50" />}
              </div>
              <p className="text-lg font-medium text-zinc-500">
                {activeTab === 'bookmarks' ? 'No bookmarks yet' : 'No masterpieces yet'}
              </p>
              <p className="text-sm text-zinc-700 mt-2">
                {activeTab === 'bookmarks' ? 'Save images you love to see them here' : 'Use the prompt bar above to start creating'}
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Bar for Comparison */}
        {isComparisonMode && selectedForComparison.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {selectedForComparison.map((img) => (
                  <div key={img.id} className="w-10 h-10 rounded-lg border-2 border-[#09090b] overflow-hidden">
                    <img src={img.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-white">{selectedForComparison.length} selected</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <button
              onClick={() => setShowComparisonView(true)}
              disabled={selectedForComparison.length < 2}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Layers size={16} />
              Compare Now
            </button>
          </div>
        )}

        {/* Comparison View Modal */}
        {showComparisonView && (
          <ComparisonView
            images={selectedForComparison}
            onClose={() => setShowComparisonView(false)}
            onBookmark={(img) => toggleBookmark(img.id)}
          />
        )}

        {/* Modals */}
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />

        <MockupModal
          image={mockupImage}
          onClose={() => setMockupImage(null)}
        />

        <EditModal
          image={editImage}
          onClose={() => setEditImage(null)}
          onSave={(newImage) => saveToSession(newImage)}
          onApplyToMockup={setMockupImage}
        />

        {showTutorial && <InteractiveTutorial onClose={() => setShowTutorial(false)} />}
        <AuthModal />
      </div>
    </ResponsiveShell>
  );
}
