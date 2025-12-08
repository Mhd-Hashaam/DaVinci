import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Shirt, Share2, Download, Maximize2, Wand2, Image as ImageIcon, MoreVertical, Repeat } from 'lucide-react';
import ImageContextMenu from './ImageContextMenu';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  onMockupClick: (image: GeneratedImage) => void;
  onBookmarkClick?: (image: GeneratedImage) => void;
  onEditClick?: (image: GeneratedImage) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick, onMockupClick, onBookmarkClick, onEditClick }) => {
  const [selectedForMockup, setSelectedForMockup] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuButtonRefs = React.useRef<Map<string, React.RefObject<HTMLButtonElement>>>(new Map());

  const toggleMockupSelection = (image: GeneratedImage) => {
    setSelectedForMockup(prev => {
      const newSet = new Set(prev);
      if (newSet.has(image.id)) {
        newSet.delete(image.id);
      } else {
        newSet.add(image.id);
      }
      return newSet;
    });
    // Call the mockup click handler
    onMockupClick(image);
  };

  // Create ref for each image's menu button
  const getMenuButtonRef = (imageId: string) => {
    if (!menuButtonRefs.current.has(imageId)) {
      menuButtonRefs.current.set(imageId, React.createRef<HTMLButtonElement>());
    }
    return menuButtonRefs.current.get(imageId)!;
  };

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-20">
      {images.map((image) => (
        <div
          key={image.id}
          className="break-inside-avoid relative group rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
          onClick={(e) => {
            // Don't open image modal if clicking the Check (mockup select) button or its icon
            const targetElement = e.target as HTMLElement;
            if (!targetElement.closest('.mockup-select-btn')) {
              onImageClick(image);
            }
          }}
        >
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full object-cover"
            style={{ aspectRatio: image.aspectRatio.replace(':', '/') }}
            loading="lazy"
          />

          {/* Top-Left: Select for Mockup - Always rendered, shown on hover via group */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMockupClick(image);
              }}
              className="mockup-select-btn w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-indigo-600 flex items-center justify-center transition-all shadow-lg"
              title="Apply to Mockup"
            >
              <Shirt size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Hover Overlay with Icon Buttons */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">

            {/* Top-Right: Share, Download, Edit with AI */}
            <div className="absolute top-3 right-3 flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-lg"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Download functionality
                }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-lg"
                title="Download"
              >
                <Download size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.(image);
                }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-lg"
                title="Edit with AI"
              >
                <Wand2 size={16} />
              </button>
            </div>

            {/* Bottom-Left: Fullscreen */}
            <div className="absolute bottom-3 left-3 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(image);
                }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>



            {/* Prompt Tooltip on Hover (bottom center) */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg max-w-[80%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <p className="text-white text-xs font-medium line-clamp-2 text-center">
                {image.prompt}
              </p>
            </div>
          </div>

          {/* Bottom-Right Actions - Wider Remix Button */}
          <div className="absolute bottom-3 left-14 right-3 flex gap-2 items-center z-10">
            {/* Remix Button - ALWAYS VISIBLE, CENTERED */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Remix functionality
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95 flex-1"
              title="Remix this image"
            >
              <Repeat size={16} />
              <span>Remix</span>
            </button>



            {/* More Menu - Hover Only */}
            <div className="relative opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
              <button
                ref={getMenuButtonRef(image.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === image.id ? null : image.id);
                }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-lg"
                title="More options"
              >
                <MoreVertical size={16} />
              </button>
              <ImageContextMenu
                isOpen={activeMenuId === image.id}
                onClose={() => setActiveMenuId(null)}
                buttonRef={getMenuButtonRef(image.id)}
                onDelete={() => console.log('Delete', image.id)}
                onCopyToClipboard={() => console.log('Copy', image.id)}
                onRemoveBackground={() => console.log('Remove bg', image.id)}
                onDescribeWithAI={() => console.log('Describe', image.id)}
                onUseAsGuidance={() => console.log('Use as guidance', image.id)}
                onEditInCanvas={() => onEditClick?.(image)}
                onIterate={() => console.log('Iterate', image.id)}
                onOrganize={() => console.log('Organize', image.id)}
              />
            </div>
          </div>

          {/* Aspect Ratio Badge (always visible) */}
          <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
            <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
              {image.aspectRatio}
            </span>
          </div>


        </div>
      ))}
    </div>
  );
};

export default ImageGrid;