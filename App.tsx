import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PromptBar from './components/PromptBar';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import MockupModal from './components/MockupModal';
import EditModal from './components/EditModal';
import InteractiveTutorial from './components/Tutorial';
import { generateImage } from './services/gemini';
import { GeneratedImage, AspectRatio } from './types';
import { MOCK_IMAGES, MODEL_NAME } from './constants';
import { Sparkles, Layers, Search, Archive, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
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

  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load initial mock data
  useEffect(() => {
    setImages(MOCK_IMAGES);
  }, []);

  const handleGenerate = async (prompt: string, aspectRatio: AspectRatio) => {
    setIsGenerating(true);
    setLoadingPrompt(prompt);

    // Scroll to top to see new creation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      // Simulate multiple generations if count > 1
      // In a real app, the API would handle batching or we'd loop requests
      // For now, we'll just generate one and duplicate it with unique IDs for the demo
      const imageUrl = await generateImage(prompt, aspectRatio);

      const newImages: GeneratedImage[] = Array.from({ length: generationCount }).map((_, i) => ({
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: prompt,
        aspectRatio: aspectRatio,
        timestamp: Date.now() + i, // slight offset
        model: MODEL_NAME,
      }));

      setImages((prev) => [...newImages, ...prev]);
    } catch (error: any) {
      console.error("Failed to generate:", error);
      let message = error instanceof Error ? error.message : "Failed to generate image. Please try again.";

      // Truncate overly long error messages (e.g., if the model tries to chat)
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

  const contentMargin = isSidebarCollapsed ? 80 : sidebarWidth;

  const getDisplayedImages = () => {
    switch (activeTab) {
      case 'create': return images;
      case 'explore': return [...MOCK_IMAGES].reverse();
      case 'bookmarks': return bookmarks;
      default: return images;
    }
  };

  const displayedImages = getDisplayedImages();

  return (
    <div className="min-h-screen bg-background text-white selection:bg-indigo-500/30 font-sans">
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

      <main
        className="min-h-screen relative flex flex-col transition-all duration-75 ease-out"
        style={{ marginLeft: `${contentMargin}px` }}
      >

        {/* Sticky Header with Prompt Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-10">
          <div className="max-w-[2400px] mx-auto w-full flex items-center justify-between gap-6">

            {/* Search / Prompt Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full">
              {activeTab === 'create' ? (
                <PromptBar onGenerate={handleGenerate} isGenerating={isGenerating} />
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-2xl h-12 flex items-center px-4 text-zinc-500 w-full max-w-2xl mx-auto">
                  <Search size={18} className="mr-3" />
                  <span>Search the community...</span>
                </div>
              )}
            </div>

            {/* Header Stats (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 text-zinc-400">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all group"
                title="Help & Tutorial"
              >
                <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
              </button>
              <div className="text-right">
                <p className="text-xs font-semibold text-white">Gemini 2.5 Flash</p>
                <p className="text-[10px] flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full p-6 md:p-10 relative z-0">
          {/* Section Header */}
          <div className="mb-8 max-w-[2400px] mx-auto flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {activeTab === 'create' ? 'Your Creations' : activeTab === 'bookmarks' ? 'Saved Collection' : 'Explore Community'}
              </h1>
              <p className="text-zinc-400 mt-2 flex items-center gap-2 text-sm">
                {activeTab === 'bookmarks' ? <Archive size={14} className="text-indigo-400" /> : <Sparkles size={14} className="text-indigo-400" />}
                {activeTab === 'create' ? 'Generated by Gemini 2.5 Flash Image' : activeTab === 'bookmarks' ? 'Your curated favorites' : 'Curated masterpieces'}
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

          <ImageGrid
            images={displayedImages}
            onImageClick={setSelectedImage}
            onMockupClick={setMockupImage}
            onBookmarkClick={handleBookmark}
            onEditClick={setEditImage}
          />

          {/* Empty States */}
          {displayedImages.length === 0 && !isGenerating && (
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

      </main>

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
    </div>
  );
};

export default App;