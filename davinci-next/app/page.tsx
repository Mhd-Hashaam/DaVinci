'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PromptBar from '@/components/PromptBar';
import ImageGrid from '@/components/ImageGrid';
import ImageModal from '@/components/ImageModal';
import MockupModal from '@/components/MockupModal';
import EditModal from '@/components/EditModal';
import InteractiveTutorial from '@/components/Tutorial';
import ExploreGrid from '@/components/ExploreGrid';
import ExploreFilters from '@/components/ExploreFilters';
import { api } from '@/lib/api/client';
import { GeneratedImage, AspectRatio } from '@/types';
import { AIModel, ImageDimension, ImageSize, PromptEnhance, StylePreset } from '@/types/settings';
import { MOCK_IMAGES, EXPLORE_IMAGES } from '@/constants';
import { Sparkles, Layers, Search, Archive, HelpCircle } from 'lucide-react';

import { ResponsiveShell } from '@/components/layout/ResponsiveShell';
import { PromptInputLayout } from '@/components/layout/PromptInputLayout';

// Using standard GSAP import
import gsap from 'gsap';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

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
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [bookmarks, setBookmarks] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [mockupImage, setMockupImage] = useState<GeneratedImage | null>(null);
  const [editImage, setEditImage] = useState<GeneratedImage | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(1);
  const [model, setModel] = useState<AIModel>('gemini-2.5-flash');

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
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Load initial mock data
  useEffect(() => {
    setImages(MOCK_IMAGES);
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

      setImages((prev) => [...newImages, ...prev]);
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

  const handleBookmark = (image: GeneratedImage) => {
    setBookmarks(prev => {
      const exists = prev.find(img => img.id === image.id);
      if (exists) {
        return prev.filter(img => img.id !== image.id);
      } else {
        return [image, ...prev];
      }
    });
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
      case 'bookmarks': return bookmarks;
      default: return images;
    }
  })();

  return (
    <div ref={containerRef} className="animate-shell">
      <ResponsiveShell
        sidebar={
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            width={sidebarWidth}
            setWidth={setSidebarWidth}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            generationCount={generationCount}
            setGenerationCount={setGenerationCount}
          />
        }
      >
        <div className="min-h-screen bg-background text-white selection:bg-indigo-500/30 font-sans pb-24 lg:pb-0"> {/* Padding bottom for mobile prompt input */}

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
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{model}</p>
              <p className="text-[10px] flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</p>
            </div>
          </div>


          {/* Content Area */}
          <div className="w-full p-4 md:p-10 relative z-0 mt-8 lg:mt-2 6">
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
              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-medium border border-white/10 px-3 py-1.5 rounded-full bg-white/5">
                <Layers size={12} />
                {displayedImages.length} items
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
                  onMockupClick={setMockupImage}
                  onBookmarkClick={handleBookmark}
                  onEditClick={setEditImage}
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

        </div>

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
          onApplyToMockup={setMockupImage}
        />

        {/* Tutorial */}
        {showTutorial && (
          <InteractiveTutorial onClose={() => setShowTutorial(false)} />
        )}
      </ResponsiveShell>
    </div>
  );
}
