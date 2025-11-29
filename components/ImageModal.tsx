import React from 'react';
import { X, Download, Copy, ExternalLink, Maximize2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `dreamstream-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    // Could add toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 bg-surface border border-white/10 rounded-2xl max-w-7xl w-full max-h-[95vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Image Section */}
        <div className="flex-1 bg-black/50 flex items-center justify-center p-4 overflow-hidden relative group">
           <img 
             src={image.url} 
             alt={image.prompt}
             className="max-w-full max-h-[80vh] md:max-h-full object-contain shadow-2xl rounded-md"
           />
           <button 
             onClick={onClose}
             className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full md:hidden"
           >
             <X size={24} />
           </button>
        </div>

        {/* Sidebar Section */}
        <div className="w-full md:w-96 bg-surface border-l border-white/10 flex flex-col h-[30vh] md:h-auto">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
             <h3 className="font-semibold text-white">Details</h3>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-secondary hover:text-white transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Scrollable details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Prompt */}
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">Prompt</label>
              <p className="text-gray-200 leading-relaxed text-sm md:text-base selection:bg-primary/30">
                {image.prompt}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Model</label>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-sm text-zinc-300">Gemini 2.5</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Aspect Ratio</label>
                <span className="text-sm text-zinc-300 font-mono bg-white/5 px-2 py-1 rounded">{image.aspectRatio}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Created</label>
                <span className="text-sm text-zinc-300">{new Date(image.timestamp).toLocaleDateString()}</span>
              </div>
              <div>
                 <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">Resolution</label>
                 <span className="text-sm text-zinc-300">Standard</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white/10 bg-surface/50 space-y-3">
             <button 
               onClick={handleCopyPrompt}
               className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all text-sm font-medium"
             >
               <Copy size={16} />
               Copy Prompt
             </button>
             <button 
               onClick={handleDownload}
               className="w-full flex items-center justify-center gap-2 p-3 bg-white text-black hover:bg-gray-200 rounded-xl transition-all text-sm font-bold shadow-lg shadow-white/5"
             >
               <Download size={16} />
               Download Image
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
